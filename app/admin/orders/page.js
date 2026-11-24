import { notFound, redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import AdminShell from "../../../components/AdminShell";
import AdminOrdersManager from "../../../components/AdminOrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Forders");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const records = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      customer: { select: { email: true, fullName: true } },
      items: true,
      shipments: { orderBy: { createdAt: "desc" }, take: 1 },
      payment: {
        include: {
          submissions: { orderBy: { submittedAt: "desc" } },
        },
      },
    },
  });

  const orders = records.map((order) => {
    const shipment = order.shipments[0] || null;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerName: order.customer.fullName || "",
      customerEmail: order.customer.email,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      deliveryState: order.deliveryState,
      deliveryCity: order.deliveryCity,
      deliveryLocality: order.deliveryLocality || "",
      deliveryAddress: order.deliveryAddress,
      deliveryLandmark: order.deliveryLandmark || "",
      customerNote: order.customerNote || "",
      subtotal: order.subtotal.toString(),
      shippingFee: order.shippingFee.toString(),
      discountTotal: order.discountTotal.toString(),
      total: order.total.toString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        size: item.size,
        colour: item.colour,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: item.lineTotal.toString(),
      })),
      shipment: shipment ? {
        provider: shipment.provider || "",
        trackingNumber: shipment.trackingNumber || "",
        trackingUrl: shipment.trackingUrl || "",
      } : null,
      payment: order.payment ? {
        submissions: order.payment.submissions.map((submission) => ({
          id: submission.id,
          accountNameUsed: submission.accountNameUsed,
          amountTransferred: submission.amountTransferred.toString(),
          bankName: submission.bankName,
          transactionReference: submission.transactionReference,
          customerNote: submission.customerNote || "",
          receiptStorageKey: submission.receiptStorageKey || "",
          status: submission.status,
          submittedAt: submission.submittedAt.toISOString(),
        })),
      } : null,
    };
  });

  return (
    <AdminShell email={user.email}>
      <main className="admin-page admin-route-page admin-orders-page">
        <div className="admin-wrap">
          <div className="admin-heading admin-orders-page-heading">
            <p className="eyebrow">STORE MANAGEMENT / ORDER OPERATIONS</p>
            <h1>Order <em>management.</em></h1>
            <p>Find customer orders, review payment progress, check delivery details and manage fulfilment from one workspace.</p>
          </div>
          <AdminOrdersManager orders={orders}/>
        </div>
      </main>
    </AdminShell>
  );
}
