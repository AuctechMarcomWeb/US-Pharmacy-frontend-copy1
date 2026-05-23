"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { noTokenGetRequest } from "../helper/index";

const Skeleton = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 18,
    }}
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 200,
          borderRadius: 20,
          background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
          animation: "catPulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

export default function Categories({ onSelect, apiEndpoint = "/category" }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await noTokenGetRequest("/category?isActive=true");
        const data = res?.data?.data?.categories || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("error while fetching categories", e);
        setError("Could not load categories");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiEndpoint]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleClick = (cat) => {
    setActive(cat._id);
    if (onSelect) onSelect(cat);
    else router.push(`/products?categoryId=${cat._id}`);
  };

  return (
    <>
      <style>{`
        @keyframes catPulse {
          0%,100% { opacity:1 } 50% { opacity:.5 }
        }
        @keyframes catIn {
          from { opacity:0; transform: translateY(22px) }
          to   { opacity:1; transform: translateY(0) }
        }
        @keyframes catFloat {
          0%,100% { transform: translateY(0px) } 50% { transform: translateY(-5px) }
        }

        .cat-section {
          padding: 48px 70px;
          font-family: var(--font-inter), sans-serif;
          background: #f8faff;
        }

        .cat-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cat-title {
          font-family: var(--font-poppins), sans-serif;
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.6px;
          line-height: 1.15;
        }
        .cat-title span { color: #249349; }
        .cat-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 6px 0 0;
        }

        /* ── GRID ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }

        /* ── CARD ── */
        .cat-card {
          position: relative;
          border-radius: 20px;
          height: 200px;
          cursor: pointer;
          overflow: hidden;
          opacity: 0;
          background: #fff;
          border: 1.5px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.26s cubic-bezier(.34,1.4,.64,1), box-shadow 0.26s, border-color 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
        }
        .cat-card.visible {
          animation: catIn 0.42s ease forwards;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.13);
          border-color: #c7dff0;
        }
        .cat-card.active {
          border-color: #249349;
          box-shadow: 0 0 0 3px rgba(36,147,73,0.15), 0 12px 32px rgba(0,0,0,0.1);
        }

        /* ── BACKGROUND IMAGE (subtle, top portion) ── */
        .cat-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1);
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
          will-change: transform;
        }
        .cat-card:hover .cat-bg { transform: scale(1.07); }

        /* white-to-transparent overlay so text is readable at bottom */
        .cat-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.55) 35%,
            rgba(255,255,255,0.92) 62%,
            rgba(255,255,255,1) 100%
          );
        }

        /* fallback if no image */
        .cat-fallback-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #e0f2fe, #f0fdf4);
        }

        /* ── ICON BOX ── (top-left, floating above scrim) */
        .cat-icon-box {
          position: absolute;
          top: 18px;
          left: 18px;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          z-index: 3;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }

        /* ── CONTENT (bottom, above scrim) ── */
        .cat-content {
          position: relative;
          z-index: 3;
        }

        .cat-name {
          font-family: var(--font-poppins), sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          margin: 0 0 5px;
        }

        .cat-desc {
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.55;
          margin: 0 0 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* arrow row */
        .cat-arrow-row {
          display: flex;
          align-items: center;
        }
        .cat-arrow-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .cat-card:hover .cat-arrow-btn,
        .cat-card.active .cat-arrow-btn {
          background: #249349;
          border-color: #249349;
          transform: translateX(3px);
        }
        .cat-arrow-btn svg { transition: stroke 0.2s; }
        .cat-card:hover .cat-arrow-btn svg,
        .cat-card.active .cat-arrow-btn svg { stroke: #fff; }

        /* count badge */
        .cat-count {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 3;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          background: rgba(255,255,255,0.75);
          color: #475569;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.9);
        }

        .cat-error {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-size: 14px;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .cat-section { padding: 36px 20px 32px; }
          .cat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .cat-card { height: 180px; padding: 16px; border-radius: 16px; }
          .cat-icon-box { width: 38px; height: 38px; border-radius: 10px; font-size: 18px; top: 14px; left: 14px; }
          .cat-name { font-size: 13px; }
          .cat-desc { font-size: 11px; -webkit-line-clamp: 2; }
          .cat-count { top: 14px; right: 14px; }
        }

        @media (max-width: 400px) {
          .cat-grid { gap: 10px; }
          .cat-card { height: 165px; padding: 14px; }
          .cat-name { font-size: 12px; }
          .cat-desc { display: none; }
        }
      `}</style>

      <section
        className="cat-section"
        ref={sectionRef}
        aria-labelledby="shop-category-heading"
      >
        <div className="cat-header">
          <div>
            <h2 className="cat-title" id="shop-category-heading">
              Shop by <span>Category</span>
            </h2>
            <p className="cat-subtitle">
              Browse medicines you need, fast and easily
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="cat-error">{error}</div>
        ) : categories.length === 0 ? (
          <div className="cat-error">No categories found.</div>
        ) : (
          <div className="cat-grid">
            {categories.map((cat, idx) => {
              const isActive = active === cat._id;
              return (
                <div
                  key={cat._id || idx}
                  className={`cat-card ${visible ? "visible" : ""} ${isActive ? "active" : ""}`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => handleClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleClick(cat)}
                  aria-label={`Browse ${cat.name}`}
                  aria-pressed={isActive}
                  title={cat.name}
                >
                  {/* Background image */}
                  {cat.image ? (
                    <div
                      className="cat-bg"
                      style={{ backgroundImage: `url(${cat.image})` }}
                    />
                  ) : (
                    <div className="cat-fallback-bg" />
                  )}

                  {/* White fade scrim */}
                  <div className="cat-scrim" />

                  {/* Icon box top-left */}
                  <div className="cat-icon-box" aria-hidden="true">
                    {cat.icon || "💊"}
                  </div>

                  {/* Count badge top-right */}
                  {cat.productCount != null && (
                    <span className="cat-count">{cat.productCount} items</span>
                  )}

                  {/* Bottom content */}
                  <div className="cat-content">
                    <p className="cat-name">{cat.name}</p>
                    {cat.description && (
                      <p className="cat-desc">{cat.description}</p>
                    )}
                    <div className="cat-arrow-row">
                      <div className="cat-arrow-btn" aria-hidden="true">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#249349"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
