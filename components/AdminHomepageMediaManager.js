"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, LoaderCircle, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import CloudinaryMediaLibraryPicker from "./CloudinaryMediaLibraryPicker";

const SLOTS = [
  { key: "hero_main", title: "Main homepage hero", location: "The large first image at the very top of the homepage.", ratio: "Wide landscape", fallback: "Current linen campaign hero" },
  { key: "collection_men", title: "Men's collection card", location: "First image under “Two ways to wear your day”.", ratio: "Portrait / tall", fallback: "Men's Edit card" },
  { key: "collection_women", title: "Women's collection card", location: "Second image under “Two ways to wear your day”.", ratio: "Portrait / tall", fallback: "Women's Edit card" },
  { key: "linen_feature", title: "Linen feature image", location: "Large image beside “Made for the everyday”.", ratio: "Landscape", fallback: "Linen feature panel" },
  { key: "moodboard_men", title: "Moodboard – men's look", location: "First tall image in the “Natural texture” visual grid.", ratio: "Portrait / tall", fallback: "Men's linen inspiration" },
  { key: "moodboard_women", title: "Moodboard – women's look", location: "Second image in the “Natural texture” visual grid.", ratio: "Square / landscape", fallback: "Women's linen inspiration" },
  { key: "moodboard_details", title: "Moodboard – garment details", location: "Third image in the “Natural texture” visual grid.", ratio: "Square / landscape", fallback: "Linen garment details" },
  { key: "moodboard_everyday", title: "Moodboard – everyday style", location: "Fourth image in the “Natural texture” visual grid.", ratio: "Square / landscape", fallback: "Everyday linen style" },
  { key: "category_linen_wear", title: "Category – Linen Wear", location: "First card under “More ways to wear linen”.", ratio: "Portrait", fallback: "Linen Wear category card" },
  { key: "category_linen_sets", title: "Category – Linen Sets", location: "Second card under “More ways to wear linen”.", ratio: "Portrait", fallback: "Linen Sets category card" },
  { key: "category_linen_dresses", title: "Category – Linen Dresses", location: "Third card under “More ways to wear linen”.", ratio: "Portrait", fallback: "Linen Dresses category card" },
];

