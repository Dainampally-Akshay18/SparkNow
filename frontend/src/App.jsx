import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';

// Debug component to see current route
const RouteDebugger = () => {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return null;
};

const News = lazy(() => import('./components/News'));
const About = lazy(() => import('./components/About'));

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1429] to-[#0d1b36]">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-[#19b1ff]/10 to-[#0a78ff]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-[#19b1ff]/5 to-[#0a78ff]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#19b1ff]/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <Router>
        <RouteDebugger />
        <Navbar />
        <main className="relative max-w-7xl mx-auto px-4 pt-24 pb-16">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 animate-pulse">
              <div className="flex items-center gap-3 text-white/60">
                <div className="h-6 w-6 border-2 border-white/20 border-t-[#19b1ff] rounded-full animate-spin"></div>
                <span>Loading content...</span>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/about" element={<About />} />
              {['general','business','entertainment','health','science','sports','technology'].map((c) => (
                <Route
                  key={c}
                  path={`/${c}`}
                  element={<News key={c} pageSize={18} country="in" category={c} />}
                />
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