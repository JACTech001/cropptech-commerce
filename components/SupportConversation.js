"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";

const statuses = [["OPEN","Open"],["IN_PROGRESS","In progress"],["WAITING_FOR_CUSTOMER","Waiting for customer"],["RESOLVED","Resolved"],["CLOSED","Closed"]];
const priorities = [["LOW","Low"],["NORMAL","Normal"],["HIGH","High"],["URGENT","Urgent"]];

export default function SupportConversation({ ticketId, isStaff = false }) {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/support/tickets/" + encodeURIComponent(ticketId) + "/messages", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Conversation unavailable.");
    setTicket(data.ticket); setMessages(data.ticket.messages || []);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, [ticketId]);

  async function send(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/support/tickets/" + encodeURIComponent(ticketId) + "/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isInternal: internal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message could not be sent.");
      setMessages((current) => [...current, data.message]); setMessage(""); setNotice(internal ? "Internal note saved." : "Your reply has been sent.");
      if (!internal) await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function update(fields) {
    setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/support/tickets/" + encodeURIComponent(ticketId), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ticket update failed.");
      setTicket((current) => ({ ...current, ...data.ticket })); setNotice("Support request updated.");
    } catch (err) { setError(err.message); }
  }

  if (!ticket) return <div className="support-conversation-loading">{error || "Loading conversation..."}</div>;

  return <section className="support-conversation">
    <div className="support-conversation-heading">
      <div><Link href={isStaff ? "/admin/support" : "/support"} className="support-back-link"><ArrowLeft size={15}/> BACK TO {isStaff ? "INBOX" : "SUPPORT REQUESTS"}</Link><p className="eyebrow">{ticket.ticketNumber} / {ticket.category.replaceAll("_"," ")}</p><h2>{ticket.subject}</h2><p>{isStaff ? (ticket.customer?.fullName || ticket.customer?.email || "Customer") : "Our customer care team will respond in this conversation."}{ticket.order?.orderNumber ? " · Order " + ticket.order.orderNumber : ""}</p></div>
      <span className={"customer-support-status status-" + ticket.status.toLowerCase()}>{ticket.status.replaceAll("_"," ")}</span>
    </div>
    {isStaff && <div className="support-admin-controls">
      <label>STATUS<select value={ticket.status} onChange={(event) => update({ status: event.target.value })}>{statuses.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>PRIORITY<select value={ticket.priority} onChange={(event) => update({ priority: event.target.value })}>{priorities.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button type="button" className="support-assign-button" onClick={() => update({ assignToMe: true })}>ASSIGN TO ME</button>
    </div>}
    {error && <p className="customer-support-error" role="alert">{error}</p>}
    {notice && <p className="customer-support-success" role="status">{notice}</p>}
    <div className="support-message-list">{messages.map((item) => <article key={item.id} className={"support-message " + (item.senderRole === "CUSTOMER" ? "from-customer" : "from-staff") + (item.isInternal ? " is-internal" : "")}>
      <div className="support-message-meta"><strong>{item.isInternal ? "Internal staff note" : item.senderRole === "CUSTOMER" ? (isStaff ? ticket.customer?.fullName || "Customer" : "You") : "CROPPTECH Support"}</strong><time>{new Date(item.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></div>
      <p>{item.body}</p>
    </article>)}</div>
    {ticket.status !== "CLOSED" && (isStaff || !["RESOLVED","CLOSED"].includes(ticket.status)) ? <form className="support-reply-form" onSubmit={send}>
      {isStaff && <label className="support-internal-toggle"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)}/><ShieldCheck size={15}/> Add internal note (only staff can see this)</label>}
      <textarea rows={4} required minLength={2} maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={internal ? "Write a private staff note..." : "Write your reply..."}/>
      <button className="customer-support-primary" type="submit" disabled={busy}><Send size={15}/>{busy ? "SENDING..." : internal ? "SAVE INTERNAL NOTE" : "SEND REPLY"}</button>
    </form> : <p className="support-closed-note">This support request is closed. Create a new request if you need further assistance.</p>}
  </section>;
}
