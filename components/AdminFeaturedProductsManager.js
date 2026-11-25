"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, LoaderCircle, Save, Search, Star, X } from "lucide-react";
import styles from "./AdminFeaturedProductsManager.module.css";

export default function AdminFeaturedProductsManager() {
  const [products, setProducts] = useState([]);
  const [activeView, setActiveView] = useState("selected");
  const [selectedIds, setSelectedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/featured-products", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Featured products could not be loaded.");
        if (!active) return;
        setProducts(data.products || []);
        setSelectedIds(data.featuredProductIds || []);
        setSavedIds(data.featuredProductIds || []);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((product) => product.id === id)).filter(Boolean),
    [products, selectedIds]
  );
  const availableProducts = useMemo(() => products.filter((product) => {
    const term = search.trim().toLowerCase();
    return !selectedIds.includes(product.id) && (!term || [product.name, product.category, product.productType].some((value) => String(value || "").toLowerCase().includes(term)));
  }), [products, search, selectedIds]);
  const hasChanges = selectedIds.length !== savedIds.length || selectedIds.some((id, index) => id !== savedIds[index]);

  function addProduct(id) {
    if (selectedIds.length >= 6) return;
    setSelectedIds((current) => [...current, id]);
    setNotice("");
    setError("");
  }

  function removeProduct(id) {
    setSelectedIds((current) => current.filter((value) => value !== id));
    setNotice("");
  }

  function moveProduct(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    setSelectedIds((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setNotice("");
  }

  async function saveChanges() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/featured-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Featured products could not be saved.");
      setSelectedIds(data.featuredProductIds || []);
      setSavedIds(data.featuredProductIds || []);
      setNotice("Homepage featured products saved successfully.");
    } catch (cause) {
      setError(cause.message || "Featured products could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    setSelectedIds(savedIds);
    setError("");
    setNotice("Unsaved changes have been discarded.");
  }

  if (loading) return <div className={styles.loading}><LoaderCircle size={18} /> Loading your product catalogue…</div>;

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <div>
          <strong>{selectedIds.length} of 6 homepage positions selected</strong>
          <span>Products appear in the same order shown below. Saving updates the customer homepage only.</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={discardChanges} disabled={!hasChanges || saving}>DISCARD</button>
          <button type="button" className={styles.primaryButton} onClick={saveChanges} disabled={!hasChanges || saving}>
            {saving ? <LoaderCircle size={15} className={styles.spin} /> : <Save size={15} />} SAVE SELECTION
          </button>
        </div>
      </div>

      <nav className="admin-home-media-tabs admin-workspace-tabs" aria-label="Featured products sections">
        <button type="button" className={activeView === "selected" ? "is-active" : ""} aria-pressed={activeView === "selected"} onClick={() => setActiveView("selected")}>FEATURED SELECTION</button>
        <button type="button" className={activeView === "catalogue" ? "is-active" : ""} aria-pressed={activeView === "catalogue"} onClick={() => setActiveView("catalogue")}><Search size={14}/> PRODUCT CATALOGUE</button>
      </nav>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status"><Check size={15} />{notice}</p>}

      <div className={styles.columns}>
        <section className={styles.selectedPanel} hidden={activeView !== "selected"} aria-labelledby="selected-featured-heading">
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>HOMEPAGE DISPLAY</p><h2 id="selected-featured-heading">Featured selection</h2></div>
            <span>{selectedIds.length}/6</span>
          </div>
          {selectedProducts.length ? (
            <div className={styles.selectedList}>
              {selectedProducts.map((product, index) => (
                <article className={styles.selectedCard} key={product.id}>
                  <span className={styles.position}>{index + 1}</span>
                  <div className={styles.imageWrap}>{product.image ? <Image src={product.image} alt="" fill sizes="76px" unoptimized /> : <Star size={20}/>}</div>
                  <div className={styles.productCopy}><strong>{product.name}</strong><span>{product.category} · {product.productType}</span><small>{product.price == null ? "Price unavailable" : "₦" + product.price.toLocaleString("en-NG")}</small></div>
                  <div className={styles.reorder}>
                    <button type="button" onClick={() => moveProduct(index, -1)} disabled={index === 0} aria-label={"Move " + product.name + " up"}><ArrowUp size={15}/></button>
                    <button type="button" onClick={() => moveProduct(index, 1)} disabled={index === selectedProducts.length - 1} aria-label={"Move " + product.name + " down"}><ArrowDown size={15}/></button>
                  </div>
                  <button type="button" className={styles.removeButton} onClick={() => removeProduct(product.id)} aria-label={"Remove " + product.name + " from homepage"} title="Remove from homepage"><X size={16}/></button>
                </article>
              ))}
            </div>
          ) : <div className={styles.emptySelected}><Star size={22}/><strong>No featured products selected</strong><span>Add products from the catalogue to create your homepage edit.</span></div>}
          <div className={styles.preview}>
            <div className={styles.previewHeading}><strong>Homepage preview</strong><span>Product order as customers will see it</span></div>
            {selectedProducts.length ? <div className={styles.previewGrid}>
              {selectedProducts.map((product, index) => <article className={styles.previewCard} key={product.id}>
                <div className={styles.previewImage}>{product.image && <Image src={product.image} alt="" fill sizes="(max-width: 700px) 30vw, 140px" unoptimized />}<span>{index + 1}</span></div>
                <strong>{product.name}</strong>
                <small>{product.price == null ? "Price unavailable" : "₦" + product.price.toLocaleString("en-NG")}</small>
              </article>)}
            </div> : <p className={styles.previewEmpty}>Your homepage product section will stay hidden until you select at least one product.</p>}
          </div>
          <p className={styles.footnote}>Removing a product here does not delete it, archive it or remove it from the Shop catalogue.</p>
        </section>

        <section className={styles.cataloguePanel} hidden={activeView !== "catalogue"} aria-labelledby="catalogue-products-heading">
          <div className={styles.panelHeading}>
            <div><p className={styles.eyebrow}>PUBLISHED CATALOGUE</p><h2 id="catalogue-products-heading">Add products</h2></div>
            <span>{availableProducts.length} available</span>
          </div>
          <label className={styles.search}><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search published products…" /><span className="sr-only">Search published products</span></label>
          <div className={styles.catalogueList}>
            {availableProducts.length ? availableProducts.map((product) => (
              <article className={styles.catalogueCard} key={product.id}>
                <div className={styles.imageWrap}>{product.image ? <Image src={product.image} alt="" fill sizes="64px" unoptimized /> : <Star size={18}/>}</div>
                <div className={styles.productCopy}><strong>{product.name}</strong><span>{product.category} · {product.productType}</span><small>{product.price == null ? "Price unavailable" : "₦" + product.price.toLocaleString("en-NG")}{product.eligible ? " · In stock" : " · Cannot be featured"}</small></div>
                <button type="button" className={styles.addButton} onClick={() => addProduct(product.id)} disabled={!product.eligible || selectedIds.length >= 6} aria-label={"Add " + product.name + " to homepage"}><Check size={15}/><span>ADD</span></button>
              </article>
            )) : <div className={styles.emptyCatalogue}><strong>No matching products</strong><span>Publish products with an image and at least one in-stock variant to feature them.</span></div>}
          </div>
        </section>
      </div>
      <p className={styles.bottomNote}>Only active, published products with a product image and at least one in-stock variant can be featured. Their product details, gallery, pricing and inventory remain managed in Product Catalogue.</p>
    </section>
  );
}
