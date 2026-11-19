"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CartLink, useCart } from "../../components/CartProvider";
import { products } from "../../data/products";
import { ProductPrice } from "../../components/CurrencyProvider";

export default function CartPage() {
  const { items, changeQuantity, removeItem, toggleItem, changeSize, selectedItems, selectedCount, count, ready } = useCart();
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + ((products.find(product => product.id === item.id)?.price || 0) * item.quantity), 0);
  return <main className="cart-page">
    <header className="shop-topbar"><Link href="/shop" className="shop-back"><ArrowLeft size={16}/> CONTINUE SHOPPING</Link><Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home"><Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" /></Link><CartLink className="shop-cart-link" /></header>
    <section className="cart-content">
      <p className="eyebrow">CROPPTECH COMMERCE STORE / YOUR SELECTION</p><h1 className="cart-page-title"><ShoppingBag size={35} strokeWidth={1.7}/> Your <em>cart.</em></h1>
      <p className="cart-intro">Review your selected pieces and sizes before placing your order.</p>
      {!ready ? <p>Loading your cart...</p> : items.length === 0 ? <div className="cart-empty"><h2>Your cart is empty.</h2><p>Explore the collection and add pieces you like.</p><Link href="/shop" className="product-enquire-link">EXPLORE THE COLLECTION <ArrowUpRight size={16}/></Link></div> :
      <><div className="cart-list">{items.map(item => <article className={"cart-item" + (item.selected === false ? " cart-item-unselected" : "")} key={item.key}>
        <label className="cart-item-check" aria-label={"Include " + item.name + " in order"}><input type="checkbox" checked={item.selected !== false} onChange={() => toggleItem(item.key)}/><span></span></label>
        <Link href={"/shop/" + item.slug} className="cart-item-image"><Image src={item.image} alt={item.name} fill sizes="110px" style={{objectFit:"cover"}}/></Link>
        <div className="cart-item-details"><p>{item.audience} / {item.category}</p><h2><Link href={"/shop/" + item.slug}>{item.name}</Link></h2><span>{item.tone}</span>
          <label className="cart-size-change">SIZE <select value={item.size} onChange={event => changeSize(item.key, event.target.value)}>{(item.availableSizes?.length ? item.availableSizes : ["S","M","L","XL","2XL","3XL","4XL","5XL"]).map(size => <option key={size} value={size}>{size}</option>)}</select></label>
          <div className="cart-quantity"><button aria-label="Decrease quantity" onClick={() => changeQuantity(item.key, item.quantity - 1)}><Minus size={13}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => changeQuantity(item.key, item.quantity + 1)}><Plus size={13}/></button></div>
        </div><button className="cart-remove" onClick={() => removeItem(item.key)} aria-label={"Remove " + item.name}><Trash2 size={16}/></button>
      </article>)}</div>
      <div className="cart-summary"><div><span>SELECTED ITEMS / {count} IN BAG</span><strong>{selectedCount}</strong></div><div className="cart-subtotal"><span>SELECTED SUBTOTAL</span><strong><ProductPrice amount={selectedSubtotal} /></strong></div><p>Delivery is calculated separately. Our team will confirm stock availability, final pricing and payment details with you.</p>
      {selectedItems.length ? <Link href="/checkout" className="cart-buy-link"><ShoppingBag size={17} strokeWidth={1.7}/> PROCEED TO BUY <ArrowUpRight size={16}/></Link> : <p className="cart-no-selection">Select at least one item to continue.</p>}</div></>}
    </section>
    <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
  </main>;
}