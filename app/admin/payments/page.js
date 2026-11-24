import { notFound, redirect } from "next/navigation";
import { Bell, CheckCircle2 } from "lucide-react";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import AdminShell from "../../../components/AdminShell";
import PaymentReviewControls from "../../../components/PaymentReviewControls";
import CsvExportButton from "../../../components/CsvExportButton";

export const dynamic = "force-dynamic";
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value));

export default async function AdminPaymentsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Fpayments");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    include: { customer: { select: { email: true, fullName: true } }, payment: { include: { submissions: { orderBy: { submittedAt: "desc" }, include: { submittedBy: { select: { email: true, fullName: true } } } } } } },
  });
  const submissions = orders.flatMap((order) => (order.payment?.submissions || []).map((submission) => ({ order, submission })));
  const pending = submissions.filter(({ submission }) => submission.status === "PENDING");

  return <AdminShell email={user.email}>
    <main className="admin-page admin-route-page"><div className="admin-wrap">
      <div className="admin-heading"><p className="eyebrow">STORE MANAGEMENT / PAYMENTS</p><h1>Payment <em>reviews.</em></h1><p>Verify submitted bank transfers against the store account before confirming customer payments.</p></div>
      <div className="admin-route-summary"><div><span>AWAITING REVIEW</span><strong>{pending.length}</strong></div><div><span>APPROVED</span><strong>{submissions.filter(({ submission }) => submission.status === "APPROVED").length}</strong></div><div><span>NEEDS CLARIFICATION</span><strong>{submissions.filter(({ submission }) => submission.status === "NEEDS_CLARIFICATION").length}</strong></div><div><span>REJECTED</span><strong>{submissions.filter(({ submission }) => submission.status === "REJECTED").length}</strong></div></div>
      <section className="admin-orders-section"><div className="admin-section-heading"><div><p className="eyebrow">TRANSFER SUBMISSIONS</p><h2>Payment activity <span>({submissions.length})</span></h2></div><CsvExportButton filename="cropptech-payment-submissions" label="EXPORT CSV" columns={[{ key: "orderNumber", label: "Order number" }, { key: "customer", label: "Customer" }, { key: "email", label: "Customer email" }, { key: "sender", label: "Sender name" }, { key: "bank", label: "Bank" }, { key: "amount", label: "Amount transferred (NGN)" }, { key: "orderTotal", label: "Order total (NGN)" }, { key: "reference", label: "Transaction reference" }, { key: "status", label: "Review status" }, { key: "submittedAt", label: "Submitted at" }, { key: "note", label: "Customer note" }]} rows={submissions.map(({ order, submission }) => ({ orderNumber: order.orderNumber, customer: order.customer.fullName || "", email: order.customer.email, sender: submission.accountNameUsed, bank: submission.bankName, amount: submission.amountTransferred.toString(), orderTotal: order.total.toString(), reference: submission.transactionReference || "", status: submission.status, submittedAt: new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(submission.submittedAt), note: submission.customerNote || "" }))} disabled={!submissions.length}/></div>
        {!submissions.length ? <section className="admin-empty"><Bell size={24}/><h2>No payment submissions</h2><p>Customer bank-transfer submissions will appear here when they submit payment details.</p></section> :
          <div className="admin-order-list">{submissions.map(({ order, submission }) => <article className="admin-order-card" key={submission.id}>
            <div className="admin-order-head"><div><p className="eyebrow">{order.orderNumber}</p><h2>{order.customer.fullName || order.customer.email}</h2><span>{order.customer.email}</span></div><div className="admin-order-total"><strong>{money(submission.amountTransferred)}</strong><span>{submission.status.replaceAll("_", " ")}</span></div></div>
            <div className="admin-submission-list"><div className="admin-submission"><div className="admin-submission-facts"><span><b>Sender</b>{submission.accountNameUsed}</span><span><b>Bank</b>{submission.bankName}</span><span><b>Order total</b>{money(order.total)}</span><span><b>Reference</b>{submission.transactionReference || "Not provided"}</span><span><b>Submitted</b>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(submission.submittedAt)}</span><span><b>Submitted by</b>{submission.submittedBy?.fullName || submission.submittedBy?.email || "Customer"}</span></div>
              {submission.customerNote && <p className="admin-customer-note">Customer note: {submission.customerNote}</p>}
              {submission.receiptStorageKey && <a className="admin-receipt-link" href={"/api/admin/payment-submissions/" + submission.id + "/receipt"} target="_blank" rel="noreferrer">VIEW PRIVATE RECEIPT</a>}
              <PaymentReviewControls submissionId={submission.id} status={submission.status}/>
            </div></div>
          </article>)}</div>}
      </section>
      <p className="admin-setting-hint"><CheckCircle2 size={13}/> Only approve after personally confirming the full amount has reached the store bank account.</p>
    </div></main>
  </AdminShell>;
}
