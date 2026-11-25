import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Music2 } from "lucide-react";
import { CartLink } from "./CartProvider";

const footerLinks = [
  ["/about", "ABOUT"],
  ["/contact", "CONTACT"],
  ["/delivery-returns", "DELIVERY & RETURNS"],
  ["/faq", "FAQS"],
  ["/privacy", "PRIVACY"],
  ["/terms", "TERMS"],
];

export default function StorePageShell({ eyebrow, title, intro, children }) {
  return (
    <main className="info-page">
      <header className="shop-topbar info-topbar">
        <Link href="/" className="shop-back info-home-link"><ArrowLeft size={16} /> HOME</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" />
        </Link>
        <div className="info-header-actions">
          <nav className="info-header-links" aria-label="Store pages">
            <Link href="/shop">SHOP</Link>
            <Link href="/about">OUR STORY</Link>
            <Link href="/contact">CONTACT</Link>
          </nav>
          <a className="desktop-tiktok-link info-tiktok-link" href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Follow CroppTech Commerce on TikTok" title="Follow us on TikTok"><Music2 size={18}/><span>TIKTOK</span></a>
          <CartLink className="info-cart-link" />
        </div>
      </header>
      <section className="info-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="info-content">{children}</section>
      <footer className="info-footer">
        <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span>
        <nav aria-label="Footer navigation">
          {footerLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <span>BUSINESS MOVES WITH COMMERCE.</span>
      </footer>
    </main>
  );
}
