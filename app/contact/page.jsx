"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { postRequest } from "../../helper";

const metadata = {
  title: "Contact Us | Prescription Medicine Information & Inquiry",
  description:
    "Contact our team for prescription medicine information, availability inquiries, prescription assistance, and general support.",
  keywords: [
    "medicine inquiry",
    "prescription information",
    "availability inquiry",
    "contact support",
    "drug information",
    "prescription assistance",
  ],
  alternates: {
    canonical: "/contact-us",
  },
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    discription: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postRequest({
        url: "/contact/create",
        cred: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          title: form.title,
          discription: form.discription,
        },
      });
      showToast(
        "success",
        res?.data?.message ||
        "Inquiry submitted successfully.Our team will review your request and contact you if further information is required.",
      );
      setForm({ name: "", phone: "", email: "", title: "", discription: "" });
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
        err.message ||
        "Unable to submit your inquiry. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-white via-green-50 to-[#eef8f1] px-4 sm:px-6 py-10 sm:py-16 overflow-hidden relative"
      aria-labelledby="contact-heading"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-[-100px] w-[320px] h-[320px] bg-[#4f9b62]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[320px] h-[320px] bg-[#337642]/10 blur-3xl rounded-full pointer-events-none" />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-xl border text-sm font-semibold sm:max-w-sm transition-all ${toast.type === "success"
            ? "bg-green-50 border-green-200 text-[#285e35]"
            : "bg-red-50 border-red-200 text-red-700"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              size={18}
              className="flex-shrink-0 text-emerald-500"
            />
          ) : (
            <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
          )}
          <span className="flex-1">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-4xl mx-auto text-center mb-10 sm:mb-14 relative z-10">
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm mb-4 sm:mb-5 backdrop-blur-xl">
          <Mail size={16} />
          Secure Communication Channel
        </div> */}
        <h1
          className="text-3xl sm:text-4xl md:text-3xl font-extrabold tracking-tight text-[#285e35]"
          id="contact-heading"
        >
          Contact Our Support Team
        </h1>
        <p className="mt-3 sm:mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          Contact our team for medicine information, prescription assistance, availability inquiries, or general support. All requests are reviewed manually.
        </p>
      </header>

      {/* GRID — form first on mobile via order */}
      <section
        className="max-w-3xl mx-auto grid md:grid-cols-1 gap-6 sm:gap-10 relative z-10"
        aria-label="Contact information and contact form"
      >
        {/* FORM — order-1 on mobile (shows first), order-2 on md+ (shows second/right) */}
        <form
          onSubmit={handleSubmit}
          className="order-1 md:order-2 bg-[#eef8f1] backdrop-blur-2xl border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-[#285e35] mb-5 sm:mb-6">
            Submit Inquiry
          </h2>

          {/* NAME + PHONE row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 text-[#285e35] placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-sm"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              type="tel"
              maxLength={10}
              className="w-full p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 text-[#285e35] placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-sm"
            />
          </div>

          {/* EMAIL */}
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            type="email"
            className="w-full p-3 sm:p-4 mb-3 sm:mb-4 rounded-2xl bg-white border border-slate-200 text-[#285e35] placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-sm"
          />

          {/* TITLE */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Inquiry Subject"
            required
            className="w-full p-3 sm:p-4 mb-3 sm:mb-4 rounded-2xl bg-white border border-slate-200 text-[#285e35] placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-sm"
          />

          {/* MESSAGE */}
          <textarea
            name="discription"
            value={form.discription}
            onChange={handleChange}
            placeholder="Describe your inquiry or provide additional information"
            rows={4}
            required
            className="w-full p-3 sm:p-4 mb-4 sm:mb-5 rounded-2xl bg-white border border-slate-200 text-[#285e35] placeholder:text-slate-400 outline-none resize-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all text-sm"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-[#337642] hover:bg-[#285e35] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Inquiry
              </>
            )}
          </button>
        </form>

        {/* LEFT INFO — order-2 on mobile (shows second), order-1 on md+ (shows first/left) */}
        {/* <div className="order-2 md:order-1 space-y-4 sm:space-y-6">
          {[
            { icon: Phone, label: "Hotline", value: "+91 98765 43210" },
            { icon: Mail, label: "Email", value: "support@medicoforensic.com" },
            {
              icon: MapPin,
              label: "Location",
              value: "Forensic Medical HQ, India",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-[#C6E9FF] backdrop-blur-2xl border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-emerald-700 mb-2 sm:mb-3">
                <Icon size={20} />
                <h2 className="font-bold text-base sm:text-lg">{label}</h2>
              </div>
              <p className="text-slate-600 text-sm sm:text-base">{value}</p>
            </div>
          ))}
        </div> */}
      </section>
    </main>
  );
}
