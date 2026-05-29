"use client";

export default function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .ph-hero {
          font-family: --var(--font-inter);
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 250px;
          overflow: hidden;
          background: #f7f9f5;
         
        }

        /* ── LEFT PANEL ── */
        .ph-left {
          position: relative;
          z-index: 2;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.4rem 0rem 1.4rem 8rem;
          gap: 0.7rem;
        }

        .ph-left::after {
          content: '';
          position: absolute;
          top: 0;
          right: -50px;
          width: 50px;
          height: 100%;
          background: #ffffff;
          clip-path: polygon(0 0, 0 100%, 100% 100%);
          z-index: 3;
        }

        .ph-sale-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          width: fit-content;
        }

        .ph-badge-pct {
          font-family: --var(--font-poppins);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #e8f5e9;
          color: #1b5e20;
          padding: 0.22rem 0.65rem;
          border-radius: 4px;
        }

        .ph-badge-label {
          font-size: 0.68rem;
          font-weight: 500;
          color: #999;
          letter-spacing: 0.03em;
        }

        .ph-title {
          font-family: --var(--font-inter);
          font-size: clamp(1.25rem, 2.8vw, 2rem);
          font-weight: 800;
          line-height: 1.08;
          color: #0d1b0e;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .ph-title .num {
          position: relative;
          display: inline-block;
          color: #2e7d32;
        }

        .ph-title .num::before {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #a5d6a7;
          border-radius: 2px;
          z-index: -1;
        }

        .ph-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .ph-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 500;
          color: #2e2e2e;
          background: #f4f4f4;
          border-radius: 999px;
          padding: 0.22rem 0.65rem;
        }

        .ph-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2e7d32;
          flex-shrink: 0;
        }

        .ph-tag-dot.delivery { background: #1565c0; }
        .ph-tag-dot.verified { background: #6a1b9a; }

        /* ── RIGHT PANEL ── */
        .ph-right {
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .ph-right-img {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900&q=85')
            center center / cover no-repeat;
        }

        .ph-right-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(46,125,50,0.15) 0%, rgba(0,0,0,0.08) 100%);
        }

        .ph-discount-card {
          position: absolute;
          bottom: 1rem;
          right: 7rem;
          background: #ffffff;
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          box-shadow: 0 6px 24px rgba(0,0,0,0.16);
          min-width: 110px;
          z-index: 4;
          animation: floatUp 0.7s ease 0.3s both;
        }

        .ph-discount-card .big-num {
          font-family: --var(--font-poppins);
          font-size: 1.75rem;
          font-weight: 800;
          color: #2e7d32;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .ph-discount-card .big-num span {
          font-size: 0.85rem;
          vertical-align: super;
          font-weight: 700;
        }

        .ph-discount-card .card-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .ph-discount-card .card-sub {
          font-size: 0.6rem;
          color: #aaa;
        }

        .ph-corner-tag {
          position: absolute;
          top: 0.85rem;
          right: 7rem;
          background: #2e7d32;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          z-index: 4;
          animation: floatUp 0.6s ease 0.1s both;
        }

        @keyframes floatUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .ph-hero {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            min-height: unset;
          }

          /* on mobile: image goes on top as a short strip */
          .ph-right {
            order: -1;
            height: 130px;
          }

          .ph-left {
            padding: 1rem 1rem 1.1rem;
            gap: 0.55rem;
          }

          .ph-left::after { display: none; }

          .ph-title {
            font-size: 1.2rem;
            line-height: 1.1;
          }

          /* hide the floating card on mobile — too cramped */
          .ph-discount-card { display: none; }

          /* move corner tag inside the short image strip */
          .ph-corner-tag {
            top: 0.6rem;
            right: 0.6rem;
            font-size: 0.58rem;
            padding: 0.22rem 0.55rem;
          }

          .ph-tags { gap: 0.3rem; }

          .ph-tag {
            font-size: 0.67rem;
            padding: 0.18rem 0.55rem;
          }
        }

        @media (max-width: 380px) {
          .ph-title { font-size: 1.05rem; }
          .ph-right { height: 110px; }
        }
      `}</style>

      <section className="ph-hero" aria-label="New Year Sale — up to 30% off">
        <div className="ph-left">
          <div className="ph-sale-badge">
            <span className="ph-badge-pct">🎉 New Year Sale</span>
            <span className="ph-badge-label">Limited time offer</span>
          </div>

          <h1 className="ph-title">
            Get Upto <span className="num">30% Off</span>
            <br />
            On This New Year Sale
          </h1>

          <div className="ph-tags">
            <span className="ph-tag">
              <span className="ph-tag-dot" />
              💊 Medicines
            </span>
            <span className="ph-tag">
              <span className="ph-tag-dot delivery" />
              🚚 Fast Delivery
            </span>
            <span className="ph-tag">
              <span className="ph-tag-dot verified" />✅ Verified Products
            </span>
          </div>
        </div>

        <div className="ph-right">
          <div className="ph-right-img" aria-hidden="true" />
          <div className="ph-right-overlay" aria-hidden="true" />
          <div className="ph-right-content">
            <div className="ph-corner-tag">New Year</div>
            <div className="ph-discount-card" aria-hidden="true">
              <div className="big-num">
                <span>↑</span>30<span>%</span>
              </div>
              <div className="card-label">Off Today</div>
              <div className="card-sub">On all medicines</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
