// src/Components/Navbar.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const categories = ["general","business","entertainment","health","science","sports","technology"];

const NAVY = "#0B132B";
const NAVY_HOVER = "#1C2541";
const MINT = "#14B8A6";
const TEXT = "#E5E7EB";
const TEXT_DIM = "#B6C2CF";
const LOGO_URL = "https://res.cloudinary.com/dadapse5k/image/upload/v1759479542/Gemini_Generated_Image_xw1mtuxw1mtuxw1m_bsfu8q.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const brand = useMemo(() => "SparkNow", []);

  const linkClass = ({ isActive }) =>
    [
      "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 font-medium text-sm",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-transparent",
      isActive ? "text-white bg-[#1C2541]" : "text-[#E5E7EB]/90 hover:text-white hover:bg-white/5",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50">
      <div className="w-full" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY} 70%, rgba(12,20,45,0.92) 100%)` }}>
        <nav className="relative mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex items-center justify-between py-2 sm:py-3">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-xl" onClick={() => setOpen(false)}>
              <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <img src={LOGO_URL} alt="SparkNow logo" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,.25), transparent 60%)" }} />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white">{brand}</span>
                <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-wide" style={{ color: TEXT_DIM }}>
                  NEWS NETWORK
                </span>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1.5">
              {categories.map((c) => (
                <NavLink key={c} to={`/${c}`} className={linkClass}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </NavLink>
              ))}
              <Link to="/about" className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-[#E5E7EB]/90 hover:text-white hover:bg-white/5">
                About Us
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: TEXT }}
            >
              <svg className={`h-6 w-6 transition-all duration-200 ${open ? "rotate-90 scale-110" : ""}`} viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Mobile sheet */}
          <div className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-400 ${open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-1 pb-3 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <NavLink
                  key={c}
                  to={`/${c}`}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-center",
                      isActive ? "bg-[#1C2541] text-white" : "bg-white/5 text-[#E5E7EB]/90 hover:text-white",
                    ].join(" ")
                  }
                  onClick={() => setOpen(false)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </NavLink>
              ))}
              <Link to="/about" className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-center bg-white/5 text-[#E5E7EB]/90 hover:text-white" onClick={() => setOpen(false)}>
                About
              </Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="h-[2px] w-full" style={{ background: MINT }} />
    </header>
  );
}
