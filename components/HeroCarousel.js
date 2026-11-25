"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_HERO = "https://stenstroms.com/pub_docs/files/ss26_men_linne-1-1.jpg";

export default function HeroCarousel({ homepageMedia = {} }) {
  const slides = useMemo(() => {
    const primary = homepageMedia.hero_main || {};
    const extras = Array.isArray(homepageMedia.hero_slides)
      ? homepageMedia.hero_slides.filter((slide) => slide?.url && slide.active !== false)
      : [];
    return [primary, ...extras];
  }, [homepageMedia]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  const activeSlide = slides[activeIndex] || slides[0] || {};
  const desktopImage = activeSlide.desktopUrl || activeSlide.url || FALLBACK_HERO;
  const mobileImage = activeSlide.url || activeSlide.desktopUrl || FALLBACK_HERO;
  const imageStyle = {
    "--hero-image-desktop": `url("${desktopImage}")`,
    "--hero-image-mobile": `url("${mobileImage}")`,
    "--hero-image-position": activeSlide.positionDesktop || homepageMedia.hero_main?.positionDesktop || "center 38%",
    "--hero-image-position-mobile": activeSlide.positionMobile || homepageMedia.hero_main?.positionMobile || "58% center",
  };

  function goTo(index) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div key={activeIndex} className="hero-image hero-image-carousel" style={imageStyle} />
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow hero-eyebrow">CROPPTECH COMMERCE — THE LINEN SHIRT EDIT</p>
        <h1>The linen fashion<br /><em>starts here.</em></h1>
        <p className="hero-copy">
          Discover breathable linen wear for men and women. Explore relaxed shirts, considered sets and effortless pieces made for everyday living.
        </p>
        <Link className="light-button" href="/shop?collection=linen">
          SHOP LINEN WEAR <ArrowUpRight size={16} />
        </Link>
      </div>
      <p className="hero-side-note">A NEW PERSPECTIVE ON EVERYDAY STYLE</p>
      {slides.length > 1 && <>
        <div className="hero-carousel-controls" aria-label="Hero image navigation">
          <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Previous hero image"><ChevronLeft size={19} /></button>
          <div className="hero-carousel-dots">
            {slides.map((slide, index) => <button key={slide.id || index} type="button" className={index === activeIndex ? "active" : ""} onClick={() => goTo(index)} aria-label={`Show hero image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}
          </div>
          <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Next hero image"><ChevronRight size={19} /></button>
        </div>
        <span className="hero-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      </>}
    </section>
  );
}
