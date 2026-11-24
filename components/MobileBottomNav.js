"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserRound, Store } from "lucide-react";

const TIKTOK_URL = "https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc";

const tabs = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Shop", href: "/shop", icon: Store, key: "shop" },
  { label: "TikTok", href: TIKTOK_URL, key: "tiktok", external: true },
  { label: "Account", href: "/account", icon: UserRound, key: "account" },
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M16.7 2.5c.3 2.4 1.7 4 4.1 4.2v3.2a8.2 8.2 0 0 1-4.1-1.2v6.5a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.8 2.8V2.5h3.2Z" fill="currentColor" />
      <path d="M14.9 2.5h1.8c.3 2.4 1.7 4 4.1 4.2v1.8c-3.4-.2-5.6-2.2-5.9-6Z" fill="#25F4EE" />
      <path d="M8.8 11.2v1.8a3 3 0 0 0-1.1 5.5 3 3 0 0 1 1.1-7.3Z" fill="#FE2C55" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders/")
  ) return null;

  const activeKey =
    pathname === "/" ? "home" :
    pathname === "/account" ? "account" :
    pathname.startsWith("/shop") ? "shop" : "";

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile shopping navigation">
      {tabs.map(({ label, href, icon: Icon, key, external }) => {
        const active = activeKey === key;
        const className = active ? "mobile-bottom-nav-link is-active" : "mobile-bottom-nav-link";
        const content = (
          <>
            <span className="mobile-bottom-nav-icon">
              {key === "tiktok" ? <TikTokIcon /> : <Icon size={20} strokeWidth={active ? 2.1 : 1.7} />}
            </span>
            <span>{label}</span>
          </>
        );

        return external ? (
          <a key={key} href={href} className={className} target="_blank" rel="noopener noreferrer" aria-label="Visit CROPPTECH on TikTok">
            {content}
          </a>
        ) : (
          <Link key={key} href={href} className={className} aria-current={active ? "page" : undefined}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
