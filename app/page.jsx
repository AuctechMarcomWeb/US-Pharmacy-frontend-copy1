"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import { DNA } from "react-loader-spinner";
import Categories from "../components/Categories";

// ─── map API shape → component shape ────────────────────────────────────────
// function mapProduct(p) {
//   // pick the first active variant for price/stock display on the card
//   const firstVariant =
//     (p.variants ?? []).find((v) => v.isActive !== false) ?? {};

//   return {
//     id: p._id,
//     name: p.title,
//     description: p.description ?? "",
//     image: p.thumbnail,
//     price: firstVariant.price ?? 0,
//     originalPrice: firstVariant.mrp ?? 0,
//     rating: p.rating ?? 0,
//     // categoryId is now a populated object
//     category: p.categoryId?.name ?? "",
//     isFeatured: p.isFeatured,
//     quantity: firstVariant.stock ?? 0,
//     tags: p.tags ?? [],
//   };
// }

export default function HomePage() {
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── fetch on mount ──────────────────────────────────────────────────────
  // useEffect(() => {
  //   async function fetchProducts() {
  //     try {
  //       const res = await noTokenGetRequest("/product?isFeatured=true");
  //       const json = res.data;

  //       if (!json.success) throw new Error(json.message ?? "Fetch failed");

  //       const mapped = (json.data.products ?? []).map(mapProduct);
  //       setMedicines(mapped);
  //       setFiltered(mapped);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchProducts();
  // }, []);

  // ── search filter ────────────────────────────────────────────────────────
  // useEffect(() => {
  //   if (!search.trim()) {
  //     setFiltered(medicines);
  //     return;
  //   }
  //   const q = search.toLowerCase();
  //   setFiltered(
  //     medicines.filter(
  //       (m) =>
  //         m.name.toLowerCase().includes(q) ||
  //         m.description.toLowerCase().includes(q) ||
  //         m.tags.some((t) => t.toLowerCase().includes(q)),
  //     ),
  //   );
  // }, [search, medicines]);

  // const featured = medicines.filter((m) => m.isFeatured).slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Hero />
      <Categories />
    </div>
  );
}
