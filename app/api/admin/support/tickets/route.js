import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request) {
  try {
    // Keep session resolution inside the handler so auth-provider or user-sync
    // failures are returned as JSON instead of an unhandled server response.
    const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
    if (access.status !== 200) {
      return reply(
        { error: access.status === 401
          ? "Please sign in again to view support requests."
          : "You are not authorised to view support requests." },
        access.status
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const allowed = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];

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

    const counts = await prisma.customerSupportTicket.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    return reply({
      tickets,
      counts: Object.fromEntries(counts.map((item) => [item.status, item._count._all])),
    });
  } catch (error) {
    // Log plain text rather than the Error object. This avoids triggering
    // Next.js dev-overlay inspection errors and exposes the original failure.
    const details = error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack || ""}`
      : String(error);
    console.error("Admin support inbox could not be loaded:\n" + details);
    return reply(
      { error: "The support inbox could not be loaded. Check the server logs for the underlying error." },
      500
    );
  }
}
