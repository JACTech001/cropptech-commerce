import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import { CurrencyProvider } from "../components/CurrencyProvider";
import MobileBottomNav from "../components/MobileBottomNav";
import FloatingTikTokFollow from "../components/FloatingTikTokFollow";
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
      <body><CustomerThemeProvider><CartProvider><CurrencyProvider>{children}<FloatingTikTokFollow /><MobileBottomNav /></CurrencyProvider></CartProvider></CustomerThemeProvider></body>
    </html>
  );
}
