"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserRound, Store, Bell } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Shop", href: "/shop", icon: Store, key: "shop" },
  { label: "Notifications", href: "/account/notifications", icon: Bell, key: "notifications" },
  { label: "Account", href: "/account", icon: UserRound, key: "account" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/checkout")) return null;

  const activeKey =
    pathname === "/" ? "home" :
    pathname.startsWith("/shop") ? "shop" :
    pathname.startsWith("/account/notifications") ? "notifications" :
    pathname.startsWith("/account") || pathname.startsWith("/orders/") ? "account" : "";

  return (
    <nav className="mobile-bottom-nav" aria-label="Store navigation">
      {tabs.map(({ label, href, icon: Icon, key }) => {
        const active = activeKey === key;
        return (
          <Link key={key} href={href} className={active ? "mobile-bottom-nav-link is-active" : "mobile-bottom-nav-link"} aria-current={active ? "page" : undefined}>
            <span className="mobile-bottom-nav-icon"><Icon size={20} strokeWidth={active ? 2.1 : 1.7}/></span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
