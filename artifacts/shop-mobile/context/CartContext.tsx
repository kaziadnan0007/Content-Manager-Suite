import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  comparePrice?: number | null;
  image?: string | null;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("ag_cart").then((s) => {
      if (s) try { setItems(JSON.parse(s)); } catch {}
    });
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem("ag_cart", JSON.stringify(next));
  };

  const addItem = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId);
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.map((i, index) =>
          index === idx ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) } : i
        );
      } else {
        next = [...prev, { ...item, quantity: qty }];
      }
      AsyncStorage.setItem("ag_cart", JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (productId: number) => {
    persist(items.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    persist(items.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(qty, i.stock) } : i)));
  };

  const clearCart = () => {
    persist([]);
    AsyncStorage.removeItem("ag_cart");
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
