"use client";

/**
 * PhoneField — drop-in replacement for the mobile number field in CheckoutPage.
 *
 * Props:
 *   value          – current raw digit string (no dial code)
 *   onChange       – (rawDigits: string) => void
 *   countries      – the same `countries` array already fetched in CheckoutPage
 *                    each item: { name, alpha2Code, flag }
 *   selectedCountry – the currently selected country object (same as checkout)
 *   required        – bool
 *
 * The component manages its own dial-code dropdown state so it doesn't
 * pollute the parent with extra state. It calls onChange with validated
 * digits only (strips non-numeric, respects maxLength for the country).
 *
 * Usage in CheckoutPage — replace the old mobile <div> block with:
 *
 *   <PhoneField
 *     value={form.mobile}
 *     onChange={(digits) => setForm((p) => ({ ...p, mobile: digits }))}
 *     countries={countries}
 *     selectedCountry={selectedCountry}
 *     required
 *   />
 *
 * And add `phoneCountry` to form state so you can read the dial code on submit:
 *   const [phoneCountry, setPhoneCountry] = useState(null);
 * Then pass  onCountryChange={setPhoneCountry}  to read the selected dial-code country.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Phone,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";

// ─── Country dial codes ────────────────────────────────────────────────────────
// A comprehensive map: alpha2Code → { dialCode, maxLen, minLen, pattern label }
const DIAL_META = {
  AF: { dialCode: "+93", min: 9, max: 9 },
  AL: { dialCode: "+355", min: 9, max: 9 },
  DZ: { dialCode: "+213", min: 9, max: 9 },
  AD: { dialCode: "+376", min: 6, max: 9 },
  AO: { dialCode: "+244", min: 9, max: 9 },
  AR: { dialCode: "+54", min: 10, max: 11 },
  AM: { dialCode: "+374", min: 8, max: 8 },
  AU: { dialCode: "+61", min: 9, max: 9 },
  AT: { dialCode: "+43", min: 10, max: 13 },
  AZ: { dialCode: "+994", min: 9, max: 9 },
  BH: { dialCode: "+973", min: 8, max: 8 },
  BD: { dialCode: "+880", min: 10, max: 10 },
  BY: { dialCode: "+375", min: 9, max: 9 },
  BE: { dialCode: "+32", min: 9, max: 9 },
  BZ: { dialCode: "+501", min: 7, max: 7 },
  BJ: { dialCode: "+229", min: 8, max: 8 },
  BT: { dialCode: "+975", min: 8, max: 8 },
  BO: { dialCode: "+591", min: 8, max: 8 },
  BA: { dialCode: "+387", min: 8, max: 8 },
  BW: { dialCode: "+267", min: 8, max: 8 },
  BR: { dialCode: "+55", min: 10, max: 11 },
  BN: { dialCode: "+673", min: 7, max: 7 },
  BG: { dialCode: "+359", min: 9, max: 9 },
  BF: { dialCode: "+226", min: 8, max: 8 },
  BI: { dialCode: "+257", min: 8, max: 8 },
  KH: { dialCode: "+855", min: 9, max: 9 },
  CM: { dialCode: "+237", min: 9, max: 9 },
  CA: { dialCode: "+1", min: 10, max: 10 },
  CV: { dialCode: "+238", min: 7, max: 7 },
  CF: { dialCode: "+236", min: 8, max: 8 },
  TD: { dialCode: "+235", min: 8, max: 8 },
  CL: { dialCode: "+56", min: 9, max: 9 },
  CN: { dialCode: "+86", min: 11, max: 11 },
  CO: { dialCode: "+57", min: 10, max: 10 },
  KM: { dialCode: "+269", min: 7, max: 7 },
  CG: { dialCode: "+242", min: 9, max: 9 },
  CD: { dialCode: "+243", min: 9, max: 9 },
  CR: { dialCode: "+506", min: 8, max: 8 },
  HR: { dialCode: "+385", min: 9, max: 9 },
  CU: { dialCode: "+53", min: 8, max: 8 },
  CY: { dialCode: "+357", min: 8, max: 8 },
  CZ: { dialCode: "+420", min: 9, max: 9 },
  DK: { dialCode: "+45", min: 8, max: 8 },
  DJ: { dialCode: "+253", min: 8, max: 8 },
  DO: { dialCode: "+1", min: 10, max: 10 },
  EC: { dialCode: "+593", min: 9, max: 9 },
  EG: { dialCode: "+20", min: 10, max: 10 },
  SV: { dialCode: "+503", min: 8, max: 8 },
  GQ: { dialCode: "+240", min: 9, max: 9 },
  ER: { dialCode: "+291", min: 7, max: 7 },
  EE: { dialCode: "+372", min: 7, max: 8 },
  ET: { dialCode: "+251", min: 9, max: 9 },
  FJ: { dialCode: "+679", min: 7, max: 7 },
  FI: { dialCode: "+358", min: 9, max: 9 },
  FR: { dialCode: "+33", min: 9, max: 9 },
  GA: { dialCode: "+241", min: 7, max: 7 },
  GM: { dialCode: "+220", min: 7, max: 7 },
  GE: { dialCode: "+995", min: 9, max: 9 },
  DE: { dialCode: "+49", min: 10, max: 12 },
  GH: { dialCode: "+233", min: 9, max: 9 },
  GR: { dialCode: "+30", min: 10, max: 10 },
  GT: { dialCode: "+502", min: 8, max: 8 },
  GN: { dialCode: "+224", min: 9, max: 9 },
  GW: { dialCode: "+245", min: 7, max: 7 },
  GY: { dialCode: "+592", min: 7, max: 7 },
  HT: { dialCode: "+509", min: 8, max: 8 },
  HN: { dialCode: "+504", min: 8, max: 8 },
  HK: { dialCode: "+852", min: 8, max: 8 },
  HU: { dialCode: "+36", min: 9, max: 9 },
  IS: { dialCode: "+354", min: 7, max: 7 },
  IN: { dialCode: "+91", min: 10, max: 10 },
  ID: { dialCode: "+62", min: 9, max: 12 },
  IR: { dialCode: "+98", min: 10, max: 10 },
  IQ: { dialCode: "+964", min: 10, max: 10 },
  IE: { dialCode: "+353", min: 9, max: 9 },
  IL: { dialCode: "+972", min: 9, max: 9 },
  IT: { dialCode: "+39", min: 9, max: 10 },
  JM: { dialCode: "+1", min: 10, max: 10 },
  JP: { dialCode: "+81", min: 10, max: 10 },
  JO: { dialCode: "+962", min: 9, max: 9 },
  KZ: { dialCode: "+7", min: 10, max: 10 },
  KE: { dialCode: "+254", min: 10, max: 10 },
  KI: { dialCode: "+686", min: 5, max: 8 },
  KW: { dialCode: "+965", min: 8, max: 8 },
  KG: { dialCode: "+996", min: 9, max: 9 },
  LA: { dialCode: "+856", min: 9, max: 10 },
  LV: { dialCode: "+371", min: 8, max: 8 },
  LB: { dialCode: "+961", min: 7, max: 8 },
  LS: { dialCode: "+266", min: 8, max: 8 },
  LR: { dialCode: "+231", min: 7, max: 8 },
  LY: { dialCode: "+218", min: 9, max: 9 },
  LI: { dialCode: "+423", min: 7, max: 9 },
  LT: { dialCode: "+370", min: 8, max: 8 },
  LU: { dialCode: "+352", min: 9, max: 9 },
  MO: { dialCode: "+853", min: 8, max: 8 },
  MK: { dialCode: "+389", min: 8, max: 8 },
  MG: { dialCode: "+261", min: 9, max: 9 },
  MW: { dialCode: "+265", min: 9, max: 9 },
  MY: { dialCode: "+60", min: 9, max: 10 },
  MV: { dialCode: "+960", min: 7, max: 7 },
  ML: { dialCode: "+223", min: 8, max: 8 },
  MT: { dialCode: "+356", min: 8, max: 8 },
  MH: { dialCode: "+692", min: 7, max: 7 },
  MR: { dialCode: "+222", min: 8, max: 8 },
  MU: { dialCode: "+230", min: 8, max: 8 },
  MX: { dialCode: "+52", min: 10, max: 10 },
  FM: { dialCode: "+691", min: 7, max: 7 },
  MD: { dialCode: "+373", min: 8, max: 8 },
  MC: { dialCode: "+377", min: 8, max: 9 },
  MN: { dialCode: "+976", min: 8, max: 8 },
  ME: { dialCode: "+382", min: 8, max: 8 },
  MA: { dialCode: "+212", min: 9, max: 9 },
  MZ: { dialCode: "+258", min: 9, max: 9 },
  MM: { dialCode: "+95", min: 9, max: 10 },
  NA: { dialCode: "+264", min: 9, max: 9 },
  NR: { dialCode: "+674", min: 7, max: 7 },
  NP: { dialCode: "+977", min: 10, max: 10 },
  NL: { dialCode: "+31", min: 9, max: 9 },
  NZ: { dialCode: "+64", min: 8, max: 10 },
  NI: { dialCode: "+505", min: 8, max: 8 },
  NE: { dialCode: "+227", min: 8, max: 8 },
  NG: { dialCode: "+234", min: 10, max: 10 },
  NO: { dialCode: "+47", min: 8, max: 8 },
  OM: { dialCode: "+968", min: 8, max: 8 },
  PK: { dialCode: "+92", min: 10, max: 10 },
  PW: { dialCode: "+680", min: 7, max: 7 },
  PA: { dialCode: "+507", min: 8, max: 8 },
  PG: { dialCode: "+675", min: 8, max: 8 },
  PY: { dialCode: "+595", min: 9, max: 9 },
  PE: { dialCode: "+51", min: 9, max: 9 },
  PH: { dialCode: "+63", min: 10, max: 10 },
  PL: { dialCode: "+48", min: 9, max: 9 },
  PT: { dialCode: "+351", min: 9, max: 9 },
  QA: { dialCode: "+974", min: 8, max: 8 },
  RO: { dialCode: "+40", min: 9, max: 9 },
  RU: { dialCode: "+7", min: 10, max: 10 },
  RW: { dialCode: "+250", min: 9, max: 9 },
  WS: { dialCode: "+685", min: 5, max: 7 },
  SM: { dialCode: "+378", min: 9, max: 10 },
  ST: { dialCode: "+239", min: 7, max: 7 },
  SA: { dialCode: "+966", min: 9, max: 9 },
  SN: { dialCode: "+221", min: 9, max: 9 },
  RS: { dialCode: "+381", min: 9, max: 9 },
  SC: { dialCode: "+248", min: 7, max: 7 },
  SL: { dialCode: "+232", min: 8, max: 8 },
  SG: { dialCode: "+65", min: 8, max: 8 },
  SK: { dialCode: "+421", min: 9, max: 9 },
  SI: { dialCode: "+386", min: 8, max: 8 },
  SB: { dialCode: "+677", min: 5, max: 7 },
  SO: { dialCode: "+252", min: 7, max: 9 },
  ZA: { dialCode: "+27", min: 9, max: 9 },
  SS: { dialCode: "+211", min: 9, max: 9 },
  ES: { dialCode: "+34", min: 9, max: 9 },
  LK: { dialCode: "+94", min: 9, max: 9 },
  SD: { dialCode: "+249", min: 9, max: 9 },
  SR: { dialCode: "+597", min: 7, max: 7 },
  SZ: { dialCode: "+268", min: 8, max: 8 },
  SE: { dialCode: "+46", min: 9, max: 9 },
  CH: { dialCode: "+41", min: 9, max: 9 },
  SY: { dialCode: "+963", min: 9, max: 9 },
  TW: { dialCode: "+886", min: 9, max: 9 },
  TJ: { dialCode: "+992", min: 9, max: 9 },
  TZ: { dialCode: "+255", min: 9, max: 9 },
  TH: { dialCode: "+66", min: 9, max: 9 },
  TL: { dialCode: "+670", min: 7, max: 8 },
  TG: { dialCode: "+228", min: 8, max: 8 },
  TO: { dialCode: "+676", min: 5, max: 7 },
  TT: { dialCode: "+1", min: 10, max: 10 },
  TN: { dialCode: "+216", min: 8, max: 8 },
  TR: { dialCode: "+90", min: 10, max: 10 },
  TM: { dialCode: "+993", min: 8, max: 8 },
  TV: { dialCode: "+688", min: 5, max: 6 },
  UG: { dialCode: "+256", min: 9, max: 9 },
  UA: { dialCode: "+380", min: 9, max: 9 },
  AE: { dialCode: "+971", min: 9, max: 9 },
  GB: { dialCode: "+44", min: 10, max: 10 },
  US: { dialCode: "+1", min: 10, max: 10 },
  UY: { dialCode: "+598", min: 8, max: 8 },
  UZ: { dialCode: "+998", min: 9, max: 9 },
  VU: { dialCode: "+678", min: 5, max: 7 },
  VE: { dialCode: "+58", min: 10, max: 10 },
  VN: { dialCode: "+84", min: 9, max: 10 },
  YE: { dialCode: "+967", min: 9, max: 9 },
  ZM: { dialCode: "+260", min: 9, max: 9 },
  ZW: { dialCode: "+263", min: 9, max: 9 },
};

function getDialMeta(alpha2Code) {
  return DIAL_META[alpha2Code] || { dialCode: "+1", min: 7, max: 15 };
}

function getPlaceholder(meta, countryName) {
  return "X".repeat(meta.max);
}

// ─── Dial-code dropdown ────────────────────────────────────────────────────────
function DialDropdown({
  countries,
  selectedCountry,
  isOpen,
  onToggle,
  onSelect,
  onClose,
}) {
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 });
  const [search, setSearch] = useState("");

  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: 280,
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

  const filtered = countries
    .filter((c) => DIAL_META[c.alpha2Code]) // only countries with known dial code
    .filter(
      (c) =>
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const meta = selectedCountry
    ? getDialMeta(selectedCountry.alpha2Code)
    : { dialCode: "+1" };

  return (
    <div
      ref={triggerRef}
      className="flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          updateCoords();
          onToggle();
        }}
        className={`h-full flex items-center gap-1.5 pl-3.5 pr-2.5 rounded-l-xl border-2 border-r-0 transition-all text-sm font-bold bg-slate-50 min-w-[90px]
          ${isOpen ? "border-cyan-400 bg-white" : "border-slate-200 hover:border-slate-300"}`}
      >
        <span className="text-base leading-none">
          {selectedCountry?.flag || "🌐"}
        </span>
        <span className="text-[#162555] text-xs">{meta.dialCode}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ml-0.5 ${isOpen ? "rotate-180" : ""}`}
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
                  className="w-full pl-8 pr-7 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-[#162555] placeholder-slate-300 outline-none focus:border-cyan-400 transition-all"
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
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  No countries found
                </div>
              ) : (
                filtered.map((country, i) => {
                  const m = getDialMeta(country.alpha2Code);
                  const isSelected =
                    selectedCountry?.alpha2Code === country.alpha2Code;
                  return (
                    <button
                      key={country.alpha2Code}
                      type="button"
                      onClick={() => {
                        onSelect(country);
                        setSearch("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors
                    ${i < filtered.length - 1 ? "border-b border-slate-50" : ""}
                    ${isSelected ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="text-base w-6 text-center flex-shrink-0">
                        {country.flag || "🌐"}
                      </span>
                      <span className="flex-1 text-left truncate">
                        {country.name}
                      </span>
                      <span className="text-slate-400 font-mono flex-shrink-0">
                        {m.dialCode}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={12}
                          className="text-cyan-500 flex-shrink-0"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── Main PhoneField ───────────────────────────────────────────────────────────
/**
 * onChange now fires with the FULL concatenated number: dialCode + digits
 * e.g. "+919876543210"
 *
 * Extra prop:
 *   shippingCountry – the country selected in the shipping section (for mismatch warning)
 */
