import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Package, ShoppingBag, UserRound, Headset } from "lucide-react";
import { getCurrentAppUser } from "../../lib/auth/user";
import { prisma } from "../../lib/db";
import AccountSignOutButton from "../../components/AccountSignOutButton";
import CustomerPageHeader from "../../components/CustomerPageHeader";
import CustomerThemeControl from "../../components/CustomerThemeControl";
import { redirectAdminFromCustomerPages } from "../../lib/auth/customer-access";

export const dynamic = "force-dynamic";

const orderStatusLabels = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAYMENT_UNDER_REVIEW: "Payment under review",
  CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const paymentStatusLabels = {
  UNPAID: "Unpaid",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  PAID: "Paid",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  PARTIALLY_REFUNDED: "Partially refunded",
  REFUNDED: "Refunded",
};

const money = (value) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
}).format(Number(value));

const date = (value) => new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
}).format(value);

export default async function AccountPage() {
  await redirectAdminFromCustomerPages();
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/auth/sign-in?redirectTo=%2Faccount");
  }

  if (!user.isActive) {
    return (
      <main className="account-page">
        <div className="account-wrap">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / MY ACCOUNT</p>
          <h1>Account <em>unavailable.</em></h1>
          <p className="account-muted">This account has been disabled. Please contact the store for assistance.</p>
          <Link href="/contact" className="text-link">CONTACT THE STORE <ArrowUpRight size={15} /></Link>
        </div>
      </main>
    );
  }

  const firstName = user.firstName?.trim() || user.fullName?.trim().split(/\s+/)[0] || "there";

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { placedAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      placedAt: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <main className="account-page">
      <CustomerPageHeader />

      <div className="account-wrap">
        <div className="account-heading">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / CUSTOMER SPACE</p>
          <h1>Hi, {firstName}<span>.</span></h1>
          <p>Manage your store activity and keep track of your orders in one place.</p>
        </div>

        <div className="account-layout">
          <aside className="account-profile-panel">
            <div className="account-profile-icon"><UserRound size={23} /></div>
            <p className="eyebrow">ACCOUNT DETAILS</p>
            <h2>{user.fullName || "CroppTech customer"}</h2>
            <p className="account-email">{user.email}</p>
            <span className="account-member-label">CUSTOMER ACCOUNT</span>
            <AccountSignOutButton />
            <CustomerThemeControl />
          </aside>

          <section className="account-orders-panel">
            <Link href="/support" className="account-support-entry"><span className="account-support-entry-icon"><Headset size={20}/></span><span><strong>Customer care & support</strong><small>Ask a question, report an issue or follow your support requests.</small></span><ArrowUpRight size={17}/></Link>
            <div className="account-section-heading">
              <div>
                <p className="eyebrow">YOUR PURCHASES</p>
                <h2>Order history <span>({orders.length})</span></h2>
              </div>
              <Link href="/shop" className="account-shop-link">SHOP COLLECTION <ArrowUpRight size={14} /></Link>
            </div>

            {orders.length ? (
              <div className="account-order-list">
                {orders.map((order) => (
                  <article className="account-order-card" key={order.id}>
                    <div className="account-order-main">
                      <div className="account-order-icon"><Package size={17} /></div>
                      <div>
                        <span className="account-order-date">{date(order.placedAt)}</span>
                        <h3>{order.orderNumber}</h3>
                        <p>{order._count.items} {order._count.items === 1 ? "item" : "items"} · {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</p>
                      </div>
                    </div>
                    <div className="account-order-side">
                      <strong>{money(order.total)}</strong>
                      <span className={"account-order-status account-status-" + order.status.toLowerCase()}>{orderStatusLabels[order.status] || order.status}</span>
                      <Link href={"/orders/" + encodeURIComponent(order.orderNumber)}>VIEW ORDER <ArrowUpRight size={13} /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="account-empty-orders">
                <ShoppingBag size={25} />
                <h3>No orders yet</h3>
                <p>Your purchases will appear here after you place an order.</p>
                <Link href="/shop" className="text-link">EXPLORE THE COLLECTION <ArrowUpRight size={15} /></Link>
              </div>
            )}
            {orders.length === 20 && <p className="account-muted">Showing your 20 most recent orders.</p>}
          </section>
        </div>
      </div>

      <footer className="shop-footer">
        <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span>
        <span>BUSINESS MOVES WITH COMMERCE.</span>
        <Link href="/contact">CONTACT</Link>
      </footer>
    </main>
  );
}
