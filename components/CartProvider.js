"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const CartContext = createContext(null);
const STORAGE_KEY = "cropptech-cart";
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setItems([]); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, ready]);
  const addItem = (product, size) => setItems(current => {
    const key = product.id + "-" + size;
    const found = current.find(item => item.key === key);
    return found ? current.map(item => item.key === key ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { key, id: product.id, name: product.name, slug: product.slug, image: product.image, audience: product.audience, category: product.category, tone: product.tone, size, quantity: 1 }];
  });
  const changeQuantity = (key, quantity) => setItems(current => current.map(item => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item));
  const removeItem = key => setItems(current => current.filter(item => item.key !== key));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, addItem, changeQuantity, removeItem, count, ready }), [items, count, ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
export function CartLink({ className = "shop-back" }) {
  const { count } = useCart();
  return <a className={className} href="/cart">BAG ({count})</a>;
}
