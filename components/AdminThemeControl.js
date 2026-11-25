"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

const KEY = "cropptech-admin-theme";
const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function AdminThemeControl() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (["light", "dark", "system"].includes(saved)) setTheme(saved);
    } catch {}

    const onThemeChange = (event) => setTheme(event.detail || "system");
    const onStorage = (event) => {
      if (event.key === KEY) {
        setTheme(["light", "dark", "system"].includes(event.newValue) ? event.newValue : "system");
      }
    };
    window.addEventListener("cropptech-admin-theme-change", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cropptech-admin-theme-change", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function choose(value) {
    setTheme(value);
    try { window.localStorage.setItem(KEY, value); } catch {}
    window.dispatchEvent(new CustomEvent("cropptech-admin-theme-change", { detail: value }));
  }

  return (
    <section className="admin-theme-control">
      <div><h3>Admin appearance</h3><p>Choose how the Admin workspace looks on this device.</p></div>
      <div className="admin-theme-options" role="group" aria-label="Admin colour theme">
        {choices.map(({ value, label, icon: Icon }) => (
          <button type="button" key={value} className={theme === value ? "selected" : ""} aria-pressed={theme === value} onClick={() => choose(value)}>
            <Icon size={16}/><span>{label}</span>
          </button>
        ))}
      </div>
      <small>Your choice is shared between Admin Account and Settings. The customer storefront is not affected.</small>
    </section>
  );
}
