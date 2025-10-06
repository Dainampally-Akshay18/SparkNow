// Navbar.jsx — Light, elevated nav with mobile sheet; preserves routes
import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const categories = ["general","business","entertainment","health","science","sports","technology"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const brand = useMemo(() => "SparkNow", []);

  const linkClass = ({ isActive }) =>
    [
      "px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-white",
      isActive
        ? "bg-sky-100 text-sky-800 shadow-sm border border-sky-200"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold shadow-sm">S</span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">{brand}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {categories.map((c) => (
            <NavLink key={c} to={`/${c}`} className={linkClass}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* mobile sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="ml-auto h-full w-80 max-w-[85%] bg-white shadow-2xl border-l border-slate-200 animate-[slideIn_.2s_ease-out]">
            <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">{brand}</span>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-slate-700">
                  <path d="M6 6l12 12M6 18L18 6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="p-2 grid gap-1">
              {categories.map((c) => (
                <NavLink
                  key={c}
                  to={`/${c}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "px-3 py-2 rounded-lg text-sm font-medium",
                      isActive ? "bg-sky-100 text-sky-800" : "text-slate-700 hover:bg-slate-100"
                    ].join(" ")
                  }
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
