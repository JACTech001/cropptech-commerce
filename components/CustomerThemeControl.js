"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

const KEY = "cropptech-customer-theme";

export default function CustomerThemeControl() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (["light", "dark", "system"].includes(saved)) window.queueMicrotask(() => setTheme(saved));
    } catch {}
  }, []);

  function updateTheme(value) {
    setTheme(value);
    try { localStorage.setItem(KEY, value); } catch {}
    window.dispatchEvent(new CustomEvent("cropptech-customer-theme-change", { detail: value }));
  }

  return (
    <section className="customer-appearance">
      <div><p className="eyebrow">APPEARANCE</p><h3>Display theme</h3><p>Choose how CroppTech looks on your devices.</p></div>
      <div className="customer-theme-options" role="group" aria-label="Display theme">
        <button type="button" className={theme === "light" ? "selected" : ""} aria-pressed={theme === "light"} onClick={() => updateTheme("light")}><Sun size={16}/>Light</button>
        <button type="button" className={theme === "dark" ? "selected" : ""} aria-pressed={theme === "dark"} onClick={() => updateTheme("dark")}><Moon size={16}/>Dark</button>
        <button type="button" className={theme === "system" ? "selected" : ""} aria-pressed={theme === "system"} onClick={() => updateTheme("system")}><Monitor size={16}/>System</button>
      </div>
    </section>
  );
}
