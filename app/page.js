"use client";

import { useState } from "react";
import Image from "next/image";
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
import ProductAddButton from "../components/ProductAddButton";
import { CartLink } from "../components/CartProvider";
import { products, productSlug } from "../data/products";
import { CurrencySelector, ProductPrice } from "../components/CurrencyProvider";

const collections = [
  {
    title: "The Men's Edit",
    description: "Relaxed essentials. Thoughtful details. Everyday ease.",
    image:
      "https://images.pexels.com/photos/32825460/pexels-photo-32825460/free-photo-of-stylish-male-model-in-beige-linen-outfit-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1400",
    href: "/shop?collection=men"
  },
  {
    title: "The Women's Edit",
    description: "Effortless silhouettes, made to move with you.",
    image:
      "https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=1400",
    href: "/shop?collection=women"
  }
];

const categories = [
  {
    name: "Linen Wear",
    detail: "Light layers, all day",
    image:
      "https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=1800",
    href: "/shop?collection=linen"
  },
  {
    name: "Linen Sets",
    detail: "A considered matching look",
    image:
      "https://images.pexels.com/photos/15923917/pexels-photo-15923917/free-photo-of-linen-clothes-on-clothes-hangers.jpeg?auto=compress&cs=tinysrgb&w=1400",
    href: "/shop?collection=linen&category=Sets"
  },
  {
    name: "Linen Dresses",
    detail: "Easy, expressive linen shapes",
    image:
      "https://images.pexels.com/photos/6996128/pexels-photo-6996128.jpeg?auto=compress&cs=tinysrgb&w=1400",
    href: "/shop?collection=women&category=Dresses"
  }
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <div className="announcement">
        <span>THE LINEN SHIRT EDIT IS HERE</span>
        <span className="announcement-divider">/</span>
        <span>SHOP LINEN WEAR</span>
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

        <a href="/" className="brand-lockup brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} priority className="brand-text-logo" />
        </a>

        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"}>
          <a href="/shop?collection=men" onClick={closeMenu}>MEN</a>
          <a href="/shop?collection=women" onClick={closeMenu}>WOMEN</a>
          <a href="/shop?collection=linen" onClick={closeMenu}>LINEN WEAR</a>
          <a href="#story" onClick={closeMenu}>OUR STORY</a>
        </nav>

        <div className="header-actions">
          <a href="/shop" className="icon-button" aria-label="Search linen products">
            <Search size={19} strokeWidth={1.6} />
          </a>
          <CurrencySelector />
          <CartLink className="home-cart-link" />
        </div>
      </header>

      <section className="hero">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">CROPPTECH COMMERCE — THE LINEN SHIRT EDIT</p>
          <h1>The linen shirt<br /><em>starts here.</em></h1>
          <p className="hero-copy">
            Discover breathable linen wear for men and women. Explore relaxed shirts, considered sets and effortless pieces made for everyday living.
          </p>
          <a className="light-button" href="/shop?collection=linen">
            SHOP LINEN WEAR <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="hero-side-note">A NEW PERSPECTIVE ON EVERYDAY STYLE</p>
      </section>

      <section className="intro-strip" id="story">
        <p>BUSINESS MOVES WITH COMMERCE.</p>
        <span>A considered linen collection for men and women, shaped around comfort, texture and timeless style.</span>
      </section>

      <section className="collection-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR EDIT</p>
            <h2>Two ways to<br /><em>wear your day.</em></h2>
          </div>
          <p className="section-aside">
            Linen essentials for him and her, selected to make getting dressed feel effortless.
          </p>
        </div>

        <div className="collection-grid">
          {collections.map((item) => (
            <a className="collection-card" href={item.href} key={item.title}>
              <div className="collection-image" style={{ backgroundImage: `url("${item.image}")` }}>
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
          <p className="eyebrow">THE LINEN WEAR COLLECTION</p>
          <h2>Made for<br /><em>the everyday.</em></h2>
          <p>
            Linen wear designed for breathable comfort,
            relaxed movement and easy styling, season after season.
          </p>
          <a href="/shop?collection=linen" className="text-link">SHOP LINEN WEAR <ArrowUpRight size={16} /></a>
          <span className="linen-caption">TEXTURE · MOVEMENT · SIMPLICITY</span>
        </div>
      </section>

      <section className="home-featured-section section-pad" id="featured">
        <div className="section-heading">
          <div><p className="eyebrow">SHOP THE EDIT</p><h2>Pieces to<br /><em>make yours.</em></h2></div>
          <p className="section-aside">Choose your size and add a favourite directly to your cart, without leaving the home page.</p>
        </div>
        <div className="home-featured-grid">
          {products.filter((product) => product.featured).map((product) => {
            const slug = productSlug(product.name);
            return <article className="home-featured-card" key={product.id}>
              <a href={"/shop/" + slug} className="home-featured-image"><img src={product.image} alt={product.name} /><span>{product.tag}</span></a>
              <div className="home-featured-meta">
                <p className="home-product-category">{product.audience} / {product.category}</p>
                <h3><a href={"/shop/" + slug}>{product.name}</a></h3>
                <span className="home-product-tone">{product.tone} colour direction</span>
                <div className="home-product-price-row"><span>PRICE</span><ProductPrice amount={product.price} className="home-price" /></div>
              </div>
              <ProductAddButton product={{ ...product, slug }} />
            </article>;
          })}
        </div>
        <div className="home-featured-footer"><a href="/shop" className="text-link">VIEW ALL COLLECTIONS <ArrowUpRight size={16} /></a></div>
      </section>

      <section className="linen-moodboard section-pad">
        <div className="moodboard-heading">
          <div><p className="eyebrow">LINEN, IN GOOD COMPANY</p><h2>Natural texture.<br /><em>Effortless presence.</em></h2></div>
          <a href="/shop?collection=linen" className="text-link">EXPLORE LINEN WEAR <ArrowUpRight size={16} /></a>
        </div>
        <div className="moodboard-grid">
          <a href="/shop?collection=linen" className="moodboard-tile moodboard-tile-tall"><img src="https://images.pexels.com/photos/32825460/pexels-photo-32825460.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Men's beige linen outfit" /><span>THE MEN'S LINEN EDIT</span></a>
          <a href="/shop?collection=linen" className="moodboard-tile"><img src="https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Woman wearing a relaxed linen outfit" /><span>SOFT, RELAXED SILHOUETTES</span></a>
          <a href="/shop?collection=linen" className="moodboard-tile"><img src="https://images.pexels.com/photos/15923917/pexels-photo-15923917.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Neutral linen garments on wooden hangers" /><span>THE DETAILS</span></a>
          <a href="/shop?collection=linen" className="moodboard-tile"><img src="https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Men's white linen outfit" /><span>MADE FOR EVERYDAY</span></a>
        </div>
        <p className="moodboard-note">A visual style edit for inspiration. Product fabrics, styles and availability will be confirmed in the store catalogue.</p>
      </section>

      <section className="category-section section-pad" id="categories">
        <div className="section-heading category-heading">
          <div>
            <p className="eyebrow">THE LINEN WARDROBE</p>
            <h2>More ways to<br /><em>wear linen.</em></h2>
          </div>
          <a href="/shop" className="text-link">SHOP ALL COLLECTIONS <ArrowUpRight size={16} /></a>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <a href={category.href} className="category-card" key={category.name}>
              <div className="category-image" style={{ backgroundImage: `url("${category.image}")` }}>
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
        <p className="eyebrow">THE CROPPTECH POINT OF VIEW</p>
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
          <small>By subscribing, you agree to receive updates from CroppTech Commerce Store.</small>
        </form>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <a href="/" className="brand-lockup footer-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
            <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} className="brand-text-logo" />
          </a>
          <p>BUSINESS MOVES WITH COMMERCE.</p>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE. ALL RIGHTS RESERVED.</span>
          <div><a href="/about">ABOUT</a><a href="/contact">CONTACT</a><a href="/delivery-returns">DELIVERY & RETURNS</a><a href="/faq">FAQS</a><a href="/privacy">PRIVACY</a><a href="/terms">TERMS</a></div>
          <span>MADE TO MOVE WITH YOU.</span>
        </div>
      </footer>
    </main>
  );
}
