"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // LOAD CART FROM STORAGE
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setCart(JSON.parse(stored));
    } catch {
      setCart([]);
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // SET FULL CART (used after login to sync server cart)
  const syncCart = (newCart) => setCart(newCart || []);

  // ADD ITEM
  // Always ACCUMULATES qty when the same product id already exists.
  // This mirrors what the server /cart/add does (it also accumulates).
  // The previous "replace" approach caused cart qty to show the last-added
  // batch instead of the running total (e.g. add 1 then add 3 more → showed
  // 3 instead of 4). Callers wanting an exact qty should use updateQty.
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + product.qty }
            : item,
        );
      }
      return [...prev, product];
    });
  };

  // REMOVE
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // UPDATE QTY
  // FIX: signature was (id, variantId, qty) but checkout called it as (id, qty).
  // Simplified to (id, qty) — variantId is not used anywhere for lookup.
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  // CLEAR
  const clearCart = () => setCart([]);

  // TOTAL COUNT
  const cartCount = cart.length;

  // TOTAL
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.qty ?? 1),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        syncCart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalPrice,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
