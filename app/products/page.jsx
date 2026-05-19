import { Suspense } from "react";
import MedicinesPage from "./MedicinesPage";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}
    >
      <MedicinesPage />
    </Suspense>
  );
}
