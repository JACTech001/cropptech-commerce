import { requireAppRole } from "../../../../../../lib/auth/user";
import { prisma } from "../../../../../../lib/db";

const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET(request, { params }) {
  const access = await requireAppRole(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return reply({ error: "Sign in to view this conversation." }, access.status);
  const { ticketId } = await params;
  try {
    const ticket = await prisma.customerSupportTicket.findFirst({
      where: { id: ticketId, ...(access.user.role === "CUSTOMER" ? { customerId: access.user.id } : {}) },
      select: {
        id: true, ticketNumber: true, subject: true, category: true, issueType: true, status: true, priority: true,
        createdAt: true, updatedAt: true,
        order: { select: { orderNumber: true } },
        customer: { select: { fullName: true, email: true } },
        messages: { where: access.user.role === "CUSTOMER" ? { isInternal: false } : {}, orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, fullName: true, role: true } } } },
      },
    });
    if (!ticket) return reply({ error: "This support request was not found." }, 404);
    return reply({ ticket });
  } catch (error) {
    console.error("Support conversation could not be loaded:", error);
    return reply({ error: "The conversation is temporarily unavailable." }, 500);
  }
}

export async function POST(request, { params }) {
  const access = await requireAppRole(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return reply({ error: "Sign in to reply to this support request." }, access.status);
  const { ticketId } = await params;
  const body = await request.json().catch(() => null);
  const message = clean(body?.message, 5000);
  const isStaff = ["ADMIN", "SUPER_ADMIN"].includes(access.user.role);
  const isInternal = isStaff && body?.isInternal === true;
  if (message.length < 2) return reply({ error: "Enter a message before sending." }, 400);

  try {
    const ticket = await prisma.customerSupportTicket.findFirst({
      where: { id: ticketId, ...(isStaff ? {} : { customerId: access.user.id }) },
      select: { id: true, customerId: true, status: true, ticketNumber: true },
    });
    if (!ticket) return reply({ error: "This support request was not found." }, 404);
    if (!isStaff && ["RESOLVED", "CLOSED"].includes(ticket.status)) return reply({ error: "This request is closed. Open a new request if you need more help." }, 409);

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.supportTicketMessage.create({
        data: { ticketId, senderId: access.user.id, senderRole: isStaff ? "STAFF" : "CUSTOMER", body: message, isInternal },
        include: { sender: { select: { id: true, fullName: true, role: true } } },
      });
      if (!isInternal) {
        await tx.customerSupportTicket.update({
          where: { id: ticketId },
          data: {
            lastMessageAt: new Date(),
            ...(isStaff ? { status: "WAITING_FOR_CUSTOMER" } : { status: "IN_PROGRESS", resolvedAt: null, closedAt: null }),
          },
        });
      }
      if (isStaff && !isInternal) {
        await tx.customerNotification.create({
          data: {
            userId: ticket.customerId, channel: "IN_APP", subject: "A reply to your support request",
            message: "Our support team replied to " + ticket.ticketNumber + ". Open your support conversation to view the response.",
            status: "QUEUED",
          },
        });
      } else if (!isStaff) {
        const admins = await tx.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true }, select: { id: true } });
        if (admins.length) await tx.adminNotification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id, eventKey: "SUPPORT_REPLY:" + created.id,
            category: "support", title: "Customer replied to a support request",
            message: ticket.ticketNumber + " has a new customer message.",
            href: "/admin/support/" + ticketId,
          })),
          skipDuplicates: true,
        });
      }
      return created;
    });
    return reply({ message: result }, 201);
  } catch (error) {
    console.error("Support reply could not be saved:", error);
    return reply({ error: "Your reply could not be sent. Please try again." }, 500);
  }
}
