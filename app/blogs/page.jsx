"use client";

import { useCart } from "../../context/CartContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { noTokenGetRequest } from "../../helper/index";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

const metadata = {
  title: "Our Products | US Pharmacy",
  description:
    "Browse quality medicines and healthcare products at US Pharmacy. Explore verified medicines, affordable packs, and fast delivery options.",
  keywords: [
    "online pharmacy",
    "buy medicines online",
    "healthcare products",
    "pharmacy products",
    "medicine store",
    "prescription medicines",
    "medical products",
    "US Pharmacy products",
  ],
  alternates: {
    canonical: "/products",
  },
};

const StarIcon = ({ filled }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill={filled ? "#facc15" : "none"}
    stroke={filled ? "#facc15" : "#d1d5db"}
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MedIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0e7490"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/* ─── PACK DROPDOWN ──────────────────────────────────────────────────────── */
function PackDropdown({ packs, activePack, onSelect }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const selPack = packs[activePack] || packs[0] || {};

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    updateCoords();
    setOpen((v) => !v);
  };

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all bg-white ${
          open
            ? "border-emerald-400 ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[#166534] font-semibold text-xs sm:text-sm truncate">
            {selPack.label || "Select pack"}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {selPack.marketPrice && (
              <s className="mr-1">₹{selPack.marketPrice}</s>
            )}
            ₹{selPack.price}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={listRef}
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/50 overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto">
              {packs.map((pack, idx) => (
                <button
                  key={pack._id || idx}
                  type="button"
                  onClick={() => {
                    onSelect(idx);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    idx < packs.length - 1 ? "border-b border-slate-100" : ""
                  } ${
                    activePack === idx
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">
                    {pack.label}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {pack.marketPrice && (
                      <s className="text-[10px] text-slate-400">
                        ₹{pack.marketPrice}
                      </s>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      ₹{pack.price}
                    </span>
                    {activePack === idx && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ─── SKELETON ───────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="flex flex-col sm:flex-row">
      <div className="bg-slate-100 h-[180px] sm:h-auto sm:w-[200px] lg:w-[240px] shrink-0" />
      <div className="flex-1 p-5 sm:p-7 flex flex-col gap-3">
        {[160, 260, 110, 300, 190, 150].map((w, i) => (
          <div
            key={i}
            style={{ width: Math.min(w, 300) }}
            className="h-3 bg-slate-100 rounded-lg"
          />
        ))}
      </div>
    </div>
  </div>
);

/* ─── NORMALIZE ──────────────────────────────────────────────────────────── */
const normalize = (p) => {
  const variants = p.variants || [];
  const packs = variants.map((v) => ({
    _id: v._id,
    label: `${v.packageQty} tabs · ${v.strength}`,
    price: v.price,
    marketPrice: v.mrp,
    stock: v.stock,
    isActive: v.isActive,
    strength: v.strength,
    packageQty: v.packageQty,
    brand: v.brand,
  }));
  const firstPack = packs[0] || {};
  const basePrice = firstPack.price ?? 0;
  const baseMrp = firstPack.marketPrice ?? null;
  const discount =
    baseMrp && basePrice
      ? Math.round(((baseMrp - basePrice) / baseMrp) * 100)
      : null;
  const totalStock = variants.reduce(
    (sum, v) => sum + (v.isActive ? v.stock || 0 : 0),
    0,
  );
  return {
    id: p._id || p.id,
    name: p.title || p.name || "Unnamed Product",
    description: p.description || "",
    price: basePrice,
    marketPrice: baseMrp,
    image: p.thumbnail || p.images?.[0] || "/placeholder.png",
    images: p.images?.length
      ? p.images
      : p.thumbnail
        ? [p.thumbnail]
        : ["/placeholder.png"],
    packs,
    category: p.category?.name || "Medicine",
    categoryIcon: p.category?.image || null,
    discount,
    inStock: totalStock > 0 || p.status === true,
    rating: p.rating || 0,
    reviewCount: p.totalReviews || 0,
  };
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function BlogPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [qtyMap, setQtyMap] = useState({});
  const [imgMap, setImgMap] = useState({});
  const [packMap, setPackMap] = useState({});
  const [addedMap, setAddedMap] = useState({});

  const fetchProducts = async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await noTokenGetRequest(
        `/product?isPagination=true&page=${currentPage}&limit=10`,
      );
      const items = res?.data?.data?.products || res?.data?.products || [];
      const total = res?.data?.data?.totalPages || res?.data?.totalPages || 1;
      setProducts(items);
      setTotalPages(total);
    } catch (err) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const incDec = (id, dir) =>
    setQtyMap((prev) => ({
      ...prev,
      [id]:
        dir === "inc" ? (prev[id] || 1) + 1 : Math.max(1, (prev[id] || 1) - 1),
    }));

  const handleAddToCart = (product, qty, selPack) => {
    if (!selPack?._id) {
      toast.error("Please select a pack first");
      return;
    }

    const brandId =
      typeof selPack.brand === "object"
        ? (selPack.brand?._id ?? "")
        : (selPack.brand ?? "");

    addToCart(
      {
        id: product.id,
        title: product.name,
        description: product.description,
        thumbnail: product.image,
        images: product.images,
        category: { name: product.category },
        isRx: false,
        selectedVariant: {
          _id: selPack._id,
          strength: selPack.strength ?? "",
          packageQty: selPack.packageQty ?? 0,
          price: selPack.price,
          mrp: selPack.marketPrice ?? selPack.price,
          brand: brandId,
          stock: selPack.stock ?? 0,
        },
      },
      qty,
    );

    toast.success(`${product.name} ×${qty} added to cart! 🛒`);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(
      () => setAddedMap((prev) => ({ ...prev, [product.id]: false })),
      2000,
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#f5f7fb] px-4 py-8 sm:py-10">
        {/* HEADER */}
        <div className="max-w-4xl mx-auto text-center mb-7 sm:mb-8">
          <h1 className="text-3xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-[#166534]">
            Our Products
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Quality medicines, verified and delivered fast
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ Could not load products: {error}
          </div>
        )}

        {/* FEED */}
        <div className="max-w-4xl mx-auto flex flex-col gap-5 sm:gap-6">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} />)
            : products.map((raw) => {
                const p = normalize(raw);
                const activeImg = imgMap[p.id] ?? 0;
                const qty = qtyMap[p.id] ?? 1;
                const activePack = packMap[p.id] ?? 0;
                const selPack = p.packs[activePack] || p.packs[0] || {};

                const dispPrice = selPack.price ?? p.price;
                const dispMarket = selPack.marketPrice ?? p.marketPrice;
                const saved =
                  dispMarket && dispPrice ? dispMarket - dispPrice : null;
                const dispDiscount =
                  dispMarket && dispPrice
                    ? Math.round(((dispMarket - dispPrice) / dispMarket) * 100)
                    : p.discount;
                const selInStock = selPack.isActive !== false;
                const isAdded = !!addedMap[p.id];

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* ── IMAGE PANEL — smaller ── */}
                      <div className="relative bg-[#eef4fb] sm:w-[200px] lg:w-[240px] shrink-0 p-3 sm:p-4 flex flex-col gap-2.5">
                        {dispDiscount > 0 && (
                          <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            -{dispDiscount}% OFF
                          </span>
                        )}

                        {/* MAIN IMAGE — reduced height */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center h-[150px] sm:h-[180px] lg:h-[200px]">
                          <img
                            src={p.images[activeImg]}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* THUMBNAILS */}
                        {p.images.length > 1 && (
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {p.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                onClick={() =>
                                  setImgMap((prev) => ({
                                    ...prev,
                                    [p.id]: idx,
                                  }))
                                }
                                className={`w-10 h-10 object-cover rounded-lg shrink-0 cursor-pointer transition-all border-2 ${
                                  activeImg === idx
                                    ? "border-emerald-400 scale-105 opacity-100"
                                    : "border-slate-200 opacity-60 hover:opacity-90"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── CONTENT PANEL ── */}
                      <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col">
                        {/* CATEGORY BADGE */}
                        <div className="inline-flex items-center gap-1.5 bg-[#e0f7fa] border border-[#b2ebf2] rounded-full px-3 py-1 text-[10px] font-semibold text-[#0e7490] uppercase tracking-wide w-fit mb-3">
                          <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
                            {p.categoryIcon ? (
                              <img
                                src={p.categoryIcon}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <MedIcon />
                            )}
                          </span>
                          {p.category}
                        </div>

                        {/* NAME */}
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 leading-tight mb-1.5 tracking-tight">
                          {p.name}
                        </h2>

                        {/* DESCRIPTION */}
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">
                          {p.description}
                        </p>

                        <div className="h-px bg-slate-100 mb-3" />

                        {/* PACK DROPDOWN */}
                        {p.packs.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                              Select Pack
                            </p>
                            <PackDropdown
                              packs={p.packs}
                              activePack={activePack}
                              onSelect={(idx) =>
                                setPackMap((prev) => ({ ...prev, [p.id]: idx }))
                              }
                            />
                          </div>
                        )}

                        {/* PRICE */}
                        <div className="flex items-baseline gap-2 mb-3">
                          {dispMarket && (
                            <span className="text-sm text-slate-400 line-through font-medium">
                              ₹{dispMarket}
                            </span>
                          )}
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            ₹{dispPrice}
                          </span>
                          {saved > 0 && (
                            <span className="text-xs font-bold text-green-600">
                              Save ₹{saved.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* QTY + ADD TO CART */}
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            QTY
                          </div>
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => incDec(p.id, "dec")}
                              className="w-8 h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center transition"
                            >
                              −
                            </button>
                            <span className="w-8 h-9 flex items-center justify-center font-bold text-slate-900 text-sm border-x border-slate-200">
                              {qty}
                            </span>
                            <button
                              onClick={() => incDec(p.id, "inc")}
                              className="w-8 h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-base flex items-center justify-center transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            disabled={!selInStock}
                            onClick={() => handleAddToCart(p, qty, selPack)}
                            className={`flex-1 h-9 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                              !selInStock
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : isAdded
                                  ? "bg-teal-600 text-white shadow-md"
                                  : "bg-[#166534] hover:bg-[#093319] text-white shadow-md"
                            }`}
                          >
                            <CartIcon />
                            {!selInStock
                              ? "Out of Stock"
                              : isAdded
                                ? "✓ Added!"
                                : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">No products found</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 sm:px-5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              ← Previous
            </button>
            <span className="text-xs sm:text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 sm:px-5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
