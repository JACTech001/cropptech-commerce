"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function PaymentSubmissionForm({ orderNumber, amountDue }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    const formElement = event.currentTarget;
    try {
      const formData = new FormData(formElement);
      const receiptFile = formData.get("receipt");
      const fingerprint = JSON.stringify({
        accountName: formData.get("accountName"),
        amountTransferred: formData.get("amountTransferred"),
        bankName: formData.get("bankName"),
        transactionReference: formData.get("transactionReference"),
        customerNote: formData.get("customerNote"),
        receipt: receiptFile ? [receiptFile.name, receiptFile.size, receiptFile.lastModified, receiptFile.type] : null,
      });
      const storageKey = `cropptech-payment-submission:${orderNumber}`;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
      let idempotencyKey = saved?.fingerprint === fingerprint ? saved.key : "";
      if (!idempotencyKey) {
        idempotencyKey = typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().replaceAll("-", "")
          : Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => byte.toString(16).padStart(2, "0")).join("");
        localStorage.setItem(storageKey, JSON.stringify({ fingerprint, key: idempotencyKey }));
      }
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/payment-submissions`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We could not submit your payment details.");
      setMessage(data.message || "Your payment submission has been received.");
      localStorage.removeItem(storageKey);
      formElement.reset();
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "We could not submit your payment details. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="checkout-form payment-submission-form" onSubmit={submit}>
      <p className="eyebrow">PAYMENT CONFIRMATION</p>
      <p className="payment-form-intro">After making the transfer, enter the details below and attach the bank receipt. A receipt is supporting evidence only; the store will verify the transaction with its bank.</p>
      <label className="checkout-field">ACCOUNT NAME USED
        <input name="accountName" required maxLength={120} placeholder="Name on the sending bank account"/>
      </label>
      <label className="checkout-field">AMOUNT TRANSFERRED (NGN)
        <input name="amountTransferred" type="number" min="1" step="0.01" required defaultValue={amountDue}/>
      </label>
      <label className="checkout-field">SENDING BANK
        <input name="bankName" required maxLength={120} placeholder="Your bank name"/>
      </label>
      <label className="checkout-field">TRANSACTION / SESSION REFERENCE
        <input name="transactionReference" required maxLength={120} placeholder="Bank transaction reference"/>
      </label>
      <label className="checkout-field">BANK RECEIPT (PDF, JPG, PNG OR WEBP)
        <input name="receipt" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required/>
      </label>
      <label className="checkout-field">NOTE <span className="checkout-optional">OPTIONAL</span>
        <textarea name="customerNote" rows={3} maxLength={1000} placeholder="Any additional information for the store"/>
      </label>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {message && <p className="checkout-success" role="status"><CheckCircle2 size={16}/>{message}</p>}
      <button className="checkout-primary checkout-submit" type="submit" disabled={busy}>
        {busy ? "SUBMITTING PAYMENT…" : "SUBMIT PAYMENT DETAILS"} <ArrowUpRight size={17}/>
      </button>
    </form>
  );
}
