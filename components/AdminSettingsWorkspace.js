"use client";

import { useState } from "react";
import { CreditCard, MonitorCog } from "lucide-react";
import AdminStoreSettings from "./AdminStoreSettings";
import AdminThemeControl from "./AdminThemeControl";

export default function AdminSettingsWorkspace() {
  const [activeView, setActiveView] = useState("payment");

  return (
    <div className="admin-settings-workspace">
      <nav className="admin-home-media-tabs admin-workspace-tabs" aria-label="Store settings sections">
        <button type="button" className={activeView === "payment" ? "is-active" : ""} aria-pressed={activeView === "payment"} onClick={() => setActiveView("payment")}><CreditCard size={15}/> PAYMENT SETTINGS</button>
        <button type="button" className={activeView === "appearance" ? "is-active" : ""} aria-pressed={activeView === "appearance"} onClick={() => setActiveView("appearance")}><MonitorCog size={15}/> ADMIN APPEARANCE</button>
      </nav>
      <div hidden={activeView !== "payment"}><AdminStoreSettings /></div>
      <div hidden={activeView !== "appearance"}><AdminThemeControl /></div>
    </div>
  );
}
