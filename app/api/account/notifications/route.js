import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const response = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function notificationHref(message) {
  const match = String(message || "").match(/order\s+([A-Z0-9-]+)/i);
  return match ? "/orders/" + encodeURIComponent(match[1]) : "/account";
}

export async function GET() {
  const access = await requireAppRole(["CUSTOMER"]);
  if (access.status !== 200) return response({ error: "Sign in to view your notifications." }, access.status);
  try {
    const [items, unreadCount] = await Promise.all([
      prisma.customerNotification.findMany({
        where: { userId: access.user.id, channel: "IN_APP" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, subject: true, message: true, status: true, readAt: true, createdAt: true },
      }),
      prisma.customerNotification.count({
        where: { userId: access.user.id, channel: "IN_APP", readAt: null, status: { not: "READ" } },
      }),
    ]);
    const notifications = items.map((item) => ({
      ...item,
      href: notificationHref(item.message),
      isRead: Boolean(item.readAt) || item.status === "READ",
    }));
    return response({ notifications, unreadCount });
  } catch (error) {
    console.error("Customer notifications could not be loaded:", error);
    return response({ error: "Your notifications are temporarily unavailable." }, 500);
  }
}

export async function POST(request) {
  const access = await requireAppRole(["CUSTOMER"]);
  if (access.status !== 200) return response({ error: "Sign in to update your notifications." }, access.status);
  const body = await request.json().catch(() => null);
  try {
    if (body?.action === "read-all") {
      await prisma.customerNotification.updateMany({
        where: { userId: access.user.id, channel: "IN_APP", readAt: null },
        data: { readAt: new Date(), status: "READ" },
      });
      return response({ message: "All notifications marked as read." });
    }
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) return response({ error: "A notification ID is required." }, 400);
    const result = await prisma.customerNotification.updateMany({
      where: { id, userId: access.user.id, channel: "IN_APP", readAt: null },
      data: { readAt: new Date(), status: "READ" },
    });
    return response({ message: result.count ? "Notification marked as read." : "Notification is already read or unavailable." });
  } catch (error) {
    console.error("Customer notification update failed:", error);
    return response({ error: "The notification could not be updated." }, 500);
  }
}
