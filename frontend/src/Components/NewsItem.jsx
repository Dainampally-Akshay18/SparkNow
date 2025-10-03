import React, { useMemo, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function NewsItem({
  title,
  description,
  imageurl,
  newsurl,
  author,
  date,
  source
}) {
  const when = useMemo(() => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleString();
  }, [date]);

  const transparentFallback =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8x8AAwMCAO1P5R8AAAAASUVORK5CYII=";

  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [{ rx, ry, tz, scale }, api] = useSpring(() => ({
    rx: 0,
    ry: 0,
    tz: 0,
    scale: 1,
    config: { tension: 280, friction: 20 }
  }));

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const yaw = (px - 0.5) * 12;
    const pitch = (0.5 - py) * 10;
    api.start({ rx: pitch, ry: yaw, tz: 12, scale: 1.02 });
  };

  const onLeave = () => {
    api.start({ rx: 0, ry: 0, tz: 0, scale: 1 });
  };

  return (
    <animated.article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      onMouseMove={onMove}
      style={{
        transform: rx
          .to((rxv) => `rotateX(${rxv}deg)`)
          .to((rX) =>
            ry.to((ryv) =>
              tz.to((z) =>
                scale.to((s) => `${rX} rotateY(${ryv}deg) translateZ(${z}px) scale(${s})`)
              )
            )
          )
      }}
      className="
        group relative flex flex-col rounded-2xl overflow-hidden
        [transform-style:preserve-3d] transition-all will-change-transform
        border border-white/15 bg-gradient-to-br from-[#0f1b2e]/95 to-[#131d35]/95 
        backdrop-blur-lg shadow-2xl shadow-black/40
        ring-1 ring-white/10 hover:ring-white/20
        focus-within:outline-none focus-within:ring-2
        focus-within:ring-[#19b1ff]/80
      "
    >
      {/* Enhanced media container */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <img
            src={imageurl || transparentFallback}
            alt={title}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = transparentFallback;
              setImgLoaded(true);
            }}
            className="
              w-full h-52 sm:h-56 md:h-60 object-cover
              transition-transform duration-700 group-hover:scale-110
            "
          />
        </div>
        
        {/* Loading skeleton */}
        {!imgLoaded && (
          <div className="w-full h-52 sm:h-56 md:h-60 bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
        )}
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1429]/90 via-[#0a1429]/40 to-transparent" />
        
        {/* Enhanced source pill */}
        {source && (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 backdrop-blur-lg px-3 py-1.5 text-xs font-semibold text-white border border-[#19b1ff]/30 shadow-lg">
            {source}
          </span>
        )}
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#19b1ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Enhanced content */}
      <div className="relative z-10 p-6 flex flex-col gap-4 flex-1">
        <h3 className="text-lg font-bold leading-tight text-white group-hover:text-white/95 transition-colors line-clamp-3">
          {title}
        </h3>
        
        {description && (
          <p className="text-white/75 text-sm leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
          <span className="truncate font-medium">By {author || "Unknown"}</span>
          <time className="shrink-0 font-medium">{when}</time>
        </div>

        <div className="mt-2">
          <a
            href={newsurl}
            target="_blank"
            rel="noreferrer"
            className="
              group/btn inline-flex items-center gap-3 rounded-xl px-5 py-3
              bg-gradient-to-r from-[#19b1ff] to-[#0a78ff]
              text-white text-sm font-semibold
              shadow-2xl shadow-[#19b1ff]/25
              hover:shadow-[#19b1ff]/40 hover:scale-105
              transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80
              focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1b2e]
            "
          >
            Read Full Story
            <svg 
              viewBox="0 0 24 24" 
              className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" 
              fill="none"
            >
              <path 
                d="M5 12h14M13 5l7 7-7 7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Enhanced corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#19b1ff]/10 to-transparent rounded-bl-2xl pointer-events-none" />
    </animated.article>
  );
}