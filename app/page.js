"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  Search,
  ShoppingBag,
  X,
  Instagram,
  Facebook,
} from "lucide-react";

const collections = [
  {
    number: "01",
    title: "The Men's Edit",
    description: "Relaxed essentials. Thoughtful details. Everyday ease.",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85",
    href: "/shop"
  },
  {
    number: "02",
    title: "The Women's Edit",
    description: "Effortless silhouettes, made to move with you.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    href: "/shop"
  }
];

const categories = [
  {
    name: "Linen Shirts",
    detail: "Light layers, all day",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85"
  },
  {
    name: "Linen Sets",
    detail: "A considered matching look",
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85"
  },
  {
    name: "Dresses & More",
    detail: "Easy, expressive pieces",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85"
  }
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <div className="announcement">
        <span>THE LINEN EDIT IS HERE</span>
        <span className="announcement-divider">/</span>
        <span>DISCOVER THE COLLECTION</span>
        <ArrowUpRight size={13} strokeWidth={1.8} />
      </div>

      <header className="site-header">
        <button
          className="icon-button mobile-menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a href="#" className="wordmark" aria-label="CroppTech Commerce home">
          <span className="wordmark-main">CROP<span>TECH</span></span>
          <span className="wordmark-sub">COMMERCE</span>
        </a>

        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"}>
          <a href="/shop" onClick={closeMenu}>MEN</a>
          <a href="/shop" onClick={closeMenu}>WOMEN</a>
          <a href="/shop" onClick={closeMenu}>LINEN COLLECTION</a>
          <a href="#story" onClick={closeMenu}>OUR STORY</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button" aria-label="Search">
            <Search size={19} strokeWidth={1.6} />
          </button>
          <button className="icon-button bag-button" aria-label="Shopping bag">
            <ShoppingBag size={19} strokeWidth={1.6} />
            <span className="bag-count">0</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">CROPPT​​ECH COMMERCE — THE LINEN EDIT</p>
          <h1>Made for the<br /><em>way you move.</em></h1>
          <p className="hero-copy">
            Discover easy, considered fashion for every day.
            Natural textures. Effortless silhouettes.
          </p>
          <a className="light-button" href="#linen">
            EXPLORE THE COLLECTION <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="hero-index"><span>01</span><i /> 03</div>
        <p className="hero-side-note">A NEW PERSPECTIVE ON EVERYDAY STYLE</p>
      </section>

      <section className="intro-strip" id="story">
        <p>BUSINESS MOVES WITH COMMERCE.</p>
        <span>Style that feels as good as it looks — thoughtfully selected for him and her.</span>
      </section>

      <section className="collection-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR EDIT</p>
            <h2>Two ways to<br /><em>wear your day.</em></h2>
          </div>
          <p className="section-aside">
            Versatile pieces and relaxed essentials, selected to make getting dressed feel effortless.
          </p>
        </div>

        <div className="collection-grid">
          {collections.map((item) => (
            <a className="collection-card" href={item.href} key={item.number}>
              <div className="collection-image" style={{ backgroundImage: `url("${item.image}")` }}>
                <span className="collection-number">{item.number}</span>
                <span className="round-arrow"><ArrowUpRight size={20} /></span>
              </div>
              <div className="collection-card-copy">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <ArrowRight size={19} strokeWidth={1.5} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="linen-section" id="linen">
        <div className="linen-photo" />
        <div className="linen-copy">
          <p className="eyebrow">THE COLLECTION TO LIVE IN</p>
          <h2>Natural by<br /><em>nature.</em></h2>
          <p>
            Meet the linen edit: relaxed shapes, breathable textures and
            timeless pieces that move easily from one moment to the next.
          </p>
          <a href="/shop" className="text-link">SHOP THE LINEN EDIT <ArrowUpRight size={16} /></a>
          <span className="linen-caption">TEXTURE · MOVEMENT · SIMPLICITY</span>
        </div>
      </section>

      <section className="category-section section-pad" id="categories">
        <div className="section-heading category-heading">
          <div>
            <p className="eyebrow">THE CROPPTECH SELECTION</p>
            <h2>Pieces for<br /><em>every chapter.</em></h2>
          </div>
          <a href="#linen" className="text-link">SHOP ALL COLLECTIONS <ArrowUpRight size={16} /></a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a href="#linen" className="category-card" key={category.name}>
              <div className="category-image" style={{ backgroundImage: `url("${category.image}")` }}>
                <span>0{index + 1}</span>
              </div>
              <div className="category-meta">
                <div><h3>{category.name}</h3><p>{category.detail}</p></div>
                <ArrowUpRight size={18} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="brand-note">
        <p className="eyebrow">THE CROP​​PTECH POINT OF VIEW</p>
        <h2>Less noise.<br /><em>More feeling.</em></h2>
        <p>Good style is not complicated. It is the confidence to keep things simple.</p>
        <a href="#story" className="light-button">GET TO KNOW US <ArrowUpRight size={16} /></a>
      </section>

      <section className="newsletter section-pad">
        <div>
          <p className="eyebrow">A NOTE FROM US</p>
          <h2>Stay in the<br /><em>know.</em></h2>
        </div>
        <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="newsletter-email">New collections, considered edits and updates. Straight to your inbox.</label>
          <div className="email-field">
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={20} /></button>
          </div>
          <small>By subscribing, you agree to receive updates from CroppTech Commerce.</small>
        </form>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <a href="#" className="wordmark footer-wordmark">
            <span className="wordmark-main">CROP<span>TECH</span></span>
            <span className="wordmark-sub">COMMERCE</span>
          </a>
          <p>BUSINESS MOVES WITH COMMERCE.</p>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CROP​​PTECH COMMERCE. ALL RIGHTS RESERVED.</span>
          <div><a href="#story">ABOUT</a><a href="#story">CONTACT</a><a href="#story">DELIVERY & RETURNS</a></div>
          <span>MADE TO MOVE WITH YOU.</span>
        </div>
      </footer>
    </main>
  );
}
