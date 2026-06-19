"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  Pill,
  Send,
  Loader2,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { noTokenGetRequest, postRequest } from "../../../helper/index";
import MedicineCard from "../../../components/MedicineCard";
import { ReviewSlider } from "../../../components/ReviewsSlider";

function mapProduct(p) {
  const activeVariants = (p.variants ?? []).filter((v) => v.isActive !== false);
  return {
    id: p._id,
    name: p.title,
    description: p.description,
    images: p.images ?? [],
    image: p.thumbnail,
    variants: activeVariants,
    rating: p.rating ?? 0,
    totalReviews: p.totalReviews ?? 0,
    reviews: p.reviews ?? [],
    category: p.category?.name ?? p.categoryId?.name ?? "general",
    categoryImg: p.category?.image ?? p.categoryId?.image ?? null,
    categoryId: p.category?._id ?? p.categoryId?._id ?? null,
    isFeatured: p.isFeatured,
    tags: p.tags ?? [],
    status: p.status,
  };
}

function mapVariant(v) {
  return {
    id: v._id,
    label: `${v.packageQty} tabs · ${v.strength}`,
    strength: v.strength,
    packageQty: v.packageQty,
    price: v.price,
    mrp: v.mrp,
    stock: v.stock,
    sku: v.sku,
    brand: v.brand,
  };
}

function Stars({ rating = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-300 fill-slate-200"
          }
        />
      ))}
    </div>
  );
}

