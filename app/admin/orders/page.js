import { notFound, redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import AdminShell from "../../../components/AdminShell";
import FulfillmentControls from "../../../components/FulfillmentControls";

export const dynamic = "force-dynamic";

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value));
const labels = { AWAITING_PAYMENT: "Awaiting payment", PAYMENT_UNDER_REVIEW: "Payment under review", CONFIRMED: "Confirmed", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled", EXPIRED: "Expired" };

export default async function AdminOrdersPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Forders");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { customer: { select: { email: true, fullName: true } }, items: true, shipments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return <AdminShell email={user.email}>
    <main className="admin-page admin-route-page"><div className="admin-wrap">
      <div className="admin-heading"><p className="eyebrow">STORE MANAGEMENT / ORDERS</p><h1>Order <em>management.</em></h1><p>Review customer purchases, check delivery details and keep fulfilment moving.</p></div>
      <div className="admin-route-summary"><div><span>TOTAL ORDERS LOADED</span><strong>{orders.length}</strong></div><div><span>AWAITING PAYMENT</span><strong>{orders.filter((o) => o.status === "AWAITING_PAYMENT").length}</strong></div><div><span>IN PROGRESS</span><strong>{orders.filter((o) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)).length}</strong></div><div><span>DELIVERED</span><strong>{orders.filter((o) => o.status === "DELIVERED").length}</strong></div></div>
      <section className="admin-orders-section"><div className="admin-section-heading"><div><p className="eyebrow">ORDER REGISTER</p><h2>Recent orders <span>({orders.length})</span></h2></div></div>
        {!orders.length ? <section className="admin-empty"><ClipboardList size={24}/><h2>No orders yet</h2><p>New customer orders will appear here after checkout.</p></section> :
          <div className="admin-order-list">{orders.map((order) => {
            const shipment = order.shipments[0] || null;
            return <article className="admin-order-card" key={order.id}>
              <div className="admin-order-head"><div><p className="eyebrow">{order.orderNumber}</p><h2>{order.customer.fullName || order.customer.email}</h2><span>{order.customer.email}</span></div><div className="admin-order-total"><strong>{money(order.total)}</strong><span>{labels[order.status] || order.status}</span></div></div>
              <div className="admin-order-facts"><span>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</span><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</span><span>{order.deliveryCity}, {order.deliveryState}</span><span>Payment: {order.paymentStatus.replaceAll("_", " ")}</span></div>
              <div className="admin-order-items">{order.items.map((item) => <p key={item.id}>{item.quantity} × {item.productName} — {item.size}, {item.colour}</p>)}</div>
              {shipment && <div className="admin-shipment-summary"><strong>Latest shipment</strong><span>{shipment.provider || "Courier not specified"}{shipment.trackingNumber ? " · " + shipment.trackingNumber : ""}</span>{shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noreferrer">TRACK SHIPMENT</a>}</div>}
              <FulfillmentControls orderNumber={order.orderNumber} status={order.status} shipment={shipment}/>
            </article>;
          })}</div>}
      </section>
    </div></main>
  </AdminShell>;
}
