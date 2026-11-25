"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import styles from "./CustomerNotificationBell.module.css";

export default function CustomerNotificationBell() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Notifications unavailable.");
        if (active) setCount(data.unreadCount || 0);
      })
      .catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, []);

  return (
    <Link href="/account/notifications" className={styles.link} aria-label={count ? "Notifications, " + count + " unread" : "Notifications"} title="Notifications">
      <Bell size={17}/>
      <span>NOTIFICATIONS</span>
      {count > 0 && <b>{count > 99 ? "99+" : count}</b>}
      {error && <span className={styles.srOnly}>{error}</span>}
    </Link>
  );
}
