// NewsItem.jsx — light card aesthetics, performance-friendly hover, responsive media
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
  const [imgLoaded, setImgLoaded] = useState(false);

  const [{ rx, ry, tz, scale }, api] = useSpring(() => ({
    rx: 0,
    ry: 0,
    tz: 0,
    scale: 1,
    config: { tension: 220, friction: 18 }
  }));

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const yaw = (px - 0.5) * 8;
    const pitch = (0.5 - py) * 6;
    api.start({ rx: pitch, ry: yaw, tz: 8, scale: 1.01 });
  };

  const onLeave = () => {
    api.start({ rx: 0, ry: 0, tz: 0, scale: 1 });
  };

  return (
    <animated.article
      ref={cardRef}
      onMouseLeave={onLeave}
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
          ),
      }}
      className="
        group relative flex flex-col rounded-2xl overflow-hidden
        [transform-style:preserve-3d] transition-all will-change-transform
        border border-slate-200 bg-white shadow-sm hover:shadow-lg
        focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500
      "
    >
      {/* Media */}
      <div className="relative">
        <img
          src={imageurl || transparentFallback}
          alt={title || "News preview"}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = transparentFallback;
            setImgLoaded(true);
          }}
          className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        {/* Source pill */}
        {source && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-sm">
              {source}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 grid gap-2">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 line-clamp-3">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>By {author || "Unknown"}</span>
          <span>•</span>
          <time>{when}</time>
        </div>

        <div className="pt-1">
          <a
            href={newsurl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                       bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Read Full Story
            <svg width="14" height="14" viewBox="0 0 24 24" className="fill-current">
              <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </animated.article>
  );
}
