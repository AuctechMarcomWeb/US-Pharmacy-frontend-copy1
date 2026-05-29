"use client";

/**
 * PhoneField — drop-in replacement for the mobile number field in CheckoutPage.
 *
 * Props:
 *   value          – current raw digit string (no dial code) — internal display value
 *   onChange       – (fullNumber: string) => void  ← receives dialCode + digits e.g. "+911234567890"
 *   countries      – the same `countries` array already fetched in CheckoutPage
 *                    each item: { name, alpha2Code, flag }
 *   selectedCountry – the currently selected country object (same as checkout)
 *   onCountryChange – (country) => void  optional, called when dial-code country changes
 *   required        – bool
 *
 * The component manages its own dial-code dropdown state so it doesn't
 * pollute the parent with extra state. It calls onChange with the full
 * concatenated phone number: dialCode + rawDigits  (e.g. "+911234567890").
 * The input itself only shows the raw digits for a clean UX.
 *
 * Usage in CheckoutPage:
 *
 *   <PhoneField
 *     value={form.mobile}
 *     onChange={(fullNumber) => setForm((p) => ({ ...p, mobile: fullNumber }))}
 *     onCountryChange={setPhoneCountry}
 *     countries={countries}
 *     selectedCountry={selectedCountry}
 *     required
 *   />
 *
 * form.mobile will now hold the full number e.g. "+911234567890"
 * which you can send directly in the API payload.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Country dial codes ────────────────────────────────────────────────────────
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

// Extract raw digits from a full number string (strip the leading dial code if present)
function stripDialCode(fullNumber, dialCode) {
  if (!fullNumber) return "";
  const stripped = fullNumber.startsWith(dialCode)
    ? fullNumber.slice(dialCode.length)
    : fullNumber;
  return stripped.replace(/\D/g, "");
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
    .filter((c) => DIAL_META[c.alpha2Code])
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
        className={`h-full flex items-center gap-1.5 pl-3 pr-2 rounded-l-lg border-r-0 transition-all text-sm font-bold bg-slate-50 min-w-[80px]
          ${isOpen ? "border-slate-400 bg-white" : "border-slate-200 hover:border-slate-300"}`}
      >
        <span className="text-sm leading-none">
          {selectedCountry?.flag || "🌐"}
        </span>
        <span className="text-xs font-semibold text-slate-600">
          {meta.dialCode}
        </span>
        <ChevronDown
          size={11}
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
                  className="w-full pl-7 pr-7 py-1.5 text-xs font-medium rounded-md bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-300 outline-none focus:border-slate-400 transition-all"
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
                <div className="px-4 py-4 text-center text-xs text-slate-400">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors
                        ${i < filtered.length - 1 ? "border-b border-slate-50" : ""}
                        ${isSelected ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="text-sm w-5 text-center flex-shrink-0">
                        {country.flag || "🌐"}
                      </span>
                      <span className="flex-1 text-left truncate">
                        {country.name}
                      </span>
                      <span className="text-slate-400 font-mono flex-shrink-0 text-[10px]">
                        {m.dialCode}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={11}
                          className="text-emerald-500 flex-shrink-0"
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
export default function PhoneField({
  value = "",
  onChange,
  onCountryChange,
  countries = [],
  selectedCountry: externalCountry,
  required = false,
}) {
  const [phoneCountry, setPhoneCountry] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Sync with external country on first load / change
  useEffect(() => {
    if (
      externalCountry &&
      (!phoneCountry || phoneCountry.alpha2Code !== externalCountry.alpha2Code)
    ) {
      setPhoneCountry(externalCountry);
      onCountryChange?.(externalCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCountry]);

  const meta = phoneCountry
    ? getDialMeta(phoneCountry.alpha2Code)
    : { dialCode: "+1", min: 7, max: 15 };

  // The display value is always raw digits (strip dial code from stored value)
  const displayDigits = stripDialCode(value, meta.dialCode);

  // Validation against raw digits
  const isValid =
    displayDigits.length >= meta.min && displayDigits.length <= meta.max;
  const showError = touched && displayDigits.length > 0 && !isValid;
  const showSuccess = touched && displayDigits.length > 0 && isValid;

  // Emit dialCode + digits to parent
  const emitChange = useCallback(
    (rawDigits, dialCode) => {
      onChange(dialCode + rawDigits);
    },
    [onChange],
  );

  const handleInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, meta.max);
    emitChange(raw, meta.dialCode);
  };

  const handleCountrySelect = (country) => {
    setPhoneCountry(country);
    onCountryChange?.(country);
    setDropdownOpen(false);
    const newMeta = getDialMeta(country.alpha2Code);
    // Re-emit with new dial code; trim digits if they exceed new country's max
    const trimmedDigits = displayDigits.slice(0, newMeta.max);
    onChange(newMeta.dialCode + trimmedDigits);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const borderClass = showError
    ? "border-red-400"
    : showSuccess
      ? "border-emerald-400"
      : dropdownOpen
        ? "border-slate-400 ring-2 ring-slate-100"
        : "border-slate-200 hover:border-slate-300";

  return (
    <div
      className={`flex rounded-lg border-2 bg-slate-50 transition-all overflow-hidden ${borderClass}`}
    >
      <DialDropdown
        countries={countries}
        selectedCountry={phoneCountry}
        isOpen={dropdownOpen}
        onToggle={() => setDropdownOpen((p) => !p)}
        onSelect={handleCountrySelect}
        onClose={() => setDropdownOpen(false)}
      />
      <div className="w-px bg-slate-200 self-stretch flex-shrink-0" />
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={displayDigits}
          onChange={handleInput}
          onBlur={() => setTouched(true)}
          placeholder={"X".repeat(meta.max)}
          maxLength={meta.max}
          required={required}
          className="w-full h-full px-3 py-2 bg-transparent text-slate-700 placeholder-slate-300 outline-none text-xs font-medium tracking-wide"
        />
        {displayDigits.length > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            {showSuccess && (
              <CheckCircle2 size={13} className="text-emerald-500" />
            )}
            {showError && <AlertCircle size={13} className="text-red-400" />}
          </div>
        )}
      </div>
    </div>
  );
}
