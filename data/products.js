// Central product catalogue for CROPPTECH COMMERCE STORE.
// Prices are in NGN. Null means the price has not yet been confirmed.
// Images currently point to visual references, not verified product stock.
export const products = [
  { id: 1, name: "Relaxed Linen Shirt", category: "Shirts", audience: "Men", tone: "Natural", image: "https://images.pexels.com/photos/32825460/pexels-photo-32825460/free-photo-of-stylish-male-model-in-beige-linen-outfit-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true, featured: true, price: 40000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 2, name: "Everyday Linen Trousers", category: "Trousers", audience: "Men", tone: "Sand", image: "https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "EASY ESSENTIAL", isLinen: true, featured: true, price: 40000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 3, name: "Linen Co-ord Set", category: "Sets", audience: "Women", tone: "Cream", image: "https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true, featured: true, price: 80000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 4, name: "Soft-Shape Linen Dress", category: "Dresses", audience: "Women", tone: "White", image: "https://images.pexels.com/photos/8759815/pexels-photo-8759815.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "WOMEN'S EDIT", isLinen: true, featured: true, price: null, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 5, name: "Button-Front Linen Blouse", category: "Shirts", audience: "Women", tone: "Ivory", image: "https://images.pexels.com/photos/15764812/pexels-photo-15764812.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "NEW SEASON", isLinen: true, featured: true, price: 40000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 6, name: "Weekend Linen Shorts", category: "Shorts", audience: "Men", tone: "Beige", image: "https://images.pexels.com/photos/18031036/pexels-photo-18031036.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "EASY ESSENTIAL", isLinen: true, featured: true, price: 40000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 7, name: "Relaxed Linen Skirt", category: "Skirts", audience: "Women", tone: "Sand", image: "https://images.pexels.com/photos/6996128/pexels-photo-6996128.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "WOMEN'S EDIT", isLinen: true, featured: true, price: null, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },
  { id: 8, name: "Linen Blend Overshirt", category: "Shirts", audience: "Men", tone: "Olive", image: "https://images.pexels.com/photos/17251204/pexels-photo-17251204.jpeg?auto=compress&cs=tinysrgb&w=1000", tag: "THE LINEN EDIT", isLinen: true, featured: true, price: 40000, description: "", availableSizes: [], stockStatus: "unconfirmed", imageStatus: "inspiration" },

];

export const formatPrice = (price) => price == null
  ? "Price to be confirmed"
  : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);

export const productSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
