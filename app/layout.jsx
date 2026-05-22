import "./globals.css";
import { Inter, Poppins, Playfair_Display } from "next/font/google";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { MedicineProvider } from "../context/MedicineContext";

import Header from "../components/Header";
import Footer from "../components/Footer";
import CartBarWrapper from "../components/CartBarWrapper";

export const metadata = {
  title: "US Pharmacy - Online Medicine Store",
  description:
    "Buy genuine medicines online with secure checkout and fast delivery.",
  keywords: [
    "online pharmacy",
    "buy medicines online",
    "pharmacy",
    "healthcare",
  ],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
});
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${poppins.variable} ${playfair.variable} min-h-screen flex flex-col bg-white text-slate-800`}
      >
        <AuthProvider>
          <MedicineProvider>
            <CartProvider>
              {/* 🔥 GLOBAL HEADER */}
              <Header />

              {/* PAGE CONTENT */}
              <main className="flex-1">{children}</main>
              <CartBarWrapper />
              {/* 🔥 GLOBAL FOOTER */}
              <Footer />

              {/* 🔔 GLOBAL TOAST NOTIFICATIONS */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 2200,
                  style: {
                    background: "#ffffff",
                    color: "#162555",
                    border: "1px solid #dbeafe",
                    borderRadius: "18px",
                    padding: "14px 18px",
                    fontWeight: "600",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
                  },

                  success: {
                    iconTheme: {
                      primary: "#06b6d4",
                      secondary: "#ffffff",
                    },
                  },
                }}
              />
            </CartProvider>
          </MedicineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
