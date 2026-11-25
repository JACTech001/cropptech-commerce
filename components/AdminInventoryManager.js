"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackagePlus, PackageMinus, RefreshCw, Search, LoaderCircle } from "lucide-react";
import styles from "./AdminInventoryManager.module.css";

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value));

export default function AdminInventoryManager() {
  const [variants, setVariants] = useState([]);
  const [totals, setTotals] = useState({ variants: 0, active: 0, lowStock: 0, outOfStock: 0, units: 0 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("ADD");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load inventory.");
      setVariants(data.variants || []);
      setTotals(data.totals || {});
    } catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/inventory", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load inventory.");
        if (!cancelled) { setVariants(data.variants || []); setTotals(data.totals || {}); setError(""); }
      })
      .catch((cause) => { if (!cancelled) setError(cause.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => variants.filter((item) => {
    const text = [item.product.name, item.sku, item.size, item.colour].join(" ").toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (filter === "low") return item.isActive && item.stockQuantity > 0 && item.stockQuantity <= 5;
    if (filter === "out") return item.isActive && item.stockQuantity === 0;
    if (filter === "inactive") return !item.isActive;
    return true;
  }), [variants, query, filter]);

  async function saveAdjustment(event) {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selected.id, action, quantity: Number(quantity), reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not adjust stock.");
      setMessage(data.message || "Stock updated.");
      setSelected(null); setReason(""); setQuantity("1");
      await load();
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.intro}><div><p className="eyebrow">STORE OPERATIONS / INVENTORY</p><h1>Inventory <em>control.</em></h1><p>Track stock by product variant, record adjustments and identify items that need replenishment.</p></div><button type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      <div className={styles.metrics}>
        <article><span>VARIANTS</span><strong>{totals.variants}</strong></article>
        <article><span>ACTIVE VARIANTS</span><strong>{totals.active}</strong></article>
        <article className={styles.warning}><span>LOW STOCK (1–5)</span><strong>{totals.lowStock}</strong></article>
        <article className={styles.danger}><span>OUT OF STOCK</span><strong>{totals.outOfStock}</strong></article>
        <article><span>UNITS IN STOCK</span><strong>{totals.units}</strong></article>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {message && <p className={styles.success} role="status">{message}</p>}
      {selected && <form className={styles.adjust} onSubmit={saveAdjustment}>
        <div className={styles.adjustHeading}><div><p className="eyebrow">STOCK ADJUSTMENT</p><h2>{selected.product.name}</h2><span>{selected.sku} · {selected.size} · {selected.colour} · Current: {selected.stockQuantity}</span></div><button type="button" onClick={() => setSelected(null)} aria-label="Close adjustment">×</button></div>
        <div className={styles.fields}>
          <label>Adjustment type<select value={action} onChange={(event) => setAction(event.target.value)}><option value="ADD">Add stock</option><option value="REMOVE">Remove stock</option><option value="SET">Set exact quantity</option></select></label>
          <label>{action === "SET" ? "New stock quantity" : "Quantity"}<input type="number" min={action === "SET" ? 0 : 1} max="100000" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)}/></label>
          <label className={styles.reason}>Reason<input maxLength="300" required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. New supplier delivery, damaged item, stock count correction"/></label>
        </div>
        <button className={styles.save} type="submit" disabled={busy}>{busy ? <LoaderCircle size={15}/> : <Boxes size={15}/>} Save stock adjustment</button>
      </form>}
      <section className={styles.tableCard}>
        <div className={styles.toolbar}><div><h2>Stock by variant</h2><span>{filtered.length} result(s)</span></div><div className={styles.filters}><label><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU, size…"/></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All variants</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="inactive">Inactive</option></select></div></div>
        {loading ? <p className={styles.empty}>Loading inventory…</p> : filtered.length ? <div className={styles.tableWrap}><table><thead><tr><th>PRODUCT / SKU</th><th>VARIANT</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.product.name}</strong><small>{item.sku}</small></td><td>{item.size} · {item.colour}</td><td>{money(item.price)}</td><td><b className={item.stockQuantity === 0 ? styles.zero : item.stockQuantity <= 5 ? styles.low : ""}>{item.stockQuantity}</b></td><td><span className={item.isActive ? styles.active : styles.inactive}>{item.isActive ? "Active" : "Inactive"}</span></td><td><button type="button" onClick={() => { setSelected(item); setAction("ADD"); setQuantity("1"); setReason(""); }} disabled={!item.isActive}><PackagePlus size={14}/> Adjust</button></td></tr>)}</tbody></table></div> : <p className={styles.empty}>No inventory variants match this filter.</p>}
      </section>
      <p className={styles.note}><PackageMinus size={14}/> Stock changes are recorded in the inventory transaction history. Removing stock cannot reduce a variant below zero.</p>
    </div>
  );
}
