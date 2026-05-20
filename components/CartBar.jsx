"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2, ChevronUp } from "lucide-react";
import { useCart } from "../context/CartContext";

const fmt = (n) => Number(n).toFixed(2);
const FALLBACK = "https://placehold.co/40x40/f1f5f9/94a3b8?text=Rx";

export default function CartBar() {
  const {
    cart: cartItems,
    cartCount: totalItems,
    totalPrice,
    totalSavings,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();

  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  if (!cartItems?.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* ── EXPANDED DRAWER ── */}
      <div
        className={`bg-white border-t border-slate-200 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? "max-h-[60vh]" : "max-h-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 overflow-y-auto max-h-[55vh]">
          {/* Drawer header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Cart ({totalItems} item{totalItems > 1 ? "s" : ""})
            </span>
            <div className="flex items-center gap-3">
              {totalSavings > 0 && (
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                  You save ₹{fmt(totalSavings)}
                </span>
              )}
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 transition"
              >
                <Trash2 size={12} /> Clear all
              </button>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex flex-col gap-2">
            {cartItems.map((item) => {
              const lineKey = item.lineKey ?? item.id;
              return (
                <div
                  key={lineKey}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
                >
                  <img
                    src={item.thumbnail || FALLBACK}
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200 bg-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.strength} · {item.packageQty} tabs ·{" "}
                      <span className="font-semibold text-teal-700">
                        ₹{fmt(item.price)}
                      </span>
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (item.qty <= 1) removeFromCart(lineKey);
                        else updateQty(lineKey, item.qty - 1);
                      }}
                      className="h-6 w-6 rounded-md bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition"
                      title={item.qty <= 1 ? "Remove item" : "Decrease qty"}
                    >
                      {item.qty <= 1 ? (
                        <Trash2 size={11} />
                      ) : (
                        <Minus size={11} />
                      )}
                    </button>
                    <span className="text-[13px] font-bold text-slate-700 w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(lineKey, item.qty + 1)}
                      className="h-6 w-6 rounded-md bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center transition"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Line total */}
                  <span className="text-[13px] font-bold text-slate-800 font-mono flex-shrink-0 w-20 text-right">
                    ₹{fmt(item.price * item.qty)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(lineKey)}
                    className="flex-shrink-0 text-slate-300 hover:text-red-500 transition ml-1"
                    title="Remove item"
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STICKY BAR ── */}
      <div className="bg-[#162555] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: toggle + count */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-2.5"
          >
            <div className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-teal-400 text-[#162555] text-[10px] font-black rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            </div>
            <span className="text-sm font-semibold hidden sm:block">
              {totalItems} item{totalItems > 1 ? "s" : ""} in cart
            </span>
            <ChevronUp
              size={16}
              className={`text-white/60 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Center: item pills */}
          <div className="flex-1 hidden md:flex items-center gap-2 overflow-hidden">
            {cartItems.slice(0, 3).map((item) => (
              <span
                key={item.lineKey ?? item.id}
                className="text-[11px] bg-white/10 rounded-full px-2.5 py-1 truncate max-w-[160px]"
              >
                {item.title} ×{item.qty}
              </span>
            ))}
            {cartItems.length > 3 && (
              <span className="text-[11px] text-white/50">
                +{cartItems.length - 3} more
              </span>
            )}
          </div>

          {/* Right: total + checkout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider leading-none mb-0.5">
                Total
              </p>
              <p className="text-lg font-black font-mono leading-none">
                ₹{fmt(totalPrice)}
              </p>
            </div>
            <button
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
              onClick={() => router.push("/checkout")}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
