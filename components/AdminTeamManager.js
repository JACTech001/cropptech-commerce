"use client";

import { useEffect, useState } from "react";
import { UserPlus, ShieldCheck, ShieldOff, RefreshCw, LoaderCircle } from "lucide-react";

export default function AdminTeamManager() {
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/team", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load administrator accounts.");
      setAdmins(data.admins || []); setLogs(data.activity || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function addAdmin(event) {
    event.preventDefault();
    if (busy) return;
    setBusy("add"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not grant administrator access.");
      setEmail(""); setMessage(data.message || "Administrator access granted."); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  async function setStatus(admin, isActive) {
    if (busy) return;
    const action = isActive ? "reactivate" : "deactivate";
    const confirmed = window.confirm(isActive
      ? "Restore Admin access for " + admin.email + "?"
      : "Deactivate " + admin.email + "? They will lose access to the Admin workspace.");
    if (!confirmed) return;
    setBusy(admin.id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/team/" + encodeURIComponent(admin.id), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this administrator.");
      setMessage(data.message || "Administrator account updated."); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  return (
    <div className="admin-team-workspace">
      <section className="admin-team-add-card">
        <div><p className="eyebrow">GRANT ADMIN ACCESS</p><h2>Add an administrator</h2><p>The person must already have a CroppTech customer account. They can create one first using the normal sign-up process.</p></div>
        <form onSubmit={addAdmin}><label className="checkout-field">EXISTING ACCOUNT EMAIL<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com"/></label><button className="admin-primary-button" type="submit" disabled={Boolean(busy)}>{busy === "add" ? <LoaderCircle size={15}/> : <UserPlus size={15}/>} GRANT ADMIN ACCESS</button></form>
      </section>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {message && <p className="checkout-success" role="status">{message}</p>}
      <section className="admin-team-list-card">
        <div className="admin-team-section-heading"><div><p className="eyebrow">ACCESS CONTROL</p><h2>Administrators</h2></div><button type="button" onClick={load} disabled={loading}><RefreshCw size={14}/> REFRESH</button></div>
        {loading ? <p className="admin-setting-status">Loading administrator accounts…</p> : admins.length ? <div className="admin-team-table-wrap"><table className="admin-team-table"><thead><tr><th>ADMINISTRATOR</th><th>ROLE</th><th>STATUS</th><th>JOINED</th><th>ACTION</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin.id}><td><strong>{admin.fullName || admin.email}</strong><small>{admin.email}</small></td><td><span className={"admin-team-role " + (admin.role === "SUPER_ADMIN" ? "super" : "")}>{admin.role === "SUPER_ADMIN" ? <ShieldCheck size={13}/> : null}{admin.role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"}</span></td><td><span className={"admin-team-status " + (admin.isActive ? "active" : "inactive")}>{admin.isActive ? "Active" : "Deactivated"}</span></td><td>{new Date(admin.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td><td>{admin.role === "ADMIN" ? <button type="button" className={admin.isActive ? "admin-team-deactivate" : "admin-team-reactivate"} onClick={() => setStatus(admin, !admin.isActive)} disabled={Boolean(busy)}>{busy === admin.id ? <LoaderCircle size={14}/> : admin.isActive ? <><ShieldOff size={14}/> DEACTIVATE</> : <><ShieldCheck size={14}/> REACTIVATE</>}</button> : <span className="admin-team-protected">Protected</span>}</td></tr>)}</tbody></table></div> : <p className="admin-setting-status">No administrator accounts found.</p>}
      </section>
      <section className="admin-team-list-card">
        <div className="admin-team-section-heading"><div><p className="eyebrow">ACCOUNTABILITY</p><h2>Recent access changes</h2></div></div>
        {logs.length ? <div className="admin-team-activity">{logs.map((log) => <article key={log.id}><div><strong>{log.action.replaceAll("_", " ")}</strong><small>{log.actor?.fullName || log.actor?.email || "System"} · {log.entityId || "Account"}</small></div><time>{new Date(log.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></article>)}</div> : <p className="admin-setting-status">No administrator access changes recorded yet.</p>}
      </section>
    </div>
  );
}
