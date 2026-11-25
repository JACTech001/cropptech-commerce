import { createHash } from "node:crypto";
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

  const expectedStatus = typeof body.expectedStatus === "string" ? body.expectedStatus : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
  const provider = typeof body.provider === "string" ? body.provider.trim().slice(0, 100) : "";
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim().slice(0, 120) : "";
  const trackingUrl = typeof body.trackingUrl === "string" ? body.trackingUrl.trim().slice(0, 500) : "";
  const idempotencyKey = request.headers.get("idempotency-key") || "";
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) return fail("Update session expired. Refresh the page and try again.", 400);
  const scope = "ADMIN_ORDER_STATUS:" + orderNumber + ":" + expectedStatus;
  const requestHash = createHash("sha256").update(JSON.stringify({ expectedStatus, note, provider, trackingNumber, trackingUrl })).digest("hex");
  const existingRequest = await prisma.idempotencyRecord.findUnique({
    where: { customerId_scope_key: { customerId: access.user.id, scope, key: idempotencyKey } },
  });
  if (existingRequest) {
    if (existingRequest.requestHash !== requestHash) return fail("This update key was already used with different details.", 409);
    if (existingRequest.response) return Response.json(existingRequest.response, { headers: { "Cache-Control": "no-store", "Idempotency-Replayed": "true" } });
    return fail("This order update is still being processed. Refresh and check the order status.", 409);
  }
  if (trackingUrl) {
    try {
      const url = new URL(trackingUrl);
      if (url.protocol !== "https:") return fail("Tracking links must use HTTPS.", 400);
    } catch { return fail("Enter a valid HTTPS tracking link.", 400); }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.idempotencyRecord.create({
        data: { customerId: access.user.id, scope, key: idempotencyKey, requestHash },
      });
      const order = await tx.order.findUnique({
        where: { orderNumber },
        include: { shipments: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== expectedStatus) throw new Error("ORDER_STATUS_CHANGED");
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
      const responsePayload = { message: "Order status updated.", orderNumber, status: nextStatus };
      await tx.idempotencyRecord.update({
        where: { customerId_scope_key: { customerId: access.user.id, scope, key: idempotencyKey } },
        data: { response: responsePayload },
      });
      return responsePayload;
    }, { isolationLevel: "Serializable" });

    return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error?.code === "P2002" || error?.code === "P2034") {
      const replay = await prisma.idempotencyRecord.findUnique({
        where: { customerId_scope_key: { customerId: access.user.id, scope, key: idempotencyKey } },
      });
      if (replay?.requestHash === requestHash && replay.response) {
        return Response.json(replay.response, { headers: { "Cache-Control": "no-store", "Idempotency-Replayed": "true" } });
      }
    }
    const known = {
      ORDER_NOT_FOUND: [404, "Order not found."],
      ORDER_STATUS_CHANGED: [409, "The order status has changed. Refresh the order before making another update."],
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
