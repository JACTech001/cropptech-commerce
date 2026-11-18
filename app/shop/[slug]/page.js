import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import StorePageShell from "../../../components/StorePageShell";

const products = [
  { id: 1, name: "Relaxed Linen Shirt", category: "Shirts", audience: "Men", tone: "Natural", image: "https://images.pexels.com/photos/32825460/pexels-photo-32825460/free-photo-of-stylish-male-model-in-beige-linen-outfit-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true },
  { id: 2, name: "Everyday Linen Trousers", category: "Trousers", audience: "Men", tone: "Sand", image: "https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "EASY ESSENTIAL", isLinen: true },
  { id: 3, name: "Linen Co-ord Set", category: "Sets", audience: "Women", tone: "Cream", image: "https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true },
  { id: 4, name: "Soft-Shape Linen Dress", category: "Dresses", audience: "Women", tone: "White", image: "https://images.pexels.com/photos/8759815/pexels-photo-8759815.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "WOMEN'S EDIT", isLinen: true },
  { id: 5, name: "Button-Front Linen Blouse", category: "Shirts", audience: "Women", tone: "Ivory", image: "https://images.pexels.com/photos/15764812/pexels-photo-15764812.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "NEW SEASON", isLinen: true },
  { id: 6, name: "Weekend Linen Shorts", category: "Shorts", audience: "Men", tone: "Beige", image: "https://images.pexels.com/photos/18031036/pexels-photo-18031036.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "EASY ESSENTIAL", isLinen: true },
  { id: 7, name: "Relaxed Linen Skirt", category: "Skirts", audience: "Women", tone: "Sand", image: "https://images.pexels.com/photos/6996128/pexels-photo-6996128.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "WOMEN'S EDIT", isLinen: true },
  { id: 8, name: "Linen Blend Overshirt", category: "Shirts", audience: "Men", tone: "Olive", image: "https://images.pexels.com/photos/17251204/pexels-photo-17251204.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true },
  { id: 9, name: "Classic Cotton T-Shirt", category: "T-Shirts", audience: "Men", tone: "White", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", tag: "EVERYDAY", isLinen: false },
  { id: 10, name: "Tailored Casual Jacket", category: "Jackets", audience: "Men", tone: "Neutral", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85", tag: "MODERN CLASSIC", isLinen: false },
  { id: 11, name: "Everyday Denim", category: "Trousers", audience: "Men", tone: "Blue", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85", tag: "WARDROBE STAPLE", isLinen: false },
  { id: 12, name: "Statement Midi Dress", category: "Dresses", audience: "Women", tone: "Neutral", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", tag: "WOMEN'S EDIT", isLinen: false },
  { id: 13, name: "Modern Everyday Blouse", category: "Shirts", audience: "Women", tone: "White", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", tag: "EASY ESSENTIAL", isLinen: false },
  { id: 14, name: "Relaxed Everyday Co-ord", category: "Sets", audience: "Women", tone: "Earth", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85", tag: "NEW SEASON", isLinen: false },
  { id: 15, name: "Casual Polo Shirt", category: "T-Shirts", audience: "Men", tone: "Navy", image: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=85", tag: "EVERYDAY", isLinen: false }
];

const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function generateStaticParams() {
  return products.map((product) => ({ slug: slugify(product.name) }));
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = products.find((item) => slugify(item.name) === slug);

  if (!product) {
    return (
      <StorePageShell eyebrow="CROPPTECH COMMERCE STORE / PRODUCT" title={<>Piece not <em>found.</em></>} intro="This product may have moved or is no longer in this collection.">
        <Link href="/shop" className="text-link">RETURN TO SHOP <ArrowUpRight size={16} /></Link>
      </StorePageShell>
    );
  }

  return (
    <main className="product-detail-page">
      <header className="shop-topbar">
        <Link href="/shop" className="shop-back"><ArrowLeft size={16} /> BACK TO SHOP</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" />
        </Link>
        <span className="shop-top-note">BUSINESS MOVES WITH COMMERCE.</span>
      </header>

      <div className="product-detail-wrap">
        <div className="product-detail-image">
          <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 760px) 100vw, 55vw" style={{ objectFit: "cover" }} />
          <span>{product.tag}</span>
        </div>
        <section className="product-detail-copy">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / {product.audience.toUpperCase()} / {product.category.toUpperCase()}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-tone">{product.tone} colour direction</p>
          <p className="product-detail-price">Price to be added</p>
          <div className="product-detail-rule" />
          <p className="product-detail-description">
            {product.isLinen
              ? "Explore this piece from our linen collection, selected for a relaxed, considered everyday wardrobe. Contact our team to confirm availability, sizing and product details before ordering."
              : "Explore this piece from our everyday collection. Contact our team to confirm availability, sizing and product details before ordering."}
          </p>
          <div className="product-detail-sizes">
            <span className="product-size-label">AVAILABLE SIZE OPTIONS</span>
            <div>{sizes.map((size) => <span key={size}>{size}</span>)}</div>
          </div>
          <p className="product-detail-note"><Check size={15} /> Size availability is confirmed when you enquire.</p>
          <Link className="product-enquire-link" href={`/contact?product=${encodeURIComponent(product.name)}`}>
            ENQUIRE ABOUT THIS PIECE <ArrowUpRight size={16} />
          </Link>
          <Link href="/shop" className="product-back-link"><ArrowLeft size={14} /> CONTINUE SHOPPING</Link>
        </section>
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
