import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const fail = (message, status = 400) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorised to manage returns and refunds.", access.status);
  try {
    const [returns, refunds, refundablePayments] = await Promise.all([
      prisma.returnRequest.findMany({
        orderBy: { requestedAt: "desc" }, take: 100,
        include: { order: { select: { orderNumber: true, customer: { select: { email: true, fullName: true } } } }, items: { include: { orderItem: { select: { productName: true, sku: true, size: true, colour: true, quantity: true } } } } },
      }),
      prisma.refund.findMany({
        orderBy: { requestedAt: "desc" }, take: 100,
        include: { payment: { select: { amountPaid: true, currency: true, order: { select: { orderNumber: true, customer: { select: { email: true, fullName: true } } } } } }, returnRequest: { select: { id: true, status: true } } },
      }),
      prisma.payment.findMany({
        where: { status: { in: ["PAID", "PARTIALLY_REFUNDED"] }, amountPaid: { gt: 0 } },
        orderBy: { updatedAt: "desc" }, take: 100,
        include: { order: { select: { orderNumber: true, customer: { select: { email: true, fullName: true } } } }, refunds: { where: { status: { notIn: ["REJECTED", "FAILED"] } }, select: { amount: true } } },
      }),
    ]);
    const eligiblePayments = refundablePayments.map((payment) => {
      const committed = payment.refunds.reduce((sum, refund) => sum + Number(refund.amount), 0);
      return {
        paymentId: payment.id,
        orderNumber: payment.order.orderNumber,
        customerName: payment.order.customer.fullName || payment.order.customer.email,
        customerEmail: payment.order.customer.email,
        amountPaid: payment.amountPaid.toString(),
        committed: committed.toFixed(2),
        remaining: Math.max(0, Number(payment.amountPaid) - committed).toFixed(2),
        currency: payment.currency,
      };
    }).filter((payment) => Number(payment.remaining) > 0);
    return Response.json({ returns, refunds, refundablePayments: eligiblePayments }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Returns and refunds load failed:", error);
    return fail("Returns and refunds are temporarily unavailable.", 500);
  }
}

export async function POST(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorised to create refunds.", access.status);
  const body = await request.json().catch(() => null);
  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim().slice(0, 80) : "";
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 1000) : "";
  const amountText = String(body?.amount ?? "").trim();
  if (!orderNumber || !reason || !/^(?:\d+)(?:\.\d{1,2})?$/.test(amountText) || Number(amountText) <= 0) {
    return fail("Choose a paid order, enter a valid refund amount and provide a reason.");
  }
  try {
    const created = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { order: { orderNumber }, status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
        include: { order: { include: { customer: true } }, refunds: { where: { status: { notIn: ["REJECTED", "FAILED"] } }, select: { amount: true } } },
      });
      if (!payment) throw new Error("PAYMENT_NOT_REFUNDABLE");
      const committed = payment.refunds.reduce((sum, refund) => sum.add(refund.amount), new Prisma.Decimal(0));
      const remaining = payment.amountPaid.sub(committed);
      const amount = new Prisma.Decimal(amountText);
      if (amount.greaterThan(remaining)) throw new Error("REFUND_EXCEEDS_BALANCE");
      const refund = await tx.refund.create({
        data: { paymentId: payment.id, orderId: payment.orderId, amount, reason, status: "REQUESTED" },
      });
      await tx.adminAuditLog.create({
        data: { actorId: access.user.id, action: "REFUND_REQUEST_CREATED", entityType: "Refund", entityId: refund.id, metadata: { orderNumber, amount: amount.toString(), reason } },
      });
      await tx.customerNotification.create({
        data: { userId: payment.customerId, channel: "IN_APP", subject: "Refund request received", message: "A refund request for order " + orderNumber + " has been recorded. The store will update you as it is reviewed.", status: "QUEUED" },
      });
      return refund;
    }, { isolationLevel: "Serializable" });
    return Response.json({ refund: created, message: "Refund request recorded for review." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "PAYMENT_NOT_REFUNDABLE") return fail("Only orders with verified payments can be refunded.", 409);
    if (error.message === "REFUND_EXCEEDS_BALANCE") return fail("The refund amount exceeds the remaining refundable balance.", 409);
    if (error?.code === "P2034") return fail("The refundable balance changed in another session. Refresh and try again.", 409);
    console.error("Refund creation failed:", error);
    return fail("The refund request could not be created.", 500);
  }
}
