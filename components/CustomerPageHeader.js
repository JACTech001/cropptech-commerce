import Link from "next/link";
import Image from "next/image";
import CustomerNotificationBell from "./CustomerNotificationBell";

export default function CustomerPageHeader({ backHref = "/shop", backLabel = "CONTINUE SHOPPING" }) {
  return (
    <header className="shop-topbar">
      <Link href={backHref} className="shop-back">{backLabel}</Link>
      <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
        <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo"/>
      </Link>
      <CustomerNotificationBell/>
    </header>
  );
}
