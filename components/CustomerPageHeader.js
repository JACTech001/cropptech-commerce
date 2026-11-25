import Link from "next/link";
import Image from "next/image";
import { Music2 } from "lucide-react";
import CustomerNotificationBell from "./CustomerNotificationBell";

export default function CustomerPageHeader({ backHref = "/shop", backLabel = "CONTINUE SHOPPING" }) {
  return (
    <header className="shop-topbar">
      <Link href={backHref} className="shop-back">{backLabel}</Link>
      <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
        <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo"/>
      </Link>
      <div className="customer-header-actions"><a className="desktop-tiktok-link customer-header-tiktok" href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Follow CroppTech Commerce on TikTok" title="Follow us on TikTok"><Music2 size={18}/><span>TIKTOK</span></a><CustomerNotificationBell/></div>
    </header>
  );
}
