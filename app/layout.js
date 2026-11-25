import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import { CurrencyProvider } from "../components/CurrencyProvider";
import MobileBottomNav from "../components/MobileBottomNav";
import { Music2 } from "lucide-react";
import CustomerThemeProvider from "../components/CustomerThemeProvider";

export const metadata = {
  title: "CroppTech Commerce Store | Business Moves With Commerce",
  description:
    "Discover considered linen wear for men and women at CroppTech Commerce Store.",
  applicationName: "CroppTech Commerce Store",
  icons: { icon: "/brand/cropplogo.jpeg" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><CustomerThemeProvider><CartProvider><CurrencyProvider>{children}<a className="floating-tiktok-follow" href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Follow CroppTech Commerce on TikTok" title="Follow CroppTech Commerce on TikTok"><Music2 size={21} strokeWidth={2}/><span>TIKTOK</span></a><MobileBottomNav /></CurrencyProvider></CartProvider></CustomerThemeProvider></body>
    </html>
  );
}
