import "./globals.css";

export const metadata = {
  title: "CroppTech Commerce | Business Moves With Commerce",
  description:
    "Discover considered everyday fashion for men and women, led by the CroppTech linen collection.",
  applicationName: "CroppTech Commerce",
  icons: { icon: "/brand/cropplogo.jpeg", shortcut: "/brand/cropplogo.jpeg", apple: "/brand/cropplogo.jpeg" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
