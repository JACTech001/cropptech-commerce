import { requireAppRole } from "../../../../../../lib/auth/user";
import { prisma } from "../../../../../../lib/db";

const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const statuses = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

export async function PATCH(request, { params }) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return reply({ error: "You are not authorised to manage support requests." }, access.status);
  const { ticketId } = await params;
  const body = await request.json().catch(() => null);
  const data = {};
  if (statuses.includes(body?.status)) {
    data.status = body.status;
    data.resolvedAt = body.status === "RESOLVED" ? new Date() : null;
    data.closedAt = body.status === "CLOSED" ? new Date() : null;
  }
  if (priorities.includes(body?.priority)) data.priority = body.priority;
  if (body?.assignToMe === true) data.assignedToId = access.user.id;
  if (body?.unassign === true) data.assignedToId = null;
  if (!Object.keys(data).length) return reply({ error: "No valid support update was provided." }, 400);

  try {
    const ticket = await prisma.customerSupportTicket.findUnique({ where: { id: ticketId }, select: { id: true, customerId: true, ticketNumber: true } });
    if (!ticket) return reply({ error: "Support request not found." }, 404);
    const updated = await prisma.customerSupportTicket.update({ where: { id: ticketId }, data });
    if (data.status) {
      await prisma.customerNotification.create({
        data: {
          userId: ticket.customerId, channel: "IN_APP", subject: "Your support request was updated",
          message: ticket.ticketNumber + " status changed to " + data.status.toLowerCase().replaceAll("_", " ") + ".",
          status: "QUEUED",
        },
      });
    }
    return reply({ ticket: updated });
  } catch (error) {
    console.error("Support request update failed:", error);
    return reply({ error: "The support request could not be updated." }, 500);
  }
}
