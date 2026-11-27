"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackagePlus, PackageMinus, RefreshCw, Search, LoaderCircle } from "lucide-react";
import styles from "./AdminInventoryManager.module.css";
import AdminSectionTabs from "./AdminSectionTabs";

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
      <AdminSectionTabs sections={[
        { id: "overview", label: "STOCK OVERVIEW", content: (
          <div className={styles.metrics}>
          <article><span>VARIANTS</span><strong>{totals.variants}</strong></article>
          <article><span>ACTIVE VARIANTS</span><strong>{totals.active}</strong></article>
          <article className={styles.warning}><span>LOW STOCK (1–5)</span><strong>{totals.lowStock}</strong></article>
          <article className={styles.danger}><span>OUT OF STOCK</span><strong>{totals.outOfStock}</strong></article>
          <article><span>UNITS IN STOCK</span><strong>{totals.units}</strong></article>
          </div>
        ) },
        { id: "variants", label: "STOCK BY VARIANT", content: (
          <>
      
