"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus, LoaderCircle, Plus, Save, Search, Trash2 } from "lucide-react";

const blankProduct = () => ({
  id: "",
  name: "",
  slug: "",
  description: "",
  category: "MEN",
  status: "DRAFT",
  isFeatured: false,
  variants: [],
  images: [],
});

const blankVariant = () => ({ id: "", sku: "", size: "", colour: "", price: "", stockQuantity: "0", isActive: true });
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function AdminProductsManager() {
  const [products, setProducts] = useState([]);
  const [draft, setDraft] = useState(blankProduct);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load products.");
      setProducts(data.products || []);
    } catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesStatus = filter === "ALL" || product.status === filter;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [product.name, product.slug, product.category].some((value) => String(value || "").toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }), [products, filter, search]);

  const startNew = () => { setDraft(blankProduct()); setMessage(""); setError(""); };
  const editProduct = (product) => {
    setDraft({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      status: product.status,
      isFeatured: product.isFeatured,
      variants: product.variants.map((variant) => ({ ...variant, price: String(variant.price), stockQuantity: String(variant.stockQuantity) })),
      images: product.images.map((image) => ({ ...image })),
    });
    setMessage(""); setError("");
  };

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateVariant = (index, key, value) => setDraft((current) => ({
    ...current,
    variants: current.variants.map((variant, i) => i === index ? { ...variant, [key]: value } : variant),
  }));
  const addVariant = () => update("variants", [...draft.variants, blankVariant()]);
  const removeVariant = (index) => update("variants", draft.variants.filter((_, i) => i !== index));

  async function uploadImages(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (draft.images.length + files.length > 30) { setError("A product can have up to 30 gallery images."); return; }
    setUploading(true); setError(""); setMessage("");
    try {
      const signResponse = await fetch("/api/admin/products/upload-signature", { method: "POST" });
      const signed = await signResponse.json();
      if (!signResponse.ok) throw new Error(signed.error || "Image upload is not available.");
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
          throw new Error("Choose image files no larger than 10 MB each.");
        }
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", signed.apiKey);
        form.append("timestamp", String(signed.timestamp));
        form.append("folder", signed.folder);
        form.append("signature", signed.signature);
        const response = await fetch("https://api.cloudinary.com/v1_1/" + encodeURIComponent(signed.cloudName) + "/image/upload", { method: "POST", body: form });
        const asset = await response.json();
        if (!response.ok) throw new Error(asset.error?.message || "Cloudinary could not upload an image.");
        uploaded.push({
          cloudinaryPublicId: asset.public_id,
          secureUrl: asset.secure_url,
          altText: draft.name || "CroppTech linen product",
          width: asset.width,
          height: asset.height,
          format: asset.format,
        });
      }
      update("images", [...draft.images, ...uploaded]);
      setMessage(uploaded.length + " image(s) uploaded. Save the product to attach them to its gallery.");
    } catch (cause) { setError(cause.message); }
    finally { setUploading(false); }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = {
        ...draft,
        variants: draft.variants.map((variant) => ({
          ...variant,
          price: variant.price,
          stockQuantity: Number(variant.stockQuantity),
        })),
      };
      const response = await fetch("/api/admin/products", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be saved.");
      setMessage("Product saved. It remains " + data.product.status.toLowerCase() + ".");
      await loadProducts();
      editProduct(data.product);
    } catch (cause) { setError(cause.message); }
    finally { setSaving(false); }
  }

  async function archiveProduct(product) {
    if (!window.confirm("Archive “" + product.name + "”? It will no longer be available for new purchases.")) return;
    const payload = {
      id: product.id, name: product.name, slug: product.slug, description: product.description,
      category: product.category, status: "ARCHIVED", isFeatured: false,
      variants: product.variants.map((variant) => ({ ...variant, price: String(variant.price), stockQuantity: variant.stockQuantity })),
      images: product.images,
    };
    setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be archived.");
      await loadProducts();
      if (draft.id === product.id) setDraft(blankProduct());
      setMessage("Product archived.");
    } catch (cause) { setError(cause.message); }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-brand"><ArrowLeft size={15}/> CROPPTECH <span>COMMERCE STORE</span></Link>
        <div><Link href="/shop">VIEW STORE ↗</Link></div>
      </header>
      <div className="admin-wrap admin-catalogue-wrap">
        <div className="admin-heading">
          <p className="eyebrow">STORE MANAGEMENT / CATALOGUE</p>
          <h1>Product <em>catalogue.</em></h1>
          <p>Create products, organise variants and stock, and manage the Cloudinary image gallery. Products stay unpublished until you choose to activate them.</p>
        </div>

        <div className="admin-catalogue-toolbar">
          <label className="admin-catalogue-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter products">
            <option value="ALL">All products</option><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option>
          </select>
          <button type="button" className="admin-primary-button" onClick={startNew}><Plus size={16}/> NEW PRODUCT</button>
        </div>

        <div className="admin-catalogue-layout">
          <section className="admin-catalogue-list">
            <div className="admin-section-heading"><h2>Catalogue <span>({visibleProducts.length})</span></h2></div>
            {loading ? <p className="admin-muted">Loading catalogue…</p> : visibleProducts.length === 0 ? <p className="admin-muted">No products match this filter.</p> : visibleProducts.map((product) => (
              <article className={"admin-catalogue-item " + (draft.id === product.id ? "selected" : "")} key={product.id}>
                <button type="button" className="admin-catalogue-item-main" onClick={() => editProduct(product)}>
                  <span className="admin-catalogue-thumb">{product.images[0] ? <Image src={product.images[0].secureUrl} alt="" fill sizes="64px" /> : <ImagePlus size={20}/>}</span>
                  <span className="admin-catalogue-item-copy"><strong>{product.name}</strong><small>{product.category} · {product.variants.length} variant(s)</small><small>{product.images.length} image(s) · {product.status}</small></span>
                </button>
                <button type="button" className="admin-catalogue-edit" onClick={() => editProduct(product)}>EDIT</button>
              </article>
            ))}
          </section>

          <form className="admin-product-editor" onSubmit={saveProduct}>
            <div className="admin-section-heading"><div><p className="eyebrow">{draft.id ? "EDIT PRODUCT" : "NEW PRODUCT"}</p><h2>{draft.name || "Product details"}</h2></div><span className={"admin-status-pill " + draft.status.toLowerCase()}>{draft.status}</span></div>
            <div className="admin-product-fields">
              <label>Product name<input required maxLength={160} value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Relaxed linen shirt"/></label>
              <label>URL slug<input value={draft.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Generated from product name if blank"/></label>
              <label>Collection<select value={draft.category} onChange={(event) => update("category", event.target.value)}><option value="MEN">Men</option><option value="WOMEN">Women</option><option value="UNISEX">Unisex</option></select></label>
              <label>Publication status<select value={draft.status} onChange={(event) => update("status", event.target.value)}><option value="DRAFT">Draft — not for sale</option><option value="ACTIVE">Active — publish</option><option value="ARCHIVED">Archived</option></select></label>
              <label className="admin-product-description">Description<textarea required rows={4} maxLength={5000} value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the actual garment, fabric, fit and details."/></label>
              <label className="admin-feature-toggle"><input type="checkbox" checked={draft.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)}/> Feature this product on the storefront</label>
            </div>

            <div className="admin-editor-section">
              <div className="admin-editor-section-head"><div><p className="eyebrow">PRODUCT OPTIONS</p><h3>Sizes, colours, prices & stock</h3></div><button type="button" className="admin-outline-button" onClick={addVariant}><Plus size={14}/> ADD VARIANT</button></div>
              {draft.variants.length === 0 && <p className="admin-muted">No variants yet. Add each size and colour combination with its own SKU, price and stock quantity.</p>}
              {draft.variants.map((variant, index) => (
                <div className="admin-variant-row" key={variant.id || "new-" + index}>
                  <label>SKU<input required value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} placeholder="CT-M-SAND-M"/></label>
                  <label>Size<input required value={variant.size} onChange={(event) => updateVariant(index, "size", event.target.value)} placeholder="M"/></label>
                  <label>Colour<input required value={variant.colour} onChange={(event) => updateVariant(index, "colour", event.target.value)} placeholder="Natural"/></label>
                  <label>Price (₦)<input required type="number" min="1" step="0.01" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} placeholder="40000"/></label>
                  <label>Stock<input required type="number" min="0" step="1" value={variant.stockQuantity} onChange={(event) => updateVariant(index, "stockQuantity", event.target.value)}/></label>
                  <button type="button" className="admin-remove-variant" aria-label="Remove variant from this edit" onClick={() => removeVariant(index)}><Trash2 size={15}/></button>
                </div>
              ))}
              <p className="admin-muted">Removing a saved variant from this form does not delete it from order history or the database. Existing variants remain unchanged unless edited.</p>
            </div>

            <div className="admin-editor-section">
              <div className="admin-editor-section-head"><div><p className="eyebrow">CLOUDINARY</p><h3>Product image gallery</h3></div><label className="admin-outline-button admin-upload-label"><ImagePlus size={14}/> {uploading ? "UPLOADING…" : "UPLOAD IMAGES"}<input type="file" accept="image/*" multiple disabled={uploading} onChange={uploadImages}/></label></div>
              <p className="admin-muted">Upload up to 10 MB per image. Add different angles of the same garment to this gallery. The first image is used as the primary image.</p>
              <div className="admin-product-image-grid">
                {draft.images.map((image, index) => <div className="admin-product-image-tile" key={image.cloudinaryPublicId}>
                  <Image src={image.secureUrl} alt={image.altText || "Product gallery image"} fill sizes="120px"/>
                  <span>{index === 0 ? "PRIMARY" : "GALLERY " + (index + 1)}</span>
                  <button type="button" aria-label="Remove image from this draft" onClick={() => update("images", draft.images.filter((_, i) => i !== index))}><Trash2 size={13}/></button>
                </div>)}
                {!draft.images.length && <div className="admin-gallery-empty"><ImagePlus size={22}/><span>No product images added</span></div>}
              </div>
            </div>

            {error && <p className="admin-form-error" role="alert">{error}</p>}
            {message && <p className="admin-form-success" role="status">{message}</p>}
            <div className="admin-editor-actions"><button type="submit" className="admin-primary-button" disabled={saving || uploading}><Save size={15}/>{saving ? "SAVING…" : "SAVE PRODUCT"}</button>{draft.id && <button type="button" className="admin-outline-button" onClick={() => archiveProduct(products.find((product) => product.id === draft.id))}>ARCHIVE</button>}</div>
          </form>
        </div>
      </div>
    </main>
  );
}
