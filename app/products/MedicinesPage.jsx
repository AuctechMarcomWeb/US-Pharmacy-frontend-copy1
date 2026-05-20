"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import MedicineCard from "../../components/MedicineCard";
import { getRequest, noTokenGetRequest } from "../../helper/index";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { DNA } from "react-loader-spinner";
import { useRouter } from "next/navigation";

// ─── constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── shape: API product → card props ─────────────────────────────────────────
function mapProduct(p) {
  const activeVariants = (p.variants ?? []).filter((v) => v.isActive !== false);
  return {
    id: p._id,
    title: p.title,
    description: p.description,
    thumbnail: p.thumbnail,
    images: p.images ?? [],
    variants: activeVariants,
    rating: p.rating ?? 0,
    totalReviews: p.totalReviews ?? 0,
    category: p.category ?? { name: "General" },
    categoryId: p.categoryId,
    isFeatured: p.isFeatured ?? false,
    isRx: p.isRx ?? false,
    tags: p.tags ?? [],
  };
}

// ─── collapsible sidebar section ─────────────────────────────────────────────
function SidebarSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 pb-5 mb-5 last:border-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <span className="text-[13px] font-bold uppercase tracking-widest text-[#162555]">
          {title}
        </span>
        {open ? (
          <ChevronUp
            size={15}
            className="text-slate-400 group-hover:text-[#162555] transition"
          />
        ) : (
          <ChevronDown
            size={15}
            className="text-slate-400 group-hover:text-[#162555] transition"
          />
        )}
      </button>
      {open && children}
    </div>
  );
}

