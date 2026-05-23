"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { noTokenGetRequest } from "../helper/index";

const Skeleton = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 16,
    }}
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 180,
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

  /* ── fetch ── */
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

  /* ── entrance animation on scroll ── */
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
          0%,100% { opacity:1 }
          50%      { opacity:.5 }
        }
        @keyframes catFloat {
          0%,100% { transform: translateY(0px) }
          50%     { transform: translateY(-5px) }
        }
        @keyframes catIn {
          from { opacity:0; transform: translateY(24px) scale(0.95) }
          to   { opacity:1; transform: translateY(0)   scale(1)    }
        }

        .cat-section {
          padding: 48px 70px;
           font-family: var(--font-inter), sans-serif;
        }

        /* ── header ── */
        .cat-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cat-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #0e7490;
          background: #e0f7fa;
          border: 1px solid #b2ebf2;
          border-radius: 20px;
          padding: 5px 14px;
          margin-bottom: 10px;
        }
        .cat-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          animation: catFloat 2s ease-in-out infinite;
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
        .cat-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #162555;
          border: 1.5px solid #162555;
          border-radius: 10px;
          padding: 8px 18px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
          align-self: flex-start;
          margin-top: 4px;
        }
        .cat-view-all:hover {
          background: #162555;
          color: #fff;
        }
        .cat-view-all svg { transition: transform 0.2s; }
        .cat-view-all:hover svg { transform: translateX(3px); }

        /* ── grid ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        /* ── card ── */
        .cat-card {
          position: relative;
          border-radius: 5px;
          height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 0;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s cubic-bezier(.34,1.56,.64,1);
          overflow: hidden;
          opacity: 0;
          padding: 0;
        }
        .cat-card.visible {
          animation: catIn 0.45s cubic-bezier(.34,1.2,.64,1) forwards;
        }
        .cat-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 20px 50px rgba(0,0,0,0.22);
        }
        .cat-card.active {
          border-color: #fff !important;
          box-shadow: 0 0 0 3px #162555, 0 16px 40px rgba(0,0,0,0.18);
          transform: translateY(-4px) scale(1.02);
        }

        /* ── background image with zoom on hover ── */
        .cat-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          border-radius: 5px;
          transform: scale(1);
          transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .cat-card:hover .cat-bg {
          transform: scale(1.12);
        }

        /* ── bottom gradient scrim for text legibility ── */
        .cat-scrim {
          position: absolute;
          inset: 0;
          border-radius: 5px;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.28) 45%,
            rgba(0,0,0,0) 100%
          );
          transition: opacity 0.35s;
        }

        /* ── count badge ── */
        .cat-count {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          background: rgba(255,255,255,0.25);
          color: #fff;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.4);
          z-index: 2;
        }

        /* ── label area ── */
        .cat-footer {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 0 14px 16px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 6px;
        }
        .cat-name {
          font-family: var(--font-poppins), sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
          letter-spacing: -0.2px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
          flex: 1;
        }
        /* arrow pill — visible on hover */
        .cat-arrow {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: 1.5px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(6px) scale(0.85);
          transition: opacity 0.25s, transform 0.25s;
          flex-shrink: 0;
        }
        .cat-card:hover .cat-arrow {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ── fallback emoji if no image ── */
        .cat-emoji-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          z-index: 1;
        }

        /* ── error ── */
        .cat-error {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .cat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .cat-card { height: 150px; }
          .cat-name { font-size: 11px; }
          .cat-section { padding: 36px 16px 32px; }
        }
      `}</style>

      <section
        className="cat-section"
        ref={sectionRef}
        aria-labelledby="shop-category-heading"
      >
        {/* Header */}
        <div className="cat-header">
          <div>
            <h2 className="cat-title" id="shop-category-heading">
              Shop by <span>Category</span>
            </h2>
            <p className="cat-subtitle">Browse medicines you need, fast and easily </p>
          </div>
        </div>

        {/* Grid */}
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
                  {/* Background image — zooms on hover via CSS */}
                  {cat.image ? (
                    <div
                      className="cat-bg"
                      style={{
                        backgroundImage: `url(${cat.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div
                      className="cat-bg"
                      style={{
                        background: "linear-gradient(135deg, #334155, #1e293b)",
                      }}
                    />
                  )}

                  {/* Bottom scrim for text */}
                  <div className="cat-scrim" />

                  {/* Fallback emoji if no image */}
                  {!cat.image && <span className="cat-emoji-fallback">💊</span>}

                  {/* Product count badge */}
                  {cat.productCount != null && (
                    <span className="cat-count">{cat.productCount}</span>
                  )}

                  {/* Name + arrow */}
                  <div className="cat-footer">
                    <p className="cat-name">{cat.name}</p>
                    <div className="cat-arrow">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
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
