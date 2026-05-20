"use client";

import { useState } from "react";
import { Modal, Checkbox, Button } from "antd";
import { AlertTriangle, ShieldCheck, Package, Loader2 } from "lucide-react";

/**
 * OrderConfirmModal
 *
 * Props:
 *  - open         {boolean}  — controls visibility
 *  - onCancel     {fn}       — called when user closes/cancels modal
 *  - onConfirm    {fn}       — called when user checks box & clicks Submit (triggers the real place-order API)
 *  - loading      {boolean}  — disables & shows spinner on Submit while API is in-flight
 *  - total        {number}   — order total to display in the modal
 *  - itemCount    {number}   — number of cart items
 *  - selectedCountry {string} — country name the user selected
 */
export default function OrderConfirmModal({
  open,
  onCancel,
  onConfirm,
  loading = false,
  total = 0,
  itemCount = 0,
  selectedCountry = "",
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  // Reset checkbox each time the modal opens
  const handleOpenChange = (visible) => {
    if (visible) setAcknowledged(false);
  };

  const fmt = (n) => Number(n).toFixed(2);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      afterOpenChange={handleOpenChange}
      footer={null}
      centered
      closable={!loading}
      mask={{ closable: !loading }}
      width={480}
      styles={{
        content: {
          borderRadius: "1.25rem",
          padding: 0,
          overflow: "hidden",
          boxShadow:
            "0 25px 60px -10px rgba(22,37,85,0.18), 0 8px 24px -6px rgba(22,37,85,0.10)",
        },
        mask: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(15,23,42,0.45)",
        },
      }}
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#162555] to-[#2846a5] px-6 pt-6 pb-5">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-snug">
              Confirm Your Order
            </h2>
            <p className="text-blue-200 text-xs mt-0.5 font-medium">
              Please review before placing
            </p>
          </div>
        </div>

        {/* Quick summary pills */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[11px] font-bold bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] font-bold bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">
            ₹{fmt(total)}
          </span>
          {selectedCountry && (
            <span className="text-[11px] font-bold bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full truncate max-w-[140px]">
              {selectedCountry}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 pt-5 pb-6 space-y-5 bg-white">
        {/* Disclaimer card */}
        <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="h-8 w-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-800 leading-snug mb-1">
              Delivery Availability Notice
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              We currently ship to{" "}
              <span className="font-bold">select countries only</span>. If your
              selected country —{" "}
              <span className="font-bold">
                {selectedCountry || "your country"}
              </span>{" "}
              — is outside our delivery network, your order{" "}
              <span className="font-bold">may not reach you</span>. Please
              verify availability before confirming.
            </p>
          </div>
        </div>

        {/* Acknowledgement checkbox */}
        <div
          className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            acknowledged
              ? "border-cyan-400 bg-cyan-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
          onClick={() => setAcknowledged((v) => !v)}
        >
          <Checkbox
            checked={acknowledged}
            onChange={(e) => {
              e.stopPropagation();
              setAcknowledged(e.target.checked);
            }}
            className="mt-0.5 flex-shrink-0"
          />
          <p className="text-xs font-semibold text-slate-600 leading-relaxed select-none">
            I understand that if my country (
            <span className="font-black text-[#162555]">
              {selectedCountry || "selected country"}
            </span>
            ) is not in the serviceable delivery zone, my order{" "}
            <span className="font-bold text-red-600">
              will not be delivered
            </span>{" "}
            and I accept full responsibility for this.
          </p>
        </div>

        {/* Trust note */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
          <span>
            Your order is secured with 256-bit SSL encryption. No payment is
            charged until dispatch.
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!acknowledged || loading}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              acknowledged && !loading
                ? "bg-gradient-to-r from-[#162555] to-[#2846a5] hover:from-[#1e3370] hover:to-[#3156cc] text-white shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Placing Order…
              </>
            ) : (
              <>Confirm &amp; Place Order</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
