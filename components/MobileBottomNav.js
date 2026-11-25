"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserRound, Store, Bell, Music2 } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Shop", href: "/shop", icon: Store, key: "shop" },
  { label: "TikTok", href: "https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc", icon: Music2, key: "tiktok", external: true },
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
      {tabs.map(({ label, href, icon: Icon, key, external }) => {
        const active = activeKey === key;
        return external ? (
          <a key={key} href={href} className="mobile-bottom-nav-link mobile-bottom-nav-tiktok" target="_blank" rel="noopener noreferrer" aria-label="Follow CroppTech Commerce on TikTok">
            <span className="mobile-bottom-nav-icon"><Icon size={20} strokeWidth={active ? 2.1 : 1.7}/></span>
            <span>{label}</span>
          </a>
        ) : (
          <Link key={key} href={href} className={active ? "mobile-bottom-nav-link is-active" : "mobile-bottom-nav-link"} aria-current={active ? "page" : undefined}>
            <span className="mobile-bottom-nav-icon"><Icon size={20} strokeWidth={active ? 2.1 : 1.7}/></span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
