import StorePageShell from "../../components/StorePageShell";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Our Story | CroppTech Commerce Store", description: "The story and point of view behind CroppTech Commerce Store, a linen-wear destination for men and women." };

export default function AboutPage() {
  return (
    <StorePageShell eyebrow="OUR STORY / CROPPTECH COMMERCE STORE" title={<>A more considered<br /><em>way to wear linen.</em></>} intro="CroppTech Commerce Store is a linen-wear destination for men and women, built around natural texture, relaxed silhouettes and everyday ease.">
      <div className="info-columns">
        <article><p className="eyebrow">WHAT WE BELIEVE</p><h2>Good style should feel effortless.</h2><p>We believe clothing can be comfortable, versatile and thoughtfully chosen without becoming complicated. Linen&apos;s natural character and easy movement sit at the heart of our point of view.</p></article>
        <article><p className="eyebrow">OUR COLLECTION</p><h2>Linen wear, and only linen wear.</h2><p>Explore shirts, trousers, shorts, coordinated sets, dresses, skirts and relaxed layers for men and women. Every collection on the store is focused on linen garments.</p></article>
      </div>
      <div className="info-callout"><h2>Find your linen edit.</h2><Link href="/shop?collection=linen" className="text-link">EXPLORE LINEN WEAR <ArrowUpRight size={16} /></Link></div>
    </StorePageShell>
  );
}
