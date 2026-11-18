import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Building2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../services/api.js';

const CATEGORIES = [
  'All',
  'Market',
  'Economy',
  'Banking',
  'Personal Finance',
  'Mutual Funds',
  'Stocks',
  'RBI',
  'Government / Tax'
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isCached, setIsCached] = useState(false);

  // Map of article id/link -> { loading, data, error, open }
  const [personalizations, setPersonalizations] = useState({});

  const fetchNews = async (category = selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.news.get(category);
      if (res?.data?.articles) {
        setArticles(res.data.articles);
        setLastUpdated(res.data.lastUpdated);
        setIsCached(res.data.cached);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('[NewsPage] Fetch error:', err);
      setError(err.message || 'Failed to load live financial news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const handlePersonalize = async (article) => {
    const key = article.id || article.link;
    const current = personalizations[key];

    // If already loaded, toggle expansion
    if (current?.data) {
      setPersonalizations((prev) => ({
        ...prev,
        [key]: { ...current, open: !current.open }
      }));
      return;
    }

    setPersonalizations((prev) => ({
      ...prev,
      [key]: { loading: true, error: null, open: true }
    }));

    try {
      const res = await api.news.personalize(article);
      if (res?.data) {
        setPersonalizations((prev) => ({
          ...prev,
          [key]: { loading: false, error: null, data: res.data, open: true }
        }));
      } else {
        throw new Error('Could not generate personalized impact analysis.');
      }
    } catch (err) {
      console.error('[NewsPage] Personalization error:', err);
      setPersonalizations((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error: err.message || 'Failed to generate personalization.',
          open: true
        }
      }));
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filter articles by search input
  const filteredArticles = articles.filter((art) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (art.title && art.title.toLowerCase().includes(q)) ||
      (art.source && art.source.toLowerCase().includes(q)) ||
      (art.description && art.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E8E2]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#14251C] tracking-tight">
                Live Financial News
              </h1>
              <p className="text-xs text-[#64736A] mt-0.5">
                Real-time market intelligence across 8 financial sectors with AI-powered personalized impact.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => fetchNews(selectedCategory)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F8F5] text-[#14251C] text-xs font-semibold rounded-xl border border-[#E0E8E2] transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#087F5B]' : ''}`} />
            <span>Refresh</span>
          </button>

          {isCached && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAFCFA] border border-[#E0E8E2] text-[11px] text-[#64736A]">
              <Clock className="w-3 h-3 text-[#087F5B]" />
              <span>Cached</span>
            </span>
          )}
        </div>
      </div>

      {/* Category Pills & Search Bar Controls */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#087F5B] text-white shadow-xs'
                    : 'bg-white hover:bg-[#ECFDF5] text-[#64736A] hover:text-[#087F5B] border border-[#E0E8E2] hover:border-[#A7F3D0]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#859188]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedCategory} news headlines...`}
              className="w-full bg-white border border-[#E0E8E2] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#17251D] placeholder:text-[#859188] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B]"
            />
          </div>

          <div className="text-[11px] text-[#64736A] flex items-center gap-2">
            <span>
              Showing <strong className="text-[#14251C]">{filteredArticles.length}</strong> real stories
            </span>
            <span className="text-[#859188]">•</span>
            <span>External syndicated publishers</span>
          </div>
        </div>
      </div>

      {/* Error Message with Retry */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#DC2626]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchNews(selectedCategory)}
            className="px-3 py-1.5 bg-white border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg font-bold transition-colors shadow-2xs self-start sm:self-center"
          >
            Retry News Feed
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-5 w-4/5 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
              <div className="h-4 w-2/3 bg-slate-100 rounded-md"></div>
              <div className="pt-2 flex justify-between">
                <div className="h-7 w-24 bg-slate-200 rounded-xl"></div>
                <div className="h-7 w-32 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredArticles.length === 0 && (
        <div className="bg-white border border-[#E0E8E2] rounded-2xl p-8 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B] mx-auto">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#14251C]">No Articles Found</h3>
          <p className="text-xs text-[#64736A]">
            {searchQuery
              ? `No articles in ${selectedCategory} matched "${searchQuery}".`
              : `No live articles available for ${selectedCategory} at the moment.`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3.5 py-1.5 bg-[#FAFCFA] border border-[#E0E8E2] hover:bg-[#ECFDF5] text-xs font-semibold rounded-xl text-[#087F5B]"
            >
              Clear Search Query
            </button>
          )}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => {
            const key = article.id || article.link;
            const pState = personalizations[key];

            return (
              <div
                key={key}
                className="bg-white border border-[#E0E8E2] rounded-2xl p-5 shadow-sm hover:border-[#A7F3D0] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Meta Tags: Category & Publisher */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] font-bold text-[#087F5B]">
                        {article.category || selectedCategory}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAFCFA] border border-[#E0E8E2] font-semibold text-[#14251C]">
                        {article.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#859188] shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm sm:text-base font-bold text-[#14251C] leading-snug hover:text-[#087F5B] transition-colors">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {article.title}
                    </a>
                  </h3>

                  {/* Description / Summary */}
                  <p className="text-xs text-[#64736A] leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                {/* Personalized "Why This Matters To You" Expansion Card */}
                {pState?.open && (
                  <div className="bg-[#FAFCFA] border border-[#A7F3D0] rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#087F5B]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Why This Matters To Your Finances</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                        AI interpretation — not financial advice
                      </span>
                    </div>

                    {pState.loading ? (
                      <div className="py-3 flex items-center justify-center gap-2 text-xs text-[#087F5B]">
                        <div className="w-4 h-4 border-2 border-[#087F5B] border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting to your MoneyPilot metrics...</span>
                      </div>
                    ) : pState.error ? (
                      <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                        {pState.error}
                      </div>
                    ) : pState.data ? (
                      <div className="space-y-2">
                        {/* Connected User Financial Factor Badges */}
                        {pState.data.userContextFactors && pState.data.userContextFactors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {pState.data.userContextFactors.map((factor, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E0E8E2] text-[#14251C] font-semibold"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#087F5B]" />
                                <span>{factor}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Impact Statement */}
                        <p className="text-xs text-[#17251D] leading-relaxed">
                          {pState.data.impactAnalysis}
                        </p>

                        <div className="text-[10px] text-[#859188] pt-1 border-t border-[#E0E8E2] flex items-center gap-1">
                          <Info className="w-3 h-3 shrink-0" />
                          <span>{pState.data.disclaimer}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-[#E0E8E2] flex items-center justify-between gap-2">
                  {/* Read Article Action */}
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#087F5B] hover:text-[#066649] transition-colors"
                  >
                    <span>Read article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Why this matters button */}
                  <button
                    onClick={() => handlePersonalize(article)}
                    disabled={pState?.loading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      pState?.open && pState?.data
                        ? 'bg-[#FAFCFA] border border-[#A7F3D0] text-[#087F5B]'
                        : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#087F5B]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {pState?.open && pState?.data ? 'Hide Impact' : 'Why this matters'}
                    </span>
                    {pState?.open && pState?.data ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
