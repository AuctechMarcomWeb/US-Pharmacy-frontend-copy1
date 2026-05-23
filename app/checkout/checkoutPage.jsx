"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCart } from "../../context/CartContext";
import { postRequest, getRequest } from "../../helper/index";
import OrderConfirmModal from "../../components/OrderConfirmationModal"; // ← separate modal component

import {
  ShieldCheck,
  CreditCard,
  Truck,
  BadgeCheck,
  LockKeyhole,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Package,
  ArrowRight,
  Star,
  Clock,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  X,
  Globe,
  Search,
} from "lucide-react";

const fmt = (n) => Number(n).toFixed(2);
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500";

const metadata = {
  title: "Secure Checkout | US Pharmacy",
  description:
    "Complete your secure order request at US Pharmacy with trusted delivery, encrypted checkout, and multiple payment options.",

  keywords: [
    "US Pharmacy checkout",
    "secure medicine order",
    "online pharmacy checkout",
    "healthcare payment",
    "medicine delivery",
    "secure pharmacy order",
  ],

  alternates: {
    canonical: "/checkout",
  },
};

// ── Country Dropdown (portal) ─────────────────────────────────────────────────
function CountryDropdown({
  countries,
  selectedCountry,
  isOpen,
  onToggle,
  onSelect,
  onClose,
  loading,
  error,
}) {
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [search, setSearch] = useState("");

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    // Focus search input when dropdown opens
    setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const filtered = search.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : countries;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
        Country *
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        disabled={loading || !!error}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm font-semibold bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 size={14} className="text-green-400 animate-spin" />
            ) : selectedCountry?.flag ? (
              <span className="text-base leading-none">
                {selectedCountry.flag}
              </span>
            ) : (
              <Globe size={14} className="text-green-500" />
            )}
          </div>
          <span className="text-[#166534] truncate">
            {loading
              ? "Loading countries…"
              : error
                ? "Could not load countries"
                : selectedCountry?.name || "Select a country"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        !loading &&
        !error &&
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
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-300/60 overflow-hidden"
          >
            {/* Search bar */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country…"
                  className="w-full pl-8 pr-4 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-[#166534] placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                  No countries found
                </div>
              ) : (
                filtered.map((country, i) => (
                  <button
                    key={country.alpha2Code || country.name}
                    type="button"
                    onClick={() => {
                      onSelect(country);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      i < filtered.length - 1 ? "border-b border-slate-50" : ""
                    } ${
                      selectedCountry?.name === country.name
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base leading-none w-6 text-center flex-shrink-0">
                      {country.flag || "🌐"}
                    </span>
                    <span className="flex-1 text-left">{country.name}</span>
                    {selectedCountry?.name === country.name && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        SELECTED
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Payment Dropdown (portal) ─────────────────────────────────────────────────
function PaymentDropdown({
  paymentMethods,
  selectedId,
  isOpen,
  onToggle,
  onSelect,
  onClose,
  selectedPaymentMethod,
}) {
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
        Select Payment Method *
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm font-semibold bg-slate-50 ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <CreditCard size={14} className="text-emerald-600" />
          </div>
          <span className="text-[#166534] capitalize">
            {selectedPaymentMethod?.name || "Select a payment method"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen &&
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
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-300/60 overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {paymentMethods.map((method, i) => (
                <button
                  key={method._id}
                  type="button"
                  onClick={() => onSelect(method._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold capitalize transition-colors ${
                    i < paymentMethods.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  } ${
                    selectedId === method._id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedId === method._id
                        ? "bg-emerald-100 border border-emerald-200"
                        : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <CreditCard
                      size={14}
                      className={
                        selectedId === method._id
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    />
                  </div>
                  <span className="flex-1 text-left">{method.name}</span>
                  {selectedId === method._id && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Checkout Page ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, clearCart } = useCart();

  // ── Country state ────────────────────────────────────────────────────────
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    country: "United States",
    payment: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedPaymentName, setConfirmedPaymentName] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);

  // ── Confirm modal ────────────────────────────────────────────────────────
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) router.replace("/products");
  }, [cart, orderPlaced, router]);

  // Fetch countries from restcountries.com — free, no auth, CORS-open
  useEffect(() => {
    (async () => {
      try {
        setCountriesLoading(true);
        // Request only the fields we need to keep the payload small
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flag",
        );
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();

        // data[i] = { name: { common, official }, cca2: "US", flag: "🇺🇸" }
        const normalized = data
          .map((c) => ({
            name: c.name?.common || c.name?.official || "",
            alpha2Code: c.cca2,
            flag: c.flag || "🌐", // restcountries v3 already provides the emoji flag
          }))
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(normalized);

        // Default to United States
        const us = normalized.find((c) => c.alpha2Code === "US");
        const defaultCountry = us || normalized[0];
        if (defaultCountry) {
          setSelectedCountry(defaultCountry);
          setForm((p) => ({ ...p, country: defaultCountry.name }));
        }
      } catch {
        setCountriesError("Could not load countries.");
        // Hardcoded US fallback so the form always works
        const fallbackUS = {
          name: "United States",
          alpha2Code: "US",
          flag: "🇺🇸",
        };
        setCountries([fallbackUS]);
        setSelectedCountry(fallbackUS);
        setForm((p) => ({ ...p, country: "United States" }));
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

  // Fetch payment methods
  useEffect(() => {
    (async () => {
      try {
        setPaymentLoading(true);
        const res = await getRequest("/paymentMethod");
        const active = (res?.data?.data?.paymentMethods || []).filter(
          (m) => m.isActive,
        );
        setPaymentMethods(active);
        if (active.length > 0)
          setForm((p) => ({ ...p, payment: active[0]._id }));
      } catch {
        setPaymentError("Could not load payment methods.");
      } finally {
        setPaymentLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m._id === form.payment,
  );

  // ── Step 1: Form submit → open confirmation modal ─────────────────────────
  const handleOrder = (e) => {
    e.preventDefault();
    setOrderError(null);
    setConfirmModalOpen(true);
  };

  // ── Step 2: Modal confirmed → fire the actual API ─────────────────────────
  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    setOrderError(null);

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price,
          totalPrice: item.price * item.qty,
          packages: String(item.packageQty ?? ""),
          strength: item.strength ?? "",
          brand: item.brand ?? "",
        })),
        shippingAddress: {
          name: form.fullName,
          phone: form.mobile,
          country: form.country,
          email: form.email,
          address: `${form.address}, ${form.country}`,
        },
        paymentMethod: selectedPaymentMethod?.name ?? form.payment,
      };

      await postRequest({ url: "/orders/createOrderNew", cred: payload });

      setConfirmedItems([...cart]);
      setConfirmedTotal(total);
      setConfirmedPaymentName(selectedPaymentMethod?.name ?? form.payment);

      setConfirmModalOpen(false);
      clearCart();
      setOrderPlaced(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setConfirmModalOpen(false);
      setOrderError(
        err?.response?.data?.message || err.message || "Something went wrong.",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // THANK YOU PAGE
  // ─────────────────────────────────────────────────────────────────────────
  if (orderPlaced) {
    const orderDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-[1fr_480px] gap-8 items-start">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                  <BadgeCheck size={28} className="text-emerald-600" />
                </div>
                <h1 className="text-3xl md:text-3xl font-black text-[#166534] leading-tight">
                  Thank you for
                  <br />
                  submitting your Request!
                </h1>
                <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-sm">
                  Your request will be processed within 24 hours during working
                  days. We will notify you by phone once your request has been
                  submitted.
                </p>
              </div>

              <div>
                <h2 className="text-base font-black text-[#166534] mb-4">
                  Billing address
                </h2>
                <div className="space-y-2.5">
                  {[
                    { label: "Name", value: form.fullName },
                    {
                      label: "Address",
                      value: `${form.address}, ${form.country}`,
                    },
                    { label: "Phone", value: form.mobile },
                    { label: "Email", value: form.email },
                    { label: "Payment", value: confirmedPaymentName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-6 text-sm">
                      <span className="w-20 text-slate-400 font-semibold flex-shrink-0">
                        {label}
                      </span>
                      <span className="text-[#166534] font-medium">
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push("/products")}
                className="w-fit px-7 py-3 rounded-full bg-gradient-to-r from-[#166534] to-[#16a34a] text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Continue Shopping
              </button>
            </div>

            {/* Right: Receipt */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-dashed border-slate-200">
                <h2 className="text-xl font-black text-[#166534] mb-4">
                  Order Summary
                </h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Date</p>
                    <p className="text-[#166534] font-bold">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Payment</p>
                    <p className="text-[#166534] font-bold capitalize">
                      {confirmedPaymentName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-64 overflow-y-auto border-b border-dashed border-slate-200">
                {confirmedItems.map((item) => (
                  <div
                    key={item.lineKey ?? item.id}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={item.thumbnail || FALLBACK_IMG}
                      alt={item.title}
                      className="h-14 w-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#166534] text-sm truncate">
                        {item.title}
                      </h4>
                      {item.strength && (
                        <p className="text-slate-400 text-xs mt-0.5">
                          {item.strength} · {item.packageQty} tabs
                        </p>
                      )}
                      <p className="text-slate-400 text-xs">Qty: {item.qty}</p>
                    </div>
                    <div className="text-sm font-bold text-[#166534] flex-shrink-0">
                      ₹{fmt(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Sub Total</span>
                  <span className="text-[#166534] font-semibold">
                    ₹{fmt(confirmedTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-base font-black text-[#166534]">
                    Total
                  </span>
                  <span className="text-xl font-black text-[#166534]">
                    ₹{fmt(confirmedTotal)}
                  </span>
                </div>
              </div>

              <div
                className="h-4 w-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, #f5f6fa 8px, white 8px) 0 0 / 20px 16px repeat-x",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN CHECKOUT
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#166534] relative overflow-hidden pb-10">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/30
bg-green-200/30 rounded-full blur-[120px] pointer-events-none"
      />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-xl mx-auto px-10 py-4 flex items-center justify-center">
          {/* <div className="flex items-center gap-2"> */}
          {/* <div className="h-8 w-8 rounded-lg bg-[#166534] flex items-center justify-center hidden sm:block">
              <LockKeyhole size={14} className="text-white" />
            </div> */}
          {/* <span className="font-black text-[#166534] tracking-tight text-lg hidden sm:block ">
              Secure Checkout
            </span> */}
          {/* </div> */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between min-w-[280px] sm:min-w-0 gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-500">
              {["Cart", "Shipping", "Confirm"].map((step, i) => (
                <div key={i} className="flex items-center flex-1 min-w-0">
                  {/* Step */}
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <div
                      className={`
                        h-5 w-5 sm:h-6 sm:w-6
                        rounded-full
                        flex items-center justify-center
                        text-[9px] sm:text-[10px]
                        font-black
                        flex-shrink-0
                        ${
                          i <= 1
                            ? "bg-[#166534] text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }
                      `}
                    >
                      {i < 1 ? "✓" : i + 1}
                    </div>

                    <span
                      className={`
              truncate whitespace-nowrap
              ${i <= 1 ? "text-[#166534]" : "text-slate-400"}
            `}
                    >
                      {step}
                    </span>
                  </div>

                  {/* Connector */}
                  {i < 2 && (
                    <div
                      className={`
              flex-1 h-px mx-1 sm:mx-2 min-w-[16px]
              ${i < 1 ? "bg-[#166534]" : "bg-slate-200"}
            `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-8 md:py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-3xl font-bold tracking-tight text-[#166534]">
            Submit Your Order Request
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Fill in your details below — we'll take care of the rest
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">
          {/* ── LEFT: FORM ── */}
          <form
            onSubmit={handleOrder}
            className="bg-white rounded-[1.75rem] border border-slate-200 shadow-xl shadow-slate-200/60"
          >
            {/* Shipping */}
            <div className="px-4 md:px-8 pt-7 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Truck size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#166534] leading-none">
                    Shipping Details
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Where should we deliver?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    placeholder="e.g. John Smith"
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[#166534] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        name="mobile"
                        placeholder="98765 43210"
                        value={form.mobile}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            mobile: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 15),
                          })
                        }
                        maxLength={15}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[#166534] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="you@email.com"
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[#166534] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                    Shipping Address *
                  </label>
                  <textarea
                    name="address"
                    placeholder="House / Flat No., Street, Area..."
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-[#166534] placeholder-slate-300 outline-none resize-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                    required
                  />
                </div>

                {/* ── Country Dropdown ── */}
                <CountryDropdown
                  countries={countries}
                  selectedCountry={selectedCountry}
                  isOpen={countryDropdownOpen}
                  onToggle={() => setCountryDropdownOpen((p) => !p)}
                  onSelect={(country) => {
                    setSelectedCountry(country);
                    setForm((p) => ({ ...p, country: country.name }));
                    setCountryDropdownOpen(false);
                  }}
                  onClose={() => setCountryDropdownOpen(false)}
                  loading={countriesLoading}
                  error={countriesError}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="px-4 md:px-8 pt-6 pb-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CreditCard size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#166534] leading-none">
                    Payment Method
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>

              {paymentLoading ? (
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  Loading payment options...
                </div>
              ) : paymentError ? (
                <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-sm text-red-500">{paymentError}</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-xs text-emerald-600 font-bold underline ml-3"
                  >
                    Retry
                  </button>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm">
                  No payment methods available
                </div>
              ) : (
                <PaymentDropdown
                  paymentMethods={paymentMethods}
                  selectedId={form.payment}
                  isOpen={paymentDropdownOpen}
                  onToggle={() => setPaymentDropdownOpen((p) => !p)}
                  onSelect={(id) => {
                    setForm((p) => ({ ...p, payment: id }));
                    setPaymentDropdownOpen(false);
                  }}
                  onClose={() => setPaymentDropdownOpen(false)}
                  selectedPaymentMethod={selectedPaymentMethod}
                />
              )}

              {orderError && (
                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-black">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-700">
                      Order Failed
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">{orderError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderError(null)}
                    className="text-red-300 hover:text-red-500 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  paymentLoading ||
                  !!paymentError ||
                  paymentMethods.length === 0 ||
                  orderLoading
                }
                className="
    w-full mt-5 sm:mt-6

    h-12 sm:h-14
    px-3 sm:px-5

    rounded-xl sm:rounded-2xl

    bg-gradient-to-r from-[#166534] to-[#16a34a]
hover:from-[#14532d] hover:to-[#15803d]

    text-white
    font-black

    text-[13px] sm:text-base

    transition-all duration-300
    active:scale-[0.98]

    shadow-xl sm:shadow-2xl shadow-blue-900/30

    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:scale-100

    flex items-center justify-center gap-1.5 sm:gap-2

    whitespace-nowrap
  "
              >
                {orderLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin flex-shrink-0" />

                    <span className="truncate">Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={15} className="flex-shrink-0" />

                    <span className="truncate">
                      Place Secure Order · ₹{fmt(total)}
                    </span>

                    <ArrowRight size={15} className="flex-shrink-0" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-3">
                By placing an order, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </form>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Package size={16} className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-black text-[#166534]">
                  Order Summary
                </h2>
                <span className="ml-auto text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items */}
              <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                {cart.map((item) => {
                  const lineKey = item.lineKey ?? item.id;
                  return (
                    <div
                      key={lineKey}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-3 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="h-16 w-16 min-w-[64px] rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                          <img
                            src={item.thumbnail || FALLBACK_IMG}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = FALLBACK_IMG;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#166534] text-sm line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          {item.category && (
                            <span className="inline-block text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full mt-1 font-semibold">
                              {item.category}
                            </span>
                          )}
                          {item.strength && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              {item.strength} · {item.packageQty} tabs
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-slate-400">
                              ₹{fmt(item.price)} each
                            </span>
                            <span className="text-sm font-black text-[#166534]">
                              ₹{fmt(item.price * item.qty)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.qty <= 1) removeFromCart(lineKey);
                              else updateQty(lineKey, item.qty - 1);
                            }}
                            className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            {item.qty <= 1 ? (
                              <Trash2 size={12} />
                            ) : (
                              <Minus size={12} />
                            )}
                          </button>
                          <span className="w-7 text-center text-sm font-black text-[#166534]">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(lineKey, item.qty + 1)}
                            className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(lineKey)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                        >
                          <X size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-[#166534]">
                    ₹{fmt(total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-base font-black text-[#166534]">
                    Total
                  </span>
                  <span className="text-2xl font-black text-[#166534]">
                    ₹{fmt(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Confirmation Modal ── */}
      <OrderConfirmModal
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handlePlaceOrder}
        loading={orderLoading}
        total={total}
        itemCount={cart.length}
        selectedCountry={form.country}
      />
    </div>
  );
}
