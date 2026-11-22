import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to configure delivery.", access.status);
  let body;
  try { body = await request.json(); } catch { return fail("Invalid delivery-zone details.", 400); }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const state = typeof body.state === "string" ? body.state.trim().slice(0, 100) : "";
  const city = typeof body.city === "string" ? body.city.trim().slice(0, 100) : "";
  const feeRaw = String(body.fee ?? "").trim();
  const minDays = Number(body.estimatedMinDays);
  const maxDays = Number(body.estimatedMaxDays);

  if (!name || !state || !city || !/^(?:\d+)(?:\.\d{1,2})?$/.test(feeRaw) || !Number.isInteger(minDays) || !Number.isInteger(maxDays) || minDays < 1 || maxDays < minDays || maxDays > 60) {
    return fail("Enter a zone name, state, city, valid NGN delivery fee and a valid delivery estimate.", 400);
  }

  try {
    const zone = await prisma.$transaction(async (tx) => {
      const created = await tx.shippingZone.create({
        data: {
          name,
          description: `Delivery coverage for ${city}, ${state}, Nigeria.`,
          locations: { create: { state, city } },
          rates: {
            create: {
              name: `${city} delivery`,
              fee: new Prisma.Decimal(feeRaw),
              estimatedMinDays: minDays,
              estimatedMaxDays: maxDays,
              isActive: true,
            },
          },
        },
        include: { rates: true },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "SHIPPING_ZONE_CREATED",
          entityType: "ShippingZone",
          entityId: created.id,
          metadata: { name, state, city, fee: feeRaw },
        },
      });
      return created;
    });
    return Response.json({ message: "Delivery zone saved.", zone: { id: zone.id, name: zone.name } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Shipping zone creation failed:", error);
    return fail("Could not save this delivery zone. Please try again.", 500);
  }
}
