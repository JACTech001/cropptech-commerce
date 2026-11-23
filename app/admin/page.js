import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, ClipboardList, ShieldCheck } from "lucide-react";
import { getCurrentAppUser } from "../../lib/auth/user";
import { prisma } from "../../lib/db";
import PaymentReviewControls from "../../components/PaymentReviewControls";
import AdminStoreSettings from "../../components/AdminStoreSettings";
import FulfillmentControls from "../../components/FulfillmentControls";

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
            include: { submittedBy: { select: { email: true, fullName: true } } },
          },
        },
      },
    },
  });

  const pendingCount = orders.reduce((total, order) =>
    total + (order.payment?.submissions.filter((submission) => submission.status === "PENDING").length || 0), 0);
  const paidCount = orders.filter((order) => order.paymentStatus === "PAID").length;
  const fulfilmentCount = orders.filter((order) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)).length;

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link href="/" className="admin-brand">CROPPTECH <span>COMMERCE STORE</span></Link>
        <div><span>{user.email}</span><Link href="/admin/products">MANAGE CATALOGUE <ArrowUpRight size={14}/></Link><Link href="/shop">VIEW STORE <ArrowUpRight size={14}/></Link></div>
      </header>
      <div className="admin-wrap">
        <div className="admin-heading">
          <p className="eyebrow">STORE MANAGEMENT / ADMINISTRATION</p>
          <h1>Order <em>management.</em></h1>
          <p>Review orders, verify bank transfers against actual bank transactions, and manage fulfilment through delivery.</p>
        </div>

        <div className="admin-overview admin-overview-four">
          <div><ClipboardList size={20}/><span>RECENT ORDERS</span><strong>{orders.length}</strong></div>
          <div><ShieldCheck size={20}/><span>PAYMENTS AWAITING REVIEW</span><strong>{pendingCount}</strong></div>
          <div><ClipboardList size={20}/><span>PAID ORDERS</span><strong>{paidCount}</strong></div>
          <div><PackageCheckIcon /><span>IN FULFILMENT</span><strong>{fulfilmentCount}</strong></div>
        </div>

        <AdminStoreSettings />

        {!orders.length ? <section className="admin-empty"><h2>No orders yet</h2><p>Customer orders will appear here after the catalogue, shipping zones and payment account are configured.</p></section> :
          <div className="admin-order-list">
            {orders.map((order) => {
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
                        <section className="admin-submission" key={submission.id}>
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
      </div>
    </main>
  );
}

function PackageCheckIcon() {
  return <span className="admin-overview-icon" aria-hidden="true">✓</span>;
}
