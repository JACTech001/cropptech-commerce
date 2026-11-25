"use client";

import { usePathname } from "next/navigation";
import { Music2 } from "lucide-react";

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
      <Music2 size={21} strokeWidth={2} />
    </a>
  );
}
