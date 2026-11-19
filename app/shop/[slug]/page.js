import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import StorePageShell from "../../../components/StorePageShell";
import ProductAddButton from "../../../components/ProductAddButton";
import { CartLink } from "../../../components/CartProvider";
import { products, formatPrice, productSlug } from "../../../data/products";

const slugify = productSlug;

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
        <div className="shop-header-actions"><span className="shop-top-note">BUSINESS MOVES WITH COMMERCE.</span><CartLink className="shop-cart-link" /></div>
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
          <p className="product-detail-price">{formatPrice(product.price)}</p>
          <div className="product-detail-rule" />
          <p className="product-detail-description">
            {product.isLinen
              ? "Explore this piece from our linen collection, selected for a relaxed, considered everyday wardrobe. Choose your size to add it to your shopping bag."
              : "Explore this piece from our everyday collection. Choose your size to add it to your shopping bag."}
          </p>
          <ProductAddButton compact product={{ ...product, slug: slugify(product.name) }} />
          <p className="product-detail-note"><Check size={15} /> Select your size, then add this piece to your shopping bag.</p>
          <Link href="/shop" className="product-back-link"><ArrowLeft size={14} /> CONTINUE SHOPPING</Link>
        </section>
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
