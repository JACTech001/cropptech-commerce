"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Command, ImagePlus, LayoutDashboard, Package, Search, Settings2, ShoppingBag, Truck, UserRound, Users, X } from "lucide-react";
import AdminNotificationBell from "./AdminNotificationBell";

const sections = [
  { items: [
    { href: "/admin", title: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", title: "Orders", icon: ShoppingBag },
    { href: "/admin/products", title: "Products", icon: Package },
    { href: "/admin/homepage-media", title: "Store Front Studio", icon: ImagePlus },
  ]},
  { label: "STORE OPERATIONS", items: [
    { href: "/admin/payments", title: "Payment reviews", icon: Bell },
    { href: "/admin/delivery", title: "Delivery", icon: Truck },
    { href: "/admin/settings", title: "Settings", icon: Settings2 },
  ]},
];

export default function AdminShell({ children, email, adminName, isSuperAdmin = false }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cropptech-admin-theme");
      if (["light", "dark", "system"].includes(saved)) {
        window.queueMicrotask(() => setTheme(saved));
      }
    } catch {}
    const onThemeChange = (event) => setTheme(event.detail || "system");
    const onStorage = (event) => {
      if (event.key === "cropptech-admin-theme") {
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

  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update(); media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  const darkMode = theme === "dark" || (theme === "system" && systemDark);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") { setCommandOpen(false); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = [
    { title: "Overview", detail: "Dashboard summary", href: "/admin" },
    { title: "Manage products", detail: "Create, edit and publish products", href: "/admin/products" },
    { title: "Store Front Studio", detail: "Curate homepage images and visual placements", href: "/admin/homepage-media" },
    { title: "Orders", detail: "Review orders and fulfilment", href: "/admin/orders" },
    { title: "Payment reviews", detail: "Review customer transfer submissions", href: "/admin/payments" },
    { title: "Delivery", detail: "Delivery zones, fees and estimates", href: "/admin/delivery" },
    { title: "Settings", detail: "Payment and store configuration", href: "/admin/settings" },
    { title: "Admin account", detail: "Personal account and appearance", href: "/admin/account" },
    ...(isSuperAdmin ? [{ title: "Admin management", detail: "Grant, deactivate and restore admin access", href: "/admin/team" }] : []),
  ].filter((item) => (item.title + " " + item.detail).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={"admin-shell " + (collapsed ? "is-collapsed " : "") + (mobileOpen ? "mobile-nav-open" : "")} data-theme={darkMode ? "dark" : "light"}>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-shell-brand"><Image src="/brand/cropplogotextcommerce-transparent.png" alt="CROPPTECH COMMERCE STORE" width={190} height={54} priority className="admin-shell-logo"/></Link>
        {sections.map((section) => <nav className="admin-nav-group" aria-label={section.label || "Main navigation"} key={section.items[0]?.href || "admin-navigation"}>
          {section.label && <p>{section.label}</p>}
          {section.items.map((item) => { const Icon = item.icon; const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/")); return (
            <Link href={item.href} key={item.href} className={"admin-nav-link " + (active ? "active" : "")} onClick={() => setMobileOpen(false)} title={item.title}>
              <Icon size={17}/><span>{item.title}</span>
            </Link>
          ); })}
        </nav>)}
        <nav className="admin-nav-group" aria-label="Personal account">
          <p>PERSONAL</p>
          <Link href="/admin/account" className={"admin-nav-link " + (pathname === "/admin/account" ? "active" : "")} onClick={() => setMobileOpen(false)}><UserRound size={17}/><span>Admin Account</span></Link>
          {isSuperAdmin && <Link href="/admin/team" className={"admin-nav-link " + (pathname === "/admin/team" ? "active" : "")} onClick={() => setMobileOpen(false)}><Users size={17}/><span>Admin Management</span></Link>}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-role-chip"><span className="admin-role-dot"/><span>{isSuperAdmin ? "SUPER ADMIN ACCESS" : "ADMIN ACCESS"}</span></div>
          <span className="admin-sidebar-email" title={email}>{email}</span>
          <button type="button" className="admin-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={16}/> : <><ChevronLeft size={16}/><span>Collapse sidebar</span></>}</button>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="admin-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
      <div className="admin-main-frame">
        <header className="admin-utility-bar">
          <button type="button" className="admin-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Command size={18}/></button>
          <button type="button" className="admin-command-trigger" onClick={() => { setQuery(""); setCommandOpen(true); }}><Search size={16}/><span>Search admin pages and actions...</span><kbd>Ctrl K</kbd></button>
          <div className="admin-utility-right"><AdminNotificationBell/><span className="admin-environment"><i/> STORE ADMIN</span><span className="admin-utility-user">{adminName || "Admin"}</span></div>
        </header>
        <div className="admin-main-content">{children}</div>
      </div>
      {commandOpen && <div className="admin-command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
        <section className="admin-command-dialog" role="dialog" aria-modal="true" aria-label="Admin command search">
          <div className="admin-command-input"><Search size={18}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search admin pages and actions..." /><button type="button" onClick={() => setCommandOpen(false)} aria-label="Close search"><X size={17}/></button></div>
          <p className="admin-command-caption">NAVIGATION</p>
          {commands.length ? commands.map((item) => <Link href={item.href} key={item.href} className="admin-command-result" onClick={() => setCommandOpen(false)}><span><b>{item.title}</b><small>{item.detail}</small></span><span>↵</span></Link>) : <p className="admin-command-empty">No matching admin destination.</p>}
        </section>
      </div>}
    </div>
  );
}
