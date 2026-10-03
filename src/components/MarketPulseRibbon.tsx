import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw,
  Star
} from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import CustomizeWatchlistModal from './CustomizeWatchlistModal';

export const MarketPulseRibbon: FC = () => {
  const { 
    currentKeyword, 
    searchNews, 
    trackedAssets, 
    toggleTrackAsset, 
    addCustomTrackedAsset, 
    resetWatchlist,
    refreshTrackedQuotes,
    isRefreshingQuotes
  } = useNews();

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);

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

  // Synchronize live quotes as soon as user opens Finance & Markets tab
  useEffect(() => {
    refreshTrackedQuotes();
  }, [refreshTrackedQuotes]);

  const handleChipClick = (query: string) => {
    searchNews(query);
  };

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
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
            REAL-TIME
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshTrackedQuotes()}
            disabled={isRefreshingQuotes}
            title="Refresh real-time prices"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200/80 dark:border-zinc-700/80 shadow-xs transition"
          >
            <RotateCcw size={11} className={isRefreshingQuotes ? 'animate-spin text-emerald-500' : 'text-gray-400 dark:text-zinc-500'} />
            <span className="hidden sm:inline">{isRefreshingQuotes ? 'Updating...' : 'Refresh Quotes'}</span>
          </button>

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

      {/* Watchlist Customization Modal */}
      <CustomizeWatchlistModal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        trackedAssets={trackedAssets}
        toggleTrackAsset={toggleTrackAsset}
        addCustomTrackedAsset={addCustomTrackedAsset}
        resetWatchlist={resetWatchlist}
      />
    </div>
  );
};

export default MarketPulseRibbon;
