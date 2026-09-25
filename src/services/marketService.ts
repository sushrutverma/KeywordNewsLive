const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://jwksmchxpprxkpbsmhxo.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8-mwp-4C7u6ouu7KftHYuw_O72qOXVq';

export interface MarketTickerItem {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  unit?: string;
  formattedPrice: string;
  formattedChange: string;
}

const MARKET_SYMBOLS: Array<{ symbol: string; label: string; unit?: string; prefix?: string }> = [
  { symbol: '^BSESN', label: 'SENSEX', prefix: '₹' },
  { symbol: '^NSEI', label: 'NIFTY 50', prefix: '₹' },
  { symbol: 'INR=X', label: 'USD/INR', prefix: '₹' },
  { symbol: 'BZ=F', label: 'BRENT CRUDE', unit: '$/bbl', prefix: '$' },
  { symbol: 'GC=F', label: 'GOLD', unit: '$/oz', prefix: '$' },
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: 'BTC-USD', label: 'BITCOIN', prefix: '$' }
];

const CACHE_KEY = 'market_ticker_cache';
const CACHE_TIMESTAMP_KEY = 'market_ticker_timestamp';
const CACHE_DURATION = 60 * 1000; // 60 seconds

const formatNumber = (num: number, decimals = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const fetchMarketData = async (): Promise<MarketTickerItem[]> => {
  // Check local cache first
  try {
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedTime && cachedData && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
      return JSON.parse(cachedData);
    }
  } catch {
    // Ignore cache parse errors
  }

  const promises = MARKET_SYMBOLS.map(async (item): Promise<MarketTickerItem | null> => {
    try {
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=1d&range=1d`;
      const proxyUrl = `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(targetUrl)}`;
      
      const res = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) return null;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      const isPositive = change >= 0;

      const prefix = item.prefix || '';
      const decimals = item.symbol === 'INR=X' ? 2 : (price > 1000 ? 2 : 2);

      return {
        symbol: item.symbol,
        label: item.label,
        price,
        change,
        changePercent,
        isPositive,
        unit: item.unit,
        formattedPrice: `${prefix}${formatNumber(price, decimals)}`,
        formattedChange: `${isPositive ? '+' : ''}${formatNumber(changePercent, 2)}%`
      };
    } catch {
      return null;
    }
  });

  const settled = await Promise.allSettled(promises);
  const items = settled
    .filter((r): r is PromiseFulfilledResult<MarketTickerItem | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((item): item is MarketTickerItem => item !== null);

  if (items.length > 0) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch {
      // Ignore cache write error
    }
  }

  return items;
};
