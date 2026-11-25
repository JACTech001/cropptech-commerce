import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const fail = (message, status = 400) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request, context) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorised to update returns or refunds.", access.status);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const action = typeof body?.action === "string" ? body.action.toUpperCase() : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : "";
  const externalReference = typeof body?.externalReference === "string" ? body.externalReference.trim().slice(0, 120) : "";
  if (!id || !["RETURN", "REFUND"].includes(type)) return fail("Choose a valid return or refund record.");
  if (action === "REJECT" && !note) return fail("Add a note explaining why this request is being rejected.");

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (type === "RETURN") {
        const current = await tx.returnRequest.findUnique({ where: { id }, include: { order: { select: { orderNumber: true, customerId: true } } } });
        if (!current) throw new Error("RECORD_NOT_FOUND");
        const transitions = {
          SUBMITTED: { UNDER_REVIEW: "UNDER_REVIEW", APPROVE: "APPROVED", REJECT: "REJECTED" },
          UNDER_REVIEW: { APPROVE: "APPROVED", REJECT: "REJECTED" },
          APPROVED: { COMPLETE: "COMPLETED" },
        };
        const next = transitions[current.status]?.[action];
        if (!next) throw new Error("INVALID_TRANSITION");
        const updated = await tx.returnRequest.update({
          where: { id },
          data: {
            status: next,
            ...(next !== "UNDER_REVIEW" ? { reviewedById: access.user.id, reviewedAt: new Date() } : {}),
            ...(next === "COMPLETED" ? { completedAt: new Date() } : {}),
            ...(note ? { adminNote: note } : {}),
          },
        });
        await tx.adminAuditLog.create({ data: { actorId: access.user.id, action: "RETURN_" + next, entityType: "ReturnRequest", entityId: id, metadata: { orderNumber: current.order.orderNumber, note } } });
        await tx.customerNotification.create({ data: { userId: current.order.customerId, channel: "IN_APP", subject: "Return request updated", message: "Your return request for order " + current.order.orderNumber + " is now " + next.toLowerCase().replaceAll("_", " ") + (note ? ". " + note : "."), status: "QUEUED" } });
        return { type, record: updated, message: "Return request updated." };
      }

      const current = await tx.refund.findUnique({ where: { id }, include: { payment: { include: { order: { select: { orderNumber: true, customerId: true } } } } } });
      if (!current) throw new Error("RECORD_NOT_FOUND");
      const transitions = {
        REQUESTED: { UNDER_REVIEW: "UNDER_REVIEW", APPROVE: "APPROVED", REJECT: "REJECTED" },
        UNDER_REVIEW: { APPROVE: "APPROVED", REJECT: "REJECTED" },
        APPROVED: { PROCESS: "PROCESSING", REJECT: "REJECTED" },
        PROCESSING: { COMPLETE: "COMPLETED", FAIL: "FAILED" },
        FAILED: { RETRY: "PROCESSING" },
      };
      const next = transitions[current.status]?.[action];
      if (!next) throw new Error("INVALID_TRANSITION");
      if (next === "COMPLETED" && !externalReference) throw new Error("REFERENCE_REQUIRED");
      if (next === "COMPLETED") {
        const completed = await tx.refund.aggregate({
          where: { paymentId: current.paymentId, status: "COMPLETED", id: { not: id } },
          _sum: { amount: true },
        });
        const alreadyRefunded = completed._sum.amount || 0;
        if (Number(alreadyRefunded) + Number(current.amount) > Number(current.payment.amountPaid)) throw new Error("REFUND_EXCEEDS_PAID");
      }
      const now = new Date();
      const updated = await tx.refund.update({
        where: { id },
        data: {
          status: next,
          ...(note ? { adminNote: note } : {}),
          ...(externalReference ? { externalReference } : {}),
          ...(["APPROVED", "REJECTED"].includes(next) && !current.reviewedAt ? { reviewedById: access.user.id, reviewedAt: now } : {}),
          ...(next === "COMPLETED" ? { reviewedById: access.user.id, reviewedAt: current.reviewedAt || now, completedAt: now } : {}),
        },
      });
      if (next === "COMPLETED") {
        const completed = await tx.refund.aggregate({ where: { paymentId: current.paymentId, status: "COMPLETED", id: { not: id } }, _sum: { amount: true } });
        const totalRefunded = Number(completed._sum.amount || 0) + Number(current.amount);
        const paymentStatus = totalRefunded >= Number(current.payment.amountPaid) ? "REFUNDED" : "PARTIALLY_REFUNDED";
        await tx.payment.update({ where: { id: current.paymentId }, data: { status: paymentStatus } });
        await tx.order.update({ where: { id: current.orderId }, data: { paymentStatus } });
      }
      await tx.adminAuditLog.create({ data: { actorId: access.user.id, action: "REFUND_" + next, entityType: "Refund", entityId: id, metadata: { orderNumber: current.payment.order.orderNumber, amount: current.amount.toString(), note, externalReference } } });
      await tx.customerNotification.create({ data: { userId: current.payment.order.customerId, channel: "IN_APP", subject: "Refund status updated", message: "Your refund for order " + current.payment.order.orderNumber + " is now " + next.toLowerCase().replaceAll("_", " ") + (note ? ". " + note : "."), status: "QUEUED" } });
      return { type, record: updated, message: "Refund status updated." };
    }, { isolationLevel: "Serializable" });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = {
      RECORD_NOT_FOUND: [404, "The selected record could not be found."],
      INVALID_TRANSITION: [409, "That status change is not allowed from the current state."],
      REFERENCE_REQUIRED: [400, "Enter the bank or payment reference before completing a refund."],
      REFUND_EXCEEDS_PAID: [409, "Completed refunds cannot exceed the verified amount paid."],
    };
    if (known[error.message]) return fail(known[error.message][1], known[error.message][0]);
    if (error?.code === "P2034") return fail("This record changed in another session. Refresh and try again.", 409);
    console.error("Return or refund update failed:", error);
    return fail("The record could not be updated.", 500);
  }
}
