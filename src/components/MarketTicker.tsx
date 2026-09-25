import { FC, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { fetchMarketData, MarketTickerItem } from '../services/marketService';

export const MarketTicker: FC = () => {
  const [data, setData] = useState<MarketTickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const loadMarket = async () => {
    try {
      const items = await fetchMarketData();
      if (items.length > 0) {
        setData(items);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarket();
    // Auto-refresh quotes every 60 seconds
    const interval = setInterval(loadMarket, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (data.length === 0 && !isLoading) {
    return null; // Don't render empty container if all requests failed
  }

  // Duplicate the items array for a seamless infinite scroll loop
  const tickerItems = [...data, ...data];

  return (
    <div 
      className="w-full mb-4 overflow-hidden rounded-xl border border-gray-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs text-xs select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {/* Static Left Badge */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100/80 dark:bg-zinc-800/80 font-bold uppercase tracking-wider text-[10px] text-gray-700 dark:text-zinc-300 border-r border-gray-200/60 dark:border-zinc-800/60 shrink-0 z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">LIVE</span>
          <span>MARKETS</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && data.length === 0 ? (
            <div className="flex items-center gap-6 px-4 py-2 text-gray-400 dark:text-zinc-500 animate-pulse">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw size={11} className="animate-spin" />
                Connecting to global market feeds...
              </span>
            </div>
          ) : (
            <div 
              className={`flex items-center gap-8 py-2 whitespace-nowrap will-change-transform ${
                isHovered ? 'animate-none' : 'animate-ticker'
              }`}
              style={{
                animationDuration: '32s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            >
              {tickerItems.map((item, idx) => (
                <div key={`${item.symbol}-${idx}`} className="inline-flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 tracking-tight">
                    {item.label}
                  </span>
                  <span className="font-mono text-gray-900 dark:text-zinc-100 font-medium">
                    {item.formattedPrice}
                    {item.unit && <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-0.5">{item.unit}</span>}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                      item.isPositive
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    }`}
                  >
                    {item.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {item.formattedChange}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