export default function PhoneField({
  value = "",
  onChange,
  onCountryChange,
  countries = [],
  selectedCountry: externalCountry,
  shippingCountry, // ← NEW: pass the shipping selectedCountry here for mismatch check
  required = false,
}) {
  // Internal phone-country state (may differ from shipping country)
  const [phoneCountry, setPhoneCountry] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Sync with external country on first load / change
  // Only auto-sync if user hasn't manually picked a different phone country
  const [userPickedPhoneCountry, setUserPickedPhoneCountry] = useState(false);
  useEffect(() => {
    if (externalCountry && !userPickedPhoneCountry) {
      setPhoneCountry(externalCountry);
      onCountryChange?.(externalCountry);
    }
  }, [externalCountry, userPickedPhoneCountry]);

  const meta = phoneCountry
    ? getDialMeta(phoneCountry.alpha2Code)
    : { dialCode: "+1", min: 7, max: 15 };

  // Strip the leading dial code from value if present, to get raw digits
  // value coming in may be full "+91XXXXXXXXXX" or just "XXXXXXXXXX"
  const rawDigits = (() => {
    if (!value) return "";
    const stripped = value.startsWith(meta.dialCode)
      ? value.slice(meta.dialCode.length)
      : value;
    return stripped.replace(/\D/g, "");
  })();

  // Validation
  const isValid = rawDigits.length >= meta.min && rawDigits.length <= meta.max;
  const showError = touched && rawDigits.length > 0 && !isValid;
  const showSuccess = touched && rawDigits.length > 0 && isValid;

  // ── Mismatch check ──────────────────────────────────────────────────────────
  // Compare phone country vs shipping country (by alpha2Code)
  const effectiveShipping = shippingCountry || externalCountry;
  const isMismatch =
    phoneCountry &&
    effectiveShipping &&
    phoneCountry.alpha2Code !== effectiveShipping.alpha2Code;

  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, meta.max);
    // Fire with concatenated full number
    onChange(meta.dialCode + digits);
  };

  const handleCountrySelect = (country) => {
    setPhoneCountry(country);
    setUserPickedPhoneCountry(true);
    onCountryChange?.(country);
    setDropdownOpen(false);
    // Re-validate digits against new country rules
    const newMeta = getDialMeta(country.alpha2Code);
    const clipped = rawDigits.slice(0, newMeta.max);
    onChange(newMeta.dialCode + clipped);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const borderClass = showError
    ? "border-red-400"
    : showSuccess
      ? "border-emerald-400"
      : isMismatch
        ? "border-amber-400"
        : dropdownOpen
          ? "border-cyan-400 ring-2 ring-cyan-100"
          : "border-slate-200 hover:border-slate-300";

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
        Mobile Number *
      </label>

      <div
        className={`flex rounded-xl border-2 bg-slate-50 transition-all overflow-hidden ${borderClass}`}
      >
        {/* Dial code trigger */}
        <DialDropdown
          countries={countries}
          selectedCountry={phoneCountry}
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen((p) => !p)}
          onSelect={handleCountrySelect}
          onClose={() => setDropdownOpen(false)}
        />

        {/* Separator */}
        <div className="w-px bg-slate-200 self-stretch flex-shrink-0" />

        {/* Number input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={rawDigits}
            onChange={handleInput}
            onBlur={() => setTouched(true)}
            placeholder={getPlaceholder(meta)}
            maxLength={meta.max}
            required={required}
            className="w-full h-full px-3.5 py-3.5 bg-transparent text-[#162555] placeholder-slate-300 outline-none text-sm font-medium tracking-wide"
          />
          {/* Status icon */}
          {rawDigits.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {showSuccess && !isMismatch && (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
              {showError && <AlertCircle size={16} className="text-red-400" />}
              {isMismatch && !showError && (
                <TriangleAlert size={16} className="text-amber-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hint / error / success line */}
      <div className="ml-1 mt-1.5 text-[11px] font-medium min-h-[16px]">
        {showError ? (
          <span className="text-red-500">
            {rawDigits.length < meta.min
              ? `Too short — needs ${meta.min} digits for ${phoneCountry?.name || "this country"} (${meta.dialCode})`
              : `Too long — max ${meta.max} digits for ${phoneCountry?.name || "this country"} (${meta.dialCode})`}
          </span>
        ) : showSuccess ? (
          <span className="text-emerald-600">
            ✓ Full number: {meta.dialCode} {rawDigits}
          </span>
        ) : (
          <span className="text-slate-400">
            {meta.dialCode} ·{" "}
            {meta.min === meta.max ? `${meta.min}` : `${meta.min}–${meta.max}`}{" "}
            digits
          </span>
        )}
      </div>

      {/* ── Mismatch disclaimer ─────────────────────────────────────────────── */}
      {isMismatch && (
        <div className="mt-2.5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <TriangleAlert
            size={15}
            className="text-amber-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-amber-700 leading-snug">
              Phone country doesn't match shipping country
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5 leading-snug">
              Your shipping address is set to{" "}
              <span className="font-bold">
                {effectiveShipping?.flag} {effectiveShipping?.name}
              </span>
              , but the phone code is for{" "}
              <span className="font-bold">
                {phoneCountry?.flag} {phoneCountry?.name} ({meta.dialCode})
              </span>
              . This is fine if you're using a foreign number — just
              double-check before submitting.
            </p>
          </div>
          {/* Quick-fix button: snap phone country to match shipping */}
          <button
            type="button"
            onClick={() => {
              handleCountrySelect(effectiveShipping);
              setUserPickedPhoneCountry(false);
            }}
            className="flex-shrink-0 text-[10px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
          >
            Use {effectiveShipping?.flag}{" "}
            {getDialMeta(effectiveShipping?.alpha2Code)?.dialCode}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── HOW TO INTEGRATE INTO CheckoutPage ───────────────────────────────────────
//
// 1. Import at the top:
//      import PhoneField from "./PhoneField";
//
// 2. Replace the old Mobile Number <div> with:
//
//      <PhoneField
//        value={form.mobile}
//        onChange={(fullNumber) => setForm((p) => ({ ...p, mobile: fullNumber }))}
//        countries={countries}
//        selectedCountry={selectedCountry}   // shipping country — auto-syncs dial code
//        shippingCountry={selectedCountry}   // same ref — used for mismatch disclaimer
//        required
//      />
//
// 3. form.mobile now holds the FULL number e.g. "+919876543210"
//    Use it directly in the payload — no manual concatenation needed:
//
//      shippingAddress: { phone: form.mobile, ... }
//
// The mismatch disclaimer appears automatically when the phone country differs
// from the shipping country, and includes a one-click fix button.
