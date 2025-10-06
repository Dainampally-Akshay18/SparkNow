// src/Components/News.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import NewsItem from "./NewsItem";

const API_BASE = "/.netlify/functions/news";

export default function News({ country = "in", pageSize = 18, category = "general", q = "" }) {
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [usedEndpoint, setUsedEndpoint] = useState("");
  const [progress, setProgress] = useState(0);

  const [searchQuery, setSearchQuery] = useState(q || "");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [dateRange, setDateRange] = useState("all");
  const [language, setLanguage] = useState("en");
  const [showFilters, setShowFilters] = useState(false);

  const timerRef = useRef(null);
  const hasQuery = Boolean(searchQuery?.trim());
  const mode = hasQuery ? "everything" : "top-headlines";

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "today": return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case "week": return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month": return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      default: return null;
    }
  };

  const primaryRequest = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (mode === "everything") {
      params.set("q", searchQuery.trim());
      params.set("sortBy", sortBy);
      const fromDate = getDateRange();
      if (fromDate) params.set("from", fromDate);
      if (language) params.set("language", language);
    } else {
      params.set("country", country);
      params.set("category", category);
    }
    return { url: `${API_BASE}?${params.toString()}`, endpoint: mode };
  }, [mode, country, category, searchQuery, sortBy, dateRange, language, page, pageSize]);

  const fallbackRequest = useMemo(() => {
    const p = new URLSearchParams();
    p.set("q", category);
    p.set("sortBy", "publishedAt");
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (language) p.set("language", language);
    return { url: `${API_BASE}?${p.toString()}`, endpoint: "everything(fallback)" };
  }, [category, page, pageSize, language]);

  const startProgress = () => {
    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setProgress((x) => (x >= 90 ? 90 : Math.round(x + (90 - x) * 0.08))), 120);
  };
  const finishProgress = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  };

  const fetchOnce = async (req) => {
    const res = await fetch(req.url);
    let json = null;
    try {
      json = await res.clone().json();
    } catch {
      const text = await res.text();
      throw new Error("Function route returned non-JSON body. Check dev server and function.");
    }
    if (!res.ok) {
      const msg = json?.message || json?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;
  };

  const fetchNews = () => {
    let cancel = false;
    const run = async () => {
      try {
        setStatus("loading");
        setErrorMsg("");
        setUsedEndpoint("");
        startProgress();

        const data = await fetchOnce(primaryRequest);
        if (cancel) return;

        const list = Array.isArray(data?.articles) ? data.articles : [];
        const total = Number.isFinite(data?.totalResults) ? data.totalResults : 0;

        if (primaryRequest.endpoint === "top-headlines" && total === 0) {
          try {
            const fb = await fetchOnce(fallbackRequest);
            if (cancel) return;
            setArticles(Array.isArray(fb?.articles) ? fb.articles : []);
            setTotalResults(Number.isFinite(fb?.totalResults) ? fb.totalResults : 0);
            setStatus("success");
            setUsedEndpoint(fallbackRequest.endpoint);
            finishProgress();
            return;
          } catch {}
        }

        setArticles(list);
        setTotalResults(total);
        setStatus("success");
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
      } catch (err) {
        if (cancel) return;
        setStatus("error");
        setErrorMsg(err?.message || "Failed to fetch news");
        setArticles([]);
        setTotalResults(0);
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
      }
    };
    run();
    return () => { cancel = true; clearInterval(timerRef.current); };
  };

  useEffect(() => {
    const cancel = fetchNews();
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryRequest.url]);

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const headerLabel = hasQuery ? `Search Results: "${searchQuery}"` : `Top Headlines: ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchNews(); };

  return (
    <section className="mx-auto max-w-7xl px-2 sm:px-0 py-6 sm:py-8">
      {/* Search + Filters container responsive spacing */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" /></svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news, topics, or keywords..."
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <button type="submit" className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:shadow-md hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" /></svg>
                <span>Search</span>
              </div>
            </button>
            <button type="button" onClick={() => setShowFilters((v) => !v)} className="px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400" aria-expanded={showFilters}>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" /></svg>
                <span>Filters</span>
              </div>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5 sm:mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="publishedAt">Latest</option>
                  <option value="relevancy">Relevancy</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5 sm:mb-2">Date Range</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="all">All Time</option>
                  <option value="today">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5 sm:mb-2">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {[
                    { code: "en", label: "English" }, { code: "ar", label: "Arabic" }, { code: "de", label: "German" },
                    { code: "es", label: "Spanish" }, { code: "fr", label: "French" }, { code: "he", label: "Hebrew" },
                    { code: "it", label: "Italian" }, { code: "nl", label: "Dutch" }, { code: "no", label: "Norwegian" },
                    { code: "pt", label: "Portuguese" }, { code: "ru", label: "Russian" }, { code: "sv", label: "Swedish" },
                    { code: "ud", label: "Urdu" }, { code: "zh", label: "Chinese" },
                  ].map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Applies to search results.</p>
              </div>
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => { setSearchQuery(""); setSortBy("publishedAt"); setDateRange("all"); setLanguage("en"); setPage(1); }} className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Reset
                </button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Apply
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Header + progress compact on mobile */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-slate-200 shadow-sm">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{headerLabel}</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">{usedEndpoint ? `Source: ${usedEndpoint}` : "Fetching the freshest stories"}{totalResults ? ` • ${totalResults} results` : ""}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-slate-700 text-sm font-medium">{progress}%</div>
          <div className="text-slate-500 text-xs">Loading</div>
          <div className="mt-2 h-3 w-28 sm:w-32 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-lg p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 sm:mb-6 h-14 w-14 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500 border-r-blue-500" />
          <div className="text-slate-900 font-semibold text-base sm:text-lg mb-1 sm:mb-2">{progress}% Complete</div>
          <div className="text-slate-600">Curating the latest news</div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8 shadow-sm">
          <div className="text-slate-900 font-bold text-lg mb-2 sm:mb-3">We hit a snag fetching stories</div>
          <div className="text-slate-800 break-all bg-white border border-slate-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono">{errorMsg}</div>
          <div className="mt-4 sm:mt-6">
            <button onClick={() => location.reload()} className="rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-700 border border-red-200 hover:from-red-500/20 hover:to-red-600/20 transition-all">
              Retry
            </button>
          </div>
        </div>
      )}

      {status === "success" && articles.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-lg p-10 sm:p-12 text-center shadow-sm">
          <div className="text-slate-900 font-bold text-lg sm:text-xl mb-1 sm:mb-2">No stories found</div>
          <div className="text-slate-600">Try a different query, category, or region</div>
        </div>
      )}

      {status === "success" && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {articles.map((a) => (
            <NewsItem
              key={a.url}
              title={a.title}
              description={a.description}
              imageurl={a.urlToImage}
              newsurl={a.url}
              author={a.author}
              date={a.publishedAt}
              source={a.source?.name}
            />
          ))}
        </div>
      )}

      {status === "success" && totalPages > 1 && (
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-800 font-medium border border-slate-300 bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Previous</span>
          </button>
          <div className="flex items-center justify-center gap-3">
            <span className="text-slate-700 text-sm font-medium">Page</span>
            <span className="px-4 py-2 bg-blue-50 text-slate-900 rounded-lg font-bold border border-blue-200">{page}</span>
            <span className="text-slate-500 text-sm">of {totalPages}</span>
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-800 font-medium border border-slate-300 bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span>Next</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </section>
  );
}

News.propTypes = { country: PropTypes.string, pageSize: PropTypes.number, category: PropTypes.string, q: PropTypes.string };