// ─── A–Z letter index strip ───────────────────────────────────────────────────
function AlphabetIndex({ activeLetter, onSelect }) {
  return (
    <div className="flex flex-col items-center gap-px">
      {/* "All" reset pill */}
      <button
        onClick={() => onSelect("")}
        className={`w-6 h-5 text-[10px] font-bold rounded transition leading-none
          ${
            activeLetter === ""
              ? "bg-cyan-500 text-white shadow-sm"
              : "text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
          }`}
      >
        All
      </button>
      {ALPHABET.map((letter) => (
        <button
          key={letter}
          onClick={() => onSelect(letter === activeLetter ? "" : letter)}
          className={`w-6 h-5 text-[11px] font-semibold rounded transition leading-none
            ${
              activeLetter === letter
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
            }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function MedicinesPage() {
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [appliedSearch, setAppliedSearch] = useState(
    searchParams.get("search") || "",
  );
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || "",
  );
  const [sortBy, setSortBy] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const [activeLetter, setActiveLetter] = useState("");
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stagedCategory, setStagedCategory] = useState(categoryId);
  const [stagedMinPrice, setStagedMinPrice] = useState(minPriceInput);
  const [stagedMaxPrice, setStagedMaxPrice] = useState(maxPriceInput);
  const [stagedFeatured, setStagedFeatured] = useState(isFeatured);
  const [stagedLetter, setStagedLetter] = useState(activeLetter);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  const categoryDropdownRef = useRef(null);
  const mounted = useRef(false);

  const router = useRouter();

  // Sync staged state when mobile drawer opens
  useEffect(() => {
    if (mobileSidebar) {
      setStagedCategory(categoryId);
      setStagedMinPrice(minPriceInput);
      setStagedMaxPrice(maxPriceInput);
      setStagedFeatured(isFeatured);
      setStagedLetter(activeLetter);
      setMobileCategoryOpen(false);
    }
  }, [mobileSidebar]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinPrice(minPriceInput);
      setMaxPrice(maxPriceInput);
    }, 600);
    return () => clearTimeout(timer);
  }, [minPriceInput, maxPriceInput]);

  // ── fetch categories once ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const r1 = await noTokenGetRequest(`/category?page=1&limit=100`);
        const j1 = r1.data;
        if (!j1.success) return;
        const first = j1.data.categories ?? [];
        const pages = j1.data.totalPages ?? 1;
        let all = [...first];
        if (pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: pages - 1 }, (_, i) =>
              noTokenGetRequest(`/category?page=${i + 2}&limit=100`).then(
                (r) => r.data,
              ),
            ),
          );
          rest.forEach((j) => {
            if (j.success) all = all.concat(j.data.categories ?? []);
          });
        }
        setCategories(all.filter((c) => c.isActive !== false));
      } catch (_) {
      } finally {
        setCatLoading(false);
      }
    }
    load();
  }, []);

  // ── fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        q.set("page", String(page));
        q.set("limit", String(PAGE_SIZE));

        // Letter search overrides typed search
        const effectiveSearch = activeLetter
          ? activeLetter
          : appliedSearch.trim();
        if (effectiveSearch) q.set("search", effectiveSearch);
        if (categoryId) q.set("categoryId", categoryId);
        if (isFeatured) q.set("isFeatured", "true");
        if (sortBy) q.set("sortBy", sortBy);
        if (minPrice !== "" && Number(minPrice) > 0)
          q.set("minPrice", minPrice);
        if (maxPrice !== "" && Number(maxPrice) > 0)
          q.set("maxPrice", maxPrice);

        const res = await noTokenGetRequest(`/product?${q.toString()}`);
        const json = res.data;
        if (json.success) {
          setProducts((json.data.products ?? []).map(mapProduct));
          setTotalProducts(json.data.totalProducts ?? 0);
          setTotalPages(json.data.totalPages ?? 1);
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("[MedicinesPage] error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [
    appliedSearch,
    activeLetter,
    categoryId,
    sortBy,
    minPrice,
    maxPrice,
    isFeatured,
    page,
  ]);

  // reset page to 1 on filter change

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setPage(1);
  }, [
    appliedSearch,
    activeLetter,
    categoryId,
    sortBy,
    minPrice,
    maxPrice,
    isFeatured,
  ]);

  useEffect(() => {
    const handler = (e) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      )
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMobileApply = () => {
    setCategoryId(stagedCategory);
    setMinPriceInput(stagedMinPrice);
    setMaxPriceInput(stagedMaxPrice);
    setIsFeatured(stagedFeatured);
    setActiveLetter(stagedLetter);
    if (stagedLetter) {
      setSearchInput("");
      setAppliedSearch("");
    }
    setPage(1);
    setMobileSidebar(false);
  };

  const handleMobileReset = () => {
    setStagedCategory("");
    setStagedMinPrice("");
    setStagedMaxPrice("");
    setStagedFeatured(false);
    setStagedLetter("");
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveLetter(""); // clear letter when typing a search
    setAppliedSearch(searchInput.trim());
  };

  const handleLetterSelect = (letter) => {
    setActiveLetter(letter);
    if (letter) {
      // clear typed search when a letter is chosen
      setSearchInput("");
      setAppliedSearch("");
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setAppliedSearch("");
    setActiveLetter("");
    setCategoryId("");
    setSortBy("");
    setMinPriceInput(""); // ← add
    setMaxPriceInput("");
    setMinPrice("");
    setMaxPrice("");
    setIsFeatured(false);
    setPage(1);
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const startItem = totalProducts === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalProducts);
  const hasAnyFilter = !!(
    appliedSearch ||
    activeLetter ||
    categoryId ||
    isFeatured ||
    (minPrice !== "" && Number(minPrice) > 0) ||
    (maxPrice !== "" && Number(maxPrice) > 0)
  );

  const sortOptions = [
    { value: "", label: "Default order" },
    { value: "recent", label: "Sort by latest" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "popularity", label: "Sort by popularity" },
  ];

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums = [1];
    if (page > 3) nums.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      nums.push(i);
    if (page < totalPages - 2) nums.push("...");
    nums.push(totalPages);
    return nums;
  };

  // ── sidebar JSX ───────────────────────────────────────────────────────────
  const renderSidebarContent = () => (
    <div className="space-y-0">
      {/* SEARCH */}
      <SidebarSection title="Search">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5
                       text-sm text-[#162555] placeholder-slate-400 outline-none bg-slate-50
                       focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#162555] transition"
          >
            <Search size={16} />
          </button>
        </form>
      </SidebarSection>

      {/* CATEGORIES */}
      <SidebarSection title="Product Categories">
        {catLoading ? (
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ) : (
          <div ref={categoryDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen((v) => !v)}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-xl
                 pl-3 pr-3 py-2.5 text-sm bg-slate-50 outline-none
                 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
            >
              {categoryId === "" ? (
                <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 border-cyan-400 bg-cyan-100">
                  <Tag size={13} className="text-cyan-600" />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-lg overflow-hidden flex-shrink-0 border-2 border-cyan-400">
                  <img
                    src={categories.find((c) => c._id === categoryId)?.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <span className="flex-1 text-left text-[#162555] font-medium">
                {categoryId === ""
                  ? "All Products"
                  : categories.find((c) => c._id === categoryId)?.name}
              </span>
              {categoryId === "" && (
                <span className="text-xs text-slate-400 flex-shrink-0 mr-1">
                  {totalProducts}
                </span>
              )}
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform flex-shrink-0 ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId("");
                    setCategoryOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition ${categoryId === "" ? "bg-cyan-50" : "hover:bg-slate-50"}`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition ${categoryId === "" ? "border-cyan-400 bg-cyan-100" : "border-slate-200 bg-slate-100"}`}
                  >
                    <Tag
                      size={13}
                      className={
                        categoryId === "" ? "text-cyan-600" : "text-slate-400"
                      }
                    />
                  </div>
                  <span
                    className={`flex-1 text-left ${categoryId === "" ? "text-cyan-700 font-semibold" : "text-slate-600"}`}
                  >
                    All Products
                  </span>
                  <span className="text-xs text-slate-400">
                    {totalProducts}
                  </span>
                  {categoryId === "" && (
                    <span className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                  )}
                </button>
                <div className="mx-3 border-t border-slate-100" />
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat._id);
                      setCategoryOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition ${categoryId === cat._id ? "bg-cyan-50" : "hover:bg-slate-50"}`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${categoryId === cat._id ? "border-cyan-400" : "border-slate-200"}`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <span
                      className={`flex-1 text-left capitalize leading-tight ${categoryId === cat._id ? "text-cyan-700 font-semibold" : "text-slate-600"}`}
                    >
                      {cat.name}
                    </span>
                    {categoryId === cat._id && (
                      <span className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </SidebarSection>

      {/* PRICE RANGE */}
      <SidebarSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block mb-1">
                Min (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPriceInput} // ← changed
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#162555] bg-slate-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
              />
            </div>
            <span className="text-slate-300 mt-4">—</span>
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block mb-1">
                Max (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={maxPriceInput} // ← changed
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#162555] bg-slate-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={
              maxPriceInput === ""
                ? 10000
                : Math.min(Number(maxPriceInput), 10000)
            } // ← changed
            onChange={(e) => setMaxPriceInput(e.target.value)} // ← changed
            className="w-full accent-cyan-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>₹0</span>
            <span>₹10,000+</span>
          </div>
        </div>
      </SidebarSection>

      {/* FEATURED */}
      <SidebarSection title="Filter">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setIsFeatured(!isFeatured)}
            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition cursor-pointer
              ${isFeatured ? "bg-cyan-500 border-cyan-500" : "border-slate-300 bg-white group-hover:border-cyan-400"}`}
          >
            {isFeatured && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path
                  d="M1 4L4 7.5L10 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-slate-600 group-hover:text-[#162555] transition">
            Featured products only
          </span>
        </label>
      </SidebarSection>

      {/* RESET */}
      <button
        onClick={handleReset}
        className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-red-300
                   text-sm font-semibold text-slate-500 hover:text-red-500
                   transition flex items-center justify-center gap-2"
      >
        <X size={14} /> Reset All Filters
      </button>
    </div>
  );

  const renderMobileSidebarContent = () => (
    <div className="space-y-0">
      {/* SEARCH — same as desktop, applies immediately */}
      <SidebarSection title="Search">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#162555] placeholder-slate-400 outline-none bg-slate-50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#162555] transition"
          >
            <Search size={16} />
          </button>
        </form>
      </SidebarSection>

      {/* CATEGORIES — uses staged state */}
      {/* CATEGORIES — uses staged state */}
      <SidebarSection title="Product Categories">
        {catLoading ? (
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileCategoryOpen((v) => !v);
              }}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-xl pl-3 pr-3 py-2.5 text-sm bg-slate-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
            >
              {stagedCategory === "" ? (
                <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 border-cyan-400 bg-cyan-100">
                  <Tag size={13} className="text-cyan-600" />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-lg overflow-hidden flex-shrink-0 border-2 border-cyan-400">
                  <img
                    src={
                      categories.find((c) => c._id === stagedCategory)?.image
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <span className="flex-1 text-left text-[#162555] font-medium truncate">
                {stagedCategory === ""
                  ? "All Products"
                  : categories.find((c) => c._id === stagedCategory)?.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform flex-shrink-0 ${mobileCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* ✅ Inline render instead of absolute — avoids overflow clipping */}
            {mobileCategoryOpen && (
              <div className="mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStagedCategory("");
                    setMobileCategoryOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                    stagedCategory === "" ? "bg-cyan-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition ${
                      stagedCategory === ""
                        ? "border-cyan-400 bg-cyan-100"
                        : "border-slate-200 bg-slate-100"
                    }`}
                  >
                    <Tag
                      size={13}
                      className={
                        stagedCategory === ""
                          ? "text-cyan-600"
                          : "text-slate-400"
                      }
                    />
                  </div>
                  <span
                    className={`flex-1 text-left ${stagedCategory === "" ? "text-cyan-700 font-semibold" : "text-slate-600"}`}
                  >
                    All Products
                  </span>
                  {stagedCategory === "" && (
                    <span className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                  )}
                </button>

                <div className="mx-3 border-t border-slate-100" />

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStagedCategory(cat._id);
                      setMobileCategoryOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                      stagedCategory === cat._id
                        ? "bg-cyan-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                        stagedCategory === cat._id
                          ? "border-cyan-400"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <span
                      className={`flex-1 text-left capitalize leading-tight ${
                        stagedCategory === cat._id
                          ? "text-cyan-700 font-semibold"
                          : "text-slate-600"
                      }`}
                    >
                      {cat.name}
                    </span>
                    {stagedCategory === cat._id && (
                      <span className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </SidebarSection>
      {/* PRICE RANGE — uses staged state */}
      <SidebarSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block mb-1">
                Min (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={stagedMinPrice}
                onChange={(e) => setStagedMinPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#162555] bg-slate-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
              />
            </div>
            <span className="text-slate-300 mt-4">—</span>
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block mb-1">
                Max (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={stagedMaxPrice}
                onChange={(e) => setStagedMaxPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#162555] bg-slate-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={
              stagedMaxPrice === ""
                ? 10000
                : Math.min(Number(stagedMaxPrice), 10000)
            }
            onChange={(e) => setStagedMaxPrice(e.target.value)}
            className="w-full accent-cyan-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>₹0</span>
            <span>₹10,000+</span>
          </div>
        </div>
      </SidebarSection>

      {/* FEATURED — uses staged state */}
      <SidebarSection title="Filter">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setStagedFeatured(!stagedFeatured)}
            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${stagedFeatured ? "bg-cyan-500 border-cyan-500" : "border-slate-300 bg-white group-hover:border-cyan-400"}`}
          >
            {stagedFeatured && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path
                  d="M1 4L4 7.5L10 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-slate-600 group-hover:text-[#162555] transition">
            Featured products only
          </span>
        </label>
      </SidebarSection>

      {/* RESET */}
      <button
        onClick={handleMobileReset}
        className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-red-300 text-sm font-semibold text-slate-500 hover:text-red-500 transition flex items-center justify-center gap-2"
      >
        <X size={14} /> Reset All Filters
      </button>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-[#162555]">
      {/* MOBILE DRAWER */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />
          <div className="relative w-[300px] h-full bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-lg font-bold text-[#162555]">Filters</span>
              <button
                onClick={() => setMobileSidebar(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1 items-start">
                <div className="flex-1 min-w-0">
                  {renderMobileSidebarContent()}
                </div>
                <div className="flex-shrink-0 bg-slate-50 rounded-lg border border-slate-200 py-2 px-1 flex flex-col items-center sticky top-0">
                  <AlphabetIndex
                    activeLetter={stagedLetter}
                    onSelect={(letter) => {
                      setStagedLetter(letter);
                      if (letter) {
                        setSearchInput("");
                        setAppliedSearch("");
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Apply button */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMobileApply();
                }}
                className="w-full py-3 rounded-xl bg-[#162555] hover:bg-[#1d3475] text-white text-sm font-bold transition shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 md:px-12 py-10">
        <div className="flex gap-8">
          {/* DESKTOP SIDEBAR */}
          {/* DESKTOP SIDEBAR — card + alphabet strip side-by-side */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="flex items-start sticky top-6">
              {/* Filters card — pr makes room so content never hides under strip */}
              <div className="flex-1 bg-white rounded-[0.3rem] border border-slate-200 shadow-sm p-6 min-w-0">
                {renderSidebarContent()}
              </div>
              {/* A–Z strip — sits outside the card on the right */}
              <div className="flex-shrink-0 bg-white rounded-[0.3rem] border border-slate-200 shadow-sm py-2 px-1 flex flex-col items-center">
                <AlphabetIndex
                  activeLetter={activeLetter}
                  onSelect={handleLetterSelect}
                />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0">
            {/* TOP BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebar(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#162555] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition hover:bg-[#1d3475]"
                >
                  <SlidersHorizontal size={15} /> Filters
                </button>
                <p className="text-sm text-slate-500">
                  {loading ? (
                    <span className="inline-block w-44 h-4 bg-slate-200 rounded animate-pulse" />
                  ) : totalProducts === 0 ? (
                    "No results found"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-[#162555]">
                        {startItem}–{endItem}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#162555]">
                        {totalProducts}
                      </span>{" "}
                      results
                      {activeLetter && (
                        <span className="ml-1 text-cyan-600 font-semibold">
                          · "{activeLetter}…"
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* ACTIVE FILTER PILLS */}
            {hasAnyFilter && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeLetter && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Starts with "{activeLetter}"
                    <button onClick={() => handleLetterSelect("")}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {appliedSearch && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Search: "{appliedSearch}"
                    <button
                      onClick={() => {
                        setAppliedSearch("");
                        setSearchInput("");
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {categoryId && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {categories.find((c) => c._id === categoryId)?.name ??
                      "Category"}
                    <button onClick={() => setCategoryId("")}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Featured only
                    <button onClick={() => setIsFeatured(false)}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {(minPrice !== "" || maxPrice !== "") && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    ₹{minPrice || 0} – ₹{maxPrice || "Any"}
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* GRID */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <DNA visible height="100" width="100" ariaLabel="dna-loading" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#162555] mb-2">
                  No medicines found
                </h3>
                <p className="text-slate-500 text-sm">
                  Try adjusting your filters or search keyword.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-[#162555] text-white text-sm font-semibold hover:bg-[#1d3475] transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-5">
                {products.map((med) => (
                  <MedicineCard
                    key={med.id}
                    med={med}
                    onViewDetails={(med) => router.push(`/products/${med.id}`)}
                  />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition
                    ${page === 1 ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white border border-slate-200 text-[#162555] hover:bg-[#162555] hover:text-white shadow-sm"}`}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                {getPageNumbers().map((pg, i) =>
                  pg === "..." ? (
                    <span
                      key={`e-${i}`}
                      className="px-2 text-slate-400 select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition
                        ${page === pg ? "bg-[#162555] text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"}`}
                    >
                      {pg}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition
                    ${page === totalPages ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white border border-slate-200 text-[#162555] hover:bg-[#162555] hover:text-white shadow-sm"}`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
