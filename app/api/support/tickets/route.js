import { randomBytes } from "node:crypto";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const categories = ["GENERAL", "ORDER_ISSUE", "PAYMENT", "DELIVERY", "RETURN_REFUND", "PRODUCT_QUESTION", "ACCOUNT", "OTHER"];
const issueTypes = ["GENERAL_ENQUIRY","WRONG_ITEM_RECEIVED","ITEM_MISSING_FROM_ORDER","DAMAGED_ITEM_RECEIVED","DEFECTIVE_ITEM","ORDER_NOT_RECEIVED","ORDER_STATUS_OR_TRACKING","PAYMENT_DEBITED_NOT_CONFIRMED","DUPLICATE_PAYMENT","PAYMENT_AMOUNT_DISPUTE","REFUND_NOT_RECEIVED","DELIVERY_DELAY","DELIVERY_ADDRESS_PROBLEM","DELIVERY_FEE_DISPUTE","RETURN_OR_EXCHANGE","PRODUCT_QUALITY","WRONG_SIZE_OR_FIT","PRODUCT_DESCRIPTION_MISMATCH","ACCOUNT_ACCESS","WEBSITE_OR_CHECKOUT_ERROR","STAFF_OR_SERVICE_COMPLAINT","OTHER"];

export async function GET() {
  const access = await requireAppRole(["CUSTOMER"]);
  if (access.status !== 200) return reply({ error: "Sign in to view your support requests." }, access.status);
  try {
    const tickets = await prisma.customerSupportTicket.findMany({
      where: { customerId: access.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true, ticketNumber: true, subject: true, category: true, status: true,
        issueType: true, priority: true, createdAt: true, updatedAt: true, lastMessageAt: true,
        order: { select: { orderNumber: true } },
        messages: { where: { isInternal: false }, orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderRole: true, createdAt: true } },
      },
    });
    return reply({ tickets });
  } catch (error) {
    console.error("Support tickets could not be loaded:", error);
    return reply({ error: "Your support requests are temporarily unavailable." }, 500);
  }
}

export async function POST(request) {
  const access = await requireAppRole(["CUSTOMER"]);
  if (access.status !== 200) return reply({ error: "Sign in to contact customer care." }, access.status);
  const body = await request.json().catch(() => null);
  const subject = clean(body?.subject, 140);
  const message = clean(body?.message, 5000);
  const category = categories.includes(body?.category) ? body.category : "GENERAL";
  const issueType = issueTypes.includes(body?.issueType) ? body.issueType : "GENERAL_ENQUIRY";
  const orderId = clean(body?.orderId, 80) || null;
  if (subject.length < 4 || message.length < 10) return reply({ error: "Enter a subject (at least 4 characters) and a message (at least 10 characters)." }, 400);

  try {
    if (orderId) {
      const order = await prisma.order.findFirst({ where: { id: orderId, customerId: access.user.id }, select: { id: true } });
      if (!order) return reply({ error: "That order could not be found in your account." }, 400);
    }
    const ticketNumber = "CT-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + randomBytes(3).toString("hex").toUpperCase();
    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.customerSupportTicket.create({
        data: {
          ticketNumber, customerId: access.user.id, orderId, category, issueType, subject,
          messages: { create: { senderId: access.user.id, senderRole: "CUSTOMER", body: message } },
        },
        select: { id: true, ticketNumber: true, subject: true, status: true, createdAt: true },
      });
      const admins = await tx.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true }, select: { id: true } });
      if (admins.length) {
        await tx.adminNotification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id, eventKey: "SUPPORT_TICKET:" + created.id,
            category: "support", title: "New customer support request",
            message: created.ticketNumber + " · " + created.subject,
            href: "/admin/support/" + created.id,
          })),
          skipDuplicates: true,
        });
      }
      return created;
    });
    return reply({ ticket }, 201);
  } catch (error) {
    console.error("Support ticket could not be created:", error);
    return reply({ error: "Your request could not be submitted. Please try again." }, 500);
  }
}
