import { notFound, redirect } from "next/navigation";
import { Bell, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import AdminShell from "../../../components/AdminShell";
import PaymentReviewControls from "../../../components/PaymentReviewControls";
import CsvExportButton from "../../../components/CsvExportButton";

export const dynamic = "force-dynamic";
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value));
const dateTime = (value) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(value);
const statusLabel = (status) => status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function AdminPaymentsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fpayments");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { customer: { select: { email: true, fullName: true } }, payment: { include: { submissions: { orderBy: { submittedAt: "desc" } } } } },
  });
  const submissions = orders.flatMap((order) => (order.payment?.submissions || []).map((submission) => ({ order, submission })));
  const pending = submissions.filter(({ submission }) => submission.status === "PENDING");
  const approved = submissions.filter(({ submission }) => submission.status === "APPROVED");
  const clarification = submissions.filter(({ submission }) => submission.status === "NEEDS_CLARIFICATION");
  const rejected = submissions.filter(({ submission }) => submission.status === "REJECTED");

  return <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]}>
    <main className="admin-page admin-route-page payment-review-page">
      <div className="admin-wrap">
        <div className="payment-review-hero">
          <div className="admin-heading">
            <p className="eyebrow">STORE MANAGEMENT / FINANCE</p>
            <h1>Payment <em>reviews.</em></h1>
            <p>Review customer bank transfers, verify the funds in your store account, and keep every payment decision traceable.</p>
          </div>
          <div className="payment-review-hero-note"><ShieldCheck size={19}/><span><strong>Verification first</strong>Approve only after confirming the full amount has reached the store account.</span></div>
        </div>

        <section className="payment-review-metrics" aria-label="Payment review summary">
          <article className="payment-review-metric payment-review-metric-pending">
            <span className="payment-review-metric-icon"><Clock3 size={17}/></span>
            <div><small>AWAITING REVIEW</small><strong>{pending.length}</strong><span>Requires your attention</span></div>
          </article>
          <article className="payment-review-metric">
            <span className="payment-review-metric-icon"><CheckCircle2 size={17}/></span>
            <div><small>APPROVED</small><strong>{approved.length}</strong><span>Verified submissions</span></div>
          </article>
          <article className="payment-review-metric">
            <span className="payment-review-metric-icon"><Bell size={17}/></span>
            <div><small>NEEDS CLARIFICATION</small><strong>{clarification.length}</strong><span>Customer follow-up</span></div>
          </article>
          <article className="payment-review-metric">
            <span className="payment-review-metric-icon"><span className="payment-review-rejected-mark">×</span></span>
            <div><small>REJECTED</small><strong>{rejected.length}</strong><span>Not accepted</span></div>
          </article>
        </section>

        <section className="admin-orders-section payment-review-activity">
          <div className="payment-review-section-heading">
            <div><p className="eyebrow">TRANSFER SUBMISSIONS</p><h2>Payment activity <span>{submissions.length}</span></h2><p>Latest customer-submitted transfer details, with review actions and supporting evidence.</p></div>
            <CsvExportButton filename="cropptech-payment-submissions" label="EXPORT CSV" columns={[{ key: "orderNumber", label: "Order number" }, { key: "customer", label: "Customer" }, { key: "email", label: "Customer email" }, { key: "sender", label: "Sender name" }, { key: "bank", label: "Bank" }, { key: "amount", label: "Amount transferred (NGN)" }, { key: "orderTotal", label: "Order total (NGN)" }, { key: "reference", label: "Transaction reference" }, { key: "status", label: "Review status" }, { key: "submittedAt", label: "Submitted at" }, { key: "note", label: "Customer note" }]} rows={submissions.map(({ order, submission }) => ({ orderNumber: order.orderNumber, customer: order.customer.fullName || "", email: order.customer.email, sender: submission.accountNameUsed, bank: submission.bankName, amount: submission.amountTransferred.toString(), orderTotal: order.total.toString(), reference: submission.transactionReference || "", status: submission.status, submittedAt: dateTime(submission.submittedAt), note: submission.customerNote || "" }))} disabled={!submissions.length}/>
          </div>

          {!submissions.length ? <section className="admin-empty payment-review-empty"><span><Bell size={22}/></span><h2>No payment submissions yet</h2><p>When customers submit bank-transfer details, each submission will appear here for verification.</p></section> :
            <div className="payment-review-list">{submissions.map(({ order, submission }) => {
              const customerName = order.customer.fullName || order.customer.email;
              const isPending = submission.status === "PENDING";
              return <article className="payment-review-card" key={submission.id}>
                <div className="payment-review-card-top">
                  <div className="payment-review-order">
                    <span className="payment-review-order-label">ORDER REFERENCE</span>
                    <strong>{order.orderNumber}</strong>
                    <span className="payment-review-submitted">Submitted {dateTime(submission.submittedAt)}</span>
                  </div>
                  <span className={"payment-review-status payment-review-status-" + submission.status.toLowerCase()}>{statusLabel(submission.status)}</span>
                </div>
                <div className="payment-review-card-body">
                  <div className="payment-review-customer">
                    <span className="payment-review-avatar" aria-hidden="true">{customerName.trim().charAt(0).toUpperCase()}</span>
                    <div><strong>{customerName}</strong><span>{order.customer.email}</span></div>
                  </div>
                  <div className="payment-review-amount">
                    <span>AMOUNT TRANSFERRED</span>
                    <strong>{money(submission.amountTransferred)}</strong>
                    <small>Order total: {money(order.total)}</small>
                  </div>
                </div>
                <div className="payment-review-details">
                  <div><span>SENDER NAME</span><strong>{submission.accountNameUsed}</strong></div>
                  <div><span>SENDING BANK</span><strong>{submission.bankName}</strong></div>
                  <div><span>TRANSACTION REFERENCE</span><strong>{submission.transactionReference || "Not provided"}</strong></div>
                  <div><span>SUBMITTED BY</span><strong>{customerName}</strong></div>
                </div>
                {submission.customerNote && <div className="payment-review-customer-note"><span>CUSTOMER NOTE</span><p>{submission.customerNote}</p></div>}
                <div className="payment-review-card-footer">
                  {submission.receiptStorageKey ? <a className="payment-review-receipt-link" href={"/api/admin/payment-submissions/" + submission.id + "/receipt"} target="_blank" rel="noreferrer"><ShieldCheck size={15}/> View private transfer receipt</a> : <span className="payment-review-no-receipt">No receipt attached</span>}
                  {!isPending && <span className="payment-review-closed-note">Review completed</span>}
                </div>
                <PaymentReviewControls submissionId={submission.id} status={submission.status}/>
              </article>;
            })}</div>}
        </section>
      </div>
    </main>
  </AdminShell>;
}
