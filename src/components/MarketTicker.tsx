import { FC, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchMarketData, MarketTickerItem, INITIAL_MARKET_DATA } from '../services/marketService';

export const MarketTicker: FC = () => {
  const [data, setData] = useState<MarketTickerItem[]>(INITIAL_MARKET_DATA);
  const [isHovered, setIsHovered] = useState(false);

  const loadMarket = async () => {
    try {
      const items = await fetchMarketData();
      if (items.length > 0) {
        setData(items);
      }
    } catch {
      // Keep existing data on error
    }
  };

  useEffect(() => {
    loadMarket();
    // Auto-refresh quotes every 60 seconds
    const interval = setInterval(loadMarket, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const currentItems = data.length > 0 ? data : INITIAL_MARKET_DATA;
  // Duplicate the items array for a seamless infinite scroll loop
  const tickerItems = [...currentItems, ...currentItems];

  return (
    <div 
      className="w-full mb-5 overflow-hidden rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 glass-card text-xs select-none relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {/* Static Left Badge */}
        <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 bg-gray-100/70 dark:bg-zinc-800/70 font-bold uppercase tracking-wider text-[10px] text-gray-700 dark:text-zinc-300 border-r border-gray-200/60 dark:border-zinc-800/60 shrink-0 z-10 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">LIVE</span>
          <span>MARKETS</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle Right Edge Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white/80 dark:from-zinc-900/80 to-transparent pointer-events-none" />

          <div 
            className={`flex items-center gap-8 py-2.5 whitespace-nowrap will-change-transform ${
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
                <span className="font-semibold text-gray-800 dark:text-zinc-200 tracking-tight text-[11px]">
                  {item.label}
                </span>
                <span className="font-mono text-gray-900 dark:text-zinc-100 font-medium text-[11px]">
                  {item.formattedPrice}
                  {item.unit && <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-0.5">{item.unit}</span>}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    item.isPositive
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                      : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {item.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {item.formattedChange}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
