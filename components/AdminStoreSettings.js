"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

export default function AdminStoreSettings() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/payment-account", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load payment settings.");
        if (active) setAccount(data.account);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function saveBank(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/payment-account", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save payment settings.");
      setAccount(data.account); form.reset();
      setMessage(data.message || "Payment account updated.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="admin-settings-section">
      <div className="admin-settings-heading"><ShieldCheck size={19}/><div><h2>Payment configuration</h2><p>Manage the bank account customers transfer to and the instructions shown during checkout.</p></div></div>
      <div className="admin-settings-grid admin-settings-grid-single">
        <form className="admin-settings-card" onSubmit={saveBank}>
          <p className="eyebrow">BANK TRANSFER ACCOUNT</p>
          {loading ? <p className="admin-setting-status">Loading secure payment settings…</p> : account ? (
            <div className="admin-current-account"><strong>{account.bankName}</strong><span>{account.accountName}</span><b>{account.accountNumberMasked}</b><small>Active customer transfer account</small></div>
          ) : <p className="admin-setting-status">No active bank account is configured.</p>}
          <label className="checkout-field">BANK NAME<input name="bankName" required maxLength={100} placeholder="e.g. Your bank"/></label>
          <label className="checkout-field">ACCOUNT NAME<input name="accountName" required maxLength={120} placeholder="Account holder's name"/></label>
          <label className="checkout-field">10-DIGIT ACCOUNT NUMBER<input name="accountNumber" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required placeholder="Enter account number"/></label>
          <label className="checkout-field">TRANSFER INSTRUCTIONS <span className="checkout-optional">OPTIONAL</span><textarea name="instructions" rows={2} maxLength={1000} placeholder="Instructions shown to customers"/></label>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          {message && <p className="checkout-success" role="status"><CheckCircle2 size={15}/>{message}</p>}
          <button className="checkout-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={15}/> : <ShieldCheck size={15}/>} SAVE BANK ACCOUNT</button>
          <p className="admin-setting-hint">The account number is encrypted before it is saved. Only a masked version is shown here. Saving a new account deactivates the previous one; existing orders keep their payment snapshot.</p>
        </form>
      </div>
    </section>
  );
}
