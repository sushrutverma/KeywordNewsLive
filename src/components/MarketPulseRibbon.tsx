import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Filter } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';

interface MarketIndex {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percentChange: number;
  currency?: string;
  region: 'IN' | 'US' | 'COMMODITY' | 'FX';
}

const DEFAULT_INDICES: MarketIndex[] = [
  { symbol: '^NSEI', name: 'NIFTY 50', price: '25,385.40', change: '+118.25', percentChange: 0.47, region: 'IN' },
  { symbol: '^BSESN', name: 'SENSEX', price: '83,120.15', change: '+392.40', percentChange: 0.48, region: 'IN' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', price: '52,940.80', change: '+410.60', percentChange: 0.78, region: 'IN' },
  { symbol: '^GSPC', name: 'S&P 500', price: '5,752.10', change: '+24.15', percentChange: 0.42, region: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ', price: '18,210.40', change: '+142.30', percentChange: 0.79, region: 'US' },
  { symbol: 'GC=F', name: 'GOLD 10g', price: '₹76,140', change: '+210', percentChange: 0.28, region: 'COMMODITY' },
  { symbol: 'USDINR=X', name: 'USD / INR', price: '₹83.56', change: '-0.06', percentChange: -0.07, region: 'FX' },
  { symbol: 'CL=F', name: 'BRENT CRUDE', price: '$74.45', change: '-0.65', percentChange: -0.87, region: 'COMMODITY' }
];

const POPULAR_TICKERS = [
  { label: 'All', query: '' },
  { label: '$RELIANCE', query: 'Reliance' },
  { label: '$TCS', query: 'TCS' },
  { label: '$HDFCBANK', query: 'HDFC' },
  { label: '$INFY', query: 'Infosys' },
  { label: '$TATAMOTORS', query: 'Tata' },
  { label: '$ICICI', query: 'ICICI' },
  { label: '$SBIN', query: 'SBI' },
  { label: 'IPOs', query: 'IPO' },
  { label: 'RBI Policy', query: 'RBI' }
];

export const MarketPulseRibbon: FC = () => {
  const { currentKeyword, searchNews } = useNews();
  const [indices] = useState<MarketIndex[]>(DEFAULT_INDICES);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

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

  return (
    <div className="mb-6 rounded-2xl p-4 bg-gradient-to-br from-emerald-950/20 via-zinc-900/10 to-indigo-950/20 dark:from-emerald-950/40 dark:via-zinc-900/40 dark:to-zinc-900/40 border border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-md shadow-sm">
      {/* Top Header Row: Title & Market Bell Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-emerald-500/10 dark:border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              Financial Markets Pulse
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Benchmarks
              </span>
            </h2>
          </div>
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

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50">
            <Sparkles size={11} />
            <span>Terminal in Dev</span>
          </div>
        </div>
      </div>

      {/* Indices Ticker Cards (Horizontal Scrollable) */}
      <div className="overflow-x-auto scrollbar-none -mx-2 px-2 pb-2">
        <div className="flex items-center gap-2.5 min-w-max">
          {indices.map((item) => {
            const isPositive = item.percentChange >= 0;
            return (
              <motion.div
                key={item.symbol}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/80 border border-gray-200/80 dark:border-zinc-800/90 shadow-xs flex flex-col min-w-[125px]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-mono">
                    {item.region}
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
          {POPULAR_TICKERS.map((chip) => {
            const isSelected = chip.query === '' ? !currentKeyword : currentKeyword?.toLowerCase() === chip.query.toLowerCase();
            return (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.query)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-white/80 dark:bg-zinc-900/60 text-gray-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200/60 dark:border-zinc-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketPulseRibbon;
