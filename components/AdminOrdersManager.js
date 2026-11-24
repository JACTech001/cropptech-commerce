"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ArrowUpRight, CalendarDays, ChevronDown, ClipboardList, Download, MapPin, Package, Search, Truck, X } from "lucide-react";
import FulfillmentControls from "./FulfillmentControls";
import PaymentReviewControls from "./PaymentReviewControls";

const statusLabels = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAYMENT_UNDER_REVIEW: "Payment under review",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};
const paymentLabels = {
  UNPAID: "Unpaid", SUBMITTED: "Submitted", UNDER_REVIEW: "Under review",
  PAID: "Paid", REJECTED: "Rejected", EXPIRED: "Expired",
  PARTIALLY_REFUNDED: "Partially refunded", REFUNDED: "Refunded",
};
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value || 0));
const dateLabel = (value) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function AdminOrdersManager({ orders }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = [order.orderNumber, order.customerName, order.customerEmail, order.recipientName, order.recipientPhone, order.deliveryCity, order.deliveryState, ...order.items.map((item) => item.productName)].join(" ").toLowerCase();
      return (!term || searchable.includes(term))
        && (status === "ALL" || order.status === status)
        && (payment === "ALL" || order.paymentStatus === payment);
    }).sort((a, b) => sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : sort === "highest" ? Number(b.total) - Number(a.total) : sort === "lowest" ? Number(a.total) - Number(b.total) : new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, query, status, payment, sort]);

  const stats = useMemo(() => ({
    total: orders.length,
    awaiting: orders.filter((order) => order.status === "AWAITING_PAYMENT").length,
    review: orders.filter((order) => order.payment?.submissions.some((submission) => submission.status === "PENDING")).length,
    active: orders.filter((order) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)).length,
  }), [orders]);

  function exportCsv() {
    setExporting(true);
    const columns = ["Order number", "Date", "Customer", "Email", "Phone", "Status", "Payment", "Subtotal NGN", "Delivery NGN", "Total NGN", "City", "State", "Items"];
    const rows = filtered.map((order) => [
      order.orderNumber, dateLabel(order.createdAt), order.customerName, order.customerEmail,
      order.recipientPhone, statusLabels[order.status] || order.status, paymentLabels[order.paymentStatus] || order.paymentStatus,
      order.subtotal, order.shippingFee, order.total, order.deliveryCity, order.deliveryState,
      order.items.map((item) => item.quantity + "x " + item.productName + " (" + item.size + ", " + item.colour + ")").join("; "),
    ]);
    const quote = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
    const csv = [columns, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "cropptech-orders.csv"; anchor.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <>
      <div className="admin-orders-stats">
        <article><span>ORDERS IN REGISTER</span><strong>{stats.total}</strong><small>Latest 100 orders</small></article>
        <article><span>AWAITING PAYMENT</span><strong>{stats.awaiting}</strong><small>Payment not yet confirmed</small></article>
        <article><span>PAYMENT NEEDS REVIEW</span><strong>{stats.review}</strong><small>At least one pending receipt</small></article>
        <article><span>IN FULFILMENT</span><strong>{stats.active}</strong><small>Confirmed to shipped</small></article>
      </div>

      <section className="admin-orders-workspace">
        <div className="admin-orders-toolbar">
          <div className="admin-orders-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, phone or location…" aria-label="Search orders"/></div>
          <div className="admin-orders-toolbar-actions">
            <label className="admin-orders-filter"><span>ORDER STATUS</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={14}/></label>
            <label className="admin-orders-filter"><span>PAYMENT</span><select value={payment} onChange={(event) => setPayment(event.target.value)}><option value="ALL">All payments</option>{Object.entries(paymentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={14}/></label>
            <label className="admin-orders-filter admin-orders-sort"><span>SORT BY</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest value</option><option value="lowest">Lowest value</option></select><ArrowDownUp size={14}/></label>
            <button type="button" className="admin-orders-export" onClick={exportCsv} disabled={exporting || !filtered.length}><Download size={15}/> EXPORT CSV</button>
          </div>
        </div>
        <div className="admin-orders-results-line"><span><b>{filtered.length}</b> of {orders.length} orders</span><button type="button" onClick={() => { setQuery(""); setStatus("ALL"); setPayment("ALL"); setSort("newest"); }}>CLEAR FILTERS</button></div>
        {filtered.length ? (
          <div className="admin-orders-table-scroll">
            <table className="admin-orders-table">
              <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th>TOTAL</th><th>ORDER STATUS</th><th>PAYMENT</th><th><span className="sr-only">Open order</span></th></tr></thead>
              <tbody>{filtered.map((order) => <tr key={order.id}>
                <td><button className="admin-order-number-button" type="button" onClick={() => setSelected(order)}>{order.orderNumber}</button></td>
                <td><span className="admin-orders-customer">{order.customerName || "Customer"}</span><small>{order.customerEmail}</small></td>
                <td><span className="admin-orders-date">{dateLabel(order.createdAt)}</span></td>
                <td>{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</td>
                <td className="admin-orders-amount">{money(order.total)}</td>
                <td><span className={"admin-order-status-pill status-" + order.status.toLowerCase()}>{statusLabels[order.status] || order.status}</span></td>
                <td><span className={"admin-payment-status-pill payment-" + order.paymentStatus.toLowerCase()}>{paymentLabels[order.paymentStatus] || order.paymentStatus}</span></td>
                <td><button type="button" className="admin-order-open-button" onClick={() => setSelected(order)} aria-label={"View " + order.orderNumber}><ArrowUpRight size={16}/></button></td>
              </tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="admin-orders-empty"><ClipboardList size={25}/><h3>{orders.length ? "No matching orders" : "No orders yet"}</h3><p>{orders.length ? "Try another search term or clear your filters." : "New customer orders will appear here after checkout."}</p>{orders.length > 0 && <button type="button" onClick={() => { setQuery(""); setStatus("ALL"); setPayment("ALL"); }}>CLEAR FILTERS</button>}</div>
        )}
      </section>

      {selected && (
        <div className="admin-order-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <aside className="admin-order-drawer" role="dialog" aria-modal="true" aria-label={"Order " + selected.orderNumber}>
            <header className="admin-order-drawer-header">
              <div><p className="eyebrow">ORDER DETAILS</p><h2>{selected.orderNumber}</h2><span>Placed {dateLabel(selected.createdAt)}</span></div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close order details"><X size={20}/></button>
            </header>
            <div className="admin-order-drawer-body">
              <section className="admin-drawer-status">
                <span className={"admin-order-status-pill status-" + selected.status.toLowerCase()}>{statusLabels[selected.status] || selected.status}</span>
                <span className={"admin-payment-status-pill payment-" + selected.paymentStatus.toLowerCase()}>{paymentLabels[selected.paymentStatus] || selected.paymentStatus}</span>
                <strong>{money(selected.total)}</strong>
              </section>
              <section className="admin-drawer-section"><h3>CUSTOMER</h3><p><b>{selected.customerName || selected.customerEmail}</b><span>{selected.customerEmail}</span><span>{selected.recipientPhone}</span></p></section>
              <section className="admin-drawer-section"><h3><MapPin size={15}/> DELIVERY ADDRESS</h3><p><b>{selected.recipientName}</b><span>{selected.deliveryAddress}</span><span>{[selected.deliveryLocality, selected.deliveryCity, selected.deliveryState].filter(Boolean).join(", ")}</span>{selected.deliveryLandmark && <span>Landmark: {selected.deliveryLandmark}</span>}</p>{selected.customerNote && <blockquote>Customer note: {selected.customerNote}</blockquote>}</section>
              <section className="admin-drawer-section"><h3><Package size={15}/> ORDER ITEMS ({selected.itemCount})</h3><div className="admin-drawer-items">{selected.items.map((item) => <article key={item.id}><div><b>{item.productName}</b><span>{item.size} / {item.colour} · Qty {item.quantity}</span><small>{item.sku}</small></div><strong>{money(item.lineTotal)}</strong></article>)}</div></section>
              <section className="admin-drawer-section admin-drawer-totals"><h3>ORDER TOTAL</h3><p><span>Subtotal</span><b>{money(selected.subtotal)}</b></p><p><span>Delivery</span><b>{money(selected.shippingFee)}</b></p>{Number(selected.discountTotal) > 0 && <p><span>Discount</span><b>−{money(selected.discountTotal)}</b></p>}<p className="admin-drawer-grand-total"><span>Total (NGN)</span><strong>{money(selected.total)}</strong></p></section>
              {selected.payment?.submissions?.length > 0 && <section className="admin-drawer-section"><h3>PAYMENT SUBMISSIONS</h3>{selected.payment.submissions.map((submission) => <article className="admin-drawer-payment" key={submission.id}><div className="admin-drawer-payment-facts"><p><span>Sender</span><b>{submission.accountNameUsed}</b></p><p><span>Bank</span><b>{submission.bankName}</b></p><p><span>Amount stated</span><b>{money(submission.amountTransferred)}</b></p><p><span>Reference</span><b>{submission.transactionReference}</b></p><p><span>Submitted</span><b>{dateLabel(submission.submittedAt)}</b></p></div>{submission.customerNote && <p>{submission.customerNote}</p>}{submission.receiptStorageKey && <a className="admin-drawer-receipt" href={"/api/admin/payment-submissions/" + submission.id + "/receipt"} target="_blank" rel="noreferrer">VIEW PRIVATE RECEIPT <ArrowUpRight size={14}/></a>}<PaymentReviewControls submissionId={submission.id} status={submission.status}/></article>)}</section>}
              {selected.shipment && <section className="admin-drawer-section"><h3><Truck size={15}/> SHIPMENT</h3><p><b>{selected.shipment.provider || "Courier not specified"}</b>{selected.shipment.trackingNumber && <span>{selected.shipment.trackingNumber}</span>}{selected.shipment.trackingUrl && <a href={selected.shipment.trackingUrl} target="_blank" rel="noreferrer">TRACK SHIPMENT <ArrowUpRight size={13}/></a>}</p></section>}
              <FulfillmentControls orderNumber={selected.orderNumber} status={selected.status} shipment={selected.shipment}/>
            </div>
            <footer className="admin-order-drawer-footer"><button type="button" onClick={() => { setSelected(null); router.refresh(); }}>CLOSE / REFRESH</button></footer>
          </aside>
        </div>
      )}
    </>
  );
}
