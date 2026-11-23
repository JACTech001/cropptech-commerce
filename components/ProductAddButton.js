"use client";
import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

export default function ProductAddButton({ product, compact = false }) {
  const initialColour = product.colours?.[0] || product.variants?.[0]?.colour || product.tone || "";
  const [colour, setColour] = useState(initialColour);
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  const matchingVariants = useMemo(() => (product.variants || []).filter((variant) => variant.colour === colour && variant.stockQuantity > 0), [product.variants, colour]);
  const sizes = product.variants?.length
    ? [...new Set(matchingVariants.map((variant) => variant.size))]
    : (product.availableSizes?.length ? product.availableSizes : ["S", "M", "L", "XL"]);
  const selectedVariant = matchingVariants.find((variant) => variant.size === size);
  const { addItem } = useCart();

  return <div className={compact ? "product-size-picker detail-add" : "product-size-picker"}>
    {product.colours?.length > 1 && <>
      <span className="product-size-label">SELECT COLOUR</span>
      <div className="product-size-options">{product.colours.map((value) => <button type="button" key={value} className={colour === value ? "selected" : ""} aria-pressed={colour === value} onClick={() => { setColour(value); setSize(""); setMessage(""); }}>{value}</button>)}</div>
    </>}
    <span className="product-size-label">SELECT SIZE</span>
    <div className="product-size-options">{sizes.map(value => <button type="button" key={value} className={size === value ? "selected" : ""} aria-pressed={size === value} onClick={() => {setSize(current => current === value ? "" : value);setMessage("");}}>{value}</button>)}</div>
    {product.variants?.length > 0 && sizes.length === 0 && <p className="cart-added-message">This colour is currently out of stock.</p>}
    <button type="button" className="cart-add-button" disabled={!size || (product.variants?.length > 0 && !selectedVariant)} onClick={() => {
      addItem({ ...product, price: selectedVariant?.price ?? product.price }, size, colour);
      setMessage(product.name + " · " + colour + " · Size " + size + " added to your cart.");
    }}><ShoppingBag size={15}/> ADD TO CART</button>
    {message && <p className="cart-added-message" role="status">{message}</p>}
  </div>;
}
