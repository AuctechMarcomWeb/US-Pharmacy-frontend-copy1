"use client";

export default function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .hero {
           font-family: var(--font-inter);
          position: relative;
          overflow: hidden;
          min-height: 280px;
          display: flex;
          align-items: center;
        }

        .hero-bg-image {
          position: absolute;
          inset: 0;
          background:
            url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1400&q=80')
            center center / cover no-repeat;
          z-index: 0;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            rgba(3, 60, 110, 0.88) 0%,
            rgba(14, 165, 233, 0.78) 45%,
            rgba(56, 189, 248, 0.60) 100%
          );
          z-index: 1;
        }

        .hero-wave-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 3;
          line-height: 0;
        }

        .hero-wave-bottom svg {
          display: block;
          width: 100%;
          height: 48px;
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 2rem 4.5rem;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-width: 560px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          font-style: italic;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7dd3fc;
          animation: fadeUp 0.5s ease both;
        }

        .hero-title {
          font-family: var(--font-playfair);
          font-size: clamp(1.6rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
          margin: 0;
          animation: fadeUp 0.6s ease 0.1s both;
          text-shadow: 0 2px 20px rgba(0,0,0,0.25);
        }

        .hero-title em {
          font-style: italic;
          color: #38bdf8;
        }

        .hero-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.4rem;
          animation: fadeUp 0.6s ease 0.2s both;
        }

        .hero-tag {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px);
          color: #e0f2fe;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.28rem 0.75rem;
          border-radius: 999px;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 860px) {
          .hero-inner {
            flex-direction: column;
            align-items: flex-start;
            padding: 2.5rem 1.5rem 4rem;
          }
        }

        @media (max-width: 480px) {
          .hero { min-height: 220px; }
          .hero-inner { padding: 2rem 1rem 3.5rem; gap: 1rem; }
          .hero-title { font-size: 1.5rem; }
          .hero-tag { font-size: 0.65rem; padding: 0.25rem 0.65rem; }
          .hero-wave-bottom svg { height: 32px; }
        }
      `}</style>

      <section className="hero">
        <div className="hero-bg-image" aria-hidden="true" />
        <div className="hero-bg-overlay" aria-hidden="true" />

        {/* Bottom wave only — top wave removed */}
        <div className="hero-wave-bottom" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,48 L0,28 C200,8 400,0 600,14 C800,28 1000,44 1200,36 C1320,30 1380,18 1440,14 L1440,48 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="hero-inner">
          <div className="hero-left">
            {/* <span className="hero-badge">🎉 New Year Sale Offer!</span> */}

            <h1 className="hero-title">
              Get Upto <em>30% Off</em>
              <br />
              On This New Year Sale
            </h1>

            <div className="hero-tags">
              <span className="hero-tag">💊 Medicines</span>
              <span className="hero-tag">🚚 Fast Delivery</span>
              <span className="hero-tag">✅ Verified Products</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
