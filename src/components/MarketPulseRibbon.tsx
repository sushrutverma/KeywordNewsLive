import { FC, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Filter, 
  SlidersHorizontal, 
  Plus, 
  Check, 
  X, 
  Search, 
  RotateCcw,
  Star
} from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { ASSET_CATALOG, TrackedAsset } from '../services/marketAssets';

export const MarketPulseRibbon: FC = () => {
  const { 
    currentKeyword, 
    searchNews, 
    trackedAssets, 
    toggleTrackAsset, 
    addCustomTrackedAsset, 
    resetWatchlist 
  } = useNews();

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'stock' | 'index' | 'commodity' | 'forex'>('all');
  
  // Custom asset creation form
  const [customName, setCustomName] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [customCategory, setCustomCategory] = useState<TrackedAsset['category']>('stock');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Lock background scroll when customizing modal is open
  useEffect(() => {
    if (isCustomizing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCustomizing]);

  // Calculate IST Market hours (09:15 - 15:30 Mon-Fri)
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      // Convert to IST (UTC + 5.5 hours)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));
      
      const day = istDate.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && totalMinutes >= (9 * 60 + 15) && totalMinutes <= (15 * 60 + 30);
      
      setIsMarketOpen(isOpen);
      setTimeString(
        istDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChipClick = (query: string) => {
    searchNews(query);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCustomTrackedAsset(customName, customKeyword, customCategory);
    setCustomName('');
    setCustomKeyword('');
    setShowAddCustom(false);
  };

  // Filter catalog in customization modal
  const filteredCatalog = ASSET_CATALOG.filter((asset) => {
    const matchesCategory = activeCategoryTab === 'all' || asset.category === activeCategoryTab;
    const matchesQuery = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mb-6 rounded-2xl p-4 bg-gradient-to-br from-emerald-950/20 via-zinc-900/10 to-indigo-950/20 dark:from-emerald-950/40 dark:via-zinc-900/40 dark:to-zinc-900/40 border border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-md shadow-sm">
      {/* Top Header Row: Title, Market Bell Status, & Watchlist Settings Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-emerald-500/10 dark:border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            Live Benchmarks
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
            BETA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-gray-700 dark:text-zinc-300">
              NSE: {isMarketOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-gray-400 dark:text-zinc-500 font-normal">
              ({timeString})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition shadow-sm"
          >
            <SlidersHorizontal size={12} />
            <span>Customize ({trackedAssets.length})</span>
          </button>
        </div>
      </div>

      {/* Prioritization Notice Pill */}
      <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
        <span className="flex items-center gap-1.5">
          <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
          <span>
            <strong>Smart Ranking Active:</strong> Stories mentioning your tracked assets are automatically boosted to the top of the feed with a <strong className="text-amber-600 dark:text-amber-300">⭐ Tracked Asset</strong> badge.
          </span>
        </span>
      </div>

      {/* Indices & Tracked Assets Ticker Cards (Horizontal Scrollable) */}
      <div className="overflow-x-auto scrollbar-none -mx-2 px-2 pb-2">
        <div className="flex items-center gap-2.5 min-w-max">
          {trackedAssets.map((item) => {
            const isPositive = item.percentChange >= 0;
            const isFilterActive = currentKeyword && item.keywords.some(k => k.toLowerCase() === currentKeyword.toLowerCase());
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleChipClick(isFilterActive ? '' : (item.keywords[0] || item.name))}
                className={`px-3.5 py-2 rounded-xl cursor-pointer transition shadow-xs flex flex-col min-w-[130px] border ${
                  isFilterActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-white/90 dark:bg-zinc-900/80 border-gray-200/80 dark:border-zinc-800/90 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-200 tracking-tight truncate max-w-[95px]">
                    {item.name}
                  </span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-mono">
                    {item.category.slice(0, 3)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100 font-mono">
                    {item.price}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold font-mono ${
                      isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={10} className="mr-0.5 inline" /> : <TrendingDown size={10} className="mr-0.5 inline" />}
                    {isPositive ? '+' : ''}{item.percentChange.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fast Ticker / Story Topic Chips */}
      <div className="mt-3 pt-2.5 border-t border-emerald-500/10 dark:border-emerald-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center text-[11px] font-semibold text-gray-500 dark:text-zinc-400 shrink-0 mr-1">
          <Filter size={11} className="mr-1" />
          Filter:
        </div>
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => handleChipClick('')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              !currentKeyword
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-white/80 dark:bg-zinc-900/60 text-gray-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200/60 dark:border-zinc-800'
            }`}
          >
            All Stories
          </button>
          {trackedAssets.slice(0, 10).map((asset) => {
            const primaryKw = asset.keywords[0] || asset.name;
            const isSelected = currentKeyword?.toLowerCase() === primaryKw.toLowerCase();
            return (
              <button
                key={asset.id}
                onClick={() => handleChipClick(isSelected ? '' : primaryKw)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-white/80 dark:bg-zinc-900/60 text-gray-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200/60 dark:border-zinc-800'
                }`}
              >
                {asset.symbol ? `$${asset.symbol.split('.')[0].replace('^', '')}` : asset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal / Drawer for Watchlist Customization rendered via Portal on document.body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isCustomizing && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsCustomizing(false)}
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 z-10"
              >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                      Customize Your Financial Watchlist
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Select which stocks, commodities, or indices to track & prioritize.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCustomizing(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search & Category Filter Tabs */}
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any stock, commodity, index (e.g. Tata Steel, RVNL, Gold, Apple)..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Instant 1-Click Track Any Stock Card */}
                {searchQuery.trim() && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate">
                          Track "{searchQuery.trim()}"
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          Instant Add
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-zinc-400 truncate">
                        Any finance story mentioning "{searchQuery.trim()}" will pin to the top of your feed
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addCustomTrackedAsset(searchQuery.trim(), searchQuery.trim());
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1 shrink-0"
                    >
                      <Plus size={13} />
                      <span>Track Asset</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {(['all', 'stock', 'commodity', 'index', 'forex'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategoryTab(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        activeCategoryTab === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat === 'all' ? 'All Assets' : cat === 'stock' ? 'Stocks (NSE/BSE)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets Catalog Grid */}
              <div className="mt-4 max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {filteredCatalog.map((asset) => {
                  const isTracked = trackedAssets.some((a) => a.id === asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleTrackAsset(asset.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isTracked
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate">
                            {asset.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-zinc-700/80 text-gray-600 dark:text-zinc-300">
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                          <span>{asset.price}</span>
                          <span className={asset.percentChange >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                            {asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
                          </span>
                          <span>•</span>
                          <span className="truncate">Keywords: {asset.keywords.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                          isTracked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 dark:border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check size={14} className={isTracked ? 'block' : 'hidden'} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Asset Accordion */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-800">
                {!showAddCustom ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/50 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Plus size={14} />
                    <span>+ Add Any Custom Stock, Commodity, or Company</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddCustom} className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Track Custom Asset</span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustom(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Asset / Stock Name</label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Tata Power, Nvidia, Silver"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Matching News Keyword</label>
                        <input
                          type="text"
                          value={customKeyword}
                          onChange={(e) => setCustomKeyword(e.target.value)}
                          placeholder="e.g. tatapower, nvidia, silver"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as TrackedAsset['category'])}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
                      >
                        <option value="stock">Stock</option>
                        <option value="commodity">Commodity</option>
                        <option value="index">Index</option>
                        <option value="forex">Forex & Crypto</option>
                      </select>

                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Save & Track
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetWatchlist}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <RotateCcw size={12} />
                  <span>Reset to Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCustomizing(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Apply Watchlist ({trackedAssets.length} Tracked)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};

export default MarketPulseRibbon;
