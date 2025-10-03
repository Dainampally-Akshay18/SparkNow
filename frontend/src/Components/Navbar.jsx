// Navbar.jsx — Enterprise glass-nav with animated mobile sheet
import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const categories = ["general","business","entertainment","health","science","sports","technology"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const brand = useMemo(() => "SparkNow", []);

  const linkClass = ({ isActive }) =>
    [
      "px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#19b1ff]/80 focus-visible:ring-offset-slate-950",
      "backdrop-blur-sm border",
      isActive
        ? "bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 text-white border-[#19b1ff]/40 shadow-lg shadow-[#19b1ff]/10"
        : "text-white/80 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/20 hover:shadow-lg"
    ].join(" ");

  return (
    <header className="sticky top-0 z-50">
      {/* Enhanced glossy gradient rail */}
      <div className="pointer-events-none h-[1px] w-full bg-gradient-to-r from-transparent via-[#19b1ff]/40 to-transparent shadow-lg shadow-[#19b1ff]/20" />
      
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 mb-5 rounded-2xl border border-white/15 bg-gradient-to-r from-[#0f1b2e]/90 to-[#131d35]/90 backdrop-blur-xl shadow-2xl shadow-black/30 ring-1 ring-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Enhanced brand with logo */}
            <Link
              to="/"
              className="flex items-center gap-3 text-white no-underline group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80 rounded-xl p-1"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#19b1ff] to-[#0a78ff] shadow-lg shadow-[#19b1ff]/30 group-hover:shadow-[#19b1ff]/50 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dadapse5k/image/upload/v1759479542/Gemini_Generated_Image_xw1mtuxw1mtuxw1m_bsfu8q.png" 
                    alt="SparkNow Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {brand}
                </span>
                <span className="text-xs text-[#19b1ff] font-medium tracking-wide">NEWS NETWORK</span>
              </div>
            </Link>

            {/* Enhanced desktop links */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((c) => (
                <NavLink key={c} to={`/${c}`} className={linkClass}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </NavLink>
              ))}
              {/* About Us link - FIXED: Using Link instead of NavLink to avoid route conflicts */}
              <Link 
                to="/about" 
                className="px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-sm border text-white/80 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/20 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                About Us
              </Link>
            </div>

            {/* Enhanced mobile toggle */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center h-12 w-12 rounded-xl border border-white/15 bg-white/5 text-white/90 hover:bg-white/10 transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg
                className={`h-6 w-6 transition-all duration-300 ${open ? "rotate-90 scale-110" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Enhanced mobile sheet */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-500 ${open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="px-4 pb-5 grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <NavLink
                  key={c}
                  to={`/${c}`}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-300",
                      "hover:scale-105 hover:shadow-lg",
                      isActive
                        ? "bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 text-white border-[#19b1ff]/40 shadow-lg shadow-[#19b1ff]/10"
                        : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                    ].join(" ")
                  }
                  onClick={() => setOpen(false)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </NavLink>
              ))}
              {/* About Us mobile link - FIXED: Using Link instead of NavLink */}
              <Link
                to="/about"
                className="rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-300 bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg text-center"
                onClick={() => setOpen(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Enhanced bottom glow */}
      <div className="pointer-events-none h-[1px] w-full bg-gradient-to-r from-transparent via-[#19b1ff]/50 to-transparent shadow-lg shadow-[#19b1ff]/30" />
    </header>
  );
}