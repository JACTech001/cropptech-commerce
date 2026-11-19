"use client";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
export default function ProductAddButton({ product, compact = false }) {
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  const sizes = product.availableSizes?.length ? product.availableSizes : ["S", "M", "L", "XL"];
  const { addItem } = useCart();
  return <div className={compact ? "product-size-picker detail-add" : "product-size-picker"}>
    <span className="product-size-label">SELECT SIZE · TAP AGAIN TO UNSELECT</span>
    <div className="product-size-options">{sizes.map(value => <button type="button" key={value} className={size === value ? "selected" : ""} aria-pressed={size === value} onClick={() => {setSize(current => current === value ? "" : value);setMessage("");}}>{value}</button>)}</div>
    <button type="button" className="cart-add-button" disabled={!size} onClick={() => {addItem(product,size);setMessage(product.name + " · Size " + size + " added to your cart.");}}><ShoppingBag size={15}/> ADD TO CART</button>
    {message && <p className="cart-added-message" role="status">{message}</p>}
  </div>;
}
