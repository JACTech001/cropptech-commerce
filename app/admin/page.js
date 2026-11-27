import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, ShieldCheck } from "lucide-react";
import { getCurrentAppUser } from "../../lib/auth/user";
import { prisma } from "../../lib/db";
import PaymentReviewControls from "../../components/PaymentReviewControls";
import AdminShell from "../../components/AdminShell";
import FulfillmentControls from "../../components/FulfillmentControls";
import AdminSectionTabs from "../../components/AdminSectionTabs";

export const dynamic = "force-dynamic";

const money = (value) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 2,
}).format(Number(value));

const labels = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAYMENT_UNDER_REVIEW: "Payment under review",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export default async function AdminPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      customer: { select: { email: true, fullName: true } },
      items: true,
      shipments: { orderBy: { createdAt: "desc" }, take: 1 },
      payment: {
        include: {
          submissions: {
            orderBy: { submittedAt: "desc" },
          },
        },
      },
    },
  });

  const pendingCount = orders.reduce((total, order) =>
    total + (order.payment?.submissions.filter((submission) => submission.status === "PENDING").length || 0), 0);
  const paidCount = orders.filter((order) => order.paymentStatus === "PAID").length;
  const fulfilmentCount = orders.filter((order) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)).length;
  const attentionItems = orders.flatMap((order) => (order.payment?.submissions || [])
    .filter((submission) => submission.status === "PENDING")
    .map((submission) => ({ order, submission }))).slice(0, 5);
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const count = orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= date && created < new Date(date.getTime() + 86400000);
    }).length;
    return { label: new Intl.DateTimeFormat("en-NG", { weekday: "short" }).format(date), count };
  });
  const chartMax = Math.max(1, ...chartDays.map((day) => day.count));

  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page">
        <div className="admin-wrap">
          <div className="admin-heading">
            <p className="eyebrow">STORE MANAGEMENT / OVERVIEW</p>
            <h1>Store <em>overview.</em></h1>
            <p>A focused view of order activity, payments that need review and fulfilment in progress.</p>
          </div>

          <AdminSectionTabs sections={[
            {
              id: "summary",
              label: "STORE OVERVIEW",
              content: (
                <div className="admin-overview admin-overview-four">
                <div><ClipboardList size={20}/><span>RECENT ORDERS</span><strong>{orders.length}</strong></div>
                <div><ShieldCheck size={20}/><span>PAYMENTS AWAITING REVIEW</span><strong>{pendingCount}</strong></div>
                <div><ClipboardList size={20}/><span>PAID ORDERS</span><strong>{paidCount}</strong></div>
                <div><span className="admin-overview-icon" aria-hidden="true">✓</span><span>IN FULFILMENT</span><strong>{fulfilmentCount}</strong></div>
                </div>
                <div className="admin-overview-insights-spacer" />
                <section className="admin-insights-grid" aria-label="Store activity and items needing attention">
                <div className="admin-insight-panel admin-trend-panel">
                <div className="admin-panel-heading"><div><p className="eyebrow">ORDER ACTIVITY</p><h2>Last 7 days</h2></div><span className="admin-panel-meta">Orders received</span></div>
                <div className="admin-trend-chart" role="img" aria-label={chartDays.map((day) => day.label + ": " + day.count + " orders").join(", ")}>
                {chartDays.map((day, index) => <div className="admin-trend-column" key={day.label + index}><strong>{day.count || ""}</strong><div className="admin-trend-track"><i style={{ height: ((day.count / chartMax) * 100) + "%" }}/></div><span>{day.label}</span></div>)}
                </div>
                <p className="admin-panel-footnote">Daily order count from the latest 60 orders loaded for this dashboard.</p>
                </div>
                <div className="admin-insight-panel admin-attention-panel" id="payments">
                <div className="admin-panel-heading"><div><p className="eyebrow">ACTION QUEUE</p><h2>Needs attention</h2></div><span className="admin-attention-count">{pendingCount}</span></div>
                {attentionItems.length ? <div className="admin-attention-list">{attentionItems.map(({ order, submission }) => <a className="admin-attention-item" href={"#payment-" + submission.id} key={submission.id}><span className="admin-attention-mark">!</span><span><b>{order.orderNumber}</b><small>{order.customer.fullName || order.customer.email} · transfer submitted</small></span><span className="admin-attention-action">Review →</span></a>)}</div> : <div className="admin-attention-empty"><span>✓</span><p>No pending payment reviews</p><small>New customer transfer submissions will appear here.</small></div>}
                </div>
                </section>
              ),
            },
            {
              id: "attention",
              label: "NEEDS ATTENTION",
              content: (
                <section className="admin-insights-grid" aria-label="Store activity and items needing attention">
                <div className="admin-insight-panel admin-trend-panel">
                <div className="admin-panel-heading"><div><p className="eyebrow">ORDER ACTIVITY</p><h2>Last 7 days</h2></div><span className="admin-panel-meta">Orders received</span></div>
                <div className="admin-trend-chart" role="img" aria-label={chartDays.map((day) => day.label + ": " + day.count + " orders").join(", ")}>
                {chartDays.map((day, index) => <div className="admin-trend-column" key={day.label + index}><strong>{day.count || ""}</strong><div className="admin-trend-track"><i style={{ height: ((day.count / chartMax) * 100) + "%" }}/></div><span>{day.label}</span></div>)}
                </div>
                <p className="admin-panel-footnote">Daily order count from the latest 60 orders loaded for this dashboard.</p>
                </div>
                <div className="admin-insight-panel admin-attention-panel" id="payments">
                <div className="admin-panel-heading"><div><p className="eyebrow">ACTION QUEUE</p><h2>Needs attention</h2></div><span className="admin-attention-count">{pendingCount}</span></div>
                {attentionItems.length ? <div className="admin-attention-list">{attentionItems.map(({ order, submission }) => <a className="admin-attention-item" href={"#payment-" + submission.id} key={submission.id}><span className="admin-attention-mark">!</span><span><b>{order.orderNumber}</b><small>{order.customer.fullName || order.customer.email} · transfer submitted</small></span><span className="admin-attention-action">Review →</span></a>)}</div> : <div className="admin-attention-empty"><span>✓</span><p>No pending payment reviews</p><small>New customer transfer submissions will appear here.</small></div>}
                </div>
                </section>
              ),
            },
            {
              id: "orders",
              label: "RECENT ORDERS",
              content: (
                <section className="admin-orders-section" id="orders">
                <div className="admin-section-heading"><div><p className="eyebrow">ORDER OPERATIONS</p><h2>Recent orders <span>({orders.length})</span></h2></div><Link className="admin-receipt-link" href="/admin/orders">VIEW ALL ORDERS →</Link></div>
                {!orders.length ? <section className="admin-empty"><h2>No orders yet</h2><p>Customer orders will appear here after the catalogue, shipping zones and payment account are configured.</p></section> :
                <div className="admin-order-list">
                {orders.slice(0, 5).map((order) => {
                const shipment = order.shipments[0] || null;
                return (
                <article className="admin-order-card" key={order.id}>
                <div className="admin-order-head">
                <div><p className="eyebrow">{order.orderNumber}</p><h2>{order.customer.fullName || order.customer.email}</h2><span>{order.customer.email}</span></div>
                <div className="admin-order-total"><strong>{money(order.total)}</strong><span>{labels[order.status] || order.status}</span></div>
                </div>
                <div className="admin-order-facts">
                <span>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</span>
                <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</span>
                <span>{order.deliveryCity}, {order.deliveryState}</span>
                <span>Payment: {order.paymentStatus.replaceAll("_", " ")}</span>
                </div>
                <div className="admin-order-items">
                {order.items.map((item) => <p key={item.id}>{item.quantity} × {item.productName} — {item.size}, {item.colour}</p>)}
                </div>
                {shipment && (
                <div className="admin-shipment-summary">
                <strong>Latest shipment</strong>
                <span>{shipment.provider || "Courier not specified"}{shipment.trackingNumber ? " · " + shipment.trackingNumber : ""}</span>
                {shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noreferrer">TRACK SHIPMENT <ArrowUpRight size={13}/></a>}
                </div>
                )}
                <FulfillmentControls orderNumber={order.orderNumber} status={order.status} shipment={shipment}/>
                {order.payment?.submissions.length ? (
                <div className="admin-submission-list">
                <p className="eyebrow">TRANSFER SUBMISSIONS</p>
                {order.payment.submissions.map((submission) => (
                <section className="admin-submission" id={"payment-" + submission.id} key={submission.id}>
                <div className="admin-submission-facts">
                <span><b>Sender</b>{submission.accountNameUsed}</span>
                <span><b>Bank</b>{submission.bankName}</span>
                <span><b>Amount stated</b>{money(submission.amountTransferred)}</span>
                <span><b>Reference</b>{submission.transactionReference}</span>
                <span><b>Submitted</b>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(submission.submittedAt)}</span>
                </div>
                {submission.customerNote && <p className="admin-customer-note">Customer note: {submission.customerNote}</p>}
                {submission.receiptStorageKey && <a className="admin-receipt-link" href={"/api/admin/payment-submissions/" + submission.id + "/receipt"} target="_blank" rel="noreferrer">VIEW PRIVATE RECEIPT <ArrowUpRight size={14}/></a>}
                <PaymentReviewControls submissionId={submission.id} status={submission.status}/>
                </section>
                ))}
                </div>
                ) : <p className="admin-no-submission">No transfer details submitted yet.</p>}
                </article>
                );
                })}
                </div>
                }
                </section>
              ),
            },
          ]} />


        </div>
      </main>
    </AdminShell>
  );
}
