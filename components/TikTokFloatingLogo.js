"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const TIKTOK_URL = "https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc";

export default function TikTokFloatingLogo() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    const showBriefly = () => {
      window.clearTimeout(timer.current);
      setVisible(true);
      timer.current = window.setTimeout(() => setVisible(false), 15000);
    };

    showBriefly();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") showBriefly();
    };
    window.addEventListener("pageshow", showBriefly);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("pageshow", showBriefly);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <a
      className="tiktok-floating-logo"
      href={TIKTOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit CroppTech Commerce on TikTok"
      title="Follow CROPPTECH on TikTok"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M16.7 2.5c.3 2.4 1.7 4 4.1 4.2v3.2a8.2 8.2 0 0 1-4.1-1.2v6.5a6.2 6.2 0 1 1-6.2-6.2c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.8 2.8V2.5h3.2Z" fill="currentColor"/>
        <path d="M14.9 2.5h1.8c.3 2.4 1.7 4 4.1 4.2v1.8c-3.4-.2-5.6-2.2-5.9-6Z" fill="#25F4EE"/>
        <path d="M8.8 11.2v1.8a3 3 0 0 0-1.1 5.5 3 3 0 0 1 1.1-7.3Z" fill="#FE2C55"/>
      </svg>
    </a>
  );
}
