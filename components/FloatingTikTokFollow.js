"use client";

import { usePathname } from "next/navigation";

export default function FloatingTikTokFollow() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/checkout")) return null;

  return (
    <a
      className="floating-tiktok-follow"
      href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow CroppTech Commerce on TikTok"
      title="Follow CroppTech Commerce on TikTok"
    >
      <span className="floating-tiktok-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" aria-label="TikTok">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.36V2h-3.2v13.67a2.9 2.9 0 1 1-2.9-2.9c.3 0 .59.05.87.14V9.64a6.1 6.1 0 1 0 5.23 6.03V8.7a8 8 0 0 0 4.7 1.5V7a4.8 4.8 0 0 1-.93-.31Z" fill="#25F4EE" transform="translate(-1.15 0)" />
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.36V2h-3.2v13.67a2.9 2.9 0 1 1-2.9-2.9c.3 0 .59.05.87.14V9.64a6.1 6.1 0 1 0 5.23 6.03V8.7a8 8 0 0 0 4.7 1.5V7a4.8 4.8 0 0 1-.93-.31Z" fill="#FE2C55" transform="translate(1.15 0)" />
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.36V2h-3.2v13.67a2.9 2.9 0 1 1-2.9-2.9c.3 0 .59.05.87.14V9.64a6.1 6.1 0 1 0 5.23 6.03V8.7a8 8 0 0 0 4.7 1.5V7a4.8 4.8 0 0 1-.93-.31Z" fill="#000000" /> 
        </svg>
      </span>
      <span className="floating-tiktok-label">Follow us<br />on TikTok</span>
    </a>
  );
}
