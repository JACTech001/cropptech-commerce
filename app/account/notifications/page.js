import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { redirectAdminFromCustomerPages } from "../../../lib/auth/customer-access";
import CustomerNotifications from "../../../components/CustomerNotifications";

export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage() {
  await redirectAdminFromCustomerPages();
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Faccount%2Fnotifications");
  if (!user.isActive) redirect("/account");
  return (
    <main className="account-page">
      <header className="shop-topbar">
        <Link href="/account" className="shop-back">MY ACCOUNT</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home"><Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo"/></Link>
        <span className="account-top-label">NOTIFICATIONS</span>
      </header>
      <div className="account-wrap"><CustomerNotifications/></div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
