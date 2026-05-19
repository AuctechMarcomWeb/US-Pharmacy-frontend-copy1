"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ShoppingCart,
  Zap,
  Star,
  ChevronLeft,
  Package,
  Tag,
  ShieldCheck,
  Pill,
  Send,
  Loader2,
  BadgeCheck,
  Layers,
  BarChart2,
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
    category: p.categoryId?.name ?? "general",
    categoryImg: p.categoryId?.image ?? null,
    isFeatured: p.isFeatured,
    tags: p.tags ?? [],
    status: p.status,
  };
}

function mapVariant(v) {
  return {
    id: v._id,
    label: `${v.strength} · ${v.packageQty} tabs`,
    strength: v.strength,
    packageQty: v.packageQty,
    price: v.price,
    mrp: v.mrp,
    stock: v.stock,
    sku: v.sku,
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
              <div className="h-12 flex-1 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MedicineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart, updateQty } = useCart();
  const { isLoggedIn } = useAuth();

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
  const [cartLoading, setCartLoading] = useState(false);

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
        fetchRelated(product.categoryId?._id ?? null, product._id);
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
            const firstVariant =
              (p.variants ?? []).find((v) => v.isActive !== false) ?? {};
            return {
              id: p._id,
              name: p.title,
              image: p.thumbnail,
              price: firstVariant.price ?? 0,
              originalPrice: firstVariant.mrp ?? 0,
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

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      const rawVariant = medicine.variants[variantIdx] ?? medicine.variants[0];
      const brandId =
        typeof rawVariant?.brand === "object"
          ? (rawVariant.brand?._id ?? "")
          : (rawVariant?.brand ?? "");
      localStorage.setItem(
        "pendingAction",
        JSON.stringify({
          type: "cart",
          payload: {
            productId: medicine.id,
            quantity: qty,
            strength: rawVariant?.strength ?? "",
            packageQty: rawVariant?.packageQty ?? 0,
            brand: brandId,
          },
        }),
      );
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    let userId = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        userId = parsed?._id ?? parsed?.id ?? parsed?.userId ?? null;
      }
    } catch {
      userId = localStorage.getItem("user") || null;
    }

    const rawVariant = medicine.variants[variantIdx] ?? medicine.variants[0];
    const brandId =
      typeof rawVariant?.brand === "object"
        ? (rawVariant.brand?._id ?? "")
        : (rawVariant?.brand ?? "");

    setCartLoading(true);
    try {
      await postRequest({
        url: "/cart/add",
        cred: {
          userId,
          productId: medicine.id,
          quantity: qty,
          strength: rawVariant?.strength ?? "",
          packageQty: rawVariant?.packageQty ?? 0,
          brand: brandId,
        },
      });
      addToCart({
        id: medicine.id,
        variantId: variant?.id,
        name: `${medicine.name} (${variant?.label ?? ""})`,
        price: variant?.price ?? 0,
        image: medicine.image,
        qty,
        strength: rawVariant?.strength ?? "",
        packageQty: rawVariant?.packageQty ?? 0,
        brand: brandId,
      });
      toast.success(`${medicine.name} added to cart`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to add to cart",
      );
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    const payload = {
      name: medicine.name,
      price: variant?.price ?? 0,
      id: medicine.id,
      qty,
      variantId: variant?.id ?? "",
      image: medicine.image || "",
      category: medicine.category || "",
    };
    if (!isLoggedIn) {
      localStorage.setItem(
        "pendingAction",
        JSON.stringify({ type: "buyNow", payload }),
      );
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    router.push(
      `/checkout?name=${encodeURIComponent(payload.name)}&price=${payload.price}&id=${payload.id}&qty=${payload.qty}&variantId=${payload.variantId}`,
    );
  };

  const handleAddReview = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to leave a review");
      router.push("/login");
      return;
    }
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
      toast.success("Review submitted successfully!");
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
        <p className="text-[#162555] text-xl font-bold">Medicine not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl bg-[#162555] text-white text-sm font-semibold hover:bg-[#1d3475] transition"
        >
          Go Back
        </button>
      </div>
    );

  const images = medicine.images.length
    ? medicine.images
    : [medicine.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#dceeff] text-[#162555]">
      {/* BG GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] bg-cyan-300/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-[#162555]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 sm:py-8">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#162555] transition mb-6 group"
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
                <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#162555] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                  <BadgeCheck size={11} /> Featured
                </span>
              )}
              {hasDiscount && (
                <span className="absolute top-3 right-3 z-10 bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                  -{discountPct}% OFF
                </span>
              )}
              <img
                src={images[activeImg]}
                alt={medicine.name}
                className="w-full h-[240px] sm:h-[320px] lg:h-[380px] object-contain transition-all duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x400?text=No+Image";
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all duration-200
                      ${activeImg === idx ? "border-cyan-500 shadow-md shadow-cyan-200 scale-105" : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"}`}
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
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-cyan-100">
                {medicine.category}
              </span>
            </div>

            {/* NAME */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#162555] leading-tight mb-2.5 sm:mb-3">
              {medicine.name}
            </h1>

            {/* RATING */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Stars rating={medicine.rating} size={14} />
              <span className="text-xs sm:text-sm text-slate-500">
                {medicine.rating > 0
                  ? `${medicine.rating.toFixed(1)} · ${medicine.totalReviews} review${medicine.totalReviews !== 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-slate-600 leading-relaxed text-sm sm:text-[15px] mb-4 sm:mb-5 border-b border-slate-100 pb-4 sm:pb-5">
              {medicine.description ||
                "Premium pharmaceutical-grade formulation."}
            </p>

            {/* VARIANT PICKER */}
            {medicine.variants.length > 0 && (
              <div className="mb-4 sm:mb-5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Select Pack
                </p>
                <div className="flex flex-wrap gap-2">
                  {medicine.variants.map((v, idx) => {
                    const mv = mapVariant(v);
                    const isSelected = variantIdx === idx;
                    return (
                      <button
                        key={mv.id}
                        onClick={() => {
                          setVariantIdx(idx);
                          setQty(1);
                        }}
                        className={`flex flex-col items-start px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border-2 text-left transition-all
                          ${isSelected ? "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <span
                          className={`text-[11px] sm:text-xs font-bold ${isSelected ? "text-cyan-700" : "text-[#162555]"}`}
                        >
                          {mv.packageQty} tabs · {mv.strength}
                        </span>
                        <span
                          className={`text-[10px] sm:text-[11px] mt-0.5 ${isSelected ? "text-cyan-600" : "text-slate-500"}`}
                        >
                          ₹{mv.price}
                          {mv.mrp > mv.price && (
                            <span className="ml-1 line-through text-slate-400">
                              ₹{mv.mrp}
                            </span>
                          )}
                        </span>
                        {mv.stock <= 20 && mv.stock > 0 && (
                          <span className="text-[9px] sm:text-[10px] text-amber-500 font-semibold mt-0.5">
                            Only {mv.stock} left
                          </span>
                        )}
                        {mv.stock === 0 && (
                          <span className="text-[9px] sm:text-[10px] text-red-500 font-semibold mt-0.5">
                            Out of stock
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRICE */}
            {variant && (
              <div className="flex items-end gap-2 sm:gap-3 mb-2">
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                    ₹{variant.mrp}
                  </span>
                )}
                <span className="text-3xl sm:text-4xl font-black text-[#162555]">
                  ₹{variant.price}
                </span>
                {hasDiscount && (
                  <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg mb-1">
                    Save ₹{variant.mrp - variant.price}
                  </span>
                )}
              </div>
            )}

            {/* QTY PICKER */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Qty
              </span>
              <div className="flex items-center gap-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-[#162555] hover:bg-slate-200 transition font-bold text-lg"
                >
                  −
                </button>
                <span className="h-10 w-10 sm:h-11 sm:w-12 flex items-center justify-center font-bold text-[#162555] text-base border-x border-slate-200">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(variant?.stock ?? 99, q + 1))
                  }
                  className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-[#162555] hover:bg-slate-200 transition font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0 || cartLoading}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 rounded-[0.3rem] font-bold text-xs sm:text-sm transition-all duration-300
                  ${
                    added
                      ? "bg-green-500 text-white shadow-lg shadow-green-200"
                      : !variant || variant.stock === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : cartLoading
                          ? "bg-[#162555]/60 text-white cursor-not-allowed"
                          : "bg-[#162555] hover:bg-[#1f3477] text-white shadow-lg shadow-[#162555]/20 hover:shadow-xl hover:-translate-y-0.5"
                  }`}
              >
                <ShoppingCart size={15} />
                {added ? "Added ✓" : cartLoading ? "Adding…" : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!variant || variant.stock === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 rounded-[0.3rem] font-bold text-xs sm:text-sm transition-all duration-300
                  ${
                    !variant || variant.stock === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-200 hover:shadow-xl hover:-translate-y-0.5"
                  }`}
              >
                <Zap size={15} />
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div className="mt-8 sm:mt-10 bg-white/70 backdrop-blur border border-white rounded-[0.3rem] shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#162555]">
              Customer Reviews
            </h2>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* WRITE A REVIEW */}
          <div className="bg-slate-50 border border-slate-200 rounded-[0.3rem] p-3 sm:p-4 mb-5 sm:mb-6">
            <p className="text-sm font-semibold text-[#162555] mb-3">
              Write a Review
            </p>

            {/* STARS */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setReviewRating(s)}
                  type="button"
                >
                  <Star
                    size={18}
                    className={
                      s <= reviewRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300 fill-slate-100"
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-slate-400 font-medium">
                {
                  ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    reviewRating
                  ]
                }
              </span>
            </div>

            {/* INPUT + BUTTON — stacked on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !reviewSubmitting && handleAddReview()
                }
                placeholder={
                  isLoggedIn
                    ? "Share your experience…"
                    : "Please login to leave a review"
                }
                disabled={!isLoggedIn || reviewSubmitting}
                className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                           text-[#162555] placeholder-slate-400 outline-none
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleAddReview}
                disabled={!isLoggedIn || reviewSubmitting || !reviewText.trim()}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5
                           bg-[#162555] hover:bg-[#1d3475] text-white text-sm font-semibold rounded-xl transition
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#162555]"
              >
                {reviewSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Posting…
                  </>
                ) : (
                  <>
                    <Send size={14} /> Post
                  </>
                )}
              </button>
            </div>

            {!isLoggedIn && (
              <p className="mt-2 text-xs text-slate-400">
                <button
                  onClick={() => router.push("/login")}
                  className="text-cyan-600 underline font-medium"
                >
                  Log in
                </button>{" "}
                to share your review.
              </p>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <Star
                size={32}
                className="text-slate-200 fill-slate-100 mx-auto mb-2"
              />
              <p className="text-slate-400 text-sm">
                No reviews yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ReviewSlider reviews={reviews} />
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#162555]">
                Related Products
              </h2>
              <Link
                href="/medicines"
                className="text-sm text-cyan-600 hover:text-cyan-500 font-semibold transition"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((item) => (
                <MedicineCard key={item.id} med={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
