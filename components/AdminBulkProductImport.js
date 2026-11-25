"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, ImagePlus, Plus, Save, Trash2, UploadCloud } from "lucide-react";
import CloudinaryMediaLibraryPicker from "./CloudinaryMediaLibraryPicker";

const MAX_IMAGES = 120;
const newGroup = (number) => ({
  id: "bulk-group-" + number,
  name: "",
  description: "",
  category: "MEN",
  productType: "OTHER",
});
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminBulkProductImport() {
  const [groups, setGroups] = useState([newGroup(1)]);
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const grouped = useMemo(() => groups.map((group) => ({
    ...group,
    images: images.filter((image) => image.groupId === group.id),
  })), [groups, images]);

  function addCloudinaryImages(assets) {
    const known = new Set(images.map((image) => image.cloudinaryPublicId));
    const additions = assets
      .filter((asset) => !known.has(asset.cloudinaryPublicId))
      .slice(0, Math.max(0, MAX_IMAGES - images.length))
      .map((asset) => ({ ...asset, groupId: groups[0].id }));
    if (!additions.length) {
      setError("No new images were added. They may already be selected, or the 120-image import limit has been reached.");
      return;
    }
    setImages((current) => [...current, ...additions]);
    setError("");
    setMessage(additions.length + " image(s) added. Assign them to the correct product groups below.");
  }

  async function uploadFromComputer(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError("You can select up to 120 images per bulk import.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const signResponse = await fetch("/api/admin/products/upload-signature", { method: "POST", cache: "no-store" });
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
        form.append("allowed_formats", signed.allowed_formats);
        form.append("signature", signed.signature);
        const response = await fetch("https://api.cloudinary.com/v1_1/" + encodeURIComponent(signed.cloudName) + "/image/upload", { method: "POST", body: form });
        const asset = await response.json();
        if (!response.ok) throw new Error(asset.error?.message || "Cloudinary could not upload an image.");
        uploaded.push({
          cloudinaryPublicId: asset.public_id,
          secureUrl: asset.secure_url,
          altText: asset.original_filename || "CroppTech product image",
          width: asset.width,
          height: asset.height,
          format: asset.format,
          groupId: groups[0].id,
        });
      }
      setImages((current) => [...current, ...uploaded]);
      setMessage(uploaded.length + " image(s) uploaded. Assign them to product groups before saving.");
    } catch (cause) {
      setError(cause.message || "The selected images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function addGroup() {
    setGroups((current) => [...current, { ...newGroup(Date.now()), id: "bulk-group-" + Date.now() }]);
  }

  function updateGroup(id, key, value) {
    setGroups((current) => current.map((group) => group.id === id ? { ...group, [key]: value } : group));
  }

  function moveSelected(groupId) {
    if (!selected.length) return;
    setImages((current) => current.map((image) => selected.includes(image.cloudinaryPublicId) ? { ...image, groupId } : image));
    setSelected([]);
  }

  function removeGroup(groupId) {
    if (groups.length === 1) {
      setError("Keep at least one product group in the import.");
      return;
    }
    const fallback = groups.find((group) => group.id !== groupId);
    setImages((current) => current.map((image) => image.groupId === groupId ? { ...image, groupId: fallback.id } : image));
    setGroups((current) => current.filter((group) => group.id !== groupId));
  }

  function removeImage(publicId) {
    setImages((current) => current.filter((image) => image.cloudinaryPublicId !== publicId));
    setSelected((current) => current.filter((id) => id !== publicId));
  }

  async function saveDrafts() {
    const ready = grouped.filter((group) => group.name.trim() && group.description.trim() && group.images.length);
    if (!ready.length) {
      setError("Add a product name, description and at least one image to a product group before saving.");
      return;
    }
    const oversized = grouped.filter((group) => group.images.length > 30);
    if (oversized.length) {
      setError("Each product can have up to 30 images. Move some images into another product group.");
      return;
    }
    const incomplete = grouped.filter((group) => group.images.length && (!group.name.trim() || !group.description.trim()));
    if (incomplete.length) {
      setError("Complete the name and description for every group that contains images.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const saved = [];
    const savedGroupIds = [];
    const failed = [];
    for (const group of ready) {
      const payload = {
        name: group.name.trim(),
        slug: slugify(group.name.trim()),
        description: group.description.trim(),
        category: group.category,
        productType: group.productType,
        status: "DRAFT",
        isFeatured: false,
        variants: [],
        images: group.images.map((image, index) => ({
          cloudinaryPublicId: image.cloudinaryPublicId,
          secureUrl: image.secureUrl,
          altText: image.altText || group.name.trim(),
          width: image.width,
          height: image.height,
          format: image.format,
          role: index === 0 ? "primary" : "gallery",
          sortOrder: index,
        })),
      };
      try {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save this product.");
        saved.push(group.name.trim());
        savedGroupIds.push(group.id);
      } catch (cause) {
        failed.push(group.name.trim() + ": " + cause.message);
      }
    }

    setSaving(false);
    if (saved.length) {
      const savedIds = new Set(savedGroupIds);
      setImages((current) => current.filter((image) => !savedIds.has(image.groupId)));
      setGroups((current) => {
        const remaining = current.filter((group) => !savedIds.has(group.id));
        return remaining.length ? remaining : [newGroup(Date.now())];
      });
      setMessage(saved.length + " draft product(s) created successfully. " + (failed.length ? failed.length + " group(s) still need attention." : "You can now add variants and review them in the product catalogue."));
    }
    if (failed.length) setError(failed.join(" | "));

  }

  return (
    <main className="admin-page admin-bulk-import-page">
      <div className="admin-wrap">
        <div className="admin-heading">
          <p className="eyebrow">STORE MANAGEMENT / CATALOGUE / BULK IMPORT</p>
          <Link href="/admin/products" className="admin-bulk-back"><ArrowLeft size={15}/> BACK TO PRODUCT CATALOGUE</Link>
          <h1>Bulk product <em>import.</em></h1>
          <p>Select a batch of product photos, organise them into separate products, add each product&apos;s details, then create draft listings in one pass.</p>
        </div>

        <section className="admin-bulk-source">
          <div>
            <p className="eyebrow">STEP 01 / IMAGE SELECTION</p>
            <h2>Bring in your product photos</h2>
            <p>Choose existing assets from Cloudinary or upload from your computer. Up to 120 images per batch; each product can contain up to 30 gallery images.</p>
          </div>
          <div className="admin-bulk-source-actions">
            <CloudinaryMediaLibraryPicker onSelect={addCloudinaryImages} onError={setError} disabled={uploading || saving} remaining={MAX_IMAGES - images.length}/>
            <label className="admin-outline-button admin-upload-label"><UploadCloud size={15}/> {uploading ? "UPLOADING…" : "UPLOAD FROM COMPUTER"}<input type="file" accept="image/*" multiple disabled={uploading || saving || images.length >= MAX_IMAGES} onChange={uploadFromComputer}/></label>
          </div>
          <div className="admin-bulk-count"><strong>{images.length}</strong><span>IMAGE{images.length === 1 ? "" : "S"} SELECTED</span><small>120 image batch limit</small></div>
        </section>

        <section className="admin-bulk-assignment">
          <div className="admin-bulk-section-heading">
            <div><p className="eyebrow">STEP 02 / IMAGE ORGANISATION</p><h2>Assign photos to products</h2><p>New images start in Product 1. Select images and move them into the right group.</p></div>
            <button type="button" className="admin-outline-button" onClick={addGroup} disabled={saving}><Plus size={15}/> ADD PRODUCT GROUP</button>
          </div>
          {images.length > 0 && (
            <div className="admin-bulk-movebar">
              <span>{selected.length} image(s) selected</span>
              <select aria-label="Move selected images to product group" defaultValue="" onChange={(event) => { if (event.target.value) moveSelected(event.target.value); event.target.value = ""; }} disabled={!selected.length}>
                <option value="">Move selected to…</option>
                {groups.map((group, index) => <option key={group.id} value={group.id}>{group.name.trim() || "Product " + (index + 1)}</option>)}
              </select>
              <button type="button" onClick={() => setSelected(images.map((image) => image.cloudinaryPublicId))}>SELECT ALL</button>
              <button type="button" onClick={() => setSelected([])}>CLEAR</button>
            </div>
          )}
          {images.length === 0 ? <div className="admin-bulk-empty"><ImagePlus size={25}/><strong>No images selected yet</strong><span>Choose images above to begin grouping your products.</span></div> : (
            <div className="admin-bulk-image-grid">
              {images.map((image) => (
                <label className={"admin-bulk-image " + (selected.includes(image.cloudinaryPublicId) ? "is-selected" : "")} key={image.cloudinaryPublicId}>
                  <Image src={image.secureUrl} alt={image.altText || "Selected product image"} fill sizes="(max-width: 700px) 30vw, 150px"/>
                  <input type="checkbox" checked={selected.includes(image.cloudinaryPublicId)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, image.cloudinaryPublicId] : current.filter((id) => id !== image.cloudinaryPublicId))}/>
                  <span className="admin-bulk-image-group">{groups.findIndex((group) => group.id === image.groupId) + 1}</span>
                  <button type="button" aria-label="Remove selected image" onClick={(event) => { event.preventDefault(); removeImage(image.cloudinaryPublicId); }}><Trash2 size={13}/></button>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="admin-bulk-groups">
          <div className="admin-bulk-section-heading"><div><p className="eyebrow">STEP 03 / PRODUCT DETAILS</p><h2>Prepare each product listing</h2><p>Each group becomes its own unpublished draft product. Add sizes, colours, prices and stock later in the catalogue editor.</p></div></div>
          <div className="admin-bulk-group-list">
            {grouped.map((group, index) => (
              <article className="admin-bulk-group-card" key={group.id}>
                <header><div><span>PRODUCT GROUP {String(index + 1).padStart(2, "0")}</span><strong>{group.images.length} image(s)</strong></div>{groups.length > 1 && <button type="button" onClick={() => removeGroup(group.id)} disabled={saving} aria-label={"Remove product group " + (index + 1)}><Trash2 size={15}/></button>}</header>
                <div className="admin-bulk-fields">
                  <label>Product name<input value={group.name} onChange={(event) => updateGroup(group.id, "name", event.target.value)} placeholder="e.g. Men's relaxed linen shirt" maxLength={160}/></label>
                  <label>Collection<select value={group.category} onChange={(event) => updateGroup(group.id, "category", event.target.value)}><option value="MEN">Men</option><option value="WOMEN">Women</option><option value="UNISEX">Unisex</option></select></label>
                  <label>Garment type<select value={group.productType} onChange={(event) => updateGroup(group.id, "productType", event.target.value)}><option value="SHIRTS">Shirts</option><option value="TROUSERS">Trousers</option><option value="SHORTS">Shorts</option><option value="SETS">Co-ord sets</option><option value="DRESSES">Dresses</option><option value="SKIRTS">Skirts</option><option value="OTHER">Other</option></select></label>
                  <label className="admin-bulk-description">Description<textarea value={group.description} onChange={(event) => updateGroup(group.id, "description", event.target.value)} rows={3} maxLength={5000} placeholder="Describe the garment, fabric, fit, colour and distinctive details."/></label>
                </div>
                <div className="admin-bulk-group-preview">{group.images.slice(0, 6).map((image) => <span key={image.cloudinaryPublicId}><Image src={image.secureUrl} alt="" fill sizes="54px"/></span>)}{group.images.length > 6 && <small>+{group.images.length - 6} more</small>}{!group.images.length && <small>No images assigned to this group yet.</small>}</div>
              </article>
            ))}
          </div>
        </section>

        {error && <p className="admin-form-error" role="alert">{error}</p>}
        {message && <p className="admin-form-success" role="status">{message}</p>}
        <div className="admin-bulk-footer"><span>All products are created as <b>DRAFT</b>. Nothing is published or available for purchase automatically.</span><button type="button" className="admin-primary-button" onClick={saveDrafts} disabled={saving || uploading || !images.length}><Save size={15}/>{saving ? "CREATING DRAFTS…" : "CREATE DRAFT PRODUCTS"}<ArrowRightLeft size={14}/></button></div>
      </div>
    </main>
  );
}
