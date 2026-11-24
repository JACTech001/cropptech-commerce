"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2X2, UserRound, Store } from "lucide-react";

const tabs = [
  { label: "Home", href: "/", icon: Home, key: "home" },
  { label: "Shop", href: "/shop", icon: Store, key: "shop" },
  { label: "Categories", href: "/shop?collection=linen", icon: Grid2X2, key: "categories" },
  { label: "Account", href: "/account", icon: UserRound, key: "account" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [collection, setCollection] = useState("");

  useEffect(() => {
    const readCollection = () => setCollection(new URLSearchParams(window.location.search).get("collection") || "");
    readCollection();
    window.addEventListener("popstate", readCollection);
    return () => window.removeEventListener("popstate", readCollection);
  }, [pathname]);

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders/")
  ) return null;

  const activeKey =
    pathname === "/" ? "home" :
    pathname === "/account" ? "account" :
    pathname.startsWith("/shop") && collection === "linen" ? "categories" :
    pathname.startsWith("/shop") ? "shop" : "";

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile shopping navigation">
      {tabs.map(({ label, href, icon: Icon, key }) => (
        <Link
          key={key}
          href={href}
          className={activeKey === key ? "mobile-bottom-nav-link is-active" : "mobile-bottom-nav-link"}
          aria-current={activeKey === key ? "page" : undefined}
          onClick={() => setCollection(key === "categories" ? "linen" : "")}
        >
          <span className="mobile-bottom-nav-icon">
            <Icon size={20} strokeWidth={activeKey === key ? 2.1 : 1.7} />
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
