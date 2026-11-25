import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { redirectAdminFromCustomerPages } from "../../../lib/auth/customer-access";
import CustomerNotifications from "../../../components/CustomerNotifications";
import CustomerPageHeader from "../../../components/CustomerPageHeader";

export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage() {
  await redirectAdminFromCustomerPages();
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Faccount%2Fnotifications");
  if (!user.isActive) redirect("/account");
  return (
    <main className="account-page">
      <CustomerPageHeader />
      <div className="account-wrap"><CustomerNotifications/></div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
