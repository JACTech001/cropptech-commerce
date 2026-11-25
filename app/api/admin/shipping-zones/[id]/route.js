import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, {
  status,
  headers: { "Cache-Control": "no-store" },
});

function parseZone(body) {
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
  const state = typeof body?.state === "string" ? body.state.trim().slice(0, 100) : "";
  const city = typeof body?.city === "string" ? body.city.trim().slice(0, 100) : "";
  const fee = String(body?.fee ?? "").trim();
  const minDays = Number(body?.estimatedMinDays);
  const maxDays = Number(body?.estimatedMaxDays);

  if (!name || !state || !city || !/^(?:\d+)(?:\.\d{1,2})?$/.test(fee)
    || !Number.isInteger(minDays) || !Number.isInteger(maxDays)
    || minDays < 1 || maxDays < minDays || maxDays > 60) return null;

  return { name, state, city, fee, minDays, maxDays };
}

export async function PATCH(request, { params }) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to manage delivery zones.", access.status);

  const { id } = await params;
  if (!id) return fail("A delivery-zone ID is required.", 400);

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "deactivate" || action === "reactivate") {
    const activate = action === "reactivate";
    try {
      const result = await prisma.$transaction(async (tx) => {
        const zone = await tx.shippingZone.findUnique({
          where: { id },
          include: { rates: true },
        });
        if (!zone) throw new Error("ZONE_NOT_FOUND");
        if (zone.isActive === activate) throw new Error(activate ? "ZONE_ALREADY_ACTIVE" : "ZONE_ALREADY_INACTIVE");

        if (activate) {
          const location = await tx.shippingZoneLocation.findFirst({
            where: { zoneId: id },
            select: { state: true, city: true },
          });
          if (location?.city) {
            const duplicate = await tx.shippingZoneLocation.findFirst({
              where: {
                zoneId: { not: id },
                state: { equals: location.state, mode: "insensitive" },
                city: { equals: location.city, mode: "insensitive" },
                zone: { is: { isActive: true } },
              },
              select: { id: true },
            });
            if (duplicate) throw new Error("DELIVERY_ZONE_EXISTS");
          }
        }

        const updated = await tx.shippingZone.update({
          where: { id },
          data: { isActive: activate },
        });
        await tx.shippingRate.updateMany({
          where: { zoneId: id },
          data: { isActive: activate },
        });
        await tx.adminAuditLog.create({
          data: {
            actorId: access.user.id,
            action: activate ? "SHIPPING_ZONE_REACTIVATED" : "SHIPPING_ZONE_DEACTIVATED",
            entityType: "ShippingZone",
            entityId: id,
            metadata: { name: zone.name },
          },
        });
        return updated;
      }, { isolationLevel: "Serializable" });

      return Response.json({
        message: activate ? "Delivery zone reactivated." : "Delivery zone deactivated.",
        zone: { id: result.id, isActive: result.isActive },
      }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      if (error.message === "ZONE_NOT_FOUND") return fail("Delivery zone not found.", 404);
      if (error.message === "ZONE_ALREADY_ACTIVE") return fail("This delivery zone is already active.", 409);
      if (error.message === "ZONE_ALREADY_INACTIVE") return fail("This delivery zone is already inactive.", 409);
      if (error.message === "DELIVERY_ZONE_EXISTS") return fail("Another active delivery zone already covers this state and city. Update that zone before reactivating this one.", 409);
      console.error("Delivery-zone status update failed:", error);
      return fail("Could not update this delivery zone. Please try again.", 500);
    }
  }

  if (action !== "update") return fail("Choose a valid delivery-zone action.", 400);
  const values = parseZone(body);
  if (!values) return fail("Enter a zone name, state, city, valid NGN delivery fee and a valid delivery estimate.", 400);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const zone = await tx.shippingZone.findUnique({
        where: { id },
        include: { locations: true, rates: true },
      });
      if (!zone) throw new Error("ZONE_NOT_FOUND");

      const duplicate = await tx.shippingZoneLocation.findFirst({
        where: {
          zoneId: { not: id },
          state: { equals: values.state, mode: "insensitive" },
          city: { equals: values.city, mode: "insensitive" },
          zone: { is: { isActive: true } },
        },
        select: { id: true },
      });
      if (duplicate) throw new Error("DELIVERY_ZONE_EXISTS");

      const location = zone.locations[0];
      const rate = zone.rates[0];
      if (!location || !rate) throw new Error("ZONE_CONFIGURATION_INCOMPLETE");

      const saved = await tx.shippingZone.update({
        where: { id },
        data: {
          name: values.name,
          description: `Delivery coverage for ${values.city}, ${values.state}, Nigeria.`,
          locations: {
            update: { where: { id: location.id }, data: { state: values.state, city: values.city } },
          },
          rates: {
            update: {
              where: { id: rate.id },
              data: {
                name: `${values.city} delivery`,
                fee: new Prisma.Decimal(values.fee),
                estimatedMinDays: values.minDays,
                estimatedMaxDays: values.maxDays,
              },
            },
          },
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "SHIPPING_ZONE_UPDATED",
          entityType: "ShippingZone",
          entityId: id,
          metadata: { name: values.name, state: values.state, city: values.city, fee: values.fee },
        },
      });
      return saved;
    }, { isolationLevel: "Serializable" });

    return Response.json({ message: "Delivery zone updated.", zone: { id: updated.id, name: updated.name } }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error.message === "ZONE_NOT_FOUND") return fail("Delivery zone not found.", 404);
    if (error.message === "DELIVERY_ZONE_EXISTS") return fail("Another active delivery zone already covers this state and city.", 409);
    if (error.message === "ZONE_CONFIGURATION_INCOMPLETE") return fail("This delivery zone is missing its location or rate configuration.", 409);
    console.error("Delivery-zone update failed:", error);
    return fail("Could not update this delivery zone. Please try again.", 500);
  }
}
