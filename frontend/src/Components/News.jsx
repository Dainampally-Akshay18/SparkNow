// src/components/News.jsx — Premium layout shell + states with advanced search
import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import NewsItem from './NewsItem';

// Correctly point to your Netlify Function endpoint
const API_BASE = '/.netlify/functions/news';

export default function News({ country = 'in', pageSize = 18, category = 'general', q = '' }) {
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [usedEndpoint, setUsedEndpoint] = useState('');
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const timerRef = useRef(null);

  const hasQuery = Boolean(searchQuery?.trim());
  const mode = hasQuery ? 'everything' : 'top-headlines';

  // Calculate date range for filtering
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      default:
        return null;
    }
  };

  const primaryRequest = useMemo(() => {
    // All parameters are now sent in the query string to our function
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    // If it's a search, add the 'q' and 'sortBy' parameters
    if (mode === 'everything') {
      params.set('q', searchQuery.trim());
      params.set('sortBy', sortBy);
      
      const fromDate = getDateRange();
      if (fromDate) {
        params.append('from', fromDate);
      }
    } else {
      // Otherwise, add 'country' and 'category' for top headlines
      params.set('country', country);
      params.set('category', category);
    }
    
    // The URL now correctly points to our function with all params.
    // No headers or API key are needed on the client-side anymore.
    return { url: `${API_BASE}?${params.toString()}`, endpoint: mode };
  }, [mode, country, category, searchQuery, sortBy, dateRange, page, pageSize]);

  const fallbackRequest = useMemo(() => {
    // This creates a search-based fallback using the category name
    const params = new URLSearchParams({
      q: category,
      sortBy: 'publishedAt',
      page: String(page),
      pageSize: String(pageSize),
    });
    // Correctly point to the Netlify function endpoint
    return { url: `${API_BASE}?${params.toString()}`, endpoint: 'everything(fallback)' };
  }, [category, page, pageSize]);

  const startProgress = () => {
    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p < 90) return Math.min(90, p + Math.max(1, Math.round((90 - p) * 0.08)));
        return p;
      });
    }, 120);
  };

  const finishProgress = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchNews();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSortBy('publishedAt');
    setDateRange('all');
    setPage(1);
  };

  const fetchNews = () => {
    let cancel = false;

    const fetchOnce = async (req) => {
      startProgress();
      // The `init` object with headers is no longer passed here
      const res = await fetch(req.url); 
      const ok = res.ok;
      let payload = null;
      try {
        payload = await res.json();
      } catch {
        // ignore
      }
      if (!ok) {
        const serverMsg = payload?.message ? `: ${payload.message}` : '';
        throw new Error(`HTTP ${res.status}${serverMsg}`);
      }
      return payload;
    };

    const run = async () => {
      try {
        // API Key check is removed from the client
        setStatus('loading');
        setErrorMsg('');
        setUsedEndpoint('');

        const data = await fetchOnce(primaryRequest);
        if (cancel) return;

        const list = Array.isArray(data?.articles) ? data.articles : [];
        const total = Number.isFinite(data?.totalResults) ? data.totalResults : 0;

        if (primaryRequest.endpoint === 'top-headlines' && total === 0) {
          try {
            const fb = await fetchOnce(fallbackRequest);
            if (cancel) return;
            const fbList = Array.isArray(fb?.articles) ? fb.articles : [];
            const fbTotal = Number.isFinite(fb?.totalResults) ? fb.totalResults : 0;
            setArticles(fbList);
            setTotalResults(fbTotal);
            setStatus('success');
            setUsedEndpoint(fallbackRequest.endpoint);
            finishProgress();
            return;
          } catch (fbErr) {
            console.warn('[SparkNow] Fallback failed:', fbErr);
          }
        }

        setArticles(list);
        setTotalResults(total);
        setStatus('success');
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
      } catch (err) {
        if (cancel) return;
        setStatus('error');
        setErrorMsg(err?.message || 'Failed to fetch news');
        setArticles([]);
        setTotalResults(0);
        setUsedEndpoint(primaryRequest.endpoint);
        finishProgress();
      }
    };

    run();
    return () => {
      cancel = true;
      clearInterval(timerRef.current);
    };
  };

  useEffect(() => {
    fetchNews();
  }, [primaryRequest, fallbackRequest]);

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const headerLabel = hasQuery
    ? `Search Results • "${searchQuery}"`
    : `Top Headlines • ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Search and Filter Section */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-lg border border-white/10 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news, topics, or keywords..."
                className="
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-white/5 border border-white/15
                  text-white placeholder-white/60
                  focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80 focus:border-transparent
                  backdrop-blur-sm transition-all duration-300
                "
              />
            </div>
            <button
              type="submit"
              className="
                px-6 py-3 rounded-xl
                bg-gradient-to-r from-[#19b1ff] to-[#0a78ff]
                text-white font-semibold
                shadow-lg shadow-[#19b1ff]/25
                hover:shadow-[#19b1ff]/40 hover:scale-105
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
                flex items-center gap-2
              "
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="
                px-4 py-3 rounded-xl
                bg-white/5 border border-white/15
                text-white/80 hover:text-white
                hover:bg-white/10 transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
                flex items-center gap-2
              "
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              {/* Sort By */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Sort By
                </label>
                <select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="
    w-full px-3 py-2 rounded-lg
    bg-white/5 border border-white/15
    text-white focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
    backdrop-blur-sm
    appearance-none
    [color-scheme:dark]
  "
  style={{
    backgroundColor: 'rgba(255,255,255,0.05)',
  }}
>
  <option className="text-white bg-[#0b1220]" value="publishedAt">Latest</option>
  <option className="text-white bg-[#0b1220]" value="relevancy">Relevancy</option>
  <option className="text-white bg-[#0b1220]" value="popularity">Popularity</option>
</select>

              </div>

              {/* Date Range */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Date Range
                </label>
                <select
  value={dateRange}
  onChange={(e) => setDateRange(e.target.value)}
  className="
    w-full px-3 py-2 rounded-lg
    bg-white/5 border border-white/15
    text-white focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
    backdrop-blur-sm
    appearance-none
    [color-scheme:dark]
  "
  style={{
    backgroundColor: 'rgba(255,255,255,0.05)',
  }}
>
  <option className="text-white bg-[#0b1220]" value="all">All Time</option>
  <option className="text-white bg-[#0b1220]" value="today">Last 24 Hours</option>
  <option className="text-white bg-[#0b1220]" value="week">Last Week</option>
  <option className="text-white bg-[#0b1220]" value="month">Last Month</option>
</select>

              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-white/5 border border-white/15
                    text-white/80 hover:text-white hover:bg-white/10
                    transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
                  "
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-gradient-to-r from-[#19b1ff] to-[#0a78ff]
                    text-white font-medium
                    shadow-lg shadow-[#19b1ff]/25
                    hover:shadow-[#19b1ff]/40
                    transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-[#19b1ff]/80
                  "
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Search Info */}
        {hasQuery && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-white/60">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-[#19b1ff]/20 text-[#19b1ff] rounded-full border border-[#19b1ff]/30">
                Search: "{searchQuery}"
              </span>
            )}
            {dateRange !== 'all' && (
              <span className="px-3 py-1 bg-[#19b1ff]/20 text-[#19b1ff] rounded-full border border-[#19b1ff]/30">
                Date: {dateRange}
              </span>
            )}
            <span className="px-3 py-1 bg-[#19b1ff]/20 text-[#19b1ff] rounded-full border border-[#19b1ff]/30">
              Sort: {sortBy}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-lg border border-white/10 shadow-xl">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {headerLabel}
          </h2>
          <p className="text-white/60 text-sm mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#19b1ff] rounded-full animate-pulse"></span>
            {usedEndpoint ? `Source: ${usedEndpoint}` : 'Fetching the freshest stories'}
            {totalResults > 0 && ` • ${totalResults} results found`}
          </p>
        </div>
        
        {/* Enhanced progress rail */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-white/80 text-sm font-medium">{progress}%</div>
            <div className="text-white/60 text-xs">Loading</div>
          </div>
          <div className="h-3 w-32 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#19b1ff] to-[#0a78ff] transition-[width] duration-200 shadow-lg shadow-[#19b1ff]/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced loading state */}
      {status === 'loading' && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-12 text-center shadow-xl ring-1 ring-white/5">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-3 border-white/10 border-t-[#19b1ff] border-r-[#19b1ff] shadow-lg" />
          <div className="text-white font-semibold text-lg mb-2">{progress}% Complete</div>
          <div className="text-white/70">Curating the latest news for you</div>
          <div className="text-white/50 text-sm mt-2">Powered by NewsAPI • SparkNow Network</div>
        </div>
      )}

      {/* Enhanced error state */}
      {status === 'error' && (
        <div className="rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-lg p-8 shadow-xl ring-1 ring-red-400/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-white font-bold text-lg">We hit a snag fetching stories</div>
          </div>
          <div className="text-white/80 break-all bg-white/5 rounded-lg p-4 text-sm font-mono">{errorMsg}</div>
          <div className="mt-6">
            <button
              onClick={() => location.reload()}
              className="rounded-xl px-6 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 text-white border border-red-400/30 hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Enhanced empty state */}
      {status === 'success' && articles.length === 0 && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg p-12 text-center shadow-xl ring-1 ring-white/5">
          <div className="mx-auto mb-4 h-16 w-16 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-white font-bold text-xl mb-2">No stories found</div>
          <div className="text-white/70">Try a different query, category, or region</div>
          {hasQuery && (
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#19b1ff] to-[#0a78ff] text-white rounded-xl hover:scale-105 transition-all duration-300"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Enhanced grid */}
      {status === 'success' && articles.length > 0 && (
        <>
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

          {/* Enhanced pagination */}
          <div className="mt-12 flex items-center justify-between bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="
                inline-flex items-center gap-3 rounded-xl px-5 py-3 text-white font-medium
                border border-white/15 bg-gradient-to-r from-white/5 to-white/10 
                hover:from-white/10 hover:to-white/15 transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-white/5 disabled:hover:to-white/10
                hover:scale-105 hover:shadow-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80
              "
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-medium">Page</span>
              <span className="px-4 py-2 bg-gradient-to-r from-[#19b1ff]/20 to-[#0a78ff]/20 text-white rounded-lg font-bold border border-[#19b1ff]/30">
                {page}
              </span>
              <span className="text-white/60 text-sm">of {totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="
                inline-flex items-center gap-3 rounded-xl px-5 py-3 text-white font-medium
                border border-white/15 bg-gradient-to-r from-white/5 to-white/10 
                hover:from-white/10 hover:to-white/15 transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-white/5 disabled:hover:to-white/10
                hover:scale-105 hover:shadow-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#19b1ff]/80
              "
            >
              Next
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
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