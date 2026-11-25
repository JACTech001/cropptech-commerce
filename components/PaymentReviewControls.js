"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";

export default function PaymentReviewControls({ submissionId, status }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function decide(decision) {
    if (busy) return;
    if (decision !== "APPROVED" && !note.trim()) {
      setError("Add a note explaining the rejection or clarification request.");
      return;
    }
    if (decision === "APPROVED" && !window.confirm("Confirm that you personally verified this bank transaction and the full order amount has reached the store account?")) return;

    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const fingerprint = JSON.stringify({ decision, note: note.trim() });
      const storageKey = `cropptech-payment-review:${submissionId}`;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
      let idempotencyKey = saved?.fingerprint === fingerprint ? saved.key : "";
      if (!idempotencyKey) {
        idempotencyKey = typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().replaceAll("-", "")
          : Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => byte.toString(16).padStart(2, "0")).join("");
        try { localStorage.setItem(storageKey, JSON.stringify({ fingerprint, key: idempotencyKey })); } catch {}
      }
      const response = await fetch(`/api/admin/payment-submissions/${encodeURIComponent(submissionId)}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ decision, note }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save this payment review.");
      setFeedback(data.message || "Payment review saved.");
      try { localStorage.removeItem(storageKey); } catch {}
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not save this payment review.");
    } finally {
      setBusy(false);
    }
  }

  if (status !== "PENDING") return <p className="admin-review-result"><CheckCircle2 size={14}/> {status.replaceAll("_", " ")}</p>;

  return (
    <div className="admin-payment-review">
      <label className="checkout-field">ADMIN REVIEW NOTE
        <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Add a note for the customer when needed"/>
      </label>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {feedback && <p className="checkout-success" role="status">{feedback}</p>}
      <div className="admin-review-actions">
        <button type="button" onClick={() => decide("APPROVED")} disabled={busy}>{busy ? <LoaderCircle size={14}/> : <CheckCircle2 size={14}/>} Approve payment</button>
        <button type="button" onClick={() => decide("NEEDS_CLARIFICATION")} disabled={busy}>Ask for clarification</button>
        <button type="button" onClick={() => decide("REJECTED")} disabled={busy}>Reject</button>
      </div>
    </div>
  );
}
