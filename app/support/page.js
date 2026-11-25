import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Headset, MessageCircle, Plus } from "lucide-react";
import { getCurrentAppUser } from "../../lib/auth/user";
import { prisma } from "../../lib/db";
import CustomerPageHeader from "../../components/CustomerPageHeader";
import CustomerSupportWorkspace from "../../components/CustomerSupportWorkspace";

export const dynamic = "force-dynamic";

export default async function CustomerSupportPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fsupport");
  if (!user.isActive || user.role !== "CUSTOMER") redirect("/");
  const tickets = await prisma.customerSupportTicket.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true, ticketNumber: true, subject: true, category: true, status: true,
      priority: true, createdAt: true, updatedAt: true,
      order: { select: { orderNumber: true } },
      messages: { where: { isInternal: false }, orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderRole: true } },
    },
  });
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { placedAt: "desc" },
    take: 30,
    select: { id: true, orderNumber: true },
  });
  return (
    <main className="account-page">
      <CustomerPageHeader backHref="/account" backLabel="MY ACCOUNT"/>
      <div className="account-wrap">
        <div className="account-heading">
          <p className="eyebrow">CROPPTECH COMMERCE / CUSTOMER CARE</p>
          <h1>How can we <em>help?</em></h1>
          <p>Send us a message, follow your support requests and continue conversations with our team.</p>
        </div>
        <CustomerSupportWorkspace initialTickets={tickets.map((ticket) => ({...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString()}))} orders={orders}/>
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/account">MY ACCOUNT</Link></footer>
    </main>
  );
}
