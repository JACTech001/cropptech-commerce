"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, LoaderCircle, RotateCcw, Save, Trash2, Upload, WandSparkles } from "lucide-react";
import CloudinaryMediaLibraryPicker from "./CloudinaryMediaLibraryPicker";

const SLOTS = [
  { key: "hero_main", title: "Main homepage hero", location: "The large first image at the very top of the homepage. Adjust its focal point separately for desktop and mobile.", ratio: "Responsive framing", fallback: "Current linen campaign hero" },
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
  const [adaptingHero, setAdaptingHero] = useState(false);
  const [adaptationMode, setAdaptationMode] = useState("blur");
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
    setMedia((current) => ({ ...current, [key]: { ...current[key], url: asset.secureUrl, publicId: asset.cloudinaryPublicId, altText: asset.altText || "", width: asset.width || 0, height: asset.height || 0, ...(key === "hero_main" ? { desktopUrl: "", desktopPublicId: "", desktopWidth: 0, desktopHeight: 0 } : {}) } }));
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

  async function createHeroDesktopAdaptation() {
    const source = media.hero_main;
    if (!source?.url) return;
    setAdaptingHero(true); setError(""); setNotice("");
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new window.Image();
        element.crossOrigin = "anonymous";
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("The source image could not be loaded for adaptation. Try reselecting it from the Cloudinary library."));
        element.src = source.url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1600; canvas.height = 900;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create the image workspace.");
      const coverScale = Math.max(canvas.width / image.width, canvas.height / image.height);
      const coverWidth = image.width * coverScale, coverHeight = image.height * coverScale;
      const coverX = (canvas.width - coverWidth) / 2, coverY = (canvas.height - coverHeight) / 2;
      if (adaptationMode === "blur") {
        context.save(); context.filter = "blur(46px) brightness(0.78)";
        context.drawImage(image, coverX - 60, coverY - 60, coverWidth + 120, coverHeight + 120);
        context.restore();
        context.fillStyle = "rgba(20, 17, 15, 0.10)";
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (adaptationMode === "warm") { gradient.addColorStop(0, "#d5c2ad"); gradient.addColorStop(1, "#f1e9df"); }
        else if (adaptationMode === "dark") { gradient.addColorStop(0, "#34302d"); gradient.addColorStop(1, "#74695e"); }
        else { gradient.addColorStop(0, "#eeeae4"); gradient.addColorStop(1, "#d9d4cc"); }
        context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
      }
      const containScale = Math.min(1450 / image.width, 860 / image.height);
      const imageWidth = image.width * containScale, imageHeight = image.height * containScale;
      const imageX = (canvas.width - imageWidth) / 2, imageY = (canvas.height - imageHeight) / 2;
      context.save(); context.shadowColor = "rgba(0, 0, 0, 0.18)"; context.shadowBlur = 28; context.shadowOffsetY = 8;
      context.drawImage(image, imageX, imageY, imageWidth, imageHeight); context.restore();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("The adapted image could not be exported. Please try again.");
      const signatureResponse = await fetch("/api/admin/products/upload-signature", { method: "POST", cache: "no-store" });
      const config = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(config.error || "Cloudinary upload is not available.");
      const form = new FormData();
      form.append("file", blob, "cropptech-hero-desktop.jpg");
      form.append("api_key", config.apiKey); form.append("timestamp", String(config.timestamp));
      form.append("folder", config.folder); form.append("allowed_formats", config.allowed_formats);
      form.append("signature", config.signature);
      const uploadResponse = await fetch("https://api.cloudinary.com/v1_1/" + config.cloudName + "/image/upload", { method: "POST", body: form });
      const asset = await uploadResponse.json();
      if (!uploadResponse.ok || !asset.secure_url || !asset.public_id) throw new Error(asset.error?.message || "Cloudinary could not upload the adapted desktop image.");
      setMedia((current) => ({ ...current, hero_main: { ...current.hero_main, desktopUrl: asset.secure_url, desktopPublicId: asset.public_id, desktopWidth: asset.width || 1600, desktopHeight: asset.height || 900 } }));
      setNotice("Desktop adaptation created and uploaded. Review both previews, then save changes to apply it to the storefront.");
    } catch (cause) { setError(cause.message || "The desktop image could not be adapted."); }
    finally { setAdaptingHero(false); }
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
              <div className="admin-home-media-preview" style={slot.key === "hero_main" ? { aspectRatio: "16 / 9" } : item?.width > 0 && item?.height > 0 ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}>
                {item?.url ? <Image src={item.url} alt={item.altText || slot.title} fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: slot.key === "hero_main" ? (item.positionDesktop || "center center") : "center" }} unoptimized /> : <div className="admin-home-media-empty"><ImagePlus size={25}/><span>Using current storefront image</span><small>{slot.fallback}</small></div>}
              </div>
              {slot.key === "hero_main" && item?.url && <div className="admin-home-media-position-controls">
                <label>Desktop image position<select value={item.positionDesktop || "center center"} onChange={(event) => setMedia((current) => ({ ...current, hero_main: { ...current.hero_main, positionDesktop: event.target.value } }))}><option value="left top">Top left</option><option value="center top">Top centre</option><option value="right top">Top right</option><option value="left center">Middle left</option><option value="center center">Centre</option><option value="right center">Middle right</option><option value="left bottom">Bottom left</option><option value="center bottom">Bottom centre</option><option value="right bottom">Bottom right</option></select></label>
                <label>Mobile image position<select value={item.positionMobile || "58% center"} onChange={(event) => setMedia((current) => ({ ...current, hero_main: { ...current.hero_main, positionMobile: event.target.value } }))}><option value="left top">Top left</option><option value="center top">Top centre</option><option value="right top">Top right</option><option value="left center">Middle left</option><option value="center center">Centre</option><option value="right center">Middle right</option><option value="left bottom">Bottom left</option><option value="center bottom">Bottom centre</option><option value="right bottom">Bottom right</option><option value="58% center">Original mobile position</option></select></label>
                <p>These controls move the visible area of the same image. They do not stretch it or add side backgrounds.</p>
              </div>}
              {slot.key === "hero_main" && item?.url && <div className="admin-home-ai-tool">
                <div className="admin-home-ai-heading"><div><strong>Desktop image adaptation</strong><span>Create a landscape version without cropping the original portrait.</span></div><WandSparkles size={18}/></div>
                <label className="admin-home-ai-mode">Background treatment
                  <select value={adaptationMode} onChange={(event) => setAdaptationMode(event.target.value)} disabled={adaptingHero}>
                    <option value="blur">Blurred extension of the photo</option><option value="warm">Warm linen gradient</option><option value="light">Soft neutral gradient</option><option value="dark">Deep neutral gradient</option>
                  </select>
                </label>
                <button type="button" className="admin-primary-button admin-home-ai-button" onClick={createHeroDesktopAdaptation} disabled={adaptingHero || uploadingKey !== ""}>
                  {adaptingHero ? <LoaderCircle size={15} className="admin-spin"/> : <WandSparkles size={15}/>}
                  {adaptingHero ? "CREATING DESKTOP VERSION…" : item.desktopUrl ? "RECREATE DESKTOP VERSION" : "CREATE DESKTOP VERSION"}
                </button>
                {item.desktopUrl && <div className="admin-home-ai-previews">
                  <div><span>DESKTOP · 16:9</span><div className="admin-home-ai-preview landscape"><Image src={item.desktopUrl} alt="Adapted landscape desktop hero preview" fill sizes="(max-width: 700px) 100vw, 40vw" unoptimized /></div></div>
                  <div><span>MOBILE · ORIGINAL</span><div className="admin-home-ai-preview portrait"><Image src={item.url} alt="Original portrait mobile hero preview" fill sizes="(max-width: 700px) 100vw, 20vw" unoptimized /></div></div>
                </div>}
                <p className="admin-home-ai-note">Upload a clear, high-resolution image, then create and review its desktop version here; your original image remains available for mobile.</p>
              </div>}
              {item?.url && <><div className="admin-home-media-current"><Check size={13}/> Custom image selected</div></>}
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
