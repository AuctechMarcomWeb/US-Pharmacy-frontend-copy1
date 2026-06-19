"use client";

import Hero from "../components/Hero";
import Categories from "../components/Categories";


export default function HomePage() {


  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Hero />
      <Categories />
    </div>
  );
}
