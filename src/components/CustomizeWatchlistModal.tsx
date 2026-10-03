import { FC, useState, useEffect, useMemo, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Plus, 
  Check, 
  X, 
  Search, 
  RotateCcw 
} from 'lucide-react';
import { TrackedAsset, ASSET_CATALOG } from '../services/marketAssets';
import { searchOnlineStocks } from '../services/stockSearchService';

export interface CustomizeWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackedAssets: TrackedAsset[];
  toggleTrackAsset: (asset: TrackedAsset) => void;
  addCustomTrackedAsset: (name: string, keyword: string, category?: TrackedAsset['category']) => void;
  resetWatchlist: () => void;
}

export const CustomizeWatchlistModal: FC<CustomizeWatchlistModalProps> = ({
  isOpen,
  onClose,
  trackedAssets,
  toggleTrackAsset,
  addCustomTrackedAsset,
  resetWatchlist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'stock' | 'index' | 'commodity' | 'forex'>('all');
  
  // Live online stock search state
  const [onlineResults, setOnlineResults] = useState<TrackedAsset[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Custom asset creation form
  const [customName, setCustomName] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [customCategory, setCustomCategory] = useState<TrackedAsset['category']>('stock');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Lock background scroll when customizing modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced live search across all global/Indian stock exchanges
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const results = await searchOnlineStocks(searchQuery.trim());
        setOnlineResults(results);
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter catalog in customization modal
  const filteredCatalog = useMemo(() => {
    return ASSET_CATALOG.filter((asset) => {
      const matchesCategory = activeCategoryTab === 'all' || asset.category === activeCategoryTab;
      const matchesQuery = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategoryTab]);

  // Combine local catalog + live online stock search results (deduped by symbol)
  const combinedResults: TrackedAsset[] = useMemo(() => {
    const map = new Map<string, TrackedAsset>();
    filteredCatalog.forEach(a => map.set(a.symbol.toUpperCase(), a));
    onlineResults.forEach(a => {
      const key = a.symbol.toUpperCase();
      if (!map.has(key)) {
        if (activeCategoryTab === 'all' || a.category === activeCategoryTab) {
          map.set(key, a);
        }
      }
    });
    return Array.from(map.values());
  }, [filteredCatalog, onlineResults, activeCategoryTab]);

  const handleAddCustom = (e: FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCustomTrackedAsset(customName, customKeyword, customCategory);
    setCustomName('');
    setCustomKeyword('');
    setShowAddCustom(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
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
                onClick={onClose}
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
              {isSearchingOnline && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full shrink-0" />
                  <span>Searching all Indian & Global exchanges for "{searchQuery}"...</span>
                </div>
              )}

              {combinedResults.length === 0 && !isSearchingOnline ? (
                <div className="p-6 text-center text-xs text-gray-500 dark:text-zinc-400">
                  No matching assets found. Use the instant track button above to track "{searchQuery}".
                </div>
              ) : (
                combinedResults.map((asset) => {
                  const isTracked = trackedAssets.some((a) => a.id === asset.id || a.symbol.toUpperCase() === asset.symbol.toUpperCase());
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleTrackAsset(asset)}
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
                          {asset.percentChange !== 0 && (
                            <span className={asset.percentChange >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                              {asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
                            </span>
                          )}
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
                })
              )}
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
                onClick={onClose}
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
  );
};

export default CustomizeWatchlistModal;
