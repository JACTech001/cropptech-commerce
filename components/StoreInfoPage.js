import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function StoreInfoPage({ eyebrow = "CROPPTECH COMMERCE STORE", title, emphasis, intro, sections = [], children }) {
  return (
    <main className="info-page">
      <header className="info-topbar">
        <Link href="/" className="info-brand">CROPPTECH <span>COMMERCE STORE</span></Link>
        <Link href="/shop" className="info-shop-link">SHOP LINEN WEAR <ArrowUpRight size={15}/></Link>
      </header>
      <div className="info-content">
        <Link href="/" className="info-back"><ArrowLeft size={15}/> BACK TO HOME</Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title} <em>{emphasis}</em></h1>
        <p className="info-intro">{intro}</p>
        {children}
        {sections.map((section) => (
          <section className="info-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body && <p>{section.body}</p>}
            {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
        <div className="info-contact-strip">
          <div><p className="eyebrow">NEED A HAND?</p><h2>We're here to help.</h2></div>
          <Link href="/contact" className="info-contact-link">CONTACT THE STORE <ArrowUpRight size={16}/></Link>
        </div>
      </div>
      <footer className="info-footer">
        <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span>
        <span>BUSINESS MOVES WITH COMMERCE.</span>
        <Link href="/shop">SHOP LINEN WEAR</Link>
      </footer>
    </main>
  );
}
