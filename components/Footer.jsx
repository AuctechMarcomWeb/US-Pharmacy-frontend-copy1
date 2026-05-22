"use client";

import Link from "next/link";
import { Mail, ShieldCheck, FileText, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-gray-900 via-gray-950 to-black text-white">
      {/* TOP GLOW LINE */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-bold text-blue-400">US Pharmacy</h2>
            {/* <p className="text-gray-400 mt-3 text-sm leading-relaxed">
              Advanced medical &amp; forensic medicine platform designed for
              secure, fast and intelligent healthcare management.
            </p> */}
            <p className="text-xs text-gray-500 mt-4">
              © 2026 US Pharmacy. All Rights Reserved.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 sm:space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-blue-400 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          {/* <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Contact Info
            </h3>
            <div className="space-y-3 sm:space-y-4 text-sm text-gray-400">
              <p className="flex items-start gap-2 break-all">
                <Mail
                  size={15}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <span>support@medico.com</span>
              </p>
              <p className="flex items-start gap-2">
                <Phone
                  size={15}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck
                  size={15}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <span>Secure Medical Platform</span>
              </p>
              <p className="flex items-start gap-2">
                <FileText
                  size={15}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <span>Privacy &amp; Terms Protected</span>
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* BOTTOM BAR */}
   
    </footer>
  );
}
