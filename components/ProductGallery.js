"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name, tag }) {
  const [active, setActive] = useState(0);
  const selected = images[active] || images[0];
  if (!selected) return null;

  return (
    <div className="product-gallery">
      <div className="product-detail-image product-gallery-main">
        <Image src={selected.secureUrl} alt={selected.altText || name} fill priority sizes="(max-width: 760px) 100vw, 55vw" style={{ objectFit: "cover" }} />
        <span>{tag}</span>
      </div>
      {images.length > 1 && <div className="product-gallery-thumbnails" aria-label="Product gallery">
        {images.map((image, index) => <button type="button" key={image.id || image.secureUrl} className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={"View product image " + (index + 1)} aria-pressed={active === index}>
          <Image src={image.secureUrl} alt={image.altText || name + " view " + (index + 1)} fill sizes="90px" />
        </button>)}
      </div>}
    </div>
  );
}
