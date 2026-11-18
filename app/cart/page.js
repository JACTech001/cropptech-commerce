"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../components/CartProvider";
export default function CartPage() {
  const { items, changeQuantity, removeItem, count, ready } = useCart();
  return <main className="cart-page">
    <header className="shop-topbar"><Link href="/shop" className="shop-back"><ArrowLeft size={16}/> CONTINUE SHOPPING</Link><Link href="/" className="brand-lockup shop-brand-wordmark">CROPPTECH</Link><span className="shop-top-note">YOUR SHOPPING BAG</span></header>
    <section className="cart-content">
      <p className="eyebrow">CROPPTECH COMMERCE STORE / YOUR SELECTION</p><h1>Your <em>bag.</em></h1>
      <p className="cart-intro">Review your selected pieces and sizes before sending an enquiry.</p>
      {!ready ? <p>Loading your bag...</p> : items.length === 0 ? <div className="cart-empty"><h2>Your bag is empty.</h2><p>Explore the collection and add pieces you like.</p><Link href="/shop" className="product-enquire-link">EXPLORE THE COLLECTION <ArrowUpRight size={16}/></Link></div> :
      <><div className="cart-list">{items.map(item => <article className="cart-item" key={item.key}>
        <Link href={"/shop/" + item.slug} className="cart-item-image"><Image src={item.image} alt={item.name} fill sizes="110px" style={{objectFit:"cover"}}/></Link>
        <div className="cart-item-details"><p>{item.audience} / {item.category}</p><h2><Link href={"/shop/" + item.slug}>{item.name}</Link></h2><span>{item.tone} · Size {item.size}</span>
          <div className="cart-quantity"><button aria-label="Decrease quantity" onClick={() => changeQuantity(item.key, item.quantity - 1)}><Minus size={13}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => changeQuantity(item.key, item.quantity + 1)}><Plus size={13}/></button></div>
        </div><button className="cart-remove" onClick={() => removeItem(item.key)} aria-label={"Remove " + item.name}><Trash2 size={16}/></button>
      </article>)}</div>
      <div className="cart-summary"><div><span>ITEMS</span><strong>{count}</strong></div><p>Prices and availability are confirmed by our team when you enquire. No payment is collected here.</p>
      <Link href={"/contact?cart=" + encodeURIComponent(items.map(item => item.name + " — Size " + item.size + " × " + item.quantity).join("; "))} className="product-enquire-link">ENQUIRE ABOUT MY SELECTION <ArrowUpRight size={16}/></Link></div></>}
    </section>
    <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
  </main>;
}
