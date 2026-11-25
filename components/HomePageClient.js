"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

export default function HomePage({ firstName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [featuredSelectionConfigured, setFeaturedSelectionConfigured] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [homepageMedia, setHomepageMedia] = useState({});

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStoreProducts() {
      setProductsLoading(true);
      setProductsError("");
      try {
        const response = await fetch("/api/products", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Products could not be loaded.");
        setProducts(Array.isArray(data.products) ? data.products : []);
        setFeaturedSelectionConfigured(data.featuredSelectionConfigured === true);
      } catch (error) {
        if (error.name !== "AbortError") setProductsError("We could not load products right now. Please visit the shop to try again.");
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false);
      }
    }
    loadStoreProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/homepage-media", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setHomepageMedia(data.media || {}); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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

  const homepageProducts = featuredSelectionConfigured ? products.filter((product) => product.featured).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 6) : products.slice(0, 6);

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
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
        )}

        <Link href="/" className="brand-lockup brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} priority className="brand-text-logo" />
        </Link>

        <div className="mobile-menu-backdrop" aria-hidden="true" onClick={closeMenu} style={{display:menuOpen ? "block" : "none"}} />
        <nav id="mobile-navigation" className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          <div className="mobile-menu-heading"><span>EXPLORE CROPPTECH</span><button type="button" className="mobile-menu-close" onClick={closeMenu} aria-label="Close menu"><X size={21} /></button></div>
          <Link href="/shop?collection=men" onClick={closeMenu}>MEN<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <Link href="/shop?collection=women" onClick={closeMenu}>WOMEN<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <Link href="/shop?collection=linen" onClick={closeMenu}>LINEN WEAR<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <div className="mobile-menu-divider" />
          <Link href="/about" onClick={closeMenu}>OUR STORY<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <Link href="/contact" onClick={closeMenu}>CONTACT<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <Link href="/faq" onClick={closeMenu}>HELP & FAQ<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <Link href="/account" onClick={closeMenu}>MY ACCOUNT<span className="mobile-nav-arrow"><ArrowUpRight size={15} strokeWidth={1.8} /></span></Link>
          <div className="mobile-menu-footer"><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>FOLLOW ON TIKTOK</Link></div>
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-button search-trigger" aria-label="Search linen products" aria-expanded={searchOpen} onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }}>
            <Search size={19} strokeWidth={1.6} />
          </button>
          <CurrencySelector />
          <AuthAccountControl firstName={firstName} />
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
                <Link className="home-search-result" href={"/shop/" + product.slug} key={product.id}>
                  <Image src={product.image} alt="" width={48} height={58} />
                  <span className="home-search-result-copy"><strong>{product.name}</strong><small>{product.audience} / {product.category} · {product.tone}</small></span>
                  <span className="home-search-result-price">{product.price == null ? "Price to be confirmed" : "₦" + product.price.toLocaleString("en-NG")}</span>
                  <ArrowUpRight size={16} />
                </Link>
              )) : <p className="home-search-empty">No products match “{searchQuery}”. Try a different style, category or colour.</p>}
            </div>
          </div>
        </section>
      )}

      <section className="hero">
        <div className="hero-image" style={homepageMedia.hero_main?.url ? { backgroundImage: `url("${homepageMedia.hero_main.url}")` } : undefined} />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">CROPPTECH COMMERCE — THE LINEN SHIRT EDIT</p>
          <h1>The linen shirt<br /><em>starts here.</em></h1>
          <p className="hero-copy">
            Discover breathable linen wear for men and women. Explore relaxed shirts, considered sets and effortless pieces made for everyday living.
          </p>
          <Link className="light-button" href="/shop?collection=linen">
            SHOP LINEN WEAR <ArrowUpRight size={16} />
          </Link>
        </div>
        <p className="hero-side-note">A NEW PERSPECTIVE ON EVERYDAY STYLE</p>
      </section>

      <section className="intro-strip" id="story">
        <p>BUSINESS MOVES WITH COMMERCE.</p>
        <span>A considered linen collection for men and women, shaped around comfort, texture and timeless style.</span>
      </section>

      <nav className="mobile-home-shortcuts" aria-label="Shop shortcuts">
        <Link href="/shop">Shop all</Link>
        <Link href="/shop?collection=men">Men</Link>
        <Link href="/shop?collection=women">Women</Link>
        <Link href="/shop?collection=linen&category=Sets">Linen sets</Link>
      </nav>

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
          {collections.map((item, index) => (
            <Link className="collection-card" href={item.href} key={item.title}>
              <div className="collection-image" style={{ backgroundImage: `url("${homepageMedia[index === 0 ? "collection_men" : "collection_women"]?.url || item.image}")` }}>
                <span className="round-arrow"><ArrowUpRight size={20} /></span>
              </div>
              <div className="collection-card-copy">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <ArrowRight size={19} strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="linen-section" id="linen">
        <div className="linen-photo" style={homepageMedia.linen_feature?.url ? { backgroundImage: `url("${homepageMedia.linen_feature.url}")` } : undefined} />
        <div className="linen-copy">
          <p className="eyebrow">THE LINEN WEAR COLLECTION</p>
          <h2>Made for<br /><em>the everyday.</em></h2>
          <p>
            Linen wear designed for breathable comfort,
            relaxed movement and easy styling, season after season.
          </p>
          <Link href="/shop?collection=linen" className="text-link">SHOP LINEN WEAR <ArrowUpRight size={16} /></Link>
          <span className="linen-caption">TEXTURE · MOVEMENT · SIMPLICITY</span>
        </div>
      </section>

      {(!featuredSelectionConfigured || homepageProducts.length > 0 || productsLoading || productsError) && <section className="home-featured-section section-pad" id="featured">
        <div className="section-heading">
          <div><p className="eyebrow">SHOP THE EDIT</p><h2>Pieces to<br /><em>make yours.</em></h2></div>
          <p className="section-aside">Choose your size and add a favourite directly to your cart, without leaving the home page.</p>
        </div>
        <div className="home-featured-grid">
          {productsLoading ? <p className="home-products-state">Loading products from the store…</p> : productsError ? <p className="home-products-state" role="status">{productsError}</p> : homepageProducts.length === 0 ? <p className="home-products-state">Our products will appear here as soon as they are published in the store.</p> : homepageProducts.map((product) => {
            const slug = product.slug;
            return <article className="home-featured-card" key={product.id}>
              <Link href={"/shop/" + slug} className="home-featured-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" /><span>{product.tag}</span></Link>
              <div className="home-featured-meta">
                <p className="home-product-category">{product.audience} / {product.category}</p>
                <h3><Link href={"/shop/" + slug}>{product.name}</Link></h3>
                <span className="home-product-tone">{product.tone} colour direction</span>
                <div className="home-product-price-row"><span>PRICE</span><ProductPrice amount={product.price} className="home-price" /></div>
              </div>
              <ProductAddButton product={{ ...product, slug }} />
            </article>;
          })}
        </div>
        <div className="home-featured-footer"><Link href="/shop" className="text-link">VIEW ALL COLLECTIONS <ArrowUpRight size={16} /></Link></div>
      </section>}

      <section className="linen-moodboard section-pad">
        <div className="moodboard-heading">
          <div><p className="eyebrow">LINEN, IN GOOD COMPANY</p><h2>Natural texture.<br /><em>Effortless presence.</em></h2></div>
          <Link href="/shop?collection=linen" className="text-link">EXPLORE LINEN WEAR <ArrowUpRight size={16} /></Link>
        </div>
        <div className="moodboard-grid">
          <Link href="/shop?collection=linen" className="moodboard-tile moodboard-tile-tall"><Image src={homepageMedia.moodboard_men?.url || "https://images.pexels.com/photos/32825460/pexels-photo-32825460.jpeg?auto=compress&cs=tinysrgb&w=1000"} alt="Men's beige linen outfit" fill sizes="(max-width: 640px) 100vw, 40vw" /><span>THE MEN&apos;S LINEN EDIT</span></Link>
          <Link href="/shop?collection=linen" className="moodboard-tile"><Image src={homepageMedia.moodboard_women?.url || "https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=900"} alt="Woman wearing a relaxed linen outfit" fill sizes="(max-width: 640px) 50vw, 30vw" /><span>SOFT, RELAXED SILHOUETTES</span></Link>
          <Link href="/shop?collection=linen" className="moodboard-tile"><Image src={homepageMedia.moodboard_details?.url || "https://images.pexels.com/photos/15923917/pexels-photo-15923917.jpeg?auto=compress&cs=tinysrgb&w=900"} alt="Neutral linen garments on wooden hangers" fill sizes="(max-width: 640px) 50vw, 30vw" /><span>THE DETAILS</span></Link>
          <Link href="/shop?collection=linen" className="moodboard-tile"><Image src={homepageMedia.moodboard_everyday?.url || "https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=900"} alt="Men's white linen outfit" fill sizes="(max-width: 640px) 50vw, 30vw" /><span>MADE FOR EVERYDAY</span></Link>
        </div>
        <p className="moodboard-note">A visual style edit for inspiration. Product fabrics, styles and availability will be confirmed in the store catalogue.</p>
      </section>

      <section className="category-section section-pad" id="categories">
        <div className="section-heading category-heading">
          <div>
            <p className="eyebrow">THE LINEN WARDROBE</p>
            <h2>More ways to<br /><em>wear linen.</em></h2>
          </div>
          <Link href="/shop" className="text-link">SHOP ALL COLLECTIONS <ArrowUpRight size={16} /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link href={category.href} className="category-card" key={category.name}>
              <div className="category-image" style={{ backgroundImage: `url("${homepageMedia[["category_linen_wear", "category_linen_sets", "category_linen_dresses"][index]]?.url || category.image}")` }}>
              </div>
              <div className="category-meta">
                <div><h3>{category.name}</h3><p>{category.detail}</p></div>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      


      <section className="brand-note">
        <p className="eyebrow">THE CROPPTECH POINT OF VIEW</p>
        <h2>Less noise.<br /><em>More feeling.</em></h2>
        <p>Good style is not complicated. It is the confidence to keep things simple.</p>
        <Link href="#story" className="light-button">GET TO KNOW US <ArrowUpRight size={16} /></Link>
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
          <Link href="/" className="brand-lockup footer-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
            <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={170} height={49} className="brand-text-logo" />
          </Link>
          <p>BUSINESS MOVES WITH COMMERCE.</p>
          <div className="social-links">
            <Link href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><Music2 size={18} /></Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE. ALL RIGHTS RESERVED.</span>
          <div><Link href="/about">ABOUT</Link><Link href="/contact">CONTACT</Link><Link href="/delivery-returns">DELIVERY & RETURNS</Link><Link href="/faq">FAQS</Link><Link href="/privacy">PRIVACY</Link><Link href="/terms">TERMS</Link></div>
          <span>MADE TO MOVE WITH YOU.</span>
        </div>
      </footer>
    </main>
  );
}
