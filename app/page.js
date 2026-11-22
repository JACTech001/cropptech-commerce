"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  Search,
  X,
  Music2,
} from "lucide-react";
import ProductAddButton from "../components/ProductAddButton";
import { CartLink } from "../components/CartProvider";
import { products, productSlug } from "../data/products";
import { CurrencySelector, ProductPrice } from "../components/CurrencyProvider";
import AuthAccountControl from "../components/AuthAccountControl";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        setSearchOpen(false);
      }
    };
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const searchResults = searchQuery.trim()
    ? products.filter((product) => [product.name, product.category, product.audience, product.tone].some((value) => value.toLowerCase().includes(searchQuery.trim().toLowerCase())))
    : products;

  function requestUpdates(event) {
    event.preventDefault();
    const subject = encodeURIComponent("CroppTech Commerce Store updates");
    const body = encodeURIComponent("Please add this email address to the store updates list when subscriptions are available:\\n\\n" + email);
    window.location.href = "mailto:Cropptechcommercestores@gmail.com?subject=" + subject + "&body=" + body;
    setNewsletterMessage("Your email app should open with your request. Send the email to complete it.");
  }

  return (
    <main>
      <div className="announcement">
        <span>THE LINEN SHIRT EDIT IS HERE</span>
        <span className="announcement-divider">/</span>
        <span>SHOP LINEN WEAR</span>
        <ArrowUpRight size={13} strokeWidth={1.8} />
      </div>

      <header className="site-header">
        {!menuOpen && (
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open menu"
            aria-expanded={false}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
        )}

        <a href="/" className="brand-lockup brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} priority className="brand-text-logo" />
        </a>

        <div className="mobile-menu-backdrop" aria-hidden="true" onClick={closeMenu} style={{display:menuOpen ? "block" : "none"}} />
        <nav id="mobile-navigation" className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          <div className="mobile-menu-heading"><span>EXPLORE CROPPTECH</span><button type="button" className="mobile-menu-close" onClick={closeMenu} aria-label="Close menu"><X size={21} /></button></div>
          <a href="/shop?collection=men" onClick={closeMenu}>MEN<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <a href="/shop?collection=women" onClick={closeMenu}>WOMEN<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <a href="/shop?collection=linen" onClick={closeMenu}>LINEN WEAR<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <div className="mobile-menu-divider" />
          <a href="/about" onClick={closeMenu}>OUR STORY<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <a href="/contact" onClick={closeMenu}>CONTACT<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <a href="/faq" onClick={closeMenu}>HELP & FAQ<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></a>
          <div className="mobile-menu-footer"><span>BUSINESS MOVES WITH COMMERCE.</span><a href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>FOLLOW ON TIKTOK</a></div>
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-button search-trigger" aria-label="Search linen products" aria-expanded={searchOpen} onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }}>
            <Search size={19} strokeWidth={1.6} />
          </button>
          <CurrencySelector />
          <AuthAccountControl />
          <CartLink className="home-cart-link" />
        </div>
      </header>

      {searchOpen && (
        <section className="home-search-panel" aria-label="Product search">
          <div className="home-search-inner">
            <div className="home-search-input-wrap">
              <Search size={19} strokeWidth={1.7} />
              <input autoFocus type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search linen styles, categories or colours..." aria-label="Search products" />
              {searchQuery && <button type="button" className="home-search-clear" onClick={() => setSearchQuery("")}>CLEAR</button>}
              <button type="button" className="home-search-close" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button>
            </div>
            <div className="home-search-results" aria-live="polite">
              <div className="home-search-results-heading"><span>{searchQuery.trim() ? "SEARCH RESULTS" : "POPULAR IN THE COLLECTION"}</span><span>{searchResults.length} {searchResults.length === 1 ? "ITEM" : "ITEMS"}</span></div>
              {searchResults.length ? searchResults.map((product) => (
                <a className="home-search-result" href={"/shop/" + productSlug(product.name)} key={product.id}>
                  <img src={product.image} alt="" />
                  <span className="home-search-result-copy"><strong>{product.name}</strong><small>{product.audience} / {product.category} · {product.tone}</small></span>
                  <span className="home-search-result-price">{product.price == null ? "Price to be confirmed" : "₦" + product.price.toLocaleString("en-NG")}</span>
                  <ArrowUpRight size={16} />
                </a>
              )) : <p className="home-search-empty">No products match “{searchQuery}”. Try a different style, category or colour.</p>}
            </div>
          </div>
        </section>
      )}

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
              <div className="collection-image" style={{ backgroundImage: `url(\"${item.image}\")` }}>
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
              <div className="category-image" style={{ backgroundImage: `url(\"${category.image}\")` }}>
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
        <form className="newsletter-form" onSubmit={requestUpdates}>
          <label htmlFor="newsletter-email">Want to hear about new linen collections? Leave your email and send us an update request.</label>
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
          <small>No automatic subscription yet. Your email app will open so you can send the request.</small>\n          {newsletterMessage && <small role="status">{newsletterMessage}</small>}
        </form>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <a href="/" className="brand-lockup footer-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
            <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} className="brand-text-logo" />
          </a>
          <p>BUSINESS MOVES WITH COMMERCE.</p>
          <div className="social-links">
            <a href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><Music2 size={18} /></a>
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
