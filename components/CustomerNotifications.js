"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react";
import styles from "./CustomerNotifications.module.css";

const date = (value) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function CustomerNotifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/account/notifications", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load notifications.");
      setItems(data.notifications || []); setUnread(data.unreadCount || 0);
    } catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load notifications.");
        if (active) { setItems(data.notifications || []); setUnread(data.unreadCount || 0); }
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function markRead(id) {
    const response = await fetch("/api/account/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not update notification.");
    setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString(), status: "READ" } : item));
    setUnread((current) => Math.max(0, current - 1));
  }

  async function markAllRead() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read-all" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update notifications.");
      setItems((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString(), status: "READ" })));
      setUnread(0);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.heading}>
        <div><p className="eyebrow">YOUR CUSTOMER SPACE</p><h1>Notifications<span>.</span></h1><p>Order, payment and delivery updates from CroppTech.</p></div>
        <div className={styles.tools}><button type="button" onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</button><button type="button" onClick={markAllRead} disabled={!unread || busy}><CheckCheck size={14}/> Mark all read</button></div>
      </div>
      <div className={styles.summary}><Bell size={16}/><strong>{unread}</strong><span>unread notification{unread === 1 ? "" : "s"}</span></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading ? <div className={styles.empty}><LoaderCircle size={20} className={styles.spin}/> Loading your notifications…</div> :
        items.length ? <div className={styles.list}>{items.map((item) => <article key={item.id} className={item.isRead ? styles.read : styles.unread}>
          <span className={styles.indicator}/>
          <div className={styles.content}>
            <Link href={item.href} onClick={() => { if (!item.isRead) markRead(item.id).catch((cause) => setError(cause.message)); }}>
              <strong>{item.subject || "Store update"}</strong><p>{item.message}</p>
            </Link>
            <time>{date(item.createdAt)}</time>
          </div>
          {!item.isRead && <button type="button" className={styles.mark} onClick={() => markRead(item.id).catch((cause) => setError(cause.message))}>Mark read</button>}
        </article>)}</div> :
        <div className={styles.empty}><Bell size={25}/><strong>You’re all caught up.</strong><span>Important updates about your orders and payments will appear here.</span><Link href="/shop">Explore the collection</Link></div>}
      <Link href="/account" className={styles.back}><ArrowLeft size={14}/> Back to my account</Link>
    </section>
  );
}
