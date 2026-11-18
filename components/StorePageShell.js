import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function StorePageShell({ eyebrow, title, intro, children }) {
  return (
    <main className="info-page">
      <header className="shop-topbar">
        <Link href="/" className="shop-back"><ArrowLeft size={16} /> HOME</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" />
        </Link>
        <Link href="/shop" className="shop-back">SHOP COLLECTIONS <ArrowUpRight size={15} /></Link>
      </header>
      <section className="info-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="info-content">{children}</section>
      <footer className="info-footer">
        <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span>
        <nav>
          <Link href="/about">ABOUT</Link><Link href="/contact">CONTACT</Link>
          <Link href="/delivery-returns">DELIVERY & RETURNS</Link><Link href="/faq">FAQS</Link>
          <Link href="/privacy">PRIVACY</Link><Link href="/terms">TERMS</Link>
        </nav>
        <span>BUSINESS MOVES WITH COMMERCE.</span>
      </footer>
    </main>
  );
}
