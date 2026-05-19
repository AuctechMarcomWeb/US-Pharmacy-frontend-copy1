import { Suspense } from "react";
import CheckoutPage from "./checkoutPage";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#f0f4ff] animate-pulse" />}
    >
      <CheckoutPage />
    </Suspense>
  );
}
