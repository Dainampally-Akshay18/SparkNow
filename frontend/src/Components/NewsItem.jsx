// src/Components/NewsItem.jsx
import React, { useMemo, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";

export default function NewsItem({ title, description, imageurl, newsurl, author, date, source }) {
  const when = useMemo(() => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleString();
  }, [date]);

  const transparentFallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8x8AAwMCAO1P5R8AAAAASUVORK5CYII=";
  const cardRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [{ rx }, api] = useSpring(() => ({ rx: 0, config: { tension: 280, friction: 20 } }));

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const pitch = (0.5 - py) * 6; // reduced tilt on mobile hover-emulation
    api.start({ rx: pitch });
  };

  const onLeave = () => api.start({ rx: 0 });

  return (
    <animated.article
      ref={cardRef}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      style={{ transform: rx.to((x) => `rotateX(${x}deg)`) }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all"
    >
      <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden border border-slate-200">
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
            <img
              src={imageurl || transparentFallback}
              alt={title || "news-image"}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.currentTarget.src = transparentFallback; setImgLoaded(true); }}
              className="w-full h-44 sm:h-52 md:h-60 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {!imgLoaded && <div className="w-full h-44 sm:h-52 md:h-60 bg-slate-100 animate-pulse" />}
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent" />
          {source && <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-blue-50/90 backdrop-blur px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-blue-700 border border-blue-200 shadow-sm">{source}</span>}
        </div>

        <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg font-bold leading-tight text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-3">{title}</h3>
          {description && <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{description}</p>}

          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span className="truncate font-medium">By {author || "Unknown"}</span>
            <time className="shrink-0 font-medium">{when}</time>
          </div>

          <div className="mt-2">
            <a href={newsurl} target="_blank" rel="noreferrer" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 sm:gap-3 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              Read Full Story
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* gloss corner */}
      <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-2xl" />
    </animated.article>
  );
}
