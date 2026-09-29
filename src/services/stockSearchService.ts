import axios from 'axios';
import { TrackedAsset } from './marketAssets';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

interface YahooQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  exchDisp?: string;
  quoteType?: string;
  typeDisp?: string;
  score?: number;
}

interface YahooSearchResponse {
  count: number;
  quotes: YahooQuote[];
}

// In-memory cache for query results
const queryCache = new Map<string, { timestamp: number; results: TrackedAsset[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const searchOnlineStocks = async (query: string): Promise<TrackedAsset[]> => {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  const cacheKey = cleanQuery.toLowerCase();
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  try {
    const targetUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&quotesCount=10&newsCount=0`;
    const proxyUrl = `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(targetUrl)}`;

    const response = await axios.get<YahooSearchResponse>(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      timeout: 6000
    });

    const quotes = response.data?.quotes || [];
    const validQuotes = quotes.filter((q) => q.symbol && (q.shortname || q.longname));

    const results: TrackedAsset[] = validQuotes.map((q) => {
      const isIndian = q.exchDisp === 'NSE' || q.exchDisp === 'BSE' || q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO');
      const cleanSymbol = q.symbol;
      const baseTicker = cleanSymbol.split('.')[0];
      const displayName = q.longname || q.shortname || cleanSymbol;

      // Extract unique searchable keywords
      const keywordsSet = new Set<string>();
      if (q.shortname) keywordsSet.add(q.shortname.toLowerCase());
      if (q.longname) keywordsSet.add(q.longname.toLowerCase());
      keywordsSet.add(baseTicker.toLowerCase());
      keywordsSet.add(cleanSymbol.toLowerCase());

      // If Indian equity, add common variations
      if (isIndian) {
        keywordsSet.add(baseTicker.replace(/[^a-z0-9]/gi, '').toLowerCase());
      }

      const category: TrackedAsset['category'] = 
        q.quoteType === 'INDEX' ? 'index' :
        q.quoteType === 'COMMODITY' ? 'commodity' :
        q.quoteType === 'CURRENCY' ? 'forex' : 'stock';

      return {
        id: `online-${cleanSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        symbol: cleanSymbol,
        name: displayName,
        category,
        price: q.exchDisp ? `${q.exchDisp}` : 'Live',
        change: q.typeDisp || 'Asset',
        percentChange: 0,
        region: isIndian ? 'IN' : 'GLOBAL',
        keywords: Array.from(keywordsSet)
      };
    });

    queryCache.set(cacheKey, { timestamp: Date.now(), results });
    return results;
  } catch (err) {
    console.warn('Online stock search failed, falling back gracefully:', err);
    return [];
  }
};
