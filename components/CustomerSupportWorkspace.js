"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Plus, Send, Ticket } from "lucide-react";

const statusLabel = (value) => ({ OPEN: "Open", IN_PROGRESS: "In progress", WAITING_FOR_CUSTOMER: "Awaiting your reply", RESOLVED: "Resolved", CLOSED: "Closed" }[value] || value);
const categories = [
  ["GENERAL", "General enquiry"], ["ORDER_ISSUE", "Order issue"], ["PAYMENT", "Payment"], ["DELIVERY", "Delivery"],
  ["RETURN_REFUND", "Returns & refunds"], ["PRODUCT_QUESTION", "Product question"], ["ACCOUNT", "Account"], ["OTHER", "Other"],
];

export default function CustomerSupportWorkspace({ initialTickets, orders }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, orderId: orderId || null, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your request could not be submitted.");
      setTickets((current) => [{ ...data.ticket, category, priority: "NORMAL", createdAt: data.ticket.createdAt, updatedAt: data.ticket.createdAt, order: orders.find((item) => item.id === orderId) || null, messages: [{ body: message, senderRole: "CUSTOMER" }] }, ...current]);
      setSubject(""); setMessage(""); setOrderId(""); setCategory("GENERAL"); setShowForm(false);
      setSuccess("Your support request has been submitted. Our team will respond in this conversation.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="customer-support-workspace">
      <div className="customer-support-toolbar">
        <div><p className="eyebrow">YOUR SUPPORT HISTORY</p><h2>Support requests <span>({tickets.length})</span></h2></div>
        <button type="button" className="customer-support-primary" onClick={() => { setShowForm((value) => !value); setError(""); }}><Plus size={16}/>{showForm ? "CLOSE FORM" : "NEW REQUEST"}</button>
      </div>
      {success && <p className="customer-support-success" role="status">{success}</p>}
      {error && <p className="customer-support-error" role="alert">{error}</p>}
      {showForm && <form className="customer-support-form" onSubmit={submit}>
        <div className="customer-support-form-heading"><Ticket size={20}/><div><h3>Send a support request</h3><p>Tell us what happened. Our team will reply here.</p></div></div>
        <label>SUBJECT<input required minLength={4} maxLength={140} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?"/></label>
        <div className="customer-support-form-grid">
          <label>REQUEST TYPE<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>RELATED ORDER (OPTIONAL)<select value={orderId} onChange={(event) => setOrderId(event.target.value)}><option value="">Not order-related</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber}</option>)}</select></label>
        </div>
        <label>MESSAGE<textarea required minLength={10} maxLength={5000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the issue or question in detail..."/></label>
        <button className="customer-support-primary" type="submit" disabled={busy}><Send size={15}/>{busy ? "SENDING..." : "SUBMIT REQUEST"}</button>
      </form>}
      {tickets.length ? <div className="customer-support-ticket-list">{tickets.map((ticket) => <Link className="customer-support-ticket-card" href={"/support/" + ticket.id} key={ticket.id}>
        <div className="customer-support-ticket-top"><span>{ticket.ticketNumber}</span><span className={"customer-support-status status-" + ticket.status.toLowerCase()}>{statusLabel(ticket.status)}</span></div>
        <h3>{ticket.subject}</h3>
        <p>{ticket.messages?.[0]?.body || "No message preview available."}</p>
        <div className="customer-support-ticket-bottom"><span>{ticket.order?.orderNumber || "General support"}</span><span>{new Date(ticket.updatedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span><ArrowUpRight size={15}/></div>
      </Link>)}</div> : <div className="customer-support-empty"><MessageCircle size={28}/><h3>No support requests yet</h3><p>If you need help with an order or have a question, send our team a message.</p><button type="button" className="customer-support-primary" onClick={() => setShowForm(true)}><Plus size={15}/> CREATE REQUEST</button></div>}
    </div>
  );
}
