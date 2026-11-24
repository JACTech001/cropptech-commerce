"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, Command, LayoutDashboard, Package, Search, Settings2, ShoppingBag, X } from "lucide-react";

const sections = [
  { items: [
    { href: "/admin", title: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", title: "Orders", icon: ShoppingBag },
    { href: "/admin/products", title: "Products", icon: Package },
  ]},
  { label: "STORE OPERATIONS", items: [
    { href: "/admin/payments", title: "Payment reviews", icon: Bell },
    { href: "/admin/settings", title: "Delivery & settings", icon: Settings2 },
  ]},
];

export default function AdminShell({ children, email, adminName }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");

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
    { title: "Orders", detail: "Review orders and fulfilment", href: "/admin/orders" },
    { title: "Payment reviews", detail: "Review customer transfer submissions", href: "/admin/payments" },
    { title: "Delivery and settings", detail: "Bank account and delivery zones", href: "/admin/settings" },
  ].filter((item) => (item.title + " " + item.detail).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={"admin-shell " + (collapsed ? "is-collapsed " : "") + (mobileOpen ? "mobile-nav-open" : "")}>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-shell-brand"><Image src="/brand/cropplogotextcommerce-transparent.png" alt="CROPPTECH COMMERCE STORE" width={190} height={54} priority className="admin-shell-logo"/></Link>
        {sections.map((section) => <nav className="admin-nav-group" aria-label={section.label} key={section.label}>
          {section.label && <p>{section.label}</p>}
          {section.items.map((item) => { const Icon = item.icon; const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/")); return (
            <Link href={item.href} key={item.href} className={"admin-nav-link " + (active ? "active" : "")} onClick={() => setMobileOpen(false)} title={item.title}>
              <Icon size={17}/><span>{item.title}</span>
            </Link>
          ); })}
        </nav>)}
        <div className="admin-sidebar-bottom">
          <div className="admin-role-chip"><span className="admin-role-dot"/><span>ADMIN ACCESS</span></div>
          <span className="admin-sidebar-email" title={email}>{email}</span>
          <button type="button" className="admin-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={16}/> : <><ChevronLeft size={16}/><span>Collapse sidebar</span></>}</button>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="admin-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
      <div className="admin-main-frame">
        <header className="admin-utility-bar">
          <button type="button" className="admin-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Command size={18}/></button>
          <button type="button" className="admin-command-trigger" onClick={() => { setQuery(""); setCommandOpen(true); }}><Search size={16}/><span>Search admin pages and actions...</span><kbd>Ctrl K</kbd></button>
          <div className="admin-utility-right"><span className="admin-environment"><i/> STORE ADMIN</span><span className="admin-utility-user">{adminName || "Admin"}</span></div>
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
