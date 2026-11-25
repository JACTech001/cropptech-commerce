"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PackageCheck, Truck } from "lucide-react";

const nextSteps = {
  CONFIRMED: { status: "PROCESSING", label: "Start processing" },
  PROCESSING: { status: "SHIPPED", label: "Mark as shipped" },
  SHIPPED: { status: "DELIVERED", label: "Mark as delivered" },
};

export default function FulfillmentControls({ orderNumber, status, shipment }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState(shipment?.provider || "");
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(shipment?.trackingUrl || "");
  const [note, setNote] = useState("");

  const next = nextSteps[status];
  if (!next) return null;

  async function advance() {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = { expectedStatus: status, provider, trackingNumber, trackingUrl, note };
      const fingerprint = JSON.stringify(payload);
      const storageKey = `cropptech-order-status:${orderNumber}:${status}`;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
      let idempotencyKey = saved?.fingerprint === fingerprint ? saved.key : "";
      if (!idempotencyKey) {
        idempotencyKey = typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().replaceAll("-", "")
          : Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => byte.toString(16).padStart(2, "0")).join("");
        try { localStorage.setItem(storageKey, JSON.stringify({ fingerprint, key: idempotencyKey })); } catch {}
      }
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this order.");
      setMessage(data.message || "Order updated.");
      try { localStorage.removeItem(storageKey); } catch {}
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not update this order.");
    } finally { setBusy(false); }
  }

  return (
    <section className="admin-fulfillment">
      <p className="eyebrow">ORDER FULFILMENT</p>
      {next.status === "SHIPPED" && (
        <div className="admin-fulfillment-fields">
          <label className="checkout-field">DELIVERY COMPANY / COURIER<input value={provider} onChange={(event) => setProvider(event.target.value)} maxLength={100} placeholder="e.g. GIG Logistics"/></label>
          <label className="checkout-field">TRACKING NUMBER<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} maxLength={120} placeholder="Tracking reference"/></label>
          <label className="checkout-field">TRACKING LINK<input type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} maxLength={500} placeholder="https://..."/></label>
        </div>
      )}
      <label className="checkout-field">INTERNAL / CUSTOMER UPDATE NOTE<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Optional update note"/></label>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {message && <p className="checkout-success" role="status">{message}</p>}
      <button type="button" className="admin-fulfillment-button" onClick={advance} disabled={busy}>
        {busy ? <LoaderCircle size={15}/> : next.status === "SHIPPED" ? <Truck size={15}/> : <PackageCheck size={15}/>}
        {busy ? "SAVING…" : next.label.toUpperCase()}
      </button>
      <p className="admin-setting-hint">Only verified, paid orders can move through fulfilment. Each change is recorded in the order history and admin audit log.</p>
    </section>
  );
}
