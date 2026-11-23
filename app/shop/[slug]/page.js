import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check, Info } from "lucide-react";
import StorePageShell from "../../../components/StorePageShell";
import ProductAddButton from "../../../components/ProductAddButton";
import ProductGallery from "../../../components/ProductGallery";
import { CartLink } from "../../../components/CartProvider";
import { CurrencySelector, ProductPrice } from "../../../components/CurrencyProvider";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

const titleCase = (value) => value === "SETS" ? "Sets" : value.charAt(0) + value.slice(1).toLowerCase();

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const record = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      variants: { where: { isActive: true }, orderBy: [{ colour: "asc" }, { size: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!record || !record.variants.length || !record.images.length) {
    return (
      <StorePageShell eyebrow="CROPPTECH COMMERCE STORE / PRODUCT" title={<>Piece not <em>found.</em></>} intro="This product may have moved or is no longer in this collection.">
        <Link href="/shop" className="text-link">RETURN TO SHOP <ArrowUpRight size={16} /></Link>
      </StorePageShell>
    );
  }

  const colours = [...new Set(record.variants.map((variant) => variant.colour))];
  const product = {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    audience: record.category === "MEN" ? "Men" : record.category === "WOMEN" ? "Women" : "Unisex",
    category: titleCase(record.productType),
    tone: colours[0] || "Natural",
    image: record.images[0].secureUrl,
    images: record.images,
    tag: record.isFeatured ? "FEATURED LINEN" : "LINEN COLLECTION",
    price: Math.min(...record.variants.map((variant) => Number(variant.price))),
    colours,
    availableSizes: [...new Set(record.variants.map((variant) => variant.size))],
    variants: record.variants.map((variant) => ({
      id: variant.id, sku: variant.sku, size: variant.size, colour: variant.colour,
      price: Number(variant.price), stockQuantity: variant.stockQuantity, isActive: variant.isActive,
    })),
  };

  return (
    <main className="product-detail-page">
      <header className="shop-topbar">
        <Link href="/shop" className="shop-back"><ArrowLeft size={16} /> BACK TO SHOP</Link>
        <Link href="/" className="brand-lockup shop-brand-wordmark" aria-label="CROPPTECH COMMERCE home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce" width={210} height={60} priority className="brand-text-logo" />
        </Link>
        <div className="shop-header-actions"><span className="shop-top-note">BUSINESS MOVES WITH COMMERCE.</span><CurrencySelector /><CartLink className="shop-cart-link" /></div>
      </header>

      <div className="product-detail-wrap">
        <ProductGallery images={product.images} name={product.name} tag={product.tag} />
        <section className="product-detail-copy">
          <p className="eyebrow">CROPPTECH COMMERCE STORE / {product.audience.toUpperCase()} / {product.category.toUpperCase()}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-tone">{product.colours.join(" · ")} colour options</p>
          <ProductPrice amount={product.price} className="product-detail-price" />
          <div className="product-detail-rule" />

          <div className="product-detail-description-block">
            <p className="eyebrow">ABOUT THIS PIECE</p>
            <p className="product-detail-description">{product.description}</p>
          </div>

          <div className="product-detail-specs">
            <div><span>COLLECTION</span><strong>{product.audience} linen wear</strong></div>
            <div><span>GARMENT TYPE</span><strong>{product.category}</strong></div>
            <div><span>AVAILABLE SIZES</span><strong>{product.availableSizes.join(" · ")}</strong></div>
          </div>

          <ProductAddButton compact product={product} />

          <p className="product-detail-note"><Check size={15} /> Choose a colour and available size to add this piece to your shopping bag.</p>
          <div className="product-detail-availability"><Info size={15} /><span>Availability and pricing are checked again against the store database when you place your order.</span></div>
          <Link href="/shop" className="product-back-link"><ArrowLeft size={14} /> CONTINUE SHOPPING</Link>
        </section>
      </div>
      <footer className="shop-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span><span>BUSINESS MOVES WITH COMMERCE.</span><Link href="/contact">CONTACT</Link></footer>
    </main>
  );
}
