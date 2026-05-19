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

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    discription: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", msg: string }

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
          "Message sent successfully! We'll get back to you soon.",
      );
      setForm({ name: "", phone: "", email: "", title: "", discription: "" });
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message ||
          err.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-100 to-[#eef3ff] px-6 py-16 overflow-hidden relative">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-[-100px] w-[320px] h-[320px] bg-cyan-400/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[320px] h-[320px] bg-[#162555]/10 blur-3xl rounded-full pointer-events-none" />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-semibold max-w-sm transition-all animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
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
      <div className="max-w-4xl mx-auto text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 text-sm mb-5 backdrop-blur-xl">
          <Mail size={16} />
          Secure Communication Channel
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#162555]">
          Contact US Pharmacy
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Send secure queries to our clinical intelligence support system.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 relative z-10">
        {/* LEFT INFO */}
        <div className="space-y-6">
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
              className="bg-[#C6E9FF] backdrop-blur-2xl border border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-cyan-700 mb-3">
                <Icon size={20} />
                <h2 className="font-bold text-lg">{label}</h2>
              </div>
              <p className="text-slate-600">{value}</p>
            </div>
          ))}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#C6E9FF] backdrop-blur-2xl border border-slate-200 rounded-3xl p-7 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-[#162555] mb-6">
            Send Message
          </h2>

          {/* NAME + PHONE row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-[#162555] placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              type="tel"
              maxLength={10}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-[#162555] placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
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
            className="w-full p-4 mb-4 rounded-2xl bg-white border border-slate-200 text-[#162555] placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
          />

          {/* TITLE / SUBJECT */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Subject / Title"
            required
            className="w-full p-4 mb-4 rounded-2xl bg-white border border-slate-200 text-[#162555] placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
          />

          {/* MESSAGE */}
          <textarea
            name="discription"
            value={form.discription}
            onChange={handleChange}
            placeholder="Your Message"
            rows={5}
            required
            className="w-full p-4 mb-5 rounded-2xl bg-white border border-slate-200 text-[#162555] placeholder:text-slate-400 outline-none resize-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#162555] hover:bg-[#1e3477] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={18} />
                Send Secure Message
              </>
            )}
          </button>
        </form>
      </div>

      {/* FOOTNOTE */}
      <div className="text-center mt-16 text-slate-500 text-sm relative z-10">
        Encrypted communication enabled • US Pharmacy
      </div>
    </div>
  );
}
