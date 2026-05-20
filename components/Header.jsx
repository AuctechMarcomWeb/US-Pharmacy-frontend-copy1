"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  UserCircle2,
  Home,
  Newspaper,
  Pill,
  Phone,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
// import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blogs", label: "Blog", icon: Newspaper },
  { href: "/products", label: "Products", icon: Pill },
  { href: "/contact", label: "Contact", icon: Phone },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const profileRef = useRef(null);
  const profileBtnRef = useRef(null);
  const searchRef = useRef(null);
  const searchBtnRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search)}`);
    setShowSearch(false);
    setMobileMenu(false);
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchBtnRef.current &&
        !searchBtnRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/100 backdrop-blur-2xl border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-10 h-[65px]">
          {/* LOGO */}
          <h2
            onClick={() => router.push("/")}
            className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent cursor-pointer select-none whitespace-nowrap"
          >
            US Pharmacy
          </h2>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-7 text-gray-700 text-sm font-semibold">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/blogs" className="hover:text-cyan-500 transition">
              Blog
            </Link>
            <Link href="/products" className="hover:text-blue-600 transition">
              Products
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition">
              Contact
            </Link>
          </nav>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* SEARCH */}
            <button
              type="button"
              ref={searchBtnRef}
              onClick={() => setShowSearch(!showSearch)}
              className="text-black hover:text-blue-600 transition hover:scale-110"
            >
              <Search size={20} />
            </button>

            {/* CART */}
            <button
              onClick={() => router.push("/checkout")}
              className="relative text-black hover:text-blue-600 transition hover:scale-110"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* DESKTOP PROFILE */}
            {/* <div className="relative hidden md:flex items-center">
              <button
                ref={profileBtnRef}
                onClick={() => setOpenProfile(!openProfile)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#162555] to-[#27408f] text-white shadow-lg hover:scale-105 transition-all duration-300"
              >
                <User size={18} />
              </button>

              {openProfile && (
                <div
                  ref={profileRef}
                  className="absolute top-[58px] right-0 w-[280px] bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-5 py-5 bg-gradient-to-r from-[#162555] to-[#27408f] text-white">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                        <UserCircle2 size={28} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {user ? (
                          <>
                            <p className="text-xs text-blue-100 mb-1">
                              Logged in as
                            </p>
                            <p className="font-semibold truncate text-sm">
                              {user?.email || user?.name}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-sm">
                              Welcome Guest
                            </p>
                            <p className="text-xs text-blue-100 mt-1">
                              Login to continue
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    {user ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            router.push("/profile");
                            setOpenProfile(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#EAF6FF] transition-all duration-200 text-sm font-medium text-[#162555]"
                        >
                          <UserCircle2 size={18} /> My Profile
                        </button>
                        <button
                          onClick={() => {
                            router.push("/orders");
                            setOpenProfile(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#EAF6FF] transition-all duration-200 text-sm font-medium text-[#162555]"
                        >
                          <Package size={18} /> My Orders
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-all duration-200 text-sm font-medium text-red-500"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            router.push("/login");
                            setOpenProfile(false);
                          }}
                          className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-[#162555]"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            router.push("/register");
                            setOpenProfile(false);
                          }}
                          className="w-full py-3 rounded-2xl bg-[#162555] hover:bg-[#1f3477] text-white transition text-sm font-semibold"
                        >
                          Register
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div> */}

            {/* MOBILE HAMBURGER */}
            <button
              className="md:hidden p-1 text-black hover:text-blue-600 transition"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        {showSearch && (
          <div
            ref={searchRef}
            className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-2xl"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines..."
                className="flex-1 bg-transparent outline-none px-4 py-2 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── LEFT DRAWER OVERLAY ── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileMenu(false)}
        className={`
          fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm
          transition-opacity duration-300 md:hidden
          ${mobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Drawer Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-[70]
          w-[78vw] max-w-[300px]
          bg-white
          shadow-[4px_0_40px_rgba(0,0,0,0.18)]
          flex flex-col
          transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* DRAWER HEADER — user info */}
        <div className=" px-5 pt-10 pb-6">
          <button
            onClick={() => setMobileMenu(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
          <h2
            onClick={() => router.push("/")}
            className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent cursor-pointer select-none whitespace-nowrap"
          >
            US Pharmacy
          </h2>
          {/* <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
              <UserCircle2 size={24} className="text-white" />
            </div>
            <div className="overflow-hidden">
              {user ? (
                <>
                  <p className="font-bold text-white text-sm truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-white/70 text-xs truncate">
                    {user?.email}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-white text-sm">Welcome, Guest</p>
                  <p className="text-white/70 text-xs">Login to continue</p>
                </>
              )}
            </div>
          </div> */}
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200 shrink-0">
                <Icon
                  size={16}
                  className="text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                />
              </span>
              {label}
            </Link>
          ))}

          {/* DIVIDER */}
          <div className="my-3 border-t border-gray-100" />

          {user ? (
            <>
              <button
                onClick={() => {
                  router.push("/profile");
                  setMobileMenu(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <UserCircle2
                    size={16}
                    className="text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                  />
                </span>
                Profile
              </button>

              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenu(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200 shrink-0 relative">
                  <ShoppingCart
                    size={16}
                    className="text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                Cart
              </button>
              {/* 
              <button
                onClick={() => {
                  router.push("/orders");
                  setMobileMenu(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <Package
                    size={16}
                    className="text-gray-500 group-hover:text-blue-600 transition-colors duration-200"
                  />
                </span>
                Orders
              </button> */}

              {/* <button
                onClick={() => {
                  logout();
                  router.push("/");
                  setMobileMenu(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <LogOut
                    size={16}
                    className="text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                  />
                </span>
                Logout
              </button> */}
            </>
          ) : (
            <div className="px-1 pt-2 space-y-2">
              {/* <button
                onClick={() => {
                  router.push("/login");
                  setMobileMenu(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200"
              >
                <LogOut size={16} className="rotate-180" />
                Login / Sign Up
              </button> */}
            </div>
          )}
        </nav>

        {/* DRAWER FOOTER */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center">
            © 2025 US Pharmacy · All rights reserved
          </p>
        </div>
      </aside>

      {/* OFFSET */}
      <div className="h-[65px]" />

      {/* CART DRAWER */}
      {/* <CartDrawer open={cartOpen} setOpen={setCartOpen} /> */}
    </>
  );
}
