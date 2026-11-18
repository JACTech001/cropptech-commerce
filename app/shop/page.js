"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";

const products = [
  { id: 1, name: "Relaxed Linen Shirt", category: "Shirts", audience: "Men", tone: "Natural", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT", isLinen: true },
  { id: 2, name: "Everyday Linen Trousers", category: "Trousers", audience: "Men", tone: "Sand", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL", isLinen: true },
  { id: 3, name: "Linen Co-ord Set", category: "Sets", audience: "Women", tone: "Cream", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT", isLinen: true },
  { id: 4, name: "Soft-Shape Linen Dress", category: "Dresses", audience: "Women", tone: "White", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT", isLinen: true },
  { id: 5, name: "Button-Front Linen Blouse", category: "Shirts", audience: "Women", tone: "Ivory", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", tag: "NEW SEASON", isLinen: true },
  { id: 6, name: "Weekend Linen Shorts", category: "Shorts", audience: "Men", tone: "Beige", image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL", isLinen: true },
  { id: 7, name: "Relaxed Linen Skirt", category: "Skirts", audience: "Women", tone: "Sand", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT", isLinen: true },
  { id: 8, name: "Linen Blend Overshirt", category: "Shirts", audience: "Men", tone: "Olive", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85", tag: "THE LINEN EDIT", isLinen: true },
  { id: 9, name: "Classic Cotton T-Shirt", category: "T-Shirts", audience: "Men", tone: "White", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", tag: "EVERYDAY", isLinen: false },
  { id: 10, name: "Tailored Casual Jacket", category: "Jackets", audience: "Men", tone: "Neutral", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85", tag: "MODERN CLASSIC", isLinen: false },
  { id: 11, name: "Everyday Denim", category: "Trousers", audience: "Men", tone: "Blue", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85", tag: "WARDROBE STAPLE", isLinen: false },
  { id: 12, name: "Statement Midi Dress", category: "Dresses", audience: "Women", tone: "Neutral", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT", isLinen: false },
  { id: 13, name: "Modern Everyday Blouse", category: "Shirts", audience: "Women", tone: "White", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL", isLinen: false },
  { id: 14, name: "Relaxed Everyday Co-ord", category: "Sets", audience: "Women", tone: "Earth", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85", tag: "NEW SEASON", isLinen: false },
  { id: 15, name: "Casual Polo Shirt", category: "T-Shirts", audience: "Men", tone: "Navy", image: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=85", tag: "EVERYDAY", isLinen: false }
];

const audiences = ["All", "Men", "Women", "Linen"];
const categories = ["All categories", "Shirts", "T-Shirts", "Trousers", "Shorts", "Sets", "Dresses", "Skirts", "Jackets"];

export default function ShopPage() {
  const [audience, setAudience] = useState("All");
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collection = (params.get("collection") || "all").toLowerCase();
    if (["men", "women", "linen"].includes(collection)) setAudience(collection.charAt(0).toUpperCase() + collection.slice(1));
    const selectedCategory = params.get("category");
    if (selectedCategory && categories.includes(selectedCategory)) setCategory(selectedCategory);
  }, []);

  const visibleProducts = useMemo(() => {
    let list = products.filter((product) => {
      const collectionMatch = audience === "All" || (audience === "Linen" ? product.isLinen : product.audience === audience);
      const categoryMatch = category === "All categories" || product.category === category;
      const searchMatch = [product.name, product.tone, product.category].some((value) => value.toLowerCase().includes(search.toLowerCase()));
      return collectionMatch && categoryMatch && searchMatch;
    });
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "audience") list = [...list].sort((a, b) => a.audience.localeCompare(b.audience));
    return list;
  }, [audience, category, search, sort]);

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
        <span className="shop-top-note">BUSINESS MOVES WITH COMMERCE.</span>
      </header>
      <section className="shop-hero">
        <div>
          <p className="eyebrow">CROPPTECH COMMERCE STORE / COLLECTIONS</p>
          <h1>{audience === "All" ? <>Find your<br /><em>everyday edit.</em></> : audience === "Linen" ? <>The linen<br /><em>collection.</em></> : <>The {audience.toLowerCase()}'s<br /><em>edit.</em></>}</h1>
          <p>{audience === "Men" ? "Explore clothing selected for men, from relaxed linen essentials to everyday wardrobe staples." : audience === "Women" ? "Explore clothing selected for women, from effortless linen pieces to everyday wardrobe staples." : audience === "Linen" ? "One considered linen collection for both men and women. Explore breathable pieces, relaxed shapes and natural textures." : "Explore considered clothing for men and women, led by our shared linen collection."}</p>
        </div>
        <span className="shop-hero-index">COLLECTION 001 — LINEN & EVERYDAY</span>
      </section>
      <section className="shop-catalogue">
        <div className="catalogue-heading">
          <div><p className="eyebrow">THE COLLECTION</p><h2>{audience === "All" ? "Shop all pieces" : audience === "Linen" ? "Shop linen wear" : "Shop " + audience.toLowerCase() + "'s pieces"} <span>({visibleProducts.length})</span></h2></div>
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
          {visibleProducts.map((product) => (
            <article className="shop-product-card" key={product.id}>
              <div className="shop-product-image">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw" style={{ objectFit: "cover" }} />
                <span className="shop-product-tag">{product.tag}</span>
                <span className="shop-product-view">{product.audience.toUpperCase()} / {product.category.toUpperCase()} <ArrowUpRight size={14} /></span>
              </div>
              <div className="shop-product-info">
                <div><p>{product.audience} / {product.category}</p><h3>{product.name}</h3><span>{product.tone} colour direction</span></div>
                <span className="product-price-note">Details soon</span>
              </div>
            </article>
          ))}
          {visibleProducts.length === 0 && <div className="shop-empty"><h3>No styles found.</h3><p>Try another search or clear your filters.</p><button onClick={() => { setAudience("All"); setCategory("All categories"); setSearch(""); }}>CLEAR FILTERS</button></div>}
        </div>
        <p className="catalogue-disclaimer">These are curated style previews, not confirmed stock listings. Product fabrics, sizes, prices and availability will be confirmed before orders open.</p>
      </section>
      <section className="shop-bottom-cta"><p className="eyebrow">A MORE CONSIDERED WARDROBE</p><h2>Good style starts<br /><em>with the essentials.</em></h2><Link href="/" className="text-link">BACK TO HOME <ArrowUpRight size={16} /></Link></section>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
