"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, MapPin, Pencil, PlusCircle, RefreshCw, ShieldOff, ShieldCheck, Truck, X } from "lucide-react";

export default function AdminDeliveryManager() {
  const [zones, setZones] = useState([]);
  const [activeView, setActiveView] = useState("zones");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);

  const loadZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/shipping-zones", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load delivery zones.");
      setZones(data.zones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/shipping-zones", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load delivery zones.");
        if (!cancelled) setZones(data.zones || []);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function addZone(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy("add");
    setError("");
    setMessage("");
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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function saveZone(event) {
    event.preventDefault();
    if (!editing || busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(editing.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/shipping-zones/" + encodeURIComponent(editing.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...values }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this delivery zone.");
      setEditing(null);
      await loadZones();
      setMessage(data.message || "Delivery zone updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function toggleZone(zone) {
    if (busy) return;
    const action = zone.isActive ? "deactivate" : "reactivate";
    const confirmed = window.confirm(zone.isActive
      ? "Deactivate delivery for " + zone.city + ", " + zone.state + "? Customers will no longer be able to select this area at checkout."
      : "Reactivate delivery for " + zone.city + ", " + zone.state + "?");
    if (!confirmed) return;

    setBusy(zone.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/shipping-zones/" + encodeURIComponent(zone.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this delivery zone.");
      await loadZones();
      setMessage(data.message || "Delivery zone status updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function beginEdit(zone) {
    setActiveView("zones");
    setError("");
    setMessage("");
    setEditing({
      id: zone.id,
      name: zone.name,
      state: zone.state,
      city: zone.city,
      fee: zone.fee,
      estimatedMinDays: String(zone.minDays ?? 2),
      estimatedMaxDays: String(zone.maxDays ?? 5),
    });
  }

  return (
    <section className="admin-delivery-workspace">
      <div className="admin-delivery-intro">
        <div className="admin-delivery-intro-icon"><Truck size={22}/></div>
        <div><h2>Delivery coverage</h2><p>Set the delivery areas, checkout fees and estimated delivery windows available to customers.</p></div>
      </div>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {message && <p className="checkout-success" role="status"><CheckCircle2 size={15}/>{message}</p>}
      <nav className="admin-home-media-tabs admin-workspace-tabs" aria-label="Delivery management sections">
        <button type="button" className={activeView === "zones" ? "is-active" : ""} aria-pressed={activeView === "zones"} onClick={() => setActiveView("zones")}><MapPin size={15}/> DELIVERY ZONES</button>
        <button type="button" className={activeView === "add" ? "is-active" : ""} aria-pressed={activeView === "add"} onClick={() => setActiveView("add")}><PlusCircle size={15}/> ADD DELIVERY AREA</button>
      </nav>
      <div className="admin-delivery-grid">
        <form className="admin-delivery-card" hidden={activeView !== "add"} onSubmit={addZone}>
          <p className="eyebrow">ADD DELIVERY AREA</p>
          <label className="checkout-field">ZONE NAME<input name="name" required maxLength={100} placeholder="e.g. Lagos Mainland"/></label>
          <label className="checkout-field">STATE<input name="state" required maxLength={100} placeholder="e.g. Lagos"/></label>
          <label className="checkout-field">CITY / TOWN<input name="city" required maxLength={100} placeholder="e.g. Ikeja"/></label>
          <label className="checkout-field">DELIVERY FEE (NGN)<input name="fee" type="number" min="0" step="0.01" required placeholder="e.g. 3500"/></label>
          <div className="admin-shipping-days">
            <label className="checkout-field">MIN. DAYS<input name="estimatedMinDays" type="number" min="1" max="60" defaultValue="2" required/></label>
            <label className="checkout-field">MAX. DAYS<input name="estimatedMaxDays" type="number" min="1" max="60" defaultValue="5" required/></label>
          </div>
          <button className="checkout-primary" type="submit" disabled={Boolean(busy)}>{busy === "add" ? <LoaderCircle size={15}/> : <PlusCircle size={15}/>} ADD DELIVERY AREA</button>
          <p className="admin-setting-hint">A city can have one active delivery rate. The configured fee is used by the checkout calculation.</p>
        </form>
        <section className="admin-delivery-card admin-delivery-zone-card" hidden={activeView !== "zones"}>
          <div className="admin-delivery-list-heading">
            <div><p className="eyebrow">DELIVERY COVERAGE</p><h2>Delivery zones</h2></div>
            <button type="button" onClick={loadZones} disabled={loading}><RefreshCw size={14}/> REFRESH</button>
          </div>
          <div className="admin-delivery-counts"><span>{zones.filter((zone) => zone.isActive).length} active</span><span>{zones.filter((zone) => !zone.isActive).length} inactive</span></div>
          {loading ? <p className="admin-setting-status">Loading delivery areas…</p> : zones.length ? (
            <div className="admin-delivery-zone-list">
              {zones.map((zone) => (
                <article key={zone.id} className={!zone.isActive ? "is-inactive" : ""}>
                  <span className="admin-delivery-zone-icon"><MapPin size={16}/></span>
                  <div className="admin-delivery-zone-info">
                    <strong>{zone.name}</strong>
                    <small>{zone.city}, {zone.state} · {zone.minDays}–{zone.maxDays} days</small>
                    <span className={"admin-team-status " + (zone.isActive ? "active" : "inactive")}>{zone.isActive ? "Active at checkout" : "Inactive"}</span>
                  </div>
                  <b>₦{Number(zone.fee).toLocaleString("en-NG")}</b>
                  <div className="admin-delivery-zone-actions">
                    <button type="button" onClick={() => beginEdit(zone)} disabled={Boolean(busy)} aria-label={"Edit " + zone.name}><Pencil size={14}/> EDIT</button>
                    <button type="button" className={zone.isActive ? "deactivate" : "reactivate"} onClick={() => toggleZone(zone)} disabled={Boolean(busy)}>{busy === zone.id ? <LoaderCircle size={14}/> : zone.isActive ? <><ShieldOff size={14}/> DEACTIVATE</> : <><ShieldCheck size={14}/> REACTIVATE</>}</button>
                  </div>
                  {editing?.id === zone.id && (
                    <form className="admin-delivery-edit-form" onSubmit={saveZone}>
                      <div className="admin-delivery-edit-heading"><strong>Edit delivery area</strong><button type="button" onClick={() => setEditing(null)} aria-label="Cancel editing"><X size={15}/></button></div>
                      <label className="checkout-field">ZONE NAME<input name="name" required maxLength={100} defaultValue={editing.name}/></label>
                      <div className="admin-delivery-edit-fields">
                        <label className="checkout-field">STATE<input name="state" required maxLength={100} defaultValue={editing.state}/></label>
                        <label className="checkout-field">CITY / TOWN<input name="city" required maxLength={100} defaultValue={editing.city}/></label>
                        <label className="checkout-field">FEE (NGN)<input name="fee" type="number" min="0" step="0.01" required defaultValue={editing.fee}/></label>
                        <label className="checkout-field">MIN. DAYS<input name="estimatedMinDays" type="number" min="1" max="60" required defaultValue={editing.estimatedMinDays}/></label>
                        <label className="checkout-field">MAX. DAYS<input name="estimatedMaxDays" type="number" min="1" max="60" required defaultValue={editing.estimatedMaxDays}/></label>
                      </div>
                      <button className="checkout-primary" type="submit" disabled={Boolean(busy)}>{busy === zone.id ? <LoaderCircle size={15}/> : <CheckCircle2 size={15}/>} SAVE DELIVERY AREA</button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          ) : <div className="admin-delivery-empty"><MapPin size={23}/><strong>No delivery zones yet</strong><span>Add your first delivery area to make it available at checkout.</span></div>}
          <p className="admin-setting-hint">Deactivating an area removes it from checkout without deleting historical order or shipping-rate records. Dispatch and tracking remain part of Orders.</p>
        </section>
      </div>
    </section>
  );
}
