import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import { decryptBankAccountNumber } from "../../../lib/security/bank-account-encryption";
import { redirectAdminFromCustomerPages } from "../../../lib/auth/customer-access";
import PaymentSubmissionForm from "../../../components/PaymentSubmissionForm";

export const dynamic = "force-dynamic";

const money = (value) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 2,
}).format(Number(value));

const orderStatusLabels = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAYMENT_UNDER_REVIEW: "Payment under review",
  CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export default async function OrderDetailsPage({ params }) {
  const { orderNumber } = await params;
  await redirectAdminFromCustomerPages();
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=" + encodeURIComponent("/orders/" + orderNumber));

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId: user.id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: {
        include: {
          submissions: { orderBy: { submittedAt: "desc" }, include: { verifications: { orderBy: { verifiedAt: "desc" }, select: { decision: true, note: true, verifiedAt: true } } } },
        },
      },
      statusHistory: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!order) notFound();

  let accountNumber = null;
  let paymentSetupError = false;
  if (order.payment && order.payment.status !== "PAID") {
    try { accountNumber = decryptBankAccountNumber(order.payment.accountNumberSnapshotEncrypted); }
    catch { paymentSetupError = true; }
  }

  const hasPendingSubmission = order.payment?.submissions.some((submission) => submission.status === "PENDING");
  const canSubmitPayment = order.payment && order.payment.status !== "PAID" &&
    !hasPendingSubmission && !["CANCELLED", "EXPIRED", "DELIVERED"].includes(order.status);

  return (
    <main className="checkout-page order-details-page">
      <header className="shop-topbar">
        <Link href="/shop" className="shop-back"><ArrowLeft size={16}/> CONTINUE SHOPPING</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo"/>
        </Link>
        <span className="order-header-label">MY ORDER</span>
      </header>

      <div className="checkout-wrap">
        <div className="checkout-heading">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / ORDER CONFIRMATION</p>
          <h1>Order <em>received.</em></h1>
          <p>Your order has been saved. Keep your order reference for future enquiries and payment updates.</p>
        </div>

        <section className="order-confirmation-card">
          <div className="order-confirmation-top">
            <div><p className="eyebrow">ORDER REFERENCE</p><h2>{order.orderNumber}</h2></div>
            <span className={"order-status-pill order-status-" + order.status.toLowerCase()}>{orderStatusLabels[order.status] || order.status}</span>
          </div>
          <div className="order-confirmation-grid">
            <div><span>ORDER TOTAL</span><strong>{money(order.total)}</strong></div>
            <div><span>PAYMENT STATUS</span><strong>{order.paymentStatus.replaceAll("_", " ")}</strong></div>
            <div><span>PLACED</span><strong>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(order.placedAt)}</strong></div>
          </div>
        </section>

        <div className="order-details-layout">
          <div className="order-details-main">
            <section className="checkout-form-section">
              <p className="eyebrow">ORDER ITEMS</p>
              <div className="order-line-list">
                {order.items.map((item) => (
                  <article className="order-line" key={item.id}>
                    <div><h3>{item.productName}</h3><p>Size {item.size} · {item.colour} · Quantity {item.quantity}</p><small>{item.sku}</small></div>
                    <strong>{money(item.lineTotal)}</strong>
                  </article>
                ))}
              </div>
              <div className="checkout-summary-foot"><span>SUBTOTAL</span><strong>{money(order.subtotal)}</strong></div>
              <div className="checkout-summary-foot"><span>DELIVERY</span><strong>{money(order.shippingFee)}</strong></div>
              <div className="order-total-row"><span>TOTAL DUE</span><strong>{money(order.total)}</strong></div>
            </section>

            <section className="checkout-form-section">
              <p className="eyebrow">DELIVERY DETAILS</p>
              <div className="order-address">
                <strong>{order.recipientName}</strong>
                <span>{order.recipientPhone}</span>
                <span>{order.deliveryAddress}</span>
                <span>{[order.deliveryLocality, order.deliveryCity, order.deliveryState, "Nigeria"].filter(Boolean).join(", ")}</span>
                {order.deliveryLandmark && <span>Landmark: {order.deliveryLandmark}</span>}
              </div>
            </section>
          </div>

          <aside className="order-payment-panel">
            <p className="eyebrow">BANK TRANSFER PAYMENT</p>
            {order.payment?.status === "PAID" ? (
              <><div className="order-payment-state"><CheckCircle2 size={28}/><h3>Payment confirmed</h3><p>Your transfer has been verified by the store. We will update your order as it moves through processing and delivery.</p></div>
              <Link href={"/api/orders/" + encodeURIComponent(order.orderNumber) + "/receipt"} target="_blank" className="checkout-edit-link">VIEW OFFICIAL PAYMENT RECEIPT <ArrowLeft size={14}/></Link></>
            ) : order.payment?.status === "SUBMITTED" || hasPendingSubmission ? (
              <div className="order-payment-state"><Clock3 size={28}/><h3>Payment under review</h3><p>Your transfer details have been received. Please do not submit the same payment again while the store verifies it.</p></div>
            ) : paymentSetupError ? (
              <div className="checkout-error">The payment account details are temporarily unavailable. Please contact the store and quote your order reference.</div>
            ) : order.payment && accountNumber ? (
              <>
                <p className="order-payment-intro">Transfer the exact amount below. Use your order number as the transfer narration where supported.</p>
                <div className="order-bank-details">
                  <div><span>BANK</span><strong>{order.payment.bankNameSnapshot}</strong></div>
                  <div><span>ACCOUNT NAME</span><strong>{order.payment.accountNameSnapshot}</strong></div>
                  <div><span>ACCOUNT NUMBER</span><strong className="order-account-number">{accountNumber}</strong></div>
                  <div><span>AMOUNT TO TRANSFER</span><strong className="order-amount">{money(order.payment.amountDue)}</strong></div>
                </div>
                {order.payment.paymentInstructionsSnapshot && <p className="order-payment-intro">{order.payment.paymentInstructionsSnapshot}</p>}
                {order.payment.submissions.flatMap((submission) => submission.verifications).slice(0, 1).map((review) => review.note ? <p className="order-payment-warning" key={review.verifiedAt.toISOString()}>Store update ({review.decision.replaceAll("_", " ").toLowerCase()}): {review.note}</p> : null)}
                <p className="order-payment-warning">Do not send cash to a personal account or a different account supplied outside this website. A receipt alone does not confirm payment.</p>
                {canSubmitPayment && <PaymentSubmissionForm orderNumber={order.orderNumber} amountDue={order.payment.amountDue.toString()}/>}
              </>
            ) : (
              <p className="checkout-error">Payment instructions are not available for this order. Contact the store with your order reference.</p>
            )}
            <Link href="/shop" className="checkout-edit-link"><ArrowLeft size={14}/> RETURN TO SHOP</Link>
          </aside>
        </div>

        <section className="checkout-form-section order-history-section">
          <p className="eyebrow">ORDER ACTIVITY</p>
          <div className="order-history-list">
            {order.statusHistory.map((entry) => (
              <div className="order-history-item" key={entry.id}>
                <PackageCheck size={16}/>
                <div><strong>{orderStatusLabels[entry.toStatus] || entry.toStatus}</strong><span>{entry.note || "Order status updated"}</span><small>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(entry.createdAt)}</small></div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
