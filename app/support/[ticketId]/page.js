import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAppUser } from "../../../lib/auth/user";
import CustomerPageHeader from "../../../components/CustomerPageHeader";
import SupportConversation from "../../../components/SupportConversation";

export const dynamic = "force-dynamic";

export default async function SupportTicketPage({ params }) {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fsupport");
  if (!user.isActive || user.role !== "CUSTOMER") notFound();
  const { ticketId } = await params;
  return <main className="account-page"><CustomerPageHeader backHref="/support" backLabel="CUSTOMER CARE"/><div className="account-wrap"><div className="account-heading"><p className="eyebrow">CROPPTECH COMMERCE / SUPPORT CONVERSATION</p><h1>Your <em>conversation.</em></h1></div><SupportConversation ticketId={ticketId}/></div><footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><Link href="/support">CUSTOMER CARE</Link></footer></main>;
}
