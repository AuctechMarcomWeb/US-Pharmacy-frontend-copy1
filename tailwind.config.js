/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "500px",
        xxs: "410px",
      },
      fontSize: {
        hero: ["48px", "56px"],
        h1: ["40px", "48px"],
        h2: ["32px", "40px"],
        h3: ["24px", "32px"],
        body: ["16px", "28px"],
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-poppins)"],
        serif: ["var(--font-playfair)"],
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