/* ─── PACK DROPDOWN (portal) ─────────────────────────────────────────────── */
function PackDropdown({ variants, activeIdx, onSelect }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const sel = variants[activeIdx] ? mapVariant(variants[activeIdx]) : null;

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
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all bg-white ${open
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-slate-200 hover:border-slate-300"
          }`}
      >
        <div className="flex flex-col items-start min-w-0">
          {sel ? (
            <>
              <span className="text-[#166534] font-semibold text-sm truncate">
                {sel.label}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {sel.mrp > sel.price && <s className="mr-1">${sel.mrp}</s>}$
                {sel.price}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Select a pack</span>
          )}
        </div>
        <ChevronDown
          size={16}
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
            <div className="max-h-56 overflow-y-auto">
              {variants.map((v, idx) => {
                const mv = mapVariant(v);
                const isSelected = activeIdx === idx;
                return (
                  <button
                    key={mv.id}
                    type="button"
                    onClick={() => {
                      onSelect(idx);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${idx < variants.length - 1
                      ? "border-b border-slate-100"
                      : ""
                      } ${isSelected ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">{mv.label}</span>
                      {mv.stock <= 20 && mv.stock > 0 && (
                        <span className="text-[10px] text-amber-500 font-semibold">
                          Only {mv.stock} left
                        </span>
                      )}
                      {mv.stock === 0 && (
                        <span className="text-[10px] text-red-500 font-semibold">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mv.mrp > mv.price && (
                        <s className="text-[11px] text-slate-400">${mv.mrp}</s>
                      )}
                      <span className="text-sm font-bold text-slate-800">
                        ${mv.price}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ─── SKELETON ───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4ff] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-100 rounded-3xl h-[300px] sm:h-[420px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse mt-4" />
            <div className="h-12 w-40 bg-slate-200 rounded-2xl animate-pulse mt-2" />
            <div className="flex gap-3 mt-4">
              <div className="h-12 flex-1 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
export default function MedicineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [medicine, setMedicine] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await noTokenGetRequest(`/product/${id}`);
        const product = res.data.data;
        const med = mapProduct(product);
        setMedicine(med);
        setReviews(product.reviews ?? []);
        setVariantIdx(0);
        fetchRelated(
          product.category?._id ?? product.categoryId?._id ?? null,
          product._id,
        );
      } catch (err) {
        console.error("Failed to load product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function fetchRelated(catId, excludeId) {
    try {
      const q = new URLSearchParams({ page: "1", limit: "5" });
      if (catId) q.set("categoryId", catId);
      const res = await noTokenGetRequest(`/product?${q.toString()}`);
      setRelated(
        (res.data.data.products ?? [])
          .filter((p) => p._id !== excludeId)
          .slice(0, 4)
          .map((p) => {
            const activeVariants = (p.variants ?? []).filter(
              (v) => v.isActive !== false,
            );
            const firstVariant = activeVariants[0] ?? {};
            return {
              id: p._id,
              title: p.title,
              description: p.description,
              thumbnail: p.thumbnail,
              images: p.images ?? [],
              category: p.category ?? { name: "General" },
              variants: activeVariants,
              isRx: p.isRx ?? false,
            };
          }),
      );
    } catch {
      /* non-critical */
    }
  }

  const variant = medicine?.variants?.length
    ? mapVariant(medicine.variants[variantIdx] ?? medicine.variants[0])
    : null;

  const hasDiscount = variant ? variant.mrp > variant.price : false;
  const discountPct = hasDiscount
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
    : 0;

  // ── Add to Cart — context only, no API ──────────────────────────────────
  const handleAddToCart = () => {
    if (!variant) return;

    const rawVariant = medicine.variants[variantIdx] ?? medicine.variants[0];
    const brandId =
      typeof rawVariant?.brand === "object"
        ? (rawVariant.brand?._id ?? "")
        : (rawVariant?.brand ?? "");

    addToCart(
      {
        id: medicine.id,
        title: medicine.name,
        description: medicine.description,
        thumbnail: medicine.image,
        images: medicine.images,
        category: { name: medicine.category },
        isRx: false,
        selectedVariant: {
          _id: variant.id,
          strength: variant.strength,
          packageQty: variant.packageQty,
          price: variant.price,
          mrp: variant.mrp,
          brand: brandId,
          stock: variant.stock,
        },
      },
      qty,
    );

    toast.success(`${medicine.name} Added to Inquiry List ✓`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  // ── Review ──────────────────────────────────────────────────────────────
  const handleAddReview = async () => {
    if (!reviewText.trim()) {
      toast.error("Please write a comment before submitting");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await postRequest({
        url: `/product/${id}/review`,
        cred: { rating: reviewRating, comment: reviewText.trim() },
      });
      const updatedReviews = res.data?.data?.reviews ?? res.data?.reviews;
      if (updatedReviews) {
        setReviews(updatedReviews);
      } else {
        setReviews((prev) => [
          {
            comment: reviewText.trim(),
            user: "You",
            rating: reviewRating,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setReviewText("");
      setReviewRating(5);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <Skeleton />;
  if (notFound || !medicine)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-4">
        <Pill size={48} className="text-slate-300" />
        <p className="text-[#166534] text-xl font-bold">Medicine not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl bg-[#166534] text-white text-sm font-semibold hover:bg-[#1d3475] transition"
        >
          Go Back
        </button>
      </div>
    );

  const images = medicine.images.length
    ? medicine.images
    : [medicine.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#dceeff] text-[#166534]">
      {/* BG GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] bg-emerald-300/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-[#166534]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 sm:py-8">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#166534] transition mb-6 group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition"
          />
          Back to medicines
        </button>

        {/* MAIN CARD */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 bg-white/70 backdrop-blur-xl rounded-[0.5rem] border border-white shadow-xl p-4 sm:p-6 md:p-8">
          {/* ── LEFT: IMAGES ── */}
          <div>
            <div className="relative bg-gradient-to-br from-[#e8f4ff] to-[#f5f9ff] rounded-[0.5rem] overflow-hidden border border-slate-100 shadow-inner">
              {medicine.isFeatured && (
                <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#166534] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  <BadgeCheck size={11} /> Featured
                </span>
              )}

              <img
                src={images[activeImg]}
                alt={medicine.name}
                className="w-full h-[240px] sm:h-[320px] lg:h-[380px] object-contain transition-all duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x400?text=No+Image";
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImg === idx
                      ? "border-emerald-500 shadow-md shadow-emerald-200 scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`view ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: INFO ── */}
          <div className="flex flex-col">
            {/* CATEGORY BADGE */}
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
              {medicine.categoryImg && (
                <img
                  src={medicine.categoryImg}
                  alt={medicine.category}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-md object-cover border border-slate-200"
                />
              )}
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-100">
                {medicine.category}
              </span>
            </div>

            {/* NAME */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#166534] leading-tight mb-2.5 sm:mb-3">
              {medicine?.name}
            </h1>


            <p className="text-slate-600 leading-relaxed text-sm sm:text-[15px] mb-4 sm:mb-5 border-b border-slate-100 pb-4 sm:pb-5">
              {medicine?.description ||
                "Premium pharmaceutical-grade formulation."}
            </p>

            {medicine?.variants?.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Select Pack
                </p>
                <PackDropdown
                  variants={medicine.variants}
                  activeIdx={variantIdx}
                  onSelect={(idx) => {
                    setVariantIdx(idx);
                    setQty(1);
                  }}
                />
              </div>
            )}

            {/* PRICE */}
            {variant && (
              <div className="flex items-end gap-2 sm:gap-3 mb-4">
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                    ${variant.mrp}
                  </span>
                )}
                <span className="text-3xl sm:text-4xl font-black text-[#166534]">
                  ${variant.price}
                </span>

              </div>
            )}

            {/* QTY PICKER */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Qty
              </span>
              <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-[#166534] hover:bg-slate-200 transition font-bold text-lg"
                >
                  −
                </button>
                <span className="h-10 w-10 sm:h-11 sm:w-12 flex items-center justify-center font-bold text-[#166534] text-base border-x border-slate-200">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(variant?.stock ?? 99, q + 1))
                  }
                  className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-[#166534] hover:bg-slate-200 transition font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO CART — single button, no buy now */}
            <button
              onClick={handleAddToCart}
              disabled={!variant || variant.stock === 0}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[0.3rem] font-bold text-sm transition-all duration-300 ${added
                ? "bg-green-500 text-white shadow-lg shadow-green-200"
                : !variant || variant.stock === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#166534] hover:bg-[#1f3477] text-white shadow-lg shadow-[#166534]/20 hover:shadow-xl hover:-translate-y-0.5"
                }`}
            >
              <Send size={16} />

              {added
                ? "Added ✓"

                : "Request Availability"}
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#166534]">
                Related Products
              </h2>
              <Link
                href={`/products?categoryId=${medicine?.categoryId ?? ""}`}
                className="text-sm text-emerald-600 hover:text-emerald-500 font-semibold transition"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 sm:gap-4">
              {related.map((item) => (
                <MedicineCard
                  key={item.id}
                  med={item}
                  onViewDetails={(med) => router.push(`/products/${med.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
