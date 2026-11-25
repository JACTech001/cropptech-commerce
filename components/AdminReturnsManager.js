"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, LoaderCircle, Plus, RefreshCw, RotateCcw, X } from "lucide-react";
import styles from "./AdminReturnsManager.module.css";

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value || 0));
const date = (value) => new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

export default function AdminReturnsManager() {
  const [returns, setReturns] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [target, setTarget] = useState(null);
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/returns", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load returns and refunds.");
      setReturns(data.returns || []); setRefunds(data.refunds || []); setPayments(data.refundablePayments || []);
      setError("");
    } catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/returns", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load returns and refunds.");
        if (!cancelled) { setReturns(data.returns || []); setRefunds(data.refunds || []); setPayments(data.refundablePayments || []); }
      })
      .catch((cause) => { if (!cancelled) setError(cause.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function createRefund(event) {
    event.preventDefault();
    if (busy) return;
    setBusy("create"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/returns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber, amount, reason }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not create refund request.");
      setMessage(data.message || "Refund request recorded.");
      setOrderNumber(""); setAmount(""); setReason("");
      await load();
    } catch (cause) { setError(cause.message); }
    finally { setBusy(""); }
  }

  async function submitAction(event) {
    event.preventDefault();
    if (!target || busy) return;
    setBusy(target.id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/returns/" + encodeURIComponent(target.id), {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: target.type, action: target.action, note, externalReference: reference }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this record.");
      setMessage(data.message || "Record updated.");
      setTarget(null); setNote(""); setReference("");
      await load();
    } catch (cause) { setError(cause.message); }
    finally { setBusy(""); }
  }

  function openAction(type, item, action) {
    setTarget({ type, id: item.id, title: type === "RETURN" ? "Return request · " + item.order.orderNumber : "Refund · " + item.payment.order.orderNumber, action });
    setNote(""); setReference("");
  }

  const actionLabel = (action) => ({ UNDER_REVIEW: "Move to review", APPROVE: "Approve", REJECT: "Reject", COMPLETE: "Mark completed", PROCESS: "Mark processing", FAIL: "Mark failed", RETRY: "Retry processing" }[action] || action);

  return (
    <div className={styles.workspace}>
      <div className={styles.heading}><div><p className="eyebrow">STORE OPERATIONS / CUSTOMER RESOLUTIONS</p><h1>Returns &amp; <em>refunds.</em></h1><p>Review customer return requests and manage refunds against verified payments.</p></div><button type="button" onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</button></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {message && <p className={styles.success} role="status">{message}</p>}
      <form className={styles.createCard} onSubmit={createRefund}>
        <div><p className="eyebrow">ISSUE A REFUND</p><h2>Create refund request</h2><p>Only verified payments with a remaining refundable balance are available. A refund must be processed externally before it can be marked completed.</p></div>
        <div className={styles.createFields}>
          <label>Paid order<select required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)}><option value="">Select order</option>{payments.map((item) => <option key={item.paymentId} value={item.orderNumber}>{item.orderNumber} · {item.customerName} · Remaining {money(item.remaining)}</option>)}</select></label>
          <label>Amount (NGN)<input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)}/></label>
          <label className={styles.reasonField}>Reason<textarea required maxLength={1000} rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for refund"/></label>
        </div>
        <button className={styles.primary} type="submit" disabled={Boolean(busy) || !payments.length}>{busy === "create" ? <LoaderCircle size={14}/> : <Plus size={14}/>} Create refund request</button>
      </form>

      {target && <form className={styles.actionPanel} onSubmit={submitAction}>
        <div><p className="eyebrow">CONFIRM WORKFLOW UPDATE</p><h2>{target.title}</h2><p>Action: {actionLabel(target.action)}</p></div>
        {target.action === "COMPLETE" && target.type === "REFUND" && <label>Bank / transfer reference<input required value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120}/></label>}
        {["REJECT", "UNDER_REVIEW", "APPROVE", "FAIL"].includes(target.action) && <label>Admin note{target.action === "REJECT" ? " (required)" : ""}<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} required={target.action === "REJECT"} maxLength={1000}/></label>}
        <div className={styles.actionButtons}><button type="button" onClick={() => setTarget(null)}>Cancel</button><button className={styles.primary} type="submit" disabled={Boolean(busy)}>{busy ? <LoaderCircle size={14}/> : <Check size={14}/>} Confirm</button></div>
      </form>}

      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><p className="eyebrow">CUSTOMER REQUESTS</p><h2>Return requests <span>{returns.length}</span></h2></div></div>
        {loading ? <p className={styles.empty}>Loading return requests…</p> : returns.length ? <div className={styles.cards}>{returns.map((item) => <article className={styles.record} key={item.id}>
          <div className={styles.recordTop}><div><strong>{item.order.orderNumber}</strong><small>{item.order.customer.fullName || item.order.customer.email}</small></div><span className={styles.status}>{item.status.replaceAll("_", " ")}</span></div>
          <p>{item.reason}</p>{item.customerNote && <small>Customer note: {item.customerNote}</small>}
          {item.items.length > 0 && <ul>{item.items.map((line) => <li key={line.id}>{line.orderItem.productName} · {line.orderItem.sku} · Qty {line.quantity}</li>)}</ul>}
          <time>{date(item.requestedAt)}</time>
          <div className={styles.actions}>
            {item.status === "SUBMITTED" && <button onClick={() => openAction("RETURN", item, "UNDER_REVIEW")}>Review</button>}
            {["SUBMITTED", "UNDER_REVIEW"].includes(item.status) && <><button onClick={() => openAction("RETURN", item, "APPROVE")}>Approve</button><button className={styles.danger} onClick={() => openAction("RETURN", item, "REJECT")}>Reject</button></>}
            {item.status === "APPROVED" && <button onClick={() => openAction("RETURN", item, "COMPLETE")}>Mark completed</button>}
          </div>
        </article>)}</div> : <p className={styles.empty}>No return requests have been submitted.</p>}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><p className="eyebrow">PAYMENT REVERSALS</p><h2>Refund requests <span>{refunds.length}</span></h2></div></div>
        {loading ? <p className={styles.empty}>Loading refunds…</p> : refunds.length ? <div className={styles.cards}>{refunds.map((item) => <article className={styles.record} key={item.id}>
          <div className={styles.recordTop}><div><strong>{item.payment.order.orderNumber}</strong><small>{item.payment.order.customer.fullName || item.payment.order.customer.email}</small></div><span className={styles.status}>{item.status.replaceAll("_", " ")}</span></div>
          <strong className={styles.amount}>{money(item.amount)}</strong><p>{item.reason}</p>{item.adminNote && <small>Admin note: {item.adminNote}</small>}
          {item.externalReference && <small>Reference: {item.externalReference}</small>}
          <time>{date(item.requestedAt)}</time>
          <div className={styles.actions}>
            {item.status === "REQUESTED" && <button onClick={() => openAction("REFUND", item, "UNDER_REVIEW")}>Review</button>}
            {["REQUESTED", "UNDER_REVIEW"].includes(item.status) && <><button onClick={() => openAction("REFUND", item, "APPROVE")}>Approve</button><button className={styles.danger} onClick={() => openAction("REFUND", item, "REJECT")}>Reject</button></>}
            {item.status === "APPROVED" && <><button onClick={() => openAction("REFUND", item, "PROCESS")}>Start processing</button><button className={styles.danger} onClick={() => openAction("REFUND", item, "REJECT")}>Cancel</button></>}
            {item.status === "PROCESSING" && <><button onClick={() => openAction("REFUND", item, "COMPLETE")}>Complete refund</button><button className={styles.danger} onClick={() => openAction("REFUND", item, "FAIL")}>Mark failed</button></>}
            {item.status === "FAILED" && <button onClick={() => openAction("REFUND", item, "RETRY")}>Retry processing</button>}
          </div>
        </article>)}</div> : <p className={styles.empty}>No refund requests have been recorded.</p>}
      </section>
    </div>
  );
}
