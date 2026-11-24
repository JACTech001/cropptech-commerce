"use client";

import { useState } from "react";
import Script from "next/script";
import { Images } from "lucide-react";

const MEDIA_LIBRARY_SCRIPT = "https://media-library.cloudinary.com/global/all.js";

export default function CloudinaryMediaLibraryPicker({ onSelect, disabled = false, remaining = 30, onError }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [opening, setOpening] = useState(false);

  async function openLibrary() {
    if (opening || disabled || remaining < 1) return;
    setOpening(true);
    onError?.("");
    try {
      const response = await fetch("/api/admin/products/upload-signature", {
        method: "POST",
        cache: "no-store",
      });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Cloudinary Media Library is not available.");
      if (!window.cloudinary?.openMediaLibrary) {
        throw new Error("The Cloudinary Media Library has not finished loading. Please try again.");
      }

      window.cloudinary.openMediaLibrary(
        {
          cloud_name: config.cloudName,
          api_key: config.apiKey,
          folder: { path: config.folder, resource_type: "image" },
          multiple: true,
          max_files: Math.min(remaining, 30),
          insert_caption: "ADD SELECTED IMAGES",
        },
        {
          insertHandler: (data) => {
            const assets = (data?.assets || [])
              .filter((asset) => asset.resource_type === "image" && asset.secure_url && asset.public_id)
              .map((asset) => ({
                cloudinaryPublicId: asset.public_id,
                secureUrl: asset.secure_url,
                altText: asset.display_name || asset.public_id.split("/").pop() || "CroppTech product image",
                width: asset.width,
                height: asset.height,
                format: asset.format,
              }));
            if (!assets.length) {
              onError?.("No supported images were selected from Cloudinary.");
              return;
            }
            onSelect(assets);
          },
        }
      );
    } catch (cause) {
      onError?.(cause.message || "Could not open Cloudinary Media Library.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <>
      <Script
        src={MEDIA_LIBRARY_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => onError?.("Cloudinary Media Library could not be loaded. Check your internet connection and try again.")}
      />
      <button
        type="button"
        className="admin-outline-button"
        onClick={openLibrary}
        disabled={disabled || opening || remaining < 1}
        title={remaining < 1 ? "This product already has the maximum of 30 images." : "Browse images already stored in Cloudinary"}
      >
        <Images size={14} />
        {opening ? "OPENING CLOUDINARY…" : scriptReady ? "CHOOSE FROM CLOUDINARY" : "LOAD CLOUDINARY LIBRARY"}
      </button>
    </>
  );
}
