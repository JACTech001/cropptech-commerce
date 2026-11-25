import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return reply({ error: "You are not authorised to view support requests." }, access.status);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const allowed = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];
  try {
    const tickets = await prisma.customerSupportTicket.findMany({
      where: {
        ...(allowed.includes(status) ? { status } : {}),
        ...(q ? { OR: [
          { ticketNumber: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
          { customer: { email: { contains: q, mode: "insensitive" } } },
          { customer: { fullName: { contains: q, mode: "insensitive" } } },
        ] } : {}),
      },
      orderBy: [{ lastMessageAt: "desc" }],
      take: 100,
      select: {
        id: true, ticketNumber: true, subject: true, category: true, issueType: true, status: true, priority: true,
        createdAt: true, lastMessageAt: true,
        customer: { select: { fullName: true, email: true } },
        assignee: { select: { fullName: true, email: true } },
        order: { select: { orderNumber: true } },
        messages: { where: { isInternal: false }, orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderRole: true, createdAt: true } },
        _count: { select: { messages: true } },
      },
    });
    const counts = await prisma.customerSupportTicket.groupBy({ by: ["status"], _count: { _all: true } });
    return reply({ tickets, counts: Object.fromEntries(counts.map((item) => [item.status, item._count._all])) });
  } catch (error) {
    console.error("Admin support inbox could not be loaded:", error);
    return reply({ error: "The support inbox is temporarily unavailable." }, 500);
  }
}
