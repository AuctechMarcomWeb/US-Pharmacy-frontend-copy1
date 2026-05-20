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

  // SYNC (used after login to merge server cart)
  const syncCart = (newCart) => setCart(newCart || []);

  // ADD ITEM
  // Each unique line = medId + variantId combo.
  // Passing { ...med, selectedVariant: variant } from MedicineCard.
  const addToCart = (product, qty = 1) => {
    const { selectedVariant, ...med } = product;

    // Legacy path (no selectedVariant)
    if (!selectedVariant) {
      setCart((prev) => {
        const exist = prev.find((item) => item.id === med.id);
        if (exist) {
          return prev.map((item) =>
            item.id === med.id
              ? { ...item, qty: item.qty + (med.qty ?? qty) }
              : item,
          );
        }
        return [...prev, { ...med, qty: med.qty ?? qty }];
      });
      return;
    }

    // Variant-aware path
    const lineKey = `${med.id}__${selectedVariant._id}`;

    setCart((prev) => {
      const exist = prev.find((item) => item.lineKey === lineKey);
      if (exist) {
        return prev.map((item) =>
          item.lineKey === lineKey
            ? { ...item, qty: item.qty + qty } // ← qty instead of + 1
            : item,
        );
      }
      return [
        ...prev,
        {
          lineKey,
          id: med.id,
          title: med.title,
          thumbnail: med.thumbnail?.startsWith("http")
            ? med.thumbnail
            : (med.images?.[0] ?? ""),
          category: med.category?.name ?? "",
          isRx: med.isRx ?? false,
          variantId: selectedVariant._id,
          brand: selectedVariant.brand,
          strength: selectedVariant.strength,
          packageQty: selectedVariant.packageQty,
          sku: selectedVariant.sku ?? "",
          stock: selectedVariant.stock ?? 0,
          price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          qty, // ← qty instead of hardcoded 1
        },
      ];
    });
  };

  // REMOVE — works with both lineKey (new) and id (legacy)
  const removeFromCart = (key) => {
    setCart((prev) =>
      prev.filter((item) => item.lineKey !== key && item.id !== key),
    );
  };

  // UPDATE QTY — works with both lineKey (new) and id (legacy)
  const updateQty = (key, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.lineKey === key || item.id === key ? { ...item, qty } : item,
      ),
    );
  };

  // CLEAR
  const clearCart = () => setCart([]);

  // TOTAL ITEM COUNT (sum of all qtys)
  const cartCount = cart.length;

  // TOTAL PRICE
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.qty ?? 1),
    0,
  );

  // TOTAL MRP (to show savings)
  const totalMrp = cart.reduce(
    (sum, item) => sum + (item.mrp ?? item.price ?? 0) * (item.qty ?? 1),
    0,
  );

  const totalSavings = totalMrp - totalPrice;

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
        cartCount,
        totalPrice,
        totalMrp,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
