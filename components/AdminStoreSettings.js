"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, PlusCircle, ShieldCheck } from "lucide-react";

export default function AdminStoreSettings() {
  const [account, setAccount] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankBusy, setBankBusy] = useState(false);
  const [shippingBusy, setShippingBusy] = useState(false);
  const [bankMessage, setBankMessage] = useState("");
  const [shippingMessage, setShippingMessage] = useState("");
  const [bankError, setBankError] = useState("");
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/payment-account", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load payment settings.");
        if (active) setAccount(data.account);
      })
      .catch((error) => { if (active) setBankError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    fetch("/api/admin/shipping-zones", { cache: "no-store" })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Could not load delivery zones."); if (active) setZones(data.zones || []); })
      .catch((error) => { if (active) setShippingError(error.message); });
    return () => { active = false; };
  }, []);

  async function saveBank(event) {
    event.preventDefault();
    if (bankBusy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBankBusy(true); setBankError(""); setBankMessage("");
    try {
      const response = await fetch("/api/admin/payment-account", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save payment settings.");
      setAccount(data.account);
      form.reset();
      setBankMessage(data.message || "Payment account updated.");
    } catch (error) { setBankError(error.message); }
    finally { setBankBusy(false); }
  }

  async function saveShipping(event) {
    event.preventDefault();
    if (shippingBusy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setShippingBusy(true); setShippingError(""); setShippingMessage("");
    try {
      const response = await fetch("/api/admin/shipping-zones", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save delivery zone.");
      form.reset();
      const zonesResponse = await fetch("/api/admin/shipping-zones", { cache: "no-store" });
      const zonesData = await zonesResponse.json().catch(() => ({}));
      if (zonesResponse.ok) setZones(zonesData.zones || []);
      setShippingMessage(data.message || "Delivery zone saved.");
    } catch (error) { setShippingError(error.message); }
    finally { setShippingBusy(false); }
  }

  return (
    <section className="admin-settings-section">
      <div className="admin-settings-heading"><ShieldCheck size={19}/><div><h2>Store checkout settings</h2><p>Configure the account customers transfer to and the delivery rates used when the server calculates order totals.</p></div></div>
      <div className="admin-settings-grid">
        <form className="admin-settings-card" onSubmit={saveBank}>
          <p className="eyebrow">BANK TRANSFER ACCOUNT</p>
          {loading ? <p className="admin-setting-status">Loading secure payment settings…</p> : account ? (
            <div className="admin-current-account"><strong>{account.bankName}</strong><span>{account.accountName}</span><b>{account.accountNumberMasked}</b><small>Active customer transfer account</small></div>
          ) : <p className="admin-setting-status">No active bank account is configured.</p>}
          <label className="checkout-field">BANK NAME<input name="bankName" required maxLength={100} placeholder="e.g. Your bank"/></label>
          <label className="checkout-field">ACCOUNT NAME<input name="accountName" required maxLength={120} placeholder="Account holder's name"/></label>
          <label className="checkout-field">10-DIGIT ACCOUNT NUMBER<input name="accountNumber" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required placeholder="Enter account number"/></label>
          <label className="checkout-field">TRANSFER INSTRUCTIONS <span className="checkout-optional">OPTIONAL</span><textarea name="instructions" rows={2} maxLength={1000} placeholder="Instructions shown to customers"/></label>
          {bankError && <p className="checkout-error" role="alert">{bankError}</p>}
          {bankMessage && <p className="checkout-success" role="status"><CheckCircle2 size={15}/>{bankMessage}</p>}
          <button className="checkout-primary" type="submit" disabled={bankBusy}>{bankBusy ? <LoaderCircle size={15}/> : <ShieldCheck size={15}/>} SAVE BANK ACCOUNT</button>
          <p className="admin-setting-hint">The account number is encrypted before it is saved. Only a masked version is shown here. Saving a new account deactivates the previous one; existing orders keep their payment snapshot.</p>
        </form>

        <form className="admin-settings-card" onSubmit={saveShipping}>
          <p className="eyebrow">NIGERIAN DELIVERY ZONE</p>
          <label className="checkout-field">ZONE NAME<input name="name" required maxLength={100} placeholder="e.g. Lagos Mainland"/></label>
          <label className="checkout-field">STATE<input name="state" required maxLength={100} placeholder="e.g. Lagos"/></label>
          <label className="checkout-field">CITY / TOWN<input name="city" required maxLength={100} placeholder="e.g. Ikeja"/></label>
          <label className="checkout-field">DELIVERY FEE (NGN)<input name="fee" type="number" min="0" step="0.01" required placeholder="e.g. 3500"/></label>
          <div className="admin-shipping-days">
            <label className="checkout-field">MIN. DAYS<input name="estimatedMinDays" type="number" min="1" max="60" defaultValue="2" required/></label>
            <label className="checkout-field">MAX. DAYS<input name="estimatedMaxDays" type="number" min="1" max="60" defaultValue="5" required/></label>
          </div>
          {shippingError && <p className="checkout-error" role="alert">{shippingError}</p>}
          {shippingMessage && <p className="checkout-success" role="status"><CheckCircle2 size={15}/>{shippingMessage}</p>}
          <button className="checkout-primary" type="submit" disabled={shippingBusy}>{shippingBusy ? <LoaderCircle size={15}/> : <PlusCircle size={15}/>} ADD DELIVERY ZONE</button>
          <div className="admin-zone-list"><strong>ACTIVE DELIVERY ZONES ({zones.length})</strong>{zones.length ? zones.map((zone, index) => <div key={zone.id + "-" + index}><span>{zone.name} · {zone.city}, {zone.state}</span><b>₦{Number(zone.fee).toLocaleString("en-NG")}</b></div>) : <small>No delivery zones configured yet.</small>}</div>
          <p className="admin-setting-hint">Create one rate per city or delivery area. Duplicate state/city zones are blocked so checkout can calculate one unambiguous fee.</p>
        </form>
      </div>
    </section>
  );
}
