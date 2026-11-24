import { createHash, randomBytes } from "node:crypto";
import { requireAppRole } from "../../../../../../lib/auth/user";
import { prisma } from "../../../../../../lib/db";

function error(message, status) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request, { params }) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return error(access.status === 401 ? "Sign in to review payments." : "You are not authorized to review payments.", access.status);

  const { submissionId } = await params;
  let body;
  try { body = await request.json(); } catch { return error("Invalid review request.", 400); }
  const decision = String(body.decision || "").toUpperCase();
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
  if (!["APPROVED", "REJECTED", "NEEDS_CLARIFICATION"].includes(decision)) return error("Choose a valid payment decision.", 400);
  if (decision !== "APPROVED" && !note) return error("Add a note explaining this decision for the customer.", 400);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.paymentSubmission.findUnique({
        where: { id: submissionId },
        include: { payment: { include: { order: { include: { customer: true, items: true } } } } },
      });
      if (!submission) throw new Error("SUBMISSION_NOT_FOUND");
      if (submission.status !== "PENDING") throw new Error("SUBMISSION_ALREADY_REVIEWED");
      if (decision === "APPROVED" && !submission.amountTransferred.equals(submission.payment.amountDue)) {
        throw new Error("AMOUNT_MISMATCH");
      }

      const claimed = await tx.paymentSubmission.updateMany({
        where: { id: submission.id, status: "PENDING" },
        data: { status: decision },
      });
      if (claimed.count !== 1) throw new Error("SUBMISSION_ALREADY_REVIEWED");
      await tx.paymentVerification.create({
        data: {
          submissionId: submission.id,
          verifiedById: access.user.id,
          decision,
          note: note || "Transfer amount matched the order total and was verified against the bank transaction.",
        },
      });

      let nextOrderStatus = submission.payment.order.status;
      let nextPaymentStatus = "UNDER_REVIEW";
      if (decision === "APPROVED") {
        nextOrderStatus = "CONFIRMED";
        nextPaymentStatus = "PAID";
        await tx.payment.update({
          where: { id: submission.paymentId },
          data: { status: "PAID", amountPaid: submission.amountTransferred },
        });
        await tx.stockReservation.updateMany({
          where: { orderId: submission.payment.orderId, status: "ACTIVE" },
          data: { status: "CONSUMED" },
        });
        const order = submission.payment.order;
        const issuedAt = new Date();
        const receiptData = {
          storeName: "CROPPTECH COMMERCE STORE",
          slogan: "BUSINESS MOVES WITH COMMERCE.",
          receiptNumber: "CPS-" + issuedAt.getFullYear() + "-" + randomBytes(4).toString("hex").toUpperCase(),
          orderNumber: order.orderNumber,
          issuedAt: issuedAt.toISOString(),
          paidAt: issuedAt.toISOString(),
          customer: {
            name: order.customer.fullName || [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || order.recipientName,
            email: order.customer.email,
          },
          payment: { method: "Bank transfer", bankName: submission.bankName, transactionReference: submission.transactionReference, amountPaid: submission.amountTransferred.toString(), currency: submission.payment.currency },
          totals: { subtotal: order.subtotal.toString(), delivery: order.shippingFee.toString(), discount: order.discountTotal.toString(), total: order.total.toString() },
          items: order.items.map((item) => ({ name: item.productName, sku: item.sku, size: item.size, colour: item.colour, quantity: item.quantity, unitPrice: item.unitPrice.toString(), lineTotal: item.lineTotal.toString() })),
        };
        const snapshotHash = createHash("sha256").update(JSON.stringify(receiptData)).digest("hex");
        const existingReceipt = await tx.paymentReceipt.findUnique({ where: { paymentId: submission.paymentId } });
        if (!existingReceipt) {
          await tx.paymentReceipt.create({ data: { receiptNumber: receiptData.receiptNumber, paymentId: submission.paymentId, orderId: order.id, receiptData, snapshotHash, issuedAt } });
          await tx.adminAuditLog.create({ data: { actorId: access.user.id, action: "PAYMENT_RECEIPT_ISSUED", entityType: "PaymentReceipt", entityId: submission.paymentId, metadata: { orderNumber: order.orderNumber, receiptNumber: receiptData.receiptNumber, snapshotHash } } });
        }
      } else if (decision === "REJECTED") {
        nextOrderStatus = "AWAITING_PAYMENT";
        nextPaymentStatus = "REJECTED";
        await tx.payment.update({ where: { id: submission.paymentId }, data: { status: "REJECTED" } });
      } else {
        await tx.payment.update({ where: { id: submission.paymentId }, data: { status: "UNDER_REVIEW" } });
      }

      if (nextOrderStatus !== submission.payment.order.status) {
        await tx.order.update({
          where: { id: submission.payment.orderId },
          data: { status: nextOrderStatus, paymentStatus: nextPaymentStatus },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: submission.payment.orderId,
            fromStatus: submission.payment.order.status,
            toStatus: nextOrderStatus,
            changedById: access.user.id,
            note: note || "Payment verified and approved.",
          },
        });
      } else {
        await tx.order.update({
          where: { id: submission.payment.orderId },
          data: { paymentStatus: nextPaymentStatus },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "PAYMENT_SUBMISSION_" + decision,
          entityType: "PaymentSubmission",
          entityId: submission.id,
          metadata: { orderId: submission.payment.orderId, orderNumber: submission.payment.order.orderNumber, note },
        },
      });
      await tx.customerNotification.create({
        data: {
          userId: submission.submittedById,
          channel: "IN_APP",
          subject: decision === "APPROVED" ? "Payment confirmed" : decision === "REJECTED" ? "Payment needs attention" : "Payment clarification requested",
          message: decision === "APPROVED"
            ? `Your payment for order ${submission.payment.order.orderNumber} has been verified. Your order is confirmed.`
            : `There is an update to the payment submission for order ${submission.payment.order.orderNumber}: ${note}`,
          status: "QUEUED",
        },
      });

      return { orderNumber: submission.payment.order.orderNumber, decision };
    });

    return Response.json({ message: "Payment review saved.", ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (reviewError) {
    const known = {
      SUBMISSION_NOT_FOUND: [404, "Payment submission not found."],
      SUBMISSION_ALREADY_REVIEWED: [409, "This payment submission has already been reviewed."],
      AMOUNT_MISMATCH: [409, "The submitted amount does not match the order total. Do not approve this payment."],
    };
    const mapped = known[reviewError?.message];
    if (mapped) return error(mapped[1], mapped[0]);
    console.error("Payment review failed:", reviewError);
    return error("We could not save this payment review. Please try again.", 500);
  }
}
