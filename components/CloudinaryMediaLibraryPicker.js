"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";

const MEDIA_LIBRARY_SCRIPT = "https://media-library.cloudinary.com/global/all.js";
let mediaLibraryPromise = null;

// Every homepage image picker shares one script load and one readiness result.
function loadCloudinaryMediaLibrary() {
  if (typeof window !== "undefined" && window.cloudinary?.openMediaLibrary) {
    return Promise.resolve();
  }
  if (mediaLibraryPromise) return mediaLibraryPromise;

  mediaLibraryPromise = new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-cloudinary-media-library="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = MEDIA_LIBRARY_SCRIPT;
      script.async = true;
      script.dataset.cloudinaryMediaLibrary = "true";
      document.head.appendChild(script);
    }

    const finish = () => {
      if (window.cloudinary?.openMediaLibrary) resolve();
      else {
        mediaLibraryPromise = null;
        reject(new Error("Cloudinary Media Library could not initialise. Please refresh and try again."));
      }
    };
    if (window.cloudinary?.openMediaLibrary) {
      resolve();
    } else {
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", () => {
        mediaLibraryPromise = null;
        reject(new Error("Cloudinary Media Library could not be loaded. Check your internet connection and try again."));
      }, { once: true });
    }
  });

  return mediaLibraryPromise;
}

export default function CloudinaryMediaLibraryPicker({ onSelect, disabled = false, remaining = 30, onError }) {
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.cloudinary?.openMediaLibrary)
  );
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let active = true;
    loadCloudinaryMediaLibrary()
      .then(() => { if (active) setScriptReady(true); })
      .catch((cause) => { if (active) onError?.(cause.message); });
    return () => { active = false; };
  }, [onError]);

  async function openLibrary() {
    if (opening || disabled || remaining < 1) return;
    setOpening(true);
    onError?.("");
    try {
      await loadCloudinaryMediaLibrary();
      setScriptReady(true);
      const response = await fetch("/api/admin/products/upload-signature", {
        method: "POST",
        cache: "no-store",
      });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Cloudinary Media Library is not available.");

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
                altText: asset.display_name || asset.public_id.split("/").pop() || "CroppTech homepage image",
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
    <button
      type="button"
      className="admin-outline-button"
      onClick={openLibrary}
      disabled={disabled || opening || !scriptReady || remaining < 1}
      title={remaining < 1 ? "This position has reached its image limit." : "Browse images already stored in Cloudinary"}
    >
      <Images size={14} />
      {opening ? "OPENING CLOUDINARY…" : scriptReady ? "CHOOSE FROM CLOUDINARY" : "LOADING CLOUDINARY…"}
    </button>
  );
}
