"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const fmt = (n) => Number(n).toFixed(2);
const FALLBACK = "https://placehold.co/72x72/f1f5f9/94a3b8?text=Rx";

// ── Small chevron SVG ──────────────────────────────────────────────────────
const ChevronDown = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 4.5L6 8L9.5 4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── NativeSelect-style dropdown (mobile-friendly, keyboard accessible) ─────
function PkgDropdown({ options, value, onChange }) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="
          appearance-none cursor-pointer
          h-8 pl-2.5 pr-7
          text-[11px] sm:text-[12px] font-semibold text-slate-700
          bg-slate-100 border border-slate-200
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400
          transition
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* custom chevron overlay */}
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDown size={11} />
      </span>
    </div>
  );
}

// ── Qty stepper ────────────────────────────────────────────────────────────
function QtyStepper({ qty, onDec, onInc }) {
  return (
    <div
      className="flex items-center border border-slate-200 rounded-lg overflow-hidden flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onDec}
        disabled={qty <= 1}
        className="h-8 w-7 sm:w-8 flex items-center justify-center text-slate-500
                   hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed
                   transition text-sm font-bold"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className="h-8 w-7 sm:w-8 flex items-center justify-center
                   text-[12px] sm:text-[13px] font-bold text-slate-800
                   border-x border-slate-200 select-none"
      >
        {qty}
      </span>
      <button
        onClick={onInc}
        disabled={qty >= 99}
        className="h-8 w-7 sm:w-8 flex items-center justify-center text-slate-500
                   hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed
                   transition text-sm font-bold"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

// ── Group variants by strength ─────────────────────────────────────────────
function groupByStrength(variants) {
  const map = new Map();
  for (const v of variants) {
    const key = v.strength ?? "Unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(v);
  }
  // Sort each group by packageQty ascending
  for (const [, arr] of map) arr.sort((a, b) => a.packageQty - b.packageQty);
  return map; // Map<strength, variant[]>
}

// ── Discount helper ────────────────────────────────────────────────────────
const discountPct = (price, mrp) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

// ── Main component ─────────────────────────────────────────────────────────
export default function MedicineCard({ med, onViewDetails }) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);

  const activeVariants =
    med.variants?.filter((v) => v.isActive !== false) ?? [];
  const grouped = groupByStrength(activeVariants); // Map<strength, variant[]>
  const strengths = [...grouped.keys()];

  // Per-strength state: { [strength]: { variantId, qty, added } }
  const [rowState, setRowState] = useState(() => {
    const init = {};
    for (const [strength, variants] of grouped) {
      init[strength] = {
        variantId: variants[0]._id,
        qty: 1,
        added: false,
      };
    }
    return init;
  });

  const timerRefs = useRef({});

  const updateRow = (strength, patch) =>
    setRowState((prev) => ({
      ...prev,
      [strength]: { ...prev[strength], ...patch },
    }));

  // Lowest price across all variants (for card header)
  const lowestVariant = activeVariants.length
    ? activeVariants.reduce((a, b) => (a.price < b.price ? a : b))
    : null;
  const off = lowestVariant
    ? discountPct(lowestVariant.price, lowestVariant.mrp)
    : null;

  const thumbSrc = med.thumbnail?.startsWith("http")
    ? med.thumbnail
    : med.images?.[0]?.startsWith("http")
      ? med.images[0]
      : FALLBACK;

  const handleAddToCart = (e, strength) => {
    e.stopPropagation();
    const { variantId, qty } = rowState[strength];
    const variant = grouped.get(strength).find((v) => v._id === variantId);
    if (!variant) return;

    const brandObj = med.brands?.find((b) => b._id === variant.brand) ?? null;

    addToCart(
      {
        ...med,
        selectedVariant: variant,
        brandId: variant.brand,
        brandName: brandObj?.name ?? "",
      },
      qty,
    );

    toast.success(
      `${med.title} (${variant.strength}, ${variant.packageQty} tabs) ×${qty} added!`,
    );
    updateRow(strength, { added: true });

    // clear "added" state after 2 s
    clearTimeout(timerRefs.current[strength]);
    timerRefs.current[strength] = setTimeout(
      () => updateRow(strength, { added: false }),
      2000,
    );
  };

  // Cleanup timers on unmount
  useEffect(
    () => () => Object.values(timerRefs.current).forEach(clearTimeout),
    [],
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md w-full">
      {/* ── HEADER ROW ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-3 sm:px-4 py-3 cursor-pointer"
        onClick={() => setOpen((p) => !p)}
      >
        {/* Thumbnail */}
        <img
          src={thumbSrc}
          alt={med.title}
          className="w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-lg object-cover flex-shrink-0 border border-gray-100 bg-gray-50"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK;
          }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {med.category?.name && (
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5 truncate">
              {med.category.name}
            </p>
          )}
          <h2 className="text-[13px] sm:text-[15px] font-bold text-gray-900 truncate mb-0.5">
            {med.title}
          </h2>
          <p className="text-[11px] text-gray-400 truncate mb-1.5 leading-snug hidden sm:block">
            {med.description}
          </p>
          {lowestVariant && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] sm:text-[14px] font-bold text-gray-900 font-mono">
                ₹{fmt(lowestVariant.price)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-mono">
                ₹{fmt(lowestVariant.mrp)}
              </span>
              {off && (
                <span className="text-[9px] sm:text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                  {off}% OFF
                </span>
              )}
            </div>
          )}
          {strengths.length > 1 && (
            <p className="text-[10px] text-teal-600 font-medium mt-0.5">
              {strengths.length} strengths available
            </p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {med.isRx && (
            <span className="text-[9px] sm:text-[10px] font-bold border-[1.5px] border-gray-400 text-gray-500 rounded px-1.5 py-0.5">
              Rx
            </span>
          )}
          {/* Options / Select */}
          <button
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white
                       text-[11px] sm:text-[13px] font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5
                       rounded-lg transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((p) => !p);
            }}
            aria-expanded={open}
          >
            <span>Options</span>
            <ChevronDown
              size={10}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {/* View Details */}
          {/* <button
            className="text-[10px] sm:text-[11px] font-semibold text-teal-600
                       hover:text-teal-800 underline underline-offset-2
                       transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(med);
            }}
          >
            View Details
          </button> */}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[600px] border-t border-gray-100" : "max-h-0"}`}
      >
        <div className="bg-slate-50 px-3 sm:px-4 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Choose Strength &amp; Pack
          </p>

          <div className="flex flex-col gap-1.5">
            {strengths.map((strength) => {
              const variants = grouped.get(strength);
              const { variantId, qty, added } = rowState[strength];
              const selectedVariant =
                variants.find((v) => v._id === variantId) ?? variants[0];
              const vOff = discountPct(
                selectedVariant.price,
                selectedVariant.mrp,
              );
              const pkgOptions = variants.map((v) => ({
                value: v._id,
                label: `${v.packageQty} Tabs`,
              }));

              return (
                <div
                  key={strength}
                  className="flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-2 gap-2 hover:border-teal-400 hover:shadow-sm transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* LEFT GROUP: strength + dropdown + price — takes remaining space, clips if needed */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                    {/* Strength badge */}
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono flex-shrink-0 min-w-[36px] text-center">
                      {strength}
                    </span>

                    {/* Pack dropdown */}
                    <PkgDropdown
                      options={pkgOptions}
                      value={variantId}
                      onChange={(id) => updateRow(strength, { variantId: id })}
                    />

                    {/* Price — shrinks last, never pushes right group off screen */}
                    <div className="flex flex-col min-w-0 flex-shrink overflow-hidden">
                      <span className="text-[12px] font-bold text-gray-900 font-mono leading-tight truncate">
                        ₹{fmt(selectedVariant.price)}
                      </span>
                      {vOff && (
                        <span className="text-[9px] font-bold text-red-500 leading-tight">
                          {vOff}% off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT GROUP: stepper + add — always visible, never shrinks */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <QtyStepper
                      qty={qty}
                      onDec={() =>
                        updateRow(strength, { qty: Math.max(1, qty - 1) })
                      }
                      onInc={() =>
                        updateRow(strength, { qty: Math.min(99, qty + 1) })
                      }
                    />
                    <button
                      onClick={(e) => handleAddToCart(e, strength)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border-[1.5px] transition-all whitespace-nowrap ${
                        added
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-teal-600 border-teal-500 hover:bg-teal-600 hover:text-white"
                      }`}
                      aria-label={`Add ${strength} to cart`}
                    >
                      {added ? "✓" : "+ Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
