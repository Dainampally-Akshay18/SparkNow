// App.jsx — light theme shell with routes preserved
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import News from "./Components/News";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      <Router>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/general" replace />} />
            <Route path="/general" element={<News key="general" pageSize={18} country="in" category="general" />} />
            <Route path="/business" element={<News key="business" pageSize={18} country="in" category="business" />} />
            <Route path="/entertainment" element={<News key="entertainment" pageSize={18} country="in" category="entertainment" />} />
            <Route path="/health" element={<News key="health" pageSize={18} country="in" category="health" />} />
            <Route path="/science" element={<News key="science" pageSize={18} country="in" category="science" />} />
            <Route path="/sports" element={<News key="sports" pageSize={18} country="in" category="sports" />} />
            <Route path="/technology" element={<News key="technology" pageSize={18} country="in" category="technology" />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}
