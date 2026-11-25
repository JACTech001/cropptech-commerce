"use client";

import { useState } from "react";
import { MonitorCog, UserRound } from "lucide-react";
import AdminThemeControl from "./AdminThemeControl";

export default function AdminAccountWorkspace({ fullName, email, role }) {
  const [activeView, setActiveView] = useState("profile");

  return (
    <div className="admin-account-workspace">
      <nav className="admin-home-media-tabs admin-workspace-tabs" aria-label="Admin account sections">
        <button type="button" className={activeView === "profile" ? "is-active" : ""} aria-pressed={activeView === "profile"} onClick={() => setActiveView("profile")}><UserRound size={15}/> ACCOUNT PROFILE</button>
        <button type="button" className={activeView === "appearance" ? "is-active" : ""} aria-pressed={activeView === "appearance"} onClick={() => setActiveView("appearance")}><MonitorCog size={15}/> WORKSPACE APPEARANCE</button>
      </nav>
      <section className="admin-account-profile" hidden={activeView !== "profile"}>
        <div className="admin-account-avatar">{(fullName[0] || "A").toUpperCase()}</div>
        <div><p className="eyebrow">SIGNED-IN ADMINISTRATOR</p><h2>{fullName}</h2><p>{email}</p><span>{role === "SUPER_ADMIN" ? "SUPER ADMINISTRATOR" : "ADMINISTRATOR"}</span></div>
      </section>
      <div hidden={activeView !== "appearance"}><AdminThemeControl /></div>
      <p className="admin-setting-hint">Password changes and account recovery are managed by the secure sign-in provider. Use the sign-in page&apos;s recovery option if you need to reset your password.</p>
    </div>
  );
}
