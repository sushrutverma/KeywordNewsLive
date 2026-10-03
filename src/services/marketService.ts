const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

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

export interface AssetQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  isPositive: boolean;
  currency: string;
  formattedPrice: string;
  formattedChange: string;
  timestamp: number;
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
const QUOTE_CACHE_KEY_PREFIX = 'asset_quote_cache_';
const CACHE_DURATION = 60 * 1000; // 60 seconds

// In-memory quote cache
const memoryQuoteCache = new Map<string, AssetQuote>();

export const formatNumber = (num: number, decimals = 2, isINR = false): string => {
  if (isNaN(num)) return '0.00';
  const locale = isINR ? 'en-IN' : 'en-US';
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const INITIAL_MARKET_DATA: MarketTickerItem[] = [
  { symbol: '^BSESN', label: 'SENSEX', price: 71909.70, change: -569.40, changePercent: -0.79, isPositive: false, formattedPrice: '₹71,909.70', formattedChange: '-0.79%' },
  { symbol: '^NSEI', label: 'NIFTY 50', price: 22421.95, change: -198.50, changePercent: -0.88, isPositive: false, formattedPrice: '₹22,421.95', formattedChange: '-0.88%' },
  { symbol: 'INR=X', label: 'USD/INR', price: 86.30, change: 0.12, changePercent: 0.14, isPositive: true, formattedPrice: '₹86.30', formattedChange: '+0.14%' },
  { symbol: 'BZ=F', label: 'BRENT CRUDE', price: 100.85, change: 2.82, changePercent: 2.88, isPositive: true, unit: '$/bbl', formattedPrice: '$100.85', formattedChange: '+2.88%' },
  { symbol: 'GC=F', label: 'GOLD', price: 4197.90, change: 11.20, changePercent: 0.27, isPositive: true, unit: '$/oz', formattedPrice: '$4,197.90', formattedChange: '+0.27%' },
  { symbol: '^GSPC', label: 'S&P 500', price: 7649.36, change: -2.18, changePercent: -0.03, isPositive: false, formattedPrice: '7,649.36', formattedChange: '-0.03%' },
  { symbol: 'BTC-USD', label: 'BITCOIN', price: 84376.69, change: 810.35, changePercent: 0.97, isPositive: true, formattedPrice: '$84,376.69', formattedChange: '+0.97%' }
];

/**
 * Fetch a single asset quote via Yahoo Finance chart API through Supabase proxy
 */
export const fetchQuoteForSymbol = async (rawSymbol: string): Promise<AssetQuote | null> => {
  if (!rawSymbol || !rawSymbol.trim()) return null;
  const symbol = rawSymbol.trim().toUpperCase();

  // Check memory cache
  const cachedMem = memoryQuoteCache.get(symbol);
  if (cachedMem && (Date.now() - cachedMem.timestamp < CACHE_DURATION)) {
    return cachedMem;
  }

  // Check localStorage cache
  try {
    const cachedLocal = localStorage.getItem(`${QUOTE_CACHE_KEY_PREFIX}${symbol}`);
    if (cachedLocal) {
      const parsed: AssetQuote = JSON.parse(cachedLocal);
      if (parsed && (Date.now() - parsed.timestamp < CACHE_DURATION)) {
        memoryQuoteCache.set(symbol, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage parse error
  }

  try {
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const proxyUrl = `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(targetUrl)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const change = price - prevClose;
    const rawPercent = typeof meta.regularMarketChangePercent === 'number'
      ? meta.regularMarketChangePercent
      : (prevClose !== 0 ? (change / prevClose) * 100 : 0);
    const percentChange = Number(rawPercent.toFixed(2));
    const isPositive = percentChange >= 0;

    const currency = (meta.currency || '').toUpperCase();
    const isIndian = currency === 'INR' || symbol.endsWith('.NS') || symbol.endsWith('.BO') || symbol === '^NSEI' || symbol === '^BSESN' || symbol === '^NSEBANK';
    const prefix = isIndian ? '₹' : (currency === 'USD' || symbol.includes('USD') || symbol === 'GC=F' || symbol === 'CL=F' ? '$' : '');

    const decimals = (price > 100 || isIndian) ? 2 : (price < 1 ? 4 : 2);
    const formattedPrice = `${prefix}${formatNumber(price, decimals, isIndian)}`;
    const formattedChange = `${isPositive ? '+' : ''}${formatNumber(percentChange, 2)}%`;

    const quote: AssetQuote = {
      symbol,
      price,
      change,
      percentChange,
      isPositive,
      currency,
      formattedPrice,
      formattedChange,
      timestamp: Date.now()
    };

    memoryQuoteCache.set(symbol, quote);
    try {
      localStorage.setItem(`${QUOTE_CACHE_KEY_PREFIX}${symbol}`, JSON.stringify(quote));
    } catch {
      // Ignore localStorage write error
    }

    return quote;
  } catch (err) {
    console.warn(`[marketService] Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
};

/**
 * Batch fetch quotes for multiple symbols concurrently
 */
export const fetchQuotesForSymbols = async (symbols: string[]): Promise<Map<string, AssetQuote>> => {
  const uniqueSymbols = Array.from(new Set(symbols.map(s => s.trim().toUpperCase()).filter(Boolean)));
  const resultsMap = new Map<string, AssetQuote>();

  if (uniqueSymbols.length === 0) return resultsMap;

  // Split into fast parallel fetches
  const promises = uniqueSymbols.map(async (sym) => {
    const quote = await fetchQuoteForSymbol(sym);
    if (quote) {
      resultsMap.set(sym, quote);
    }
  });

  await Promise.allSettled(promises);
  return resultsMap;
};

export const fetchMarketData = async (): Promise<MarketTickerItem[]> => {
  // Check local cache first
  try {
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedTime && cachedData && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore cache parse errors
  }

  const promises = MARKET_SYMBOLS.map(async (item): Promise<MarketTickerItem | null> => {
    try {
      const quote = await fetchQuoteForSymbol(item.symbol);
      if (!quote) return null;

      return {
        symbol: item.symbol,
        label: item.label,
        price: quote.price,
        change: quote.change,
        changePercent: quote.percentChange,
        isPositive: quote.isPositive,
        unit: item.unit,
        formattedPrice: quote.formattedPrice,
        formattedChange: quote.formattedChange
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
    return items;
  }

  // If live fetch was completely empty, return any existing cached items or fallback data
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }

  return INITIAL_MARKET_DATA;
};

