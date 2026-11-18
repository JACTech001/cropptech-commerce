"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";

const products = [
  { id: 1, name: "Relaxed Linen Shirt", category: "Shirts", audience: "Men", tone: "Natural", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT" },
  { id: 2, name: "Everyday Linen Trousers", category: "Trousers", audience: "Men", tone: "Sand", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL" },
  { id: 3, name: "Linen Co-ord Set", category: "Sets", audience: "Women", tone: "Cream", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT" },
  { id: 4, name: "Soft-Shape Linen Dress", category: "Dresses", audience: "Women", tone: "White", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT" },
  { id: 5, name: "Button-Front Linen Blouse", category: "Shirts", audience: "Women", tone: "Ivory", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", tag: "NEW SEASON" },
  { id: 6, name: "Weekend Linen Shorts", category: "Shorts", audience: "Men", tone: "Beige", image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL" },
  { id: 7, name: "Relaxed Linen Skirt", category: "Skirts", audience: "Women", tone: "Sand", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT" },
  { id: 8, name: "Linen Blend Overshirt", category: "Shirts", audience: "Men", tone: "Olive", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT" }
];

const audiences = ["All", "Women", "Men"];
const categories = ["All categories", "Shirts", "Trousers", "Shorts", "Sets", "Dresses", "Skirts"];

export default function ShopPage() {
  const [audience, setAudience] = useState("All");
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    let list = products.filter((product) =>
      (audience === "All" || product.audience === audience) &&
      (category === "All categories" || product.category === category) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) || product.tone.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "audience") list = [...list].sort((a, b) => a.audience.localeCompare(b.audience));
    return list;
  }, [audience, category, search, sort]);

  return (
    <main className="shop-page">
      <header className="shop-topbar">
        <Link href="/" className="shop-back"><ArrowLeft size={16} /> HOME</Link>
        <Link href="/" className="shop-wordmark"><strong>CROP<span>TECH</span></strong><small>COMMERCE</small></Link>
        <span className="shop-top-note">BUSINESS MOVES WITH COMMERCE.</span>
      </header>

      <section className="shop-hero">
        <div>
          <p className="eyebrow">CROPPT​ECH COMMERCE / COLLECTIONS</p>
          <h1>Find your<br /><em>everyday edit.</em></h1>
          <p>Explore relaxed silhouettes and considered essentials for him and her, led by our linen collection.</p>
        </div>
        <span className="shop-hero-index">COLLECTION 001 — LINEN & EVERYDAY</span>
      </section>

      <section className="shop-catalogue">
        <div className="catalogue-heading">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Shop all pieces <span>({visibleProducts.length})</span></h2></div>
          <label className="shop-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search styles or colours" aria-label="Search styles or colours" /></label>
        </div>

        <div className="shop-controls">
          <div className="audience-tabs" aria-label="Filter by collection">
            {audiences.map((item) => <button key={item} className={audience === item ? "active" : ""} onClick={() => setAudience(item)}>{item === "All" ? "ALL" : item.toUpperCase()}</button>)}
          </div>
          <div className="catalogue-selects">
            <label><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="sort-label"><span>SORT</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="audience">Men / Women</option></select></label>
          </div>
        </div>

        <div className="shop-product-grid">
          {visibleProducts.map((product) => (
            <article className="shop-product-card" key={product.id}>
              <div className="shop-product-image" style={{ backgroundImage: `url("${product.image}")` }}>
                <span className="shop-product-tag">{product.tag}</span>
                <span className="shop-product-view">STYLE PREVIEW <ArrowUpRight size={14} /></span>
              </div>
              <div className="shop-product-info">
                <div><p>{product.audience} / {product.category}</p><h3>{product.name}</h3><span>{product.tone} colour direction</span></div>
                <span className="product-price-note">Details soon</span>
              </div>
            </article>
          ))}
          {visibleProducts.length === 0 && <div className="shop-empty"><h3>No styles found.</h3><p>Try another search or clear your filters.</p><button onClick={() => { setAudience("All"); setCategory("All categories"); setSearch(""); }}>CLEAR FILTERS</button></div>}
        </div>
        <p className="catalogue-disclaimer">Collection previews are for design direction only. Product photography, confirmed fabrics, sizes, prices and availability will be added when the CroppTech inventory is finalised.</p>
      </section>

      <section className="shop-bottom-cta"><p className="eyebrow">A MORE CONSIDERED WARDROBE</p><h2>Good style starts<br /><em>with the essentials.</em></h2><Link href="/" className="text-link">BACK TO HOME <ArrowUpRight size={16} /></Link></section>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROP​​PTECH COMMERCE</span><span>BUSINESS MOVES WITH COMMERCE.</span></footer>
    </main>
  );
}
