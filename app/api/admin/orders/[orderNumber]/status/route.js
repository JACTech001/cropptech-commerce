import { requireAppRole } from "../../../../../../lib/auth/user";
import { prisma } from "../../../../../../lib/db";

const fail = (message, status) => Response.json(
  { error: message },
  { status, headers: { "Cache-Control": "no-store" } }
);

const transitions = {
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function POST(request, { params }) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to update orders.", access.status);

  const { orderNumber } = await params;
  let body;
  try { body = await request.json(); } catch { return fail("Invalid order update.", 400); }

  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
  const provider = typeof body.provider === "string" ? body.provider.trim().slice(0, 100) : "";
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim().slice(0, 120) : "";
  const trackingUrl = typeof body.trackingUrl === "string" ? body.trackingUrl.trim().slice(0, 500) : "";
  if (trackingUrl) {
    try {
      const url = new URL(trackingUrl);
      if (url.protocol !== "https:") return fail("Tracking links must use HTTPS.", 400);
    } catch { return fail("Enter a valid HTTPS tracking link.", 400); }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { orderNumber },
        include: { shipments: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.paymentStatus !== "PAID") throw new Error("PAYMENT_NOT_CONFIRMED");

      const nextStatus = transitions[order.status];
      if (!nextStatus) throw new Error("INVALID_TRANSITION");

      const now = new Date();
      if (nextStatus === "SHIPPED") {
        await tx.shipment.create({
          data: {
            orderId: order.id,
            provider: provider || null,
            trackingNumber: trackingNumber || null,
            trackingUrl: trackingUrl || null,
            status: "SHIPPED",
            shippedAt: now,
            adminNote: note || null,
          },
        });
      } else if (nextStatus === "DELIVERED") {
        const shipment = order.shipments[0];
        if (!shipment) throw new Error("SHIPMENT_REQUIRED");
        await tx.shipment.update({
          where: { id: shipment.id },
          data: { status: "DELIVERED", deliveredAt: now, adminNote: note || shipment.adminNote },
        });
      }

      await tx.order.update({ where: { id: order.id }, data: { status: nextStatus } });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: nextStatus,
          changedById: access.user.id,
          note: note || `Order marked as ${nextStatus.toLowerCase().replaceAll("_", " ")}.`,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "ORDER_STATUS_UPDATED",
          entityType: "Order",
          entityId: order.id,
          metadata: { orderNumber, fromStatus: order.status, toStatus: nextStatus, provider, trackingNumber },
        },
      });
      await tx.customerNotification.create({
        data: {
          userId: order.customerId,
          channel: "IN_APP",
          subject: `Order ${orderNumber} updated`,
          message: `Your order is now ${nextStatus.toLowerCase().replaceAll("_", " ")}.${trackingNumber ? ` Tracking number: ${trackingNumber}.` : ""}`,
          status: "QUEUED",
        },
      });
      return { orderNumber, status: nextStatus };
    }, { isolationLevel: "Serializable" });

    return Response.json({ message: "Order status updated.", ...updated }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = {
      ORDER_NOT_FOUND: [404, "Order not found."],
      PAYMENT_NOT_CONFIRMED: [409, "Payment must be verified before fulfilment can begin."],
      INVALID_TRANSITION: [409, "This order cannot move to another fulfilment stage."],
      SHIPMENT_REQUIRED: [409, "A shipment record is required before marking this order delivered."],
    };
    const mapped = known[error?.message];
    if (mapped) return fail(mapped[1], mapped[0]);
    console.error("Order status update failed:", error);
    return fail("Could not update this order. Please try again.", 500);
  }
}
