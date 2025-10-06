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
  const [language, setLanguage] = useState("en"); // default to English
  const [showFilters, setShowFilters] = useState(false);

  const timerRef = useRef(null);
  const hasQuery = Boolean(searchQuery?.trim());
  const mode = hasQuery ? "everything" : "top-headlines";

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      default:
        return null;
    }
  };

  // Build a deterministic URL and only depend on that for fetching
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
  }, [mode, country, category, searchQuery, sortBy, dateRange, language, page, pageSize]); // url derives from these

  const fallbackRequest = useMemo(() => {
    const params = new URLSearchParams();
    params.set("q", category);
    params.set("sortBy", "publishedAt");
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (language) params.set("language", language);
    return { url: `${API_BASE}?${params.toString()}`, endpoint: "everything(fallback)" };
  }, [category, page, pageSize, language]);

  // Progress helpers
  const startProgress = () => {
    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : Math.max(1, Math.round(p + (90 - p) * 0.08))));
    }, 120);
  };
  const finishProgress = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  };

  // Single fetch with robust JSON detection
  const fetchOnce = async (req) => {
    console.debug("[SparkNow] request >", req.endpoint, req.url);
    const res = await fetch(req.url);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("[SparkNow] Non-JSON response:", res.status, (text || "").slice(0, 200));
      throw new Error(`Non-JSON from server (${res.status}). Is 'netlify dev' running?`);
    }
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.message || json?.error || `HTTP ${res.status}`;
      console.error("[SparkNow] fetch error <", res.status, msg, json);
      throw new Error(msg);
    }
    console.debug("[SparkNow] response <", req.endpoint, "status 200");
    return json;
  };

  // Orchestrate fetch with fallback
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
          console.warn("[SparkNow] top-headlines empty; trying fallback", fallbackRequest.url);
          try {
            const fb = await fetchOnce(fallbackRequest);
            if (cancel) return;
            setArticles(Array.isArray(fb?.articles) ? fb.articles : []);
            setTotalResults(Number.isFinite(fb?.totalResults) ? fb.totalResults : 0);
            setStatus("success");
            setUsedEndpoint(fallbackRequest.endpoint);
            finishProgress();
            return;
          } catch (fbErr) {
            console.warn("[SparkNow] fallback failed", fbErr);
          }
        }

        setArticles(list);
        setTotalResults(total);
        setStatus("success");
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
        console.info("[SparkNow] loaded", { total, endpoint: primaryRequest.endpoint });
      } catch (err) {
        if (cancel) return;
        setStatus("error");
        setErrorMsg(err?.message || "Failed to fetch news");
        setArticles([]);
        setTotalResults(0);
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
        console.error("[SparkNow] final error", err);
      }
    };

    run();
    return () => {
      cancel = true;
      clearInterval(timerRef.current);
    };
  };

  // Only refetch when the actual URL changes
  useEffect(() => {
    const cancel = fetchNews();
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryRequest.url]);

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const headerLabel = hasQuery
    ? `Search Results: "${searchQuery}"`
    : `Top Headlines: ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "ar", label: "Arabic" },
    { code: "de", label: "German" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "he", label: "Hebrew" },
    { code: "it", label: "Italian" },
    { code: "nl", label: "Dutch" },
    { code: "no", label: "Norwegian" },
    { code: "pt", label: "Portuguese" },
    { code: "ru", label: "Russian" },
    { code: "sv", label: "Swedish" },
    { code: "ud", label: "Urdu" },
    { code: "zh", label: "Chinese" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };
  const handleReset = () => {
    setSearchQuery("");
    setSortBy("publishedAt");
    setDateRange("all");
    setLanguage("en");
    setPage(1);
  };

  return (
    <section className="mx-auto max-w-7xl px-0 py-8">
      {/* Search + Filters */}
      <div className="mb-8 p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news, topics, or keywords..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:shadow-md hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" />
                </svg>
                <span>Search</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-expanded={showFilters}
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" />
                </svg>
                <span>Filters</span>
              </div>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="publishedAt">Latest</option>
                  <option value="relevancy">Relevancy</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Time</option>
                  <option value="today">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {[
                    { code: "en", label: "English" },
                    { code: "ar", label: "Arabic" },
                    { code: "de", label: "German" },
                    { code: "es", label: "Spanish" },
                    { code: "fr", label: "French" },
                    { code: "he", label: "Hebrew" },
                    { code: "it", label: "Italian" },
                    { code: "nl", label: "Dutch" },
                    { code: "no", label: "Norwegian" },
                    { code: "pt", label: "Portuguese" },
                    { code: "ru", label: "Russian" },
                    { code: "sv", label: "Swedish" },
                    { code: "ud", label: "Urdu" },
                    { code: "zh", label: "Chinese" },
                  ].map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Applies to searches only.</p>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("publishedAt");
                    setDateRange("all");
                    setLanguage("en");
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-slate-200 shadow-sm">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{headerLabel}</h2>
          <p className="text-slate-500 text-sm mt-2">
            {usedEndpoint ? `Source: ${usedEndpoint}` : "Fetching the freshest stories"}
            {totalResults ? ` • ${totalResults} results` : ""}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-slate-700 text-sm font-medium">{progress}%</div>
          <div className="text-slate-500 text-xs">Loading</div>
          <div className="mt-2 h-3 w-32 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-lg p-12 text-center shadow-sm">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500 border-r-blue-500" />
          <div className="text-slate-900 font-semibold text-lg mb-2">{progress}% Complete</div>
          <div className="text-slate-600">Curating the latest news</div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <div className="text-slate-900 font-bold text-lg mb-3">We hit a snag fetching stories</div>
          <div className="text-slate-800 break-all bg-white border border-slate-200 rounded-lg p-4 text-sm font-mono">{errorMsg}</div>
          <div className="mt-6">
            <button
              onClick={() => location.reload()}
              className="rounded-xl px-6 py-3 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-700 border border-red-200 hover:from-red-500/20 hover:to-red-600/20 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {status === "success" && articles.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-lg p-12 text-center shadow-sm">
          <div className="text-slate-900 font-bold text-xl mb-2">No stories found</div>
          <div className="text-slate-600">Try a different query, category, or region</div>
          {hasQuery && (
            <button onClick={() => handleReset()} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:scale-[1.02] transition-all">
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {status === "success" && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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

      {/* Pagination */}
      {status === "success" && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200 p-6 shadow-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-3 rounded-xl px-5 py-3 text-slate-800 font-medium border border-slate-300 bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Previous
          </button>
          <div className="flex items-center gap-4">
            <span className="text-slate-700 text-sm font-medium">Page</span>
            <span className="px-4 py-2 bg-blue-50 text-slate-900 rounded-lg font-bold border border-blue-200">{page}</span>
            <span className="text-slate-500 text-sm">of {totalPages}</span>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="inline-flex items-center gap-3 rounded-xl px-5 py-3 text-slate-800 font-medium border border-slate-300 bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
  q: PropTypes.string,
};
