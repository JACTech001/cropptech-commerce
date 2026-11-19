import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import { CurrencyProvider } from "../components/CurrencyProvider";

export const metadata = {
  title: "CroppTech Commerce Store | Business Moves With Commerce",
  description:
    "Discover considered everyday fashion for men and women, led by the CroppTech linen collection.",
  applicationName: "CroppTech Commerce Store",
  icons: { icon: "/brand/cropplogo.jpeg" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><CartProvider><CurrencyProvider>{children}</CurrencyProvider></CartProvider></body>
    </html>
  );
}
