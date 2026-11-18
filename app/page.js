"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, Menu, Search, ShoppingBag, X, Instagram, Facebook,
} from "lucide-react";

const edits = [
  {
    number: "01",
    title: "For Him",
    description: "Easy layers. Clean lines. Everyday comfort.",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85",
    position: "center 28%",
  },
  {
    number: "02",
    title: "For Her",
    description: "Relaxed silhouettes with room to move.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    position: "center 28%",
  },
];

const highlights = [
  { number: "01", title: "Linen shirts", note: "The everyday essential", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85" },
  { number: "02", title: "Linen sets", note: "A complete, easy look", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85" },
  { number: "03", title: "More to discover", note: "Build your everyday edit", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="home-c">
      <div className="c-announcement">
        <span>THE LINEN EDIT</span><span className="c-announcement-dot">•</span>
        <span>EVERYDAY STYLE, MADE EASY</span>
        <a href="/shop">EXPLORE THE COLLECTION <ArrowUpRight size={12} /></a>
      </div>

      <header className="site-header c-header">
        <button className="icon-button mobile-menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <a href="/" className="brand-wordmark" aria-label="CroppTech Commerce Store home">
          <Image src="/brand/cropplogotextcommerce.jpg" alt="CroppTech Commerce Store" fill priority sizes="190px" className="brand-logo-image" />
        </a>
        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"}>
          <a href="/shop" onClick={closeMenu}>MEN</a>
          <a href="/shop" onClick={closeMenu}>WOMEN</a>
          <a href="/shop" onClick={closeMenu}>LINEN SHIRTS</a>
          <a href="#our-story" onClick={closeMenu}>OUR STORY</a>
        </nav>
        <div className="header-actions">
          <a className="icon-button" href="/shop" aria-label="Search collections"><Search size={19} strokeWidth={1.6} /></a>
          <a className="icon-button bag-button" href="/shop" aria-label="Shopping bag"><ShoppingBag size={19} strokeWidth={1.6} /><span className="bag-count">0</span></a>
        </div>
      </header>

      <section className="c-hero">
        <div className="c-hero-copy">
          <p className="c-kicker"><span /> CROPPTECH COMMERCE STORE</p>
          <h1>Good days<br />start with<br /><em>good basics.</em></h1>
          <p className="c-hero-description">Meet the linen shirt edit: breathable, versatile styles for men and women, made to move with your everyday.</p>
          <div className="c-hero-actions">
            <a href="/shop" className="c-primary-button">SHOP LINEN SHIRTS <ArrowUpRight size={16} /></a>
            <a href="/shop" className="c-secondary-link">EXPLORE ALL <ArrowRight size={16} /></a>
          </div>
          <div className="c-hero-footnote"><span>01 / 03</span><span>BUSINESS MOVES WITH COMMERCE.</span></div>
        </div>
        <div className="c-hero-visual">
          <div className="c-hero-photo" role="img" aria-label="Fashion editorial showing relaxed everyday style" />
          <div className="c-photo-label"><span>THE NEW EVERYDAY</span><strong>LINEN<br />COLLECTION</strong><a href="/shop">DISCOVER <ArrowUpRight size={14} /></a></div>
          <div className="c-round-stamp"><span>MADE FOR</span><strong>YOUR<br />EVERYDAY</strong><span>CROPPTECH</span></div>
        </div>
      </section>

      <section className="c-trust-strip" aria-label="Collection highlights">
        <div><span className="c-trust-icon">01</span><p>MEN & WOMEN</p></div>
        <i />
        <div><span className="c-trust-icon">02</span><p>LINEN-LED COLLECTION</p></div>
        <i />
        <div><span className="c-trust-icon">03</span><p>EVERYDAY ESSENTIALS</p></div>
      </section>

      <section className="c-edits" id="collections">
        <div className="c-section-heading">
          <div><p className="c-kicker"><span /> FIND YOUR FIT</p><h2>Made for <em>everybody.</em></h2></div>
          <a href="/shop" className="c-secondary-link">SHOP ALL COLLECTIONS <ArrowUpRight size={16} /></a>
        </div>
        <div className="c-edit-grid">
          {edits.map((edit) => (
            <a href="/shop" className="c-edit-card" key={edit.number}>
              <div className="c-edit-image" style={{ backgroundImage: `url("${edit.image}")`, backgroundPosition: edit.position }}>
                <span className="c-edit-number">{edit.number}</span><span className="c-edit-arrow"><ArrowUpRight size={21} /></span>
              </div>
              <div className="c-edit-caption"><div><h3>{edit.title}</h3><p>{edit.description}</p></div><span>VIEW EDIT <ArrowRight size={15} /></span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="c-linen-feature">
        <div className="c-linen-image" role="img" aria-label="Linen clothing editorial" />
        <div className="c-linen-copy">
          <p className="c-kicker"><span /> THE SIGNATURE EDIT</p>
          <h2>Light on you.<br /><em>Easy on the day.</em></h2>
          <p>Linen brings together breathable comfort and an effortless look. Start with a shirt, make it your own, and wear it your way.</p>
          <a href="/shop" className="c-primary-button">SHOP THE LINEN EDIT <ArrowUpRight size={16} /></a>
          <span className="c-linen-index">CROPPTECH COMMERCE / COLLECTION 001</span>
        </div>
      </section>

      <section className="c-highlights">
        <div className="c-section-heading">
          <div><p className="c-kicker"><span /> THE CROPPTECH EDIT</p><h2>Find your <em>everyday.</em></h2></div>
          <p className="c-heading-note">A considered selection of pieces to make getting dressed feel simple.</p>
        </div>
        <div className="c-highlight-grid">
          {highlights.map((item) => (
            <a href="/shop" className="c-highlight-card" key={item.number}>
              <div className="c-highlight-image" style={{ backgroundImage: `url("${item.image}")` }}><span>{item.number}</span></div>
              <div className="c-highlight-caption"><div><h3>{item.title}</h3><p>{item.note}</p></div><ArrowUpRight size={18} /></div>
            </a>
          ))}
        </div>
      </section>

      <section className="c-brand-message" id="our-story">
        <p className="c-kicker"><span /> OUR POINT OF VIEW</p>
        <h2>Business moves<br /><em>with commerce.</em></h2>
        <p>CroppTech Commerce Store brings everyday fashion and easy shopping together. Discover the pieces, find your fit, and make them yours.</p>
        <a href="/shop" className="c-white-button">EXPLORE THE STORE <ArrowUpRight size={16} /></a>
      </section>

      <section className="c-newsletter">
        <div><p className="c-kicker"><span /> STAY CONNECTED</p><h2>A little note.<br /><em>Now and then.</em></h2></div>
        <form onSubmit={(event) => event.preventDefault()} className="c-newsletter-form">
          <label htmlFor="newsletter-email">Get updates on new collections and what is happening at CroppTech.</label>
          <div className="c-email-field"><input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required /><button type="submit" aria-label="Subscribe"><ArrowRight size={19} /></button></div>
          <small>By subscribing, you agree to receive updates from CroppTech Commerce Store.</small>
        </form>
      </section>

      <footer className="site-footer c-footer">
        <div className="footer-top">
          <a href="/" className="footer-brand-wordmark" aria-label="CroppTech Commerce Store home"><Image src="/brand/cropplogotextcommerce.jpg" alt="CroppTech Commerce Store" fill sizes="190px" className="brand-logo-image" /></a>
          <p>BUSINESS MOVES WITH COMMERCE.</p>
          <div className="social-links"><a href="#" aria-label="Instagram"><Instagram size={18} /></a><a href="#" aria-label="Facebook"><Facebook size={18} /></a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE. ALL RIGHTS RESERVED.</span><div><a href="#our-story">ABOUT</a><a href="#our-story">CONTACT</a><a href="#our-story">DELIVERY & RETURNS</a></div><span>MADE TO MOVE WITH YOU.</span></div>
      </footer>
    </main>
  );
}
