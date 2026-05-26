"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCart } from "../../context/CartContext";
import { postRequest, getRequest } from "../../helper/index";

import {
  CreditCard,
  Truck,
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

import PhoneField from "../../components/PhoneField";

const fmt = (n) => Number(n).toFixed(2);
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500";

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Order Summary", "Shipping", "Confirm"];
  return (
    <div className="relative z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold">
          {steps.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div key={label} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 transition-all ${
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
                    className={`truncate whitespace-nowrap ${
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
                {i < 2 && (
                  <div
                    className={`flex-1 h-px mx-2 min-w-[12px] transition-all ${
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
      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
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
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-semibold bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 size={12} className="text-emerald-400 animate-spin" />
            ) : selectedCountry?.flag ? (
              <span className="text-sm leading-none">
                {selectedCountry.flag}
              </span>
            ) : (
              <Globe size={12} className="text-emerald-500" />
            )}
          </div>
          <span className="text-[#064e3b] truncate text-sm">
            {loading
              ? "Loading…"
              : error
                ? "Could not load"
                : selectedCountry?.name || "Select a country"}
          </span>
        </div>
        <ChevronDown
          size={14}
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
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country…"
                  className="w-full pl-7 pr-8 py-1.5 text-xs font-medium rounded-md bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 transition-all"
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
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-5 text-center text-xs text-slate-400 font-medium">
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold transition-colors ${
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
      <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
        Payment Method *
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-semibold bg-slate-50 ${
          isOpen
            ? "border-emerald-400 bg-white ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <CreditCard size={12} className="text-emerald-600" />
          </div>
          <span className="text-[#064e3b] capitalize text-sm">
            {selectedPaymentMethod?.name || "Select a payment method"}
          </span>
        </div>
        <ChevronDown
          size={14}
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
            <div className="max-h-56 overflow-y-auto">
              {paymentMethods.map((method, i) => (
                <button
                  key={method._id}
                  type="button"
                  onClick={() => onSelect(method._id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
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
                    className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                      selectedId === method._id
                        ? "bg-emerald-100 border border-emerald-200"
                        : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <CreditCard
                      size={12}
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

// ─── Background wrapper ───────────────────────────────────────────────────────
function BG({ children }) {
  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#064e3b] relative overflow-hidden pb-10">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />
      {children}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, clearCart } = useCart();

  // step: 1 = Order Summary, 2 = Shipping + Payment, 3 = Thank You
  const [step, setStep] = useState(1);

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    fullAddress: "",
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

  // Redirect to products if cart is empty and not on thank you step
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

  // Submit requires: payment selected + terms accepted + not loading
  const canSubmit =
    termsAccepted &&
    !paymentLoading &&
    !paymentError &&
    !!form.payment &&
    !orderLoading;

  const goToShipping = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSummary = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          address: form.fullAddress,
        },
        paymentMethod: selectedPaymentMethod?.name ?? form.payment,
      };
      await postRequest({ url: "/orders/createOrderNew", cred: payload });
      setConfirmedItems([...cart]);
      setConfirmedTotal(total);
      setConfirmedPaymentName(selectedPaymentMethod?.name ?? form.payment);
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <BG>
        <StepBar step={3} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[1fr_440px] gap-6 items-start">
            {/* Left: confirmation info */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                  <BadgeCheck size={22} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-black text-[#064e3b] leading-tight">
                  Thank you for
                  <br />
                  submitting your Request!
                </h1>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-sm">
                  Your request will be processed within 24 hours during working
                  days. We will notify you by phone once submitted.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#064e3b] mb-3">
                  Billing address
                </h2>
                <div className="space-y-1.5">
                  {[
                    { label: "Name", value: form.fullName },
                    { label: "Address", value: form.fullAddress },
                    { label: "Phone", value: form.mobile },
                    { label: "Email", value: form.email },
                    { label: "Payment", value: confirmedPaymentName },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-5 text-sm">
                      <span className="w-16 text-slate-400 font-semibold flex-shrink-0">
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
                className="w-fit px-6 py-2.5 rounded-full bg-gradient-to-r from-[#064e3b] to-[#059669] text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Continue Shopping
              </button>
            </div>

            {/* Right: order summary card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-dashed border-slate-200">
                <h2 className="text-base font-black text-[#064e3b] mb-3">
                  Order Summary
                </h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Date</p>
                    <p className="text-[#064e3b] font-bold">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Payment</p>
                    <p className="text-[#064e3b] font-bold capitalize">
                      {confirmedPaymentName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 space-y-3 max-h-56 overflow-y-auto border-b border-dashed border-slate-200">
                {confirmedItems.map((item) => (
                  <div
                    key={item.lineKey ?? item.id}
                    className="flex items-center gap-2.5"
                  >
                    <img
                      src={item.thumbnail || FALLBACK_IMG}
                      alt={item.title}
                      className="h-12 w-12 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#064e3b] text-sm truncate">
                        {item.title}
                      </h4>
                      {item.strength && (
                        <p className="text-slate-400 text-xs">
                          {item.strength} · {item.packageQty} tabs
                        </p>
                      )}
                      <p className="text-slate-400 text-xs">Qty: {item.qty}</p>
                    </div>
                    <div className="text-sm font-bold text-[#064e3b] flex-shrink-0">
                      ${fmt(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Sub Total</span>
                  <span className="text-[#064e3b] font-semibold">
                    ${fmt(confirmedTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm font-black text-[#064e3b]">
                    Total
                  </span>
                  <span className="text-lg font-black text-[#064e3b]">
                    ${fmt(confirmedTotal)}
                  </span>
                </div>
              </div>
              <div
                className="h-3 w-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, #f5f6fa 7px, white 7px) 0 0 / 18px 12px repeat-x",
                }}
              />
            </div>
          </div>
        </div>
      </BG>
    );
  }

  // ─── STEP 1: ORDER SUMMARY ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <BG>
        <StepBar step={1} />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-7">
          <div className="mb-5 text-center">
            <h1 className="text-xl font-black text-[#064e3b]">Order Summary</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              Review your items before proceeding
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Package size={14} className="text-emerald-600" />
              </div>
              <h2 className="text-sm font-black text-[#064e3b]">Your Items</h2>
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Items list */}
            <div className="p-3 space-y-2">
              {cart.map((item) => {
                const lineKey = item.lineKey ?? item.id;
                return (
                  <div
                    key={lineKey}
                    className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex gap-2.5">
                      <div className="h-14 w-14 min-w-[56px] rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
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
                        <h3 className="font-bold text-[#064e3b] text-sm line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        {item.category && (
                          <span className="inline-block text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full mt-0.5 font-semibold">
                            {item.category}
                          </span>
                        )}
                        {item.strength && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.strength} · {item.packageQty} tabs
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-400">
                            ${fmt(item.price)} each
                          </span>
                          <span className="text-sm font-black text-[#064e3b]">
                            ${fmt(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.qty <= 1) removeFromCart(lineKey);
                            else updateQty(lineKey, item.qty - 1);
                          }}
                          className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          {item.qty <= 1 ? (
                            <Trash2 size={11} />
                          ) : (
                            <Minus size={11} />
                          )}
                        </button>
                        <span className="w-6 text-center text-sm font-black text-[#064e3b]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(lineKey, item.qty + 1)}
                          className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(lineKey)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                      >
                        <X size={11} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-[#064e3b]">
                  ${fmt(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-sm font-black text-[#064e3b]">Total</span>
                <span className="text-xl font-black text-[#064e3b]">
                  ${fmt(total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <button
                onClick={goToShipping}
                disabled={cart.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#064e3b] to-[#059669] hover:from-[#065f46] hover:to-[#10b981] text-white font-black text-sm shadow-xl shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Shipping <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </BG>
    );
  }

  // ─── STEP 2: SHIPPING + PAYMENT + TERMS ────────────────────────────────────
  return (
    <BG>
      <StepBar step={2} />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-7">
        <div className="mb-5 text-center">
          <h1 className="text-xl font-black text-[#064e3b]">
            Shipping & Payment
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Enter your details to complete the order request
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60"
        >
          {/* ── Shipping section ── */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 mb-4">
              {/* Back button */}
              <button
                type="button"
                onClick={goToSummary}
                className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-[#064e3b] hover:bg-slate-100 transition-all flex-shrink-0"
                aria-label="Back to order summary"
              >
                <ArrowRight size={13} className="rotate-180" />
              </button>
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Truck size={14} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#064e3b] leading-none">
                  Shipping Details
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Where should we deliver?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  placeholder="e.g. John Smith"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                  required
                />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
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
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      size={13}
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Country Dropdown */}
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
              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
                  Full Address *
                </label>
                <div className="relative">
                  <MapPin
                    size={13}
                    className="absolute left-3 top-3 text-slate-300"
                  />
                  <textarea
                    name="fullAddress"
                    placeholder="House / Flat No., Street, Area, City, State, Country..."
                    value={form.fullAddress}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fullAddress: e.target.value }))
                    }
                    rows={3}
                    className="w-full pl-9 pr-3 pt-2.5 pb-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#064e3b] placeholder-slate-300 outline-none resize-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 ml-1">
                  Include city, state, and country in your address
                </p>
              </div>
            </div>
          </div>

          {/* ── Payment section ── */}
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <CreditCard size={14} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#064e3b] leading-none">
                  Payment Method
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Choose how you'd like to pay
                </p>
              </div>
            </div>

            {paymentLoading ? (
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin text-emerald-400" />{" "}
                Loading payment options...
              </div>
            ) : paymentError ? (
              <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-red-50 border border-red-200">
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
              <div className="px-3 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm">
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

            {!form.payment &&
              !paymentLoading &&
              !paymentError &&
              paymentMethods.length > 0 && (
                <p className="text-[11px] text-amber-600 font-semibold mt-1.5 ml-1 flex items-center gap-1">
                  <span>⚠</span> Please select a payment method
                </p>
              )}

            {/* Mini order total */}
            <div className="mt-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
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
              <span className="text-base font-black text-[#064e3b]">
                ${fmt(total)}
              </span>
            </div>

            {/* ── Terms & Conditions checkbox ── */}
            <label
              className={`mt-3 flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-lg border-2 transition-all ${
                termsAccepted
                  ? "border-emerald-400 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
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
                  className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                    termsAccepted
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-slate-300"
                  }`}
                >
                  {termsAccepted && (
                    <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
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
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 font-bold"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 font-bold"
                >
                  Privacy Policy
                </a>
                . I understand this is an order request processed within 24
                business hours.
              </p>
            </label>

            {!termsAccepted && (
              <p className="text-[11px] text-amber-600 font-semibold mt-1.5 ml-1 flex items-center gap-1">
                <span>⚠</span> Please accept the terms to place your order
              </p>
            )}

            {/* Order error */}
            {orderError && (
              <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-[10px] font-black">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-700">Order Failed</p>
                  <p className="text-xs text-red-500 mt-0.5">{orderError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderError(null)}
                  className="text-red-300 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Place Order button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-2.5 rounded-lg font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap ${
                  canSubmit
                    ? "bg-gradient-to-r from-[#064e3b] to-[#059669] hover:from-[#065f46] hover:to-[#10b981] text-white shadow-xl shadow-emerald-900/30 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {orderLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin flex-shrink-0" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={13} className="flex-shrink-0" />
                    <span>Place Secure Order · ${fmt(total)}</span>
                    <ArrowRight size={13} className="flex-shrink-0" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-2">
              By placing an order, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </BG>
  );
}