export default function AdminHomepageMediaManager() {
  const [media, setMedia] = useState({});
  const [savedMedia, setSavedMedia] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadingKey, setUploadingKey] = useState("");
  const fileRefs = useRef({});

  useEffect(() => {
    let active = true;
    fetch("/api/admin/homepage-media", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Store Front Studio content could not be loaded.");
        if (active) {
          setMedia(data.media || {});
          setSavedMedia(data.media || {});
        }
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function assignImage(key, asset) {
    setMedia((current) => ({ ...current, [key]: { url: asset.secureUrl, publicId: asset.cloudinaryPublicId, altText: asset.altText || "", width: asset.width || 0, height: asset.height || 0 } }));
    setNotice("");
    setError("");
  }

  async function uploadImage(key, file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    setUploadingKey(key);
    setError("");
    setNotice("");
    try {
      const signatureResponse = await fetch("/api/admin/products/upload-signature", { method: "POST", cache: "no-store" });
      const config = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(config.error || "Cloudinary upload is not available.");
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", config.apiKey);
      form.append("timestamp", String(config.timestamp));
      form.append("folder", config.folder);
      form.append("allowed_formats", config.allowed_formats);
      form.append("signature", config.signature);
      const uploadResponse = await fetch("https://api.cloudinary.com/v1_1/" + config.cloudName + "/image/upload", { method: "POST", body: form });
      const asset = await uploadResponse.json();
      if (!uploadResponse.ok || !asset.secure_url || !asset.public_id) throw new Error(asset.error?.message || "Cloudinary could not upload this image.");
      assignImage(key, { secureUrl: asset.secure_url, cloudinaryPublicId: asset.public_id, altText: file.name.replace(/\.[^.]+$/, ""), width: asset.width, height: asset.height });
      setNotice("Image uploaded. Save changes to publish it on the homepage.");
    } catch (cause) {
      setError(cause.message || "Image upload failed.");
    } finally {
      setUploadingKey("");
      if (fileRefs.current[key]) fileRefs.current[key].value = "";
    }
  }

  async function saveChanges() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/homepage-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Store Front Studio changes could not be saved.");
      setMedia(data.media || {});
      setSavedMedia(data.media || {});
      setNotice("Store Front Studio changes saved successfully.");
    } catch (cause) {
      setError(cause.message || "Could not save Store Front Studio changes.");
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    setMedia(savedMedia);
    setError("");
    setNotice("Unsaved changes have been discarded.");
  }

  const hasChanges = JSON.stringify(media) !== JSON.stringify(savedMedia);

  if (loading) return <div className="admin-home-media-loading"><LoaderCircle size={18} /> Loading Store Front Studio…</div>;

  return (
    <section className="admin-home-media">
      <div className="admin-home-media-toolbar">
        <div><strong>{Object.keys(media).length} of {SLOTS.length} image positions assigned</strong><span>Unassigned positions continue using the current website image.</span></div>
        <div className="admin-home-media-actions">
          <button type="button" className="admin-outline-button" onClick={resetChanges} disabled={!hasChanges || saving}><RotateCcw size={14}/> DISCARD</button>
          <button type="button" className="admin-primary-button" onClick={saveChanges} disabled={!hasChanges || saving}>{saving ? <LoaderCircle size={15} className="admin-spin"/> : <Save size={15}/>} SAVE CHANGES</button>
        </div>
      </div>

      {error && <p className="admin-home-media-message is-error" role="alert">{error}</p>}
      {notice && <p className="admin-home-media-message is-success" role="status"><Check size={15}/>{notice}</p>}

      <div className="admin-home-media-grid">
        {SLOTS.map((slot, index) => {
          const item = media[slot.key];
          return (
            <article className="admin-home-media-card" key={slot.key}>
              <div className="admin-home-media-card-heading"><span>{slot.title}</span><small>{slot.ratio}</small></div>
              <div className="admin-home-media-location">{slot.location}</div>
              <div className="admin-home-media-preview">
                {item?.url ? <Image src={item.url} alt={item.altText || slot.title} fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "contain" }} onLoad={(event) => { const image = event.currentTarget; if (!item.width || !item.height) setMedia((current) => ({ ...current, [slot.key]: { ...current[slot.key], width: image.naturalWidth, height: image.naturalHeight } })); }} unoptimized /> : <div className="admin-home-media-empty"><ImagePlus size={25}/><span>Using current storefront image</span><small>{slot.fallback}</small></div>}
              </div>
              {item?.url && <>
                <div className="admin-home-media-current"><Check size={13}/> Custom image selected</div>
                <div className="admin-home-media-fit"><span>NATURAL PROPORTIONS</span><small>The storefront image area will adapt to this image's original dimensions.</small></div>
              </>}
              <div className="admin-home-media-card-actions">
                <CloudinaryMediaLibraryPicker
                  remaining={1}
                  onSelect={(assets) => assignImage(slot.key, assets[0])}
                  onError={setError}
                />
                <button type="button" className="admin-outline-button" onClick={() => fileRefs.current[slot.key]?.click()} disabled={uploadingKey === slot.key}>
                  {uploadingKey === slot.key ? <LoaderCircle size={14} className="admin-spin"/> : <Upload size={14}/>} UPLOAD
                </button>
                <input ref={(node) => { fileRefs.current[slot.key] = node; }} type="file" accept="image/*" hidden onChange={(event) => uploadImage(slot.key, event.target.files?.[0])}/>
                {item?.url && <button type="button" className="admin-icon-button" onClick={() => setMedia((current) => { const next = { ...current }; delete next[slot.key]; return next; })} aria-label={"Use default image for " + slot.title} title="Use default storefront image"><Trash2 size={15}/></button>}
              </div>
            </article>
          );
        })}
      </div>
      <p className="admin-home-media-footnote">Images are stored in Cloudinary. Changes only appear on the customer storefront after you save them. This does not change product catalogue photos.</p>
    </section>
  );
}
