"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCart } from "../../context/CartContext";
import { postRequest, getRequest } from "../../helper/index";
import PhoneField from "../../components/PhoneField";

import {
  CreditCard,
  BadgeCheck,
  LockKeyhole,
  Mail,
  Loader2,
  Package,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  X,
  Globe,
  Search,
  MapPin,
} from "lucide-react";

const fmt = (n) => Number(n).toFixed(2);
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500";

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Cart", "Order Summary", "Shipping", "Confirm"];
  return (
    <div className="relative z-20 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-center flex-wrap">
          {steps.map((label, i) => {
            const idx = i;
            const isFinalStep = step === steps.length - 1;

            const done =
              idx === 0 || step > idx || (isFinalStep && idx === step);

            const active = idx !== 0 && step === idx && !isFinalStep;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0 transition-all ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-[#064e3b] text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {done ? "✓" : idx}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                      done
                        ? "text-emerald-600"
                        : active
                          ? "text-[#064e3b]"
                          : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-5 sm:w-14 h-px mx-1.5 sm:mx-3 transition-all ${
                      done ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Country Dropdown (portal) ──────────────────────────────────────────────────
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
      top: rect.bottom + window.scrollY + 4,
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
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        disabled={loading || !!error}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-semibold bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-5 w-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 size={11} className="text-emerald-400 animate-spin" />
            ) : selectedCountry?.flag ? (
              <span className="text-xs leading-none">
                {selectedCountry.flag}
              </span>
            ) : (
              <Globe size={11} className="text-emerald-600" />
            )}
          </div>
          <span className="text-[#064e3b] truncate text-xs sm:text-sm">
            {loading
              ? "Loading…"
              : error
                ? "Could not load"
                : selectedCountry?.name || "Select a country"}
          </span>
        </div>
        <ChevronDown
          size={13}
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
            className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/60 overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={11}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country…"
                  className="w-full pl-7 pr-8 py-1.5 text-xs font-medium rounded-md bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors ${
                      i < filtered.length - 1 ? "border-b border-slate-50" : ""
                    } ${
                      selectedCountry?.name === country.name
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm leading-none w-5 text-center flex-shrink-0">
                      {country.flag || "🌐"}
                    </span>
                    <span className="flex-1 text-left">{country.name}</span>
                    {selectedCountry?.name === country.name && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        ✓
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

// ── Payment Dropdown (portal) ──────────────────────────────────────────────────
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
      top: rect.bottom + window.scrollY + 4,
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
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-semibold bg-slate-50 ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <CreditCard size={11} className="text-emerald-600" />
          </div>
          <span className="text-[#064e3b] capitalize text-xs sm:text-sm">
            {selectedPaymentMethod?.name || "Select a payment method"}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
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
            className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/60 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {paymentMethods.map((method, i) => (
                <button
                  key={method._id}
                  type="button"
                  onClick={() => onSelect(method._id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold capitalize transition-colors ${
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
                    className={`h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      selectedId === method._id
                        ? "bg-emerald-100 border border-emerald-200"
                        : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <CreditCard
                      size={11}
                      className={
                        selectedId === method._id
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    />
                  </div>
                  <span className="flex-1 text-left">{method.name}</span>
                  {selectedId === method._id && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      ✓
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

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, clearCart, totalSavings, totalMrp } =
    useCart();

  // step: 1 = Order Summary, 2 = Shipping + Payment, 3 = Thank You
  const [step, setStep] = useState(1);

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    country: "United States",
    payment: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [confirmedPaymentName, setConfirmedPaymentName] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && step === 1) router.replace("/products");
  }, [cart, step, router]);

  // Load countries
  useEffect(() => {
    (async () => {
      try {
        setCountriesLoading(true);
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flag",
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const normalized = data
          .map((c) => ({
            name: c.name?.common || c.name?.official || "",
            alpha2Code: c.cca2,
            flag: c.flag || "🌐",
          }))
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(normalized);
        const us =
          normalized.find((c) => c.alpha2Code === "US") || normalized[0];
        if (us) {
          setSelectedCountry(us);
          setForm((p) => ({ ...p, country: us.name }));
        }
      } catch {
        setCountriesError("Could not load countries.");
        const fallback = {
          name: "United States",
          alpha2Code: "US",
          flag: "🇺🇸",
        };
        setCountries([fallback]);
        setSelectedCountry(fallback);
        setForm((p) => ({ ...p, country: "United States" }));
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

  // Load payment methods
  useEffect(() => {
    (async () => {
      try {
        setPaymentLoading(true);
        const res = await getRequest("/paymentMethod");
        const active = (res?.data?.data?.paymentMethods || []).filter(
          (m) => m.isActive,
        );
        setPaymentMethods(active);
      } catch {
        setPaymentError("Could not load payment methods.");
      } finally {
        setPaymentLoading(false);
      }
    })();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedPaymentMethod = paymentMethods.find(
    (m) => m._id === form.payment,
  );

  const canSubmit =
    termsAccepted &&
    !paymentLoading &&
    !paymentError &&
    !!form.payment &&
    !orderLoading;

  const goToShipping = () => setStep(2);
  const goToSummary = () => setStep(1);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
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
          address: form.address,
        },
        paymentMethod: selectedPaymentMethod?.name ?? form.payment,
      };
      await postRequest({ url: "/orders/createOrderNew", cred: payload });
      setConfirmedItems([...cart]);
      setConfirmedTotal(total);
      setConfirmedPaymentName(selectedPaymentMethod?.name ?? form.payment);
      clearCart();
      setStep(3);
    } catch (err) {
      setOrderError(
        err?.response?.data?.message || err.message || "Something went wrong.",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  // ─── STEP 3: THANK YOU ─────────────────────────────────────────────────────
  if (step === 3) {
    const orderDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return (
      <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-[#064e3b]">
        <StepBar step={3} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-5 items-start">
              {/* Left */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                    <BadgeCheck size={20} className="text-emerald-600" />
                  </div>
                  <h1 className="text-xl font-black text-[#064e3b] leading-tight">
                    Thank you for submitting your Request!
                  </h1>
                  <p className="mt-1.5 text-slate-500 text-xs leading-relaxed max-w-sm">
                    Your request will be processed within 24 hours during
                    working days. We will notify you by phone once submitted.
                  </p>
                </div>
                <div>
                  <h2 className="text-xs font-black text-[#064e3b] mb-2">
                    Billing address
                  </h2>
                  <div className="space-y-1">
                    {[
                      { label: "Name", value: form.fullName },
                      { label: "Address", value: form.address },
                      { label: "Phone", value: form.mobile },
                      { label: "Email", value: form.email },
                      { label: "Payment", value: confirmedPaymentName },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-4 text-xs">
                        <span className="w-14 text-slate-400 font-semibold flex-shrink-0">
                          {label}
                        </span>
                        <span className="text-[#064e3b] font-medium">
                          {value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => router.push("/products")}
                  className="w-fit px-5 py-2 rounded-full text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-[#064e3b] to-[#059669]"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Right — order summary card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-dashed border-slate-200">
                  <h2 className="text-sm font-black text-[#064e3b] mb-2">
                    Order Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium mb-0.5">Date</p>
                      <p className="text-[#064e3b] font-bold">{orderDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium mb-0.5">
                        Payment Method
                      </p>
                      <p className="text-[#064e3b] font-bold capitalize">
                        {confirmedPaymentName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 space-y-2.5 border-b border-dashed border-slate-200">
                  {confirmedItems.map((item) => (
                    <div
                      key={item.lineKey ?? item.id}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={item.thumbnail || FALLBACK_IMG}
                        alt={item.title}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMG;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#064e3b] text-xs truncate">
                          {item.title}
                        </h4>
                        {item.strength && (
                          <p className="text-slate-400 text-[10px]">
                            {item.strength} · {item.packageQty} tabs
                          </p>
                        )}
                        <p className="text-slate-400 text-[10px]">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-[#064e3b] flex-shrink-0">
                        ${fmt(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Sub Total</span>
                    <span className="text-[#064e3b] font-semibold">
                      ${fmt(confirmedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                    <span className="text-xs font-black text-[#064e3b]">
                      Total
                    </span>
                    <span className="text-base font-black text-[#064e3b]">
                      ${fmt(confirmedTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 1: ORDER SUMMARY ─────────────────────────────────────────────────
  if (step === 1) {
    const grouped = cart.reduce((acc, item) => {
      const key = item.category || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-[#f0fdf4] text-[#064e3b]">
        <StepBar step={1} />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 items-start">
          {/* LEFT — grouped items */}
          <div className="w-full lg:flex-1 min-w-0 space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-sm font-bold text-[#064e3b] mb-2">
                  {category}{" "}
                  <span className="font-normal text-slate-500">
                    ({items.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const lineKey = item.lineKey ?? item.id;
                    return (
                      <div
                        key={lineKey}
                        className="bg-white rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex gap-3">
                          {/* thumbnail */}
                          <div className="h-14 w-14 sm:h-16 sm:w-16 min-w-[56px] sm:min-w-[64px] rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
                            <img
                              src={item.thumbnail || FALLBACK_IMG}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = FALLBACK_IMG;
                              }}
                            />
                          </div>
                          {/* details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-[#064e3b] text-xs sm:text-sm leading-snug line-clamp-2">
                                {item.title}
                              </h3>
                              {/* qty controls */}
                              <div className="flex items-center gap-1 sm:gap-1.5 border border-slate-200 rounded-full px-1.5 sm:px-2 py-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.qty <= 1) removeFromCart(lineKey);
                                    else updateQty(lineKey, item.qty - 1);
                                  }}
                                  className="flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
                                >
                                  {item.qty <= 1 ? (
                                    <Trash2 size={10} />
                                  ) : (
                                    <Minus size={10} />
                                  )}
                                </button>
                                <span className="text-xs font-black text-[#064e3b] w-4 text-center">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQty(lineKey, item.qty + 1)
                                  }
                                  className="flex items-center justify-center text-slate-500 hover:text-[#064e3b] transition-colors"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                            {item.packageQty && (
                              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                                {item.strength} · {item.packageQty} tabs
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs sm:text-sm font-black text-[#064e3b]">
                                ${fmt(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — payment details sidebar */}
          <div className="w-full lg:w-72 lg:flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-black text-[#064e3b] mb-3">
              Payment details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">MRP Total</span>
                <span className="text-[#064e3b]">${fmt(totalMrp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Discount</span>
                <span className="text-emerald-600">
                  ${fmt(totalSavings ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
                <span className="font-black text-[#064e3b]">Total Payable</span>
                <span className="font-black text-[#064e3b]">${fmt(total)}</span>
              </div>
            </div>
            <button
              onClick={goToShipping}
              disabled={cart.length === 0}
              className="mt-4 w-full py-2.5 rounded-xl text-white font-black text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#064e3b] to-[#059669] hover:from-[#065f46] hover:to-[#10b981]"
            >
              Proceed to Shipping <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: SHIPPING + PAYMENT + TERMS ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-[#064e3b]">
      <StepBar step={2} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="px-4 sm:px-5 pt-2 pb-1.5 border-b border-slate-100 flex items-center gap-2.5 bg-gradient-to-r from-white to-emerald-50/30">
              <button
                type="button"
                onClick={goToSummary}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-[#064e3b] hover:bg-emerald-50 transition-all flex-shrink-0 shadow-sm"
                aria-label="Back to order summary"
              >
                <ArrowRight size={12} className="rotate-180" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black text-[#064e3b] tracking-wide">
                  CHECKOUT
                </h2>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400 font-medium">
                  Step 2 of 2
                </span>
              </div>
            </div>

            {/* ── Form body ── */}
            <div className="px-4 sm:px-5 py-5 space-y-3.5">
              {/* Row 1: Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="fullName"
                    placeholder="e.g. John Smith"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={11}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-xs font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Country + Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    Country <span className="text-red-400">*</span>
                  </label>
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    Mobile <span className="text-red-400">*</span>
                  </label>
                  <PhoneField
                    value={form.mobile}
                    onChange={(digits) =>
                      setForm((p) => ({ ...p, mobile: digits }))
                    }
                    onCountryChange={setPhoneCountry}
                    countries={countries}
                    selectedCountry={selectedCountry}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Payment label + dropdown inline */}
              <div className="flex sm:flex-col  gap-3">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 flex-shrink-0">
                  Payment Method <span className="text-red-400">*</span>
                </label>
                <div className="flex-1">
                  {paymentLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-xs">
                      <Loader2
                        size={13}
                        className="animate-spin text-emerald-500"
                      />{" "}
                      Loading...
                    </div>
                  ) : paymentError ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-xs text-red-500">
                        {paymentError}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-xs text-emerald-600 font-bold underline ml-3"
                      >
                        Retry
                      </button>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-xs">
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
                </div>
              </div>

              {/* Row 4: Address full width */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={11}
                    className="absolute left-3 top-2.5 text-slate-300"
                  />
                  <textarea
                    name="address"
                    placeholder="House / Flat No., Street, Area, City, State..."
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                    rows={2}
                    className="w-full pl-8 pr-3 pt-2 pb-2 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none resize-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-xs font-medium"
                    required
                  />
                </div>
              </div>

              {/* Mini order total */}
              {/* <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Package size={12} />
                  <span>
                    {cart.reduce((s, i) => s + i.qty, 0)} item
                    {cart.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 font-semibold">
                    Free delivery
                  </span>
                </div>
                <span className="text-sm font-black text-[#064e3b]">
                  ${fmt(total)}
                </span>
              </div> */}

              {/* Terms checkbox */}
              <label
                className={`flex items-start gap-2 cursor-pointer select-none p-2.5 rounded-xl border-2 transition-all ${
                  termsAccepted
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <div
                    className={`h-3.5 w-3.5 rounded border-2 flex items-center justify-center transition-all ${
                      termsAccepted
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {termsAccepted && (
                      <svg width="8" height="6" viewBox="0 0 11 9" fill="none">
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
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed font-medium flex-1">
                  I agree to the Terms & Conditions and Privacy Policy.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDisclaimer(true);
                  }}
                  className="flex-shrink-0 h-3.5 w-3.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center hover:bg-emerald-600 transition-colors mt-0.5"
                  aria-label="View disclaimer"
                >
                  i
                </button>
              </label>

              {/* Order error */}
              {orderError && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <div className="h-3.5 w-3.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-[9px] font-black">
                      !
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-red-700">
                      Order Failed
                    </p>
                    <p className="text-[10px] text-red-500 mt-0.5">
                      {orderError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderError(null)}
                    className="text-red-300 hover:text-red-500 text-base leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Place Order button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-black text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap disabled:cursor-not-allowed ${
                  canSubmit
                    ? "bg-gradient-to-r from-[#064e3b] to-[#059669] hover:from-[#065f46] hover:to-[#10b981] text-white shadow-xl shadow-emerald-900/30"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {orderLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin flex-shrink-0" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={12} className="flex-shrink-0" />
                    <span>Place Secure Order · ${fmt(total)}</span>
                    <ArrowRight size={12} className="flex-shrink-0" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDisclaimer(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-sm w-full mx-0 sm:mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Disclaimer</h3>
              <button
                type="button"
                onClick={() => setShowDisclaimer(false)}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={11} className="text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              By proceeding, you agree to our{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-emerald-600 underline font-semibold hover:text-emerald-700"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-emerald-600 underline font-semibold hover:text-emerald-700"
              >
                Privacy Policy
              </a>
              . This is an order request and will be reviewed and processed
              within 24 business hours.
            </p>
            <button
              type="button"
              onClick={() => setShowDisclaimer(false)}
              className="mt-4 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
