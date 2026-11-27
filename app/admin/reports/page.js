import { notFound, redirect } from "next/navigation";
import { CircleDollarSign, ClipboardList, PackageCheck, RotateCcw } from "lucide-react";
import { getCurrentAppUser } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";
import AdminShell from "../../../components/AdminShell";
import AdminSectionTabs from "../../../components/AdminSectionTabs";

export const dynamic = "force-dynamic";

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value || 0));

export default async function AdminReportsPage() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/auth/sign-in?redirectTo=%2Fadmin%2Freports");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role) || !user.isActive) notFound();

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [orders, pendingReturns, pendingRefunds] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, orderNumber: true, createdAt: true, status: true, paymentStatus: true, total: true, payment: { select: { amountPaid: true } }, items: { select: { productName: true, quantity: true, lineTotal: true } } },
    }),
    prisma.returnRequest.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.refund.count({ where: { status: { in: ["REQUESTED", "UNDER_REVIEW", "PROCESSING"] } } }),
  ]);

  const paid = orders.filter((order) => order.paymentStatus === "PAID");
  const revenue = paid.reduce((sum, order) => sum + Number(order.payment?.amountPaid || 0), 0);
  const units = paid.reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0);
  const productTotals = new Map();
  for (const order of paid) for (const item of order.items) {
    const current = productTotals.get(item.productName) || { quantity: 0, revenue: 0 };
    current.quantity += item.quantity;
    current.revenue += Number(item.lineTotal);
    productTotals.set(item.productName, current);
  }
  const topProducts = [...productTotals.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (13 - index));
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((order) => order.createdAt >= date && order.createdAt < next);
    const dayPaid = dayOrders.filter((order) => order.paymentStatus === "PAID");
    return { label: new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short" }).format(date), orders: dayOrders.length, revenue: dayPaid.reduce((sum, order) => sum + Number(order.payment?.amountPaid || 0), 0) };
  });
  const maxOrders = Math.max(1, ...days.map((day) => day.orders));
  const average = paid.length ? revenue / paid.length : 0;

  return (
    <AdminShell email={user.email} adminName={user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]} isSuperAdmin={user.role === "SUPER_ADMIN"}>
      <main className="admin-page admin-route-page"><div className="admin-wrap">
        <div className="admin-heading"><p className="eyebrow">STORE MANAGEMENT / BUSINESS INSIGHTS</p><h1>Business <em>reports.</em></h1><p>Sales, order and product performance for the last 30 days. Revenue includes verified payments only.</p></div>
        <AdminSectionTabs sections={[
          { id: "summary", label: "PERFORMANCE SUMMARY", content: (
            <section className="admin-report-metrics">
            <article><CircleDollarSign size={19}/><span>VERIFIED REVENUE</span><strong>{money(revenue)}</strong><small>{paid.length} paid order(s)</small></article>
            <article><ClipboardList size={19}/><span>ORDERS RECEIVED</span><strong>{orders.length}</strong><small>Last 30 days · latest 500</small></article>
            <article><PackageCheck size={19}/><span>UNITS SOLD</span><strong>{units}</strong><small>From verified orders</small></article>
            <article><RotateCcw size={19}/><span>RETURNS / REFUNDS TO REVIEW</span><strong>{pendingReturns + pendingRefunds}</strong><small>{pendingReturns} returns · {pendingRefunds} refunds</small></article>
            </section>
          ) },
          { id: "sales", label: "SALES & ORDER TRENDS", content: (
            <section className="admin-report-panel">
            <div className="admin-report-heading"><div><p className="eyebrow">ORDER TREND</p><h2>Last 14 days</h2></div><span>Average paid order: {money(average)}</span></div>
            <div className="admin-report-chart">{days.map((day) => <div key={day.label}><strong>{day.orders || ""}</strong><i><b style={{ height: (day.orders / maxOrders * 100) + "%" }}/></i><small>{day.label}</small></div>)}</div>
            <p className="admin-report-footnote">Bars show orders received per day. Revenue totals above include verified payments only.</p>
            </section>
          ) },
          { id: "products", label: "PRODUCT PERFORMANCE", content: (
            <section className="admin-report-panel">
            <div className="admin-report-heading"><div><p className="eyebrow">PRODUCT PERFORMANCE</p><h2>Top products by verified sales</h2></div><span>{topProducts.length} product(s)</span></div>
            {topProducts.length ? <div className="admin-report-table-wrap"><table className="admin-report-table"><thead><tr><th>PRODUCT</th><th>UNITS SOLD</th><th>ITEM REVENUE</th></tr></thead><tbody>{topProducts.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.quantity}</td><td>{money(item.revenue)}</td></tr>)}</tbody></table></div> : <p className="admin-setting-status">No verified product sales were recorded in this period.</p>}
            </section>
          ) },
        ]} />
      </div></main>
    </AdminShell>
  );
}
