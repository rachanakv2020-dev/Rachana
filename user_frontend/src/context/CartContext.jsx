import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("ff_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ff_cart", JSON.stringify(Array.isArray(items) ? items : []));
  }, [items]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find((i) => i.id === product.id);
      if (existing) {
        return safePrev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...safePrev, { ...product, quantity }];
    });
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  }

  function removeFromCart(id) {
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter((i) => i.id !== id);
    });
  }

  function clearCart() {
    setItems([]);
  }

  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = useMemo(() => safeItems.reduce((sum, i) => sum + i.quantity, 0), [safeItems]);
  const totalPrice = useMemo(
    () => Number(safeItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)),
    [safeItems]
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
