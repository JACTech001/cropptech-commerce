import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const response = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return response({ error: "You are not authorised to view admin notifications." }, access.status);

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [admins, orders, submissions, lowStock, returns, refunds] = await Promise.all([
      prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true }, select: { id: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, orderNumber: true, createdAt: true } }),
      prisma.paymentSubmission.findMany({ where: { status: "PENDING", submittedAt: { gte: since } }, orderBy: { submittedAt: "desc" }, take: 30, select: { id: true, submittedAt: true, payment: { select: { order: { select: { orderNumber: true } } } } } }),
      prisma.productVariant.findMany({ where: { isActive: true, stockQuantity: { lte: 5 } }, orderBy: { stockQuantity: "asc" }, take: 30, select: { id: true, sku: true, size: true, colour: true, stockQuantity: true, product: { select: { name: true } } } }),
      prisma.returnRequest.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }, orderBy: { requestedAt: "desc" }, take: 30, select: { id: true, status: true, requestedAt: true, order: { select: { orderNumber: true } } } }),
      prisma.refund.findMany({ where: { status: { in: ["REQUESTED", "UNDER_REVIEW"] } }, orderBy: { requestedAt: "desc" }, take: 30, select: { id: true, status: true, requestedAt: true, payment: { select: { order: { select: { orderNumber: true } } } } } }),
    ]);

    const events = [
      ...orders.map((item) => ({ eventKey: "ORDER_CREATED:" + item.id, category: "order", title: "New order received", message: "Order " + item.orderNumber + " was placed.", href: "/admin/orders", createdAt: item.createdAt })),
      ...submissions.map((item) => ({ eventKey: "PAYMENT_PENDING:" + item.id, category: "payment", title: "Payment awaiting review", message: "A transfer was submitted for order " + item.payment.order.orderNumber + ".", href: "/admin/payments", createdAt: item.submittedAt })),
      ...lowStock.map((item) => ({ eventKey: "LOW_STOCK:" + item.id, category: "inventory", title: "Low stock alert", message: item.product.name + " · " + item.size + " / " + item.colour + " (" + item.sku + ") has " + item.stockQuantity + " unit(s) remaining.", href: "/admin/products", createdAt: new Date() })),
      ...returns.map((item) => ({ eventKey: "RETURN_PENDING:" + item.id, category: "returns", title: "Return request needs review", message: "Order " + item.order.orderNumber + " has a return request awaiting action.", href: "/admin/returns", createdAt: item.requestedAt })),
      ...refunds.map((item) => ({ eventKey: "REFUND_PENDING:" + item.id, category: "refund", title: "Refund needs review", message: "A refund for order " + item.payment.order.orderNumber + " is " + item.status.toLowerCase().replaceAll("_", " ") + ".", href: "/admin/returns", createdAt: item.requestedAt })),
    ];

    if (admins.length && events.length) {
      await prisma.adminNotification.createMany({
        data: admins.flatMap((admin) => events.map((event) => ({
          userId: admin.id,
          eventKey: event.eventKey,
          category: event.category,
          title: event.title,
          message: event.message,
          href: event.href,
          createdAt: event.createdAt,
        }))),
        skipDuplicates: true,
      });
    }

    const notifications = await prisma.adminNotification.findMany({
      where: { userId: access.user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return response({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length, lowStockThreshold: 5 });
  } catch (error) {
    console.error("Admin notifications could not be loaded:", error);
    return response({ error: "Notifications are temporarily unavailable." }, 500);
  }
}

export async function POST(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return response({ error: "You are not authorised to update admin notifications." }, access.status);
  const body = await request.json().catch(() => null);
  try {
    if (body?.action === "read-all") {
      await prisma.adminNotification.updateMany({
        where: { userId: access.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return response({ message: "All notifications marked as read." });
    }
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) return response({ error: "A notification ID is required." }, 400);
    const result = await prisma.adminNotification.updateMany({
      where: { id, userId: access.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return response({ message: result.count ? "Notification marked as read." : "Notification is already read or unavailable." });
  } catch (error) {
    console.error("Admin notification update failed:", error);
    return response({ error: "The notification could not be updated." }, 500);
  }
}
