"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
const CartContext = createContext(null);
const STORAGE_KEY = "cropptech-cart";
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(item => ({ ...item, selected: item.selected !== false }))); } catch { setItems([]); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, ready]);
  const addItem = (product, size) => setItems(current => {
    const key = product.id + "-" + size;
    const found = current.find(item => item.key === key);
    return found ? current.map(item => item.key === key ? { ...item, quantity: item.quantity + 1, selected: true } : item)
      : [...current, { key, id: product.id, name: product.name, slug: product.slug, image: product.image, audience: product.audience, category: product.category, tone: product.tone, availableSizes: product.availableSizes || ["S", "M", "L", "XL"], size, quantity: 1, selected: true }];
  });
  const changeQuantity = (key, quantity) => setItems(current => current.map(item => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item));
  const removeItem = key => setItems(current => current.filter(item => item.key !== key));
  const toggleItem = key => setItems(current => current.map(item => item.key === key ? { ...item, selected: item.selected === false } : item));
  const changeSize = (key, size) => setItems(current => {
    const item = current.find(entry => entry.key === key);
    if (!item || item.size === size) return current;
    const nextKey = item.id + "-" + size;
    const existing = current.find(entry => entry.key === nextKey);
    if (existing) return current.filter(entry => entry.key !== key).map(entry => entry.key === nextKey ? { ...entry, quantity: entry.quantity + item.quantity, selected: entry.selected || item.selected !== false } : entry);
    return current.map(entry => entry.key === key ? { ...entry, key: nextKey, size } : entry);
  });
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedItems = items.filter(item => item.selected !== false);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, addItem, changeQuantity, removeItem, toggleItem, changeSize, selectedItems, selectedCount, count, ready }), [items, count, ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
export function CartLink({ className = "shop-back" }) {
  const { count } = useCart();
  return <a className={className} href="/cart" aria-label={`Shopping bag, ${count} items`} title={`Shopping bag (${count})`}><ShoppingBag size={19} strokeWidth={1.7} /><span className="home-cart-count">{count}</span></a>;
}
