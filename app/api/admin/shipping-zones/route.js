import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

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
    || minDays < 1 || maxDays < minDays || maxDays > 60) {
    return null;
  }
  return { name, state, city, fee, minDays, maxDays };
}

export async function GET() {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to view delivery settings.", access.status);

  const zones = await prisma.shippingZone.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: { locations: true, rates: true },
  });

  return Response.json({
    zones: zones.flatMap((zone) => zone.locations.flatMap((location) =>
      zone.rates.map((rate) => ({
        id: zone.id,
        rateId: rate.id,
        name: zone.name,
        state: location.state,
        city: location.city,
        fee: rate.fee.toString(),
        minDays: rate.estimatedMinDays,
        maxDays: rate.estimatedMaxDays,
        isActive: zone.isActive && rate.isActive,
      }))
    )),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to configure delivery.", access.status);

  const body = await request.json().catch(() => null);
  const values = parseZone(body);
  if (!values) {
    return fail("Enter a zone name, state, city, valid NGN delivery fee and a valid delivery estimate.", 400);
  }

  try {
    const zone = await prisma.$transaction(async (tx) => {
      const duplicate = await tx.shippingZoneLocation.findFirst({
        where: {
          state: { equals: values.state, mode: "insensitive" },
          city: { equals: values.city, mode: "insensitive" },
          zone: { is: { isActive: true } },
        },
        select: { id: true },
      });
      if (duplicate) throw new Error("DELIVERY_ZONE_EXISTS");

      const created = await tx.shippingZone.create({
        data: {
          name: values.name,
          description: `Delivery coverage for ${values.city}, ${values.state}, Nigeria.`,
          locations: { create: { state: values.state, city: values.city } },
          rates: {
            create: {
              name: `${values.city} delivery`,
              fee: new Prisma.Decimal(values.fee),
              estimatedMinDays: values.minDays,
              estimatedMaxDays: values.maxDays,
              isActive: true,
            },
          },
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "SHIPPING_ZONE_CREATED",
          entityType: "ShippingZone",
          entityId: created.id,
          metadata: { name: values.name, state: values.state, city: values.city, fee: values.fee },
        },
      });
      return created;
    }, { isolationLevel: "Serializable" });

    return Response.json({
      message: "Delivery zone saved.",
      zone: { id: zone.id, name: zone.name },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "DELIVERY_ZONE_EXISTS") {
      return fail("A delivery zone already exists for this state and city. Edit that zone instead.", 409);
    }
    console.error("Shipping zone creation failed:", error);
    return fail("Could not save this delivery zone. Please try again.", 500);
  }
}
