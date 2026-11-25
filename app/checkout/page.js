"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "../../components/CartProvider";
import PageSkeleton from "../../components/PageSkeleton";

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedItems, ready, clearSelectedItems } = useCart();
  const [form, setForm] = useState({
    recipientName: "", recipientPhone: "", deliveryAddress: "",
    city: "", state: "", locality: "", deliveryLandmark: "", customerNote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(() => selectedItems.map((item) => ({
    ...item,
    slug: item.slug,
    colour: item.tone,
  })), [selectedItems]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        country: "Nigeria",
        items: lines.map((item) => ({
          slug: item.slug,
          size: item.size,
          colour: item.colour,
          quantity: item.quantity,
        })),
      };
      const fingerprint = JSON.stringify(payload);
      const storageKey = "cropptech-checkout-idempotency";
      let savedAttempt = null;
      try { savedAttempt = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
      const idempotencyKey = savedAttempt?.fingerprint === fingerprint && savedAttempt?.key
        ? savedAttempt.key
        : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replaceAll("-", "") : Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      localStorage.setItem(storageKey, JSON.stringify({ fingerprint, key: idempotencyKey }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We could not place your order. Please try again.");

      localStorage.removeItem("cropptech-checkout-idempotency");
      clearSelectedItems();
      router.push("/orders/" + encodeURIComponent(data.order.orderNumber));
    } catch (requestError) {
      setError(requestError.message || "We could not place your order. Please try again.");
      setSubmitting(false);
    }
  }

  if (!ready) return <PageSkeleton variant="checkout" />;

  return (
    <main className="checkout-page">
      <header className="shop-topbar">
        <Link href="/cart" className="shop-back"><ArrowLeft size={16}/> BACK TO CART</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home"><Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" /></Link>
        <Link href="/cart" className="shop-cart-link" aria-label="Return to cart"><ShoppingBag size={18}/></Link>
      </header>

      <div className="checkout-wrap">
        <div className="checkout-heading">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / YOUR ORDER</p>
          <h1>Complete <em>your order.</em></h1>
          <p>Enter your Nigerian delivery details. We will verify the selected product variants, stock and current prices before creating your order.</p>
        </div>

        {!lines.length ? (
          <section className="checkout-empty">
            <h2>Your bag is waiting.</h2>
            <p>Add a linen piece to your bag before completing your order.</p>
            <Link href="/shop" className="checkout-primary">EXPLORE LINEN WEAR <ArrowUpRight size={16}/></Link>
          </section>
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={placeOrder}>
              <section className="checkout-form-section">
                <p className="eyebrow">DELIVERY CONTACT</p>
                <div className="checkout-fields">
                  <label className="checkout-field checkout-field-wide">RECIPIENT FULL NAME
                    <input name="recipientName" autoComplete="name" value={form.recipientName} onChange={update} required maxLength={120} placeholder="Name of person receiving the order"/>
                  </label>
                  <label className="checkout-field checkout-field-wide">PHONE NUMBER
                    <input name="recipientPhone" type="tel" autoComplete="tel" value={form.recipientPhone} onChange={update} required maxLength={40} placeholder="+234…"/>
                  </label>
                </div>
              </section>

              <section className="checkout-form-section">
                <p className="eyebrow">DELIVERY ADDRESS / NIGERIA</p>
                <div className="checkout-fields">
                  <label className="checkout-field checkout-field-wide">STREET ADDRESS
                    <input name="deliveryAddress" autoComplete="street-address" value={form.deliveryAddress} onChange={update} required maxLength={500} placeholder="House number and street"/>
                  </label>
                  <label className="checkout-field">CITY / TOWN
                    <input name="city" autoComplete="address-level2" value={form.city} onChange={update} required maxLength={100} placeholder="City or town"/>
                  </label>
                  <label className="checkout-field">STATE
                    <input name="state" autoComplete="address-level1" value={form.state} onChange={update} required maxLength={100} placeholder="State"/>
                  </label>
                  <label className="checkout-field checkout-field-wide">AREA / LOCALITY <span className="checkout-optional">OPTIONAL</span>
                    <input name="locality" value={form.locality} onChange={update} maxLength={120} placeholder="Neighbourhood or area"/>
                  </label>
                  <label className="checkout-field checkout-field-wide">LANDMARK <span className="checkout-optional">OPTIONAL</span>
                    <input name="deliveryLandmark" value={form.deliveryLandmark} onChange={update} maxLength={250} placeholder="Nearby landmark for the rider"/>
                  </label>
                  <label className="checkout-field checkout-field-wide">DELIVERY NOTE <span className="checkout-optional">OPTIONAL</span>
                    <textarea name="customerNote" value={form.customerNote} onChange={update} rows={3} maxLength={1000} placeholder="Any helpful delivery instructions"/>
                  </label>
                </div>
              </section>

              {error && <p className="checkout-error" role="alert">{error}</p>}
              <button className="checkout-primary checkout-submit" type="submit" disabled={submitting}>
                {submitting ? "PLACING YOUR ORDER…" : "PLACE ORDER"} <ArrowUpRight size={17}/>
              </button>
              <p className="checkout-disclaimer">No payment is taken here. After the server confirms your items and delivery fee, you will receive an order number and secure bank-transfer instructions. Your payment is only confirmed after an admin verifies the transfer.</p>
            </form>

            <aside className="checkout-summary">
              <p className="eyebrow">YOUR ORDER / {lines.reduce((sum, item) => sum + item.quantity, 0)} ITEMS</p>
              <div className="checkout-summary-items">
                {lines.map((item) => (
                  <article className="checkout-summary-item" key={item.key}>
                    <div className="checkout-summary-image"><Image src={item.image} alt={item.name} fill sizes="76px" style={{objectFit:"cover"}}/></div>
                    <div className="checkout-summary-copy">
                      <h3>{item.name}</h3>
                      <p>Size {item.size} · {item.colour} · Qty {item.quantity}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="checkout-summary-foot"><span>ITEMS</span><strong>{lines.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
              <div className="checkout-summary-foot"><span>PRICING & DELIVERY</span><strong>Verified by store database</strong></div>
              <Link href="/cart" className="checkout-edit-link"><ArrowLeft size={14}/> EDIT YOUR BAG</Link>
            </aside>
          </div>
        )}
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
