"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, MapPin, PlusCircle, Truck } from "lucide-react";

export default function AdminDeliveryManager() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/shipping-zones", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load delivery zones.");
      setZones(data.zones || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  async function addZone(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/shipping-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save delivery zone.");
      form.reset();
      await loadZones();
      setMessage(data.message || "Delivery zone added.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="admin-delivery-workspace">
      <div className="admin-delivery-intro">
        <div className="admin-delivery-intro-icon"><Truck size={22}/></div>
        <div><h2>Delivery coverage</h2><p>Set the delivery areas, checkout fees and estimated delivery windows available to customers.</p></div>
      </div>
      <div className="admin-delivery-grid">
        <form className="admin-delivery-card" onSubmit={addZone}>
          <p className="eyebrow">ADD DELIVERY AREA</p>
          <label className="checkout-field">ZONE NAME<input name="name" required maxLength={100} placeholder="e.g. Lagos Mainland"/></label>
          <label className="checkout-field">STATE<input name="state" required maxLength={100} placeholder="e.g. Lagos"/></label>
          <label className="checkout-field">CITY / TOWN<input name="city" required maxLength={100} placeholder="e.g. Ikeja"/></label>
          <label className="checkout-field">DELIVERY FEE (NGN)<input name="fee" type="number" min="0" step="0.01" required placeholder="e.g. 3500"/></label>
          <div className="admin-shipping-days">
            <label className="checkout-field">MIN. DAYS<input name="estimatedMinDays" type="number" min="1" max="60" defaultValue="2" required/></label>
            <label className="checkout-field">MAX. DAYS<input name="estimatedMaxDays" type="number" min="1" max="60" defaultValue="5" required/></label>
          </div>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          {message && <p className="checkout-success" role="status"><CheckCircle2 size={15}/>{message}</p>}
          <button className="checkout-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={15}/> : <PlusCircle size={15}/>} ADD DELIVERY AREA</button>
          <p className="admin-setting-hint">A city can have one active delivery rate. The configured fee is used by the checkout calculation.</p>
        </form>
        <section className="admin-delivery-card admin-delivery-zone-card">
          <div className="admin-delivery-list-heading"><div><p className="eyebrow">CURRENT COVERAGE</p><h2>Delivery zones</h2></div><span>{zones.length} active</span></div>
          {loading ? <p className="admin-setting-status">Loading delivery areas…</p> : zones.length ? (
            <div className="admin-delivery-zone-list">{zones.map((zone) => <article key={zone.id}><span className="admin-delivery-zone-icon"><MapPin size={16}/></span><div><strong>{zone.name}</strong><small>{zone.city}, {zone.state} · {zone.minDays}–{zone.maxDays} days</small></div><b>₦{Number(zone.fee).toLocaleString("en-NG")}</b></article>)}</div>
          ) : <div className="admin-delivery-empty"><MapPin size={23}/><strong>No delivery zones yet</strong><span>Add your first delivery area to make it available at checkout.</span></div>}
          <p className="admin-setting-hint">Order dispatch, courier details and fulfilment status remain available in Orders. This page manages delivery coverage and pricing.</p>
        </section>
      </div>
    </section>
  );
}
