// components/CartBarWrapper.jsx
"use client";

import { usePathname } from "next/navigation";
import CartBar from "./CartBar";

export default function CartBarWrapper() {
  const pathname = usePathname();

  // Hide on checkout page
  if (pathname === "/checkout") return null;

  return <CartBar />;
}
