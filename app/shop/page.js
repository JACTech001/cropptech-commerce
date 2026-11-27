"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Search, SlidersHorizontal, UserRound } from "lucide-react";
import ProductAddButton from "../../components/ProductAddButton";
import { CartLink } from "../../components/CartProvider";
import { productSlug } from "../../data/products";
import { CurrencySelector, ProductPrice } from "../../components/CurrencyProvider";
import { ProductGridSkeleton } from "../../components/PageSkeleton";

const audiences = ["All", "Men", "Women"];
const categories = ["All categories", "Shirts", "Trousers", "Shorts", "Sets", "Dresses", "Skirts"];

export default function ShopPage() {
  const [audience, setAudience] = useState("All");
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json(); })
      .then((data) => { if (active) setProducts(data.products || []); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setCatalogueLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collection = (params.get("collection") || "all").toLowerCase();
    if (["men", "women"].includes(collection)) startTransition(() => setAudience(collection.charAt(0).toUpperCase() + collection.slice(1)));
    const selectedCategory = params.get("category");
    if (selectedCategory && categories.includes(selectedCategory)) startTransition(() => setCategory(selectedCategory));
    const initialSearch = params.get("search");
    if (initialSearch) startTransition(() => setSearch(initialSearch));
  }, []);

  const visibleProducts = useMemo(() => {
    let list = products.filter((product) => {
      const collectionMatch = audience === "All" || product.audience === audience;
      const categoryMatch = category === "All categories" || product.category === category;
      const searchMatch = [product.name, product.tone, product.category].some((value) => value.toLowerCase().includes(search.toLowerCase()));
      return collectionMatch && categoryMatch && searchMatch;
    });
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "audience") list = [...list].sort((a, b) => a.audience.localeCompare(b.audience));
    return list;
  }, [products, audience, category, search, sort]);

  const chooseAudience = (value) => {
    setAudience(value);
    const url = new URL(window.location.href);
    if (value === "All") url.searchParams.delete("collection");
    else url.searchParams.set("collection", value.toLowerCase());
    window.history.replaceState({}, "", url);
  };

  return (
    <main className="shop-page">
      <header className="shop-topbar">
        <Link href="/" className="shop-back"><ArrowLeft size={16} /> HOME</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" />
        </Link>
        <div className="shop-header-actions">
          <Link href="/account" className="shop-back shop-account-link" aria-label="My account" title="My account"><UserRound size={19} strokeWidth={1.7} /></Link>
          <CurrencySelector />
          <CartLink className="shop-cart-link" />
        </div>
      </header>
      <section className="shop-hero">
        <div>
          <p className="eyebrow">CROPPTECH COMMERCE STORE / COLLECTIONS</p>
          <h1>{audience === "All" ? <>The linen<br /><em>collection.</em></> : <>The {audience.toLowerCase()}&apos;s<br /><em>linen edit.</em></>}</h1>
          <p>{audience === "Men" ? "Explore breathable linen pieces for men, with relaxed shapes and natural textures." : audience === "Women" ? "Explore considered linen wear for women, from easy silhouettes to matching sets." : "A considered collection of linen wear for men and women. Discover breathable pieces, relaxed shapes and natural textures."}</p>
        </div>
        <span className="shop-hero-index">LINEN WEAR / MEN & WOMEN</span>
      </section>
      <section className="shop-catalogue">
        <div className="catalogue-heading">
          <div><p className="eyebrow">THE COLLECTION</p><h2>{audience === "All" ? "Shop linen wear" : "Shop " + audience.toLowerCase() + " linen"} <span>({visibleProducts.length})</span></h2></div>
          <label className="shop-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search styles or colours" aria-label="Search styles or colours" /></label>
        </div>
        <div className="shop-controls">
          <div className="audience-tabs" aria-label="Filter by collection">
            {audiences.map((item) => <button key={item} className={audience === item ? "active" : ""} onClick={() => chooseAudience(item)}>{item.toUpperCase()}</button>)}
          </div>
          <div className="catalogue-selects">
            <label><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="sort-label"><span>SORT</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="audience">Men / Women</option></select></label>
          </div>
        </div>
        <div className="shop-product-grid">
          {catalogueLoading ? <ProductGridSkeleton count={8} /> : visibleProducts.map((product) => (
            <article className="shop-product-card" key={product.id}>
              <div className="shop-product-image">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" style={{ objectFit: "cover" }} />
                <span className="shop-product-tag">{product.tag}</span>
                <span className="shop-product-view">{product.audience.toUpperCase()} / {product.category.toUpperCase()} <ArrowUpRight size={14} /></span>
              </div>
              <div className="shop-product-info">
                <p className="shop-product-category">{product.audience} / {product.category}</p>
                <h3><Link href={`/shop/${product.slug || productSlug(product.name)}`}>{product.name}</Link></h3>
                <span className="shop-product-tone">{product.tone} colour direction</span>
                <div className="shop-product-price-row"><span className="shop-product-price-label">PRICE</span><ProductPrice amount={product.price} className="product-price-note" /></div>
              </div>
              <ProductAddButton product={{ ...product, slug: product.slug || productSlug(product.name) }} />

            </article>
          ))}
          {!catalogueLoading && visibleProducts.length === 0 && <div className="shop-empty"><h3>No styles found.</h3><p>Try another search or clear your filters.</p><button onClick={() => { setAudience("All"); setCategory("All categories"); setSearch(""); }}>CLEAR FILTERS</button></div>}
        </div>
        <p className="catalogue-disclaimer">Choose a size for each piece. Every piece in this collection is selected as linen wear. Product details and availability are being completed.</p>
      </section>
      <section className="shop-bottom-cta"><p className="eyebrow">A MORE CONSIDERED WARDROBE</p><h2>Good style starts<br /><em>with the essentials.</em></h2><Link href="/" className="text-link">BACK TO HOME <ArrowUpRight size={16} /></Link></section>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
