import { useRef, useEffect, useState, useCallback } from "react";

function Stars({ rating = 5, size = 16 }) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "#2f4787" : "none"}
          stroke="#2f4787"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCount(3);
      else if (w >= 640) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export function ReviewSlider({ reviews }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);

  const visible = useVisibleCount();
  const maxIndex = Math.max(0, reviews.length - visible);

  const goTo = useCallback(
    (idx) => setCurrent(Math.max(0, Math.min(idx, maxIndex))),
    [maxIndex],
  );

  // Clamp current if visible count changes
  useEffect(() => {
    setCurrent((c) => Math.min(c, maxIndex));
  }, [maxIndex]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 3000);
  }, [maxIndex]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  // Translate track based on container width & visible count
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const gap = 16; // matches gap-4 = 16px
    const cardW = (containerW - gap * (visible - 1)) / visible;
    trackRef.current.style.transform = `translateX(-${current * (cardW + gap)}px)`;
  }, [current, visible]);

  const handleUserNav = (idx) => {
    pausedRef.current = true;
    goTo(idx);
    clearInterval(timerRef.current);
    setTimeout(() => {
      pausedRef.current = false;
      resetTimer();
    }, 4000);
  };

  // Touch swipe support
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      handleUserNav(
        diff > 0 ? Math.min(current + 1, maxIndex) : Math.max(current - 1, 0),
      );
    }
    touchStartX.current = null;
  };

  return (
    <div>
      {/* Track wrapper */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: 16,
            transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {reviews.map((r, i) => {
            // card width is calculated via CSS — flex-shrink-0 + width set inline via JS above,
            // but we control width with a dynamic style so cards fill container correctly
            const cardStyle = {
              flex: `0 0 calc(${100 / visible}% - ${(16 * (visible - 1)) / visible}px)`,
            };

            return (
              <div
                key={i}
                style={cardStyle}
                className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm text-center relative"
              >
                {/* Top accent bar */}
                <div className="absolute top-0 left-6 right-6 h-[3px] bg-[#2f4787] rounded-b" />

                {/* Avatar */}
                <div className="mx-auto mb-3 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#a79fe2] border-[3px] border-[#2f4787] flex items-center justify-center text-[#2f4787] font-semibold text-base sm:text-xl">
                  {(r?.userId?.name || r.name || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <p className="font-semibold text-[#162555] text-xs sm:text-sm mb-1.5 sm:mb-2">
                  {r?.userId?.name || r.name}
                </p>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                  {r?.text || r?.comment}
                </p>

                <Stars rating={r?.rating ?? 5} size={14} />

                {r?.createdAt && (
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 sm:mt-2">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleUserNav(i)}
              className={`rounded-full transition-all ${
                i === current ? "bg-[#2f4787] w-4 h-2" : "bg-slate-300 w-2 h-2"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      <div className="flex justify-center gap-3 mt-3 sm:mt-4">
        <button
          onClick={() => handleUserNav(current <= 0 ? maxIndex : current - 1)}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-sm"
        >
          ←
        </button>
        <button
          onClick={() => handleUserNav(current >= maxIndex ? 0 : current + 1)}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-sm"
        >
          →
        </button>
      </div>
    </div>
  );
}
