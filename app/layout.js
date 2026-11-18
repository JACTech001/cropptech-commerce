import "./globals.css";

export const metadata = {
  title: "CroppTech Commerce Store | Business Moves With Commerce",
  description:
    "Discover considered everyday fashion for men and women, led by the CroppTech linen collection.",
  applicationName: "CroppTech Commerce Store",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
