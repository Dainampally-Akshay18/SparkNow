// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import Navbar from "./Components/Navbar";

const RouteDebugger = () => {
  const location = useLocation();
  console.log("Current route", location.pathname);
  return null;
};

const News = lazy(() => import("./Components/News"));
const About = lazy(() => import("./Components/About"));

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Keep ornaments but hide on small screens to reduce paint */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-sky-300/10 to-cyan-300/10 rounded-full blur-3xl" />
        <div className="absolute top-8 left-8 -translate-x-12 -translate-y-12 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-300/10 to-transparent rounded-full blur-3xl" />
      </div>

      <Router>
        <RouteDebugger />
        <Navbar />
        <main className="relative mx-auto max-w-7xl px-3 sm:px-4 pt-24 sm:pt-28 pb-16">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-56 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="h-6 w-6 border-2 border-slate-300 border-t-blue-400 rounded-full animate-spin" />
                  <span>Loading content...</span>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/about" element={<About />} />
              {["general","business","entertainment","health","science","sports","technology"].map((c) => (
                <Route key={c} path={`/${c}`} element={<News key={c} pageSize={18} country="in" category={c} />} />
              ))}
              <Route path="/" element={<Navigate to="/general" replace />} />
              <Route path="*" element={<Navigate to="/general" replace />} />
            </Routes>
          </Suspense>
        </main>
      </Router>
    </div>
  );
}
