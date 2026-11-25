"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import styles from "./AdminNotificationBell.module.css";

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load notifications.");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (cause) {
      setError(cause.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Could not update notification.");
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (cause) { setError(cause.message); }
  }

  async function markAllRead() {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read-all" }),
      });
      if (!response.ok) throw new Error("Could not update notifications.");
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (cause) { setError(cause.message); }
  }

  return (
    <div className={styles.root}>
      <button type="button" className={styles.trigger} aria-label={unreadCount ? "Notifications, " + unreadCount + " unread" : "Notifications"} aria-expanded={open} onClick={() => { setOpen((value) => !value); if (!open) load(); }}>
        <Bell size={17}/>
        {unreadCount > 0 && <span className={styles.count}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && <>
        <button type="button" className={styles.dismiss} aria-label="Close notifications" onClick={() => setOpen(false)}/>
        <section className={styles.panel} aria-label="Admin notifications">
          <header className={styles.header}>
            <div><strong>Notifications</strong><small>{unreadCount} unread</small></div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount}><CheckCheck size={14}/> Mark all read</button>
          </header>
          {error && <p className={styles.error} role="alert">{error}</p>}
          {loading && !notifications.length ? <div className={styles.empty}><LoaderCircle className={styles.spin} size={18}/> Loading notifications…</div> :
            notifications.length ? <div className={styles.list}>{notifications.map((item) => <article key={item.id} className={item.readAt ? styles.read : styles.unread}>
              <span className={styles.dot}/>
              <div><Link href={item.href} onClick={() => { if (!item.readAt) markRead(item.id); setOpen(false); }}><strong>{item.title}</strong><p>{item.message}</p></Link><time>{new Date(item.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></div>
              {!item.readAt && <button type="button" className={styles.readButton} onClick={() => markRead(item.id)} aria-label="Mark notification as read"/>}
            </article>)}</div> :
            <div className={styles.empty}><Bell size={20}/><strong>You’re all caught up</strong><span>New orders, payment reviews and stock alerts will appear here.</span></div>}
          <footer><button type="button" onClick={load} disabled={loading}>Refresh</button></footer>
        </section>
      </>}
    </div>
  );
}
