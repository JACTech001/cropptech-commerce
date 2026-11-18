import StorePageShell from "../../components/StorePageShell";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Our Story | CroppTech Commerce Store" };

export default function AboutPage() {
  return (
    <StorePageShell eyebrow="OUR STORY / CROPPTECH COMMERCE STORE" title={<>Style, with room<br /><em>to be yourself.</em></>} intro="A considered fashion store bringing together relaxed linen pieces and everyday clothing for men and women.">
      <div className="info-columns">
        <article><p className="eyebrow">WHAT WE BELIEVE</p><h2>Good style should feel effortless.</h2><p>CroppTech Commerce Store is built around versatile clothing, thoughtful style choices and pieces that fit naturally into everyday life.</p></article>
        <article><p className="eyebrow">OUR COLLECTIONS</p><h2>Linen is the starting point, not the limit.</h2><p>Explore a shared linen collection for men and women, alongside separate edits for each. The wider store is designed to make room for more everyday wardrobe essentials.</p></article>
      </div>
      <div className="info-callout"><h2>Find your everyday edit.</h2><Link href="/shop" className="text-link">EXPLORE THE STORE <ArrowUpRight size={16} /></Link></div>
    </StorePageShell>
  );
}
