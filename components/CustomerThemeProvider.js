"use client";

import { useEffect } from "react";

const KEY = "cropptech-customer-theme";

export default function CustomerThemeProvider({ children }) {
  useEffect(() => {
    let preference = "system";
    try {
      const saved = localStorage.getItem(KEY);
      if (["light", "dark", "system"].includes(saved)) preference = saved;
    } catch {}

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (value) => {
      const dark = value === "dark" || (value === "system" && media.matches);
      document.documentElement.dataset.customerTheme = dark ? "dark" : "light";
      document.documentElement.dataset.customerThemePreference = value;
    };
    apply(preference);

    const onPreference = (event) => {
      const value = ["light", "dark", "system"].includes(event.detail) ? event.detail : "system";
      apply(value);
    };
    const onStorage = (event) => {
      if (event.key === KEY) apply(["light", "dark", "system"].includes(event.newValue) ? event.newValue : "system");
    };
    const onSystem = () => {
      if (document.documentElement.dataset.customerThemePreference === "system") apply("system");
    };
    window.addEventListener("cropptech-customer-theme-change", onPreference);
    window.addEventListener("storage", onStorage);
    media.addEventListener?.("change", onSystem);
    return () => {
      window.removeEventListener("cropptech-customer-theme-change", onPreference);
      window.removeEventListener("storage", onStorage);
      media.removeEventListener?.("change", onSystem);
    };
  }, []);

  return children;
}
