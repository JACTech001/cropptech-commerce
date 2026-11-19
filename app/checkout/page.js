"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { useCart } from "../../components/CartProvider";
import { products } from "../../data/products";
import { CurrencySelector, ProductPrice } from "../../components/CurrencyProvider";

const EMAIL = "Cropptechcommercestores@gmail.com";

export default function CheckoutPage() {
  const { selectedItems, ready } = useCart();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "", city: "", state: "", country: "Nigeria", postalCode: "", deliveryNote: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(() => selectedItems.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return { ...item, price: product?.price ?? null };
  }), [selectedItems]);
  const subtotal = lines.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  function placeOrder(event) {
    event.preventDefault();
    setError("");
    if (!lines.length) {
      setError("Your selected items are no longer available in the cart. Return to your cart and select at least one item.");
      return;
    }
    const orderLines = lines.map(item => `• ${item.name} | Size: ${item.size} | Quantity: ${item.quantity} | Unit price: ${item.price == null ? "To be confirmed" : "NGN " + item.price.toLocaleString("en-NG")}`).join("\n");
    const body = [
      "NEW ORDER REQUEST — CROPPTECH COMMERCE STORE",
      "",
      "CUSTOMER DETAILS",
      `Name: ${form.fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      "",
      "DELIVERY ADDRESS",
      form.address,
      `${form.city}, ${form.state}, ${form.country} ${form.postalCode}`,
      form.deliveryNote ? `Delivery note: ${form.deliveryNote}` : "",
      "",
      "ORDER ITEMS",
      orderLines,
      "",
      `Priced items subtotal (NGN): ${subtotal.toLocaleString("en-NG")}`,
      "Delivery: To be confirmed",
      "",
      "Please confirm stock availability, final delivery cost, total amount and payment instructions.",
    ].filter(Boolean).join("\n");
    const subject = encodeURIComponent("New store order request — " + form.fullName);
    const href = `mailto:${EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSubmitted(true);
  }

  if (!ready) return <main className="checkout-page"><p className="checkout-loading">Preparing your checkout…</p></main>;

  return <main className="checkout-page">
    <header className="shop-topbar">
      <Link href="/cart" className="shop-back"><ArrowLeft size={16}/> BACK TO CART</Link>
      <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CroppTech Commerce home">CROPPTECH</Link>
      <div className="shop-header-actions"><CurrencySelector /><Link href="/cart" className="shop-cart-link"><ShoppingBag size={18} strokeWidth={1.7}/></Link></div>
    </header>

    <div className="checkout-wrap">
      <div className="checkout-heading">
        <p className="eyebrow">CROPPTECH COMMERCE STORE / CHECKOUT</p>
        <h1>Delivery <em>details.</em></h1>
        <p>Share your contact and delivery information. Our team will review your order and confirm availability, delivery cost and payment details.</p>
      </div>

      {!lines.length ? <section className="checkout-empty"><h2>Your bag is waiting.</h2><p>Add a linen piece to your cart before checking out.</p><Link href="/shop" className="checkout-primary">EXPLORE LINEN WEAR <ArrowUpRight size={16}/></Link></section> :
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <section className="checkout-form-section">
            <p className="eyebrow">CONTACT INFORMATION</p>
            <div className="checkout-fields">
              <label className="checkout-field checkout-field-wide">FULL NAME<input name="fullName" autoComplete="name" value={form.fullName} onChange={update} required placeholder="Your full name"/></label>
              <label className="checkout-field">EMAIL ADDRESS<input type="email" name="email" autoComplete="email" value={form.email} onChange={update} required placeholder="you@example.com"/></label>
              <label className="checkout-field">PHONE NUMBER<input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={update} required placeholder="+234…"/></label>
            </div>
          </section>
          <section className="checkout-form-section">
            <p className="eyebrow">DELIVERY ADDRESS</p>
            <div className="checkout-fields">
              <label className="checkout-field checkout-field-wide">STREET ADDRESS<input name="address" autoComplete="street-address" value={form.address} onChange={update} required placeholder="House number and street"/></label>
              <label className="checkout-field">CITY / TOWN<input name="city" autoComplete="address-level2" value={form.city} onChange={update} required placeholder="City or town"/></label>
              <label className="checkout-field">STATE / REGION<input name="state" autoComplete="address-level1" value={form.state} onChange={update} required placeholder="State or region"/></label>
              <label className="checkout-field">COUNTRY<input name="country" autoComplete="country-name" value={form.country} onChange={update} required/></label>
              <label className="checkout-field">POSTAL CODE <span className="checkout-optional">OPTIONAL</span><input name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={update} placeholder="Postal code"/></label>
              <label className="checkout-field checkout-field-wide">DELIVERY NOTE <span className="checkout-optional">OPTIONAL</span><textarea name="deliveryNote" value={form.deliveryNote} onChange={update} rows={3} placeholder="Landmark or helpful delivery instructions"/></label>
            </div>
          </section>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="checkout-primary checkout-submit" type="submit">SEND ORDER REQUEST <ArrowUpRight size={17}/></button>
          <p className="checkout-disclaimer">This submits an order request by email. No payment is collected at this stage. Your order is not confirmed until our team contacts you.</p>
          {submitted && <p className="checkout-success"><CheckCircle2 size={16}/> Your email app should open with your order details. Send the email to complete your request.</p>}
        </form>

        <aside className="checkout-summary">
          <p className="eyebrow">YOUR ORDER / {lines.reduce((sum,item)=>sum+item.quantity,0)} ITEMS</p>
          <div className="checkout-summary-items">{lines.map(item => <article className="checkout-summary-item" key={item.key}>
            <div className="checkout-summary-image"><Image src={item.image} alt={item.name} fill sizes="76px" style={{objectFit:"cover"}}/></div>
            <div className="checkout-summary-copy"><h3>{item.name}</h3><p>Size {item.size} · Qty {item.quantity}</p><ProductPrice amount={item.price} /></div>
          </article>)}</div>
          <div className="checkout-summary-foot"><span>ITEMS SUBTOTAL</span><strong><ProductPrice amount={subtotal} /></strong></div>\n          <div className="checkout-summary-foot"><span>DELIVERY</span><strong>To be confirmed</strong></div>
          <div className="checkout-summary-foot"><span>PAYMENT</span><strong>Confirmed after review</strong></div>
          <Link href="/cart" className="checkout-edit-link"><ArrowLeft size={14}/> EDIT YOUR BAG</Link>
        </aside>
      </div>}
    </div>
    <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
  </main>;
}
