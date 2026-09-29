export interface TrackedAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'stock' | 'index' | 'commodity' | 'forex';
  price: string;
  change: string;
  percentChange: number;
  region: 'IN' | 'US' | 'GLOBAL';
  keywords: string[];
}

export const ASSET_CATALOG: TrackedAsset[] = [
  // 1. Major Benchmark Indices
  {
    id: 'nifty-50',
    symbol: '^NSEI',
    name: 'NIFTY 50',
    category: 'index',
    price: '25,385.40',
    change: '+118.25',
    percentChange: 0.47,
    region: 'IN',
    keywords: ['nifty', 'nifty 50', 'nse', 'dalal street']
  },
  {
    id: 'sensex',
    symbol: '^BSESN',
    name: 'SENSEX',
    category: 'index',
    price: '83,120.15',
    change: '+392.40',
    percentChange: 0.48,
    region: 'IN',
    keywords: ['sensex', 'bse', 'bombay stock exchange']
  },
  {
    id: 'bank-nifty',
    symbol: '^NSEBANK',
    name: 'BANK NIFTY',
    category: 'index',
    price: '52,940.80',
    change: '+410.60',
    percentChange: 0.78,
    region: 'IN',
    keywords: ['bank nifty', 'nifty bank', 'banking stocks']
  },
  {
    id: 'nifty-it',
    symbol: '^CNXIT',
    name: 'NIFTY IT',
    category: 'index',
    price: '42,150.30',
    change: '+480.10',
    percentChange: 1.15,
    region: 'IN',
    keywords: ['nifty it', 'tech rally', 'it sector']
  },
  {
    id: 'sp-500',
    symbol: '^GSPC',
    name: 'S&P 500',
    category: 'index',
    price: '5,752.10',
    change: '+24.15',
    percentChange: 0.42,
    region: 'US',
    keywords: ['s&p 500', 'sp500', 'wall street']
  },
  {
    id: 'nasdaq',
    symbol: '^IXIC',
    name: 'NASDAQ',
    category: 'index',
    price: '18,210.40',
    change: '+142.30',
    percentChange: 0.79,
    region: 'US',
    keywords: ['nasdaq', 'tech stocks', 'silicon valley']
  },

  // 2. Commodities
  {
    id: 'gold',
    symbol: 'GC=F',
    name: 'Gold (10g)',
    category: 'commodity',
    price: '₹76,140',
    change: '+210',
    percentChange: 0.28,
    region: 'GLOBAL',
    keywords: ['gold', 'bullion', 'yellow metal', 'sovereign gold']
  },
  {
    id: 'silver',
    symbol: 'SI=F',
    name: 'Silver (1kg)',
    category: 'commodity',
    price: '₹92,400',
    change: '+590',
    percentChange: 0.65,
    region: 'GLOBAL',
    keywords: ['silver', 'white metal']
  },
  {
    id: 'crude-oil',
    symbol: 'CL=F',
    name: 'Brent Crude',
    category: 'commodity',
    price: '$74.45',
    change: '-0.65',
    percentChange: -0.87,
    region: 'GLOBAL',
    keywords: ['crude oil', 'brent', 'petroleum', 'opec', 'oil prices']
  },
  {
    id: 'natural-gas',
    symbol: 'NG=F',
    name: 'Natural Gas',
    category: 'commodity',
    price: '$2.85',
    change: '+0.04',
    percentChange: 1.42,
    region: 'GLOBAL',
    keywords: ['natural gas', 'lng', 'gas prices']
  },

  // 3. Indian Stocks (Bluechips & Leaders)
  {
    id: 'reliance',
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries',
    category: 'stock',
    price: '₹2,980.50',
    change: '+52.30',
    percentChange: 1.78,
    region: 'IN',
    keywords: ['reliance', 'ril', 'mukesh ambani', 'jio', 'reliance retail']
  },
  {
    id: 'tcs',
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    category: 'stock',
    price: '₹4,290.10',
    change: '+25.40',
    percentChange: 0.60,
    region: 'IN',
    keywords: ['tcs', 'tata consultancy', 'tata consultancy services']
  },
  {
    id: 'hdfc-bank',
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank',
    category: 'stock',
    price: '₹1,675.40',
    change: '+14.20',
    percentChange: 0.85,
    region: 'IN',
    keywords: ['hdfc', 'hdfc bank', 'housing development finance']
  },
  {
    id: 'infosys',
    symbol: 'INFY.NS',
    name: 'Infosys',
    category: 'stock',
    price: '₹1,890.20',
    change: '-7.80',
    percentChange: -0.41,
    region: 'IN',
    keywords: ['infosys', 'infy', 'salil parekh']
  },
  {
    id: 'tata-motors',
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors',
    category: 'stock',
    price: '₹985.30',
    change: '+11.80',
    percentChange: 1.21,
    region: 'IN',
    keywords: ['tata motors', 'tatamotors', 'jlr', 'jaguar land rover']
  },
  {
    id: 'icici-bank',
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank',
    category: 'stock',
    price: '₹1,230.15',
    change: '+11.10',
    percentChange: 0.91,
    region: 'IN',
    keywords: ['icici', 'icici bank', 'sandeep bakhshi']
  },
  {
    id: 'sbi',
    symbol: 'SBIN.NS',
    name: 'State Bank of India',
    category: 'stock',
    price: '₹810.50',
    change: '+2.40',
    percentChange: 0.30,
    region: 'IN',
    keywords: ['sbi', 'state bank of india', 'state bank']
  },
  {
    id: 'itc',
    symbol: 'ITC.NS',
    name: 'ITC Ltd',
    category: 'stock',
    price: '₹510.20',
    change: '+1.10',
    percentChange: 0.22,
    region: 'IN',
    keywords: ['itc', 'itc hotel', 'fmcg giant']
  },
  {
    id: 'bharti-airtel',
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel',
    category: 'stock',
    price: '₹1,580.40',
    change: '+23.50',
    percentChange: 1.51,
    region: 'IN',
    keywords: ['airtel', 'bharti airtel', 'sunil mittal']
  },
  {
    id: 'adani-ent',
    symbol: 'ADANIENT.NS',
    name: 'Adani Enterprises',
    category: 'stock',
    price: '₹3,120.00',
    change: '+64.20',
    percentChange: 2.10,
    region: 'IN',
    keywords: ['adani', 'adani group', 'gautam adani', 'adani enterprises']
  },
  {
    id: 'larson-toubro',
    symbol: 'LT.NS',
    name: 'Larsen & Toubro',
    category: 'stock',
    price: '₹3,650.00',
    change: '+25.00',
    percentChange: 0.69,
    region: 'IN',
    keywords: ['larsen', 'l&t', 'larsen & toubro', 'larsen and toubro']
  },
  {
    id: 'maruti',
    symbol: 'MARUTI.NS',
    name: 'Maruti Suzuki',
    category: 'stock',
    price: '₹12,450.00',
    change: '-38.00',
    percentChange: -0.30,
    region: 'IN',
    keywords: ['maruti', 'maruti suzuki', 'suzuki']
  },
  {
    id: 'zomato',
    symbol: 'ZOMATO.NS',
    name: 'Zomato',
    category: 'stock',
    price: '₹285.50',
    change: '+9.40',
    percentChange: 3.41,
    region: 'IN',
    keywords: ['zomato', 'blinkit', 'deepinder goyal']
  },
  {
    id: 'titan',
    symbol: 'TITAN.NS',
    name: 'Titan Company',
    category: 'stock',
    price: '₹3,540.00',
    change: '-45.00',
    percentChange: -1.25,
    region: 'IN',
    keywords: ['titan', 'tanishq', 'fastrack']
  },
  {
    id: 'tata-steel',
    symbol: 'TATASTEEL.NS',
    name: 'Tata Steel',
    category: 'stock',
    price: '₹162.40',
    change: '+3.10',
    percentChange: 1.95,
    region: 'IN',
    keywords: ['tata steel', 'tatasteel', 'steel industry']
  },
  {
    id: 'bajaj-finance',
    symbol: 'BAJFINANCE.NS',
    name: 'Bajaj Finance',
    category: 'stock',
    price: '₹7,420.00',
    change: '+85.00',
    percentChange: 1.16,
    region: 'IN',
    keywords: ['bajaj finance', 'bajaj finserv']
  },
  {
    id: 'hcl-tech',
    symbol: 'HCLTECH.NS',
    name: 'HCL Technologies',
    category: 'stock',
    price: '₹1,780.50',
    change: '+14.20',
    percentChange: 0.80,
    region: 'IN',
    keywords: ['hcl tech', 'hcl technologies', 'hcl']
  },
  {
    id: 'kotak-bank',
    symbol: 'KOTAKBANK.NS',
    name: 'Kotak Mahindra Bank',
    category: 'stock',
    price: '₹1,840.10',
    change: '+9.50',
    percentChange: 0.52,
    region: 'IN',
    keywords: ['kotak', 'kotak bank', 'uday kotak']
  },
  {
    id: 'axis-bank',
    symbol: 'AXISBANK.NS',
    name: 'Axis Bank',
    category: 'stock',
    price: '₹1,240.00',
    change: '+12.50',
    percentChange: 1.02,
    region: 'IN',
    keywords: ['axis bank', 'axis']
  },
  {
    id: 'sun-pharma',
    symbol: 'SUNPHARMA.NS',
    name: 'Sun Pharma',
    category: 'stock',
    price: '₹1,910.00',
    change: '+18.00',
    percentChange: 0.95,
    region: 'IN',
    keywords: ['sun pharma', 'dilip shanghvi']
  },
  {
    id: 'mahindra',
    symbol: 'M&M.NS',
    name: 'Mahindra & Mahindra',
    category: 'stock',
    price: '₹3,140.00',
    change: '+45.00',
    percentChange: 1.45,
    region: 'IN',
    keywords: ['mahindra', 'm&m', 'anand mahindra']
  },
  {
    id: 'ntpc',
    symbol: 'NTPC.NS',
    name: 'NTPC Ltd',
    category: 'stock',
    price: '₹435.20',
    change: '+6.10',
    percentChange: 1.42,
    region: 'IN',
    keywords: ['ntpc', 'power sector']
  },
  {
    id: 'ongc',
    symbol: 'ONGC.NS',
    name: 'ONGC',
    category: 'stock',
    price: '₹295.40',
    change: '+2.80',
    percentChange: 0.96,
    region: 'IN',
    keywords: ['ongc', 'oil and natural gas']
  },
  {
    id: 'coal-india',
    symbol: 'COALINDIA.NS',
    name: 'Coal India',
    category: 'stock',
    price: '₹510.60',
    change: '+5.40',
    percentChange: 1.07,
    region: 'IN',
    keywords: ['coal india']
  },
  {
    id: 'trent',
    symbol: 'TRENT.NS',
    name: 'Trent (Westside / Zudio)',
    category: 'stock',
    price: '₹7,650.00',
    change: '+190.00',
    percentChange: 2.55,
    region: 'IN',
    keywords: ['trent', 'zudio', 'westside']
  },
  {
    id: 'bel',
    symbol: 'BEL.NS',
    name: 'Bharat Electronics (BEL)',
    category: 'stock',
    price: '₹305.50',
    change: '+6.80',
    percentChange: 2.28,
    region: 'IN',
    keywords: ['bel', 'bharat electronics', 'defense stocks']
  },
  {
    id: 'hal',
    symbol: 'HAL.NS',
    name: 'Hindustan Aeronautics (HAL)',
    category: 'stock',
    price: '₹4,520.00',
    change: '+95.00',
    percentChange: 2.15,
    region: 'IN',
    keywords: ['hal', 'hindustan aeronautics', 'defense']
  },
  {
    id: 'suzlon',
    symbol: 'SUZLON.NS',
    name: 'Suzlon Energy',
    category: 'stock',
    price: '₹82.40',
    change: '+3.20',
    percentChange: 4.04,
    region: 'IN',
    keywords: ['suzlon', 'green energy', 'renewable energy']
  },
  {
    id: 'jio-fin',
    symbol: 'JIOFIN.NS',
    name: 'Jio Financial Services',
    category: 'stock',
    price: '₹352.10',
    change: '+5.80',
    percentChange: 1.67,
    region: 'IN',
    keywords: ['jio financial', 'jiofin', 'jfs']
  },
  {
    id: 'apple',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stock',
    price: '$228.40',
    change: '+2.10',
    percentChange: 0.93,
    region: 'US',
    keywords: ['apple', 'iphone', 'tim cook']
  },
  {
    id: 'nvidia',
    symbol: 'NVDA',
    name: 'NVIDIA',
    category: 'stock',
    price: '$124.50',
    change: '+3.80',
    percentChange: 3.15,
    region: 'US',
    keywords: ['nvidia', 'nvda', 'jensen huang', 'ai chips']
  },
  {
    id: 'tesla',
    symbol: 'TSLA',
    name: 'Tesla',
    category: 'stock',
    price: '$255.80',
    change: '+8.40',
    percentChange: 3.39,
    region: 'US',
    keywords: ['tesla', 'elon musk', 'evs']
  },

  // 4. Forex, Macro & Crypto
  {
    id: 'usdinr',
    symbol: 'USDINR=X',
    name: 'USD / INR',
    category: 'forex',
    price: '₹83.56',
    change: '-0.06',
    percentChange: -0.07,
    region: 'IN',
    keywords: ['usd/inr', 'rupee', 'dollar', 'forex reserves']
  },
  {
    id: 'rbi-policy',
    symbol: 'RBI',
    name: 'RBI Repo Rate',
    category: 'forex',
    price: '6.50%',
    change: '0.00',
    percentChange: 0.0,
    region: 'IN',
    keywords: ['rbi', 'reserve bank', 'repo rate', 'mpc', 'shaktikanta das', 'monetary policy']
  },
  {
    id: 'ipo-radar',
    symbol: 'IPO',
    name: 'IPOs & Listings',
    category: 'stock',
    price: 'Active',
    change: '+4.5%',
    percentChange: 4.5,
    region: 'IN',
    keywords: ['ipo', 'initial public offering', 'gmp', 'subscription status', 'listing day']
  },
  {
    id: 'bitcoin',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    category: 'forex',
    price: '$64,250',
    change: '+1,320',
    percentChange: 2.10,
    region: 'GLOBAL',
    keywords: ['bitcoin', 'btc', 'cryptocurrency', 'crypto']
  }
];

export const DEFAULT_WATCHLIST_IDS = [
  'nifty-50',
  'sensex',
  'bank-nifty',
  'gold',
  'crude-oil',
  'reliance',
  'tcs',
  'hdfc-bank'
];

/**
 * Checks if an article title or description matches any tracked asset
 */
export const findMatchedAsset = (
  title: string,
  content: string = '',
  trackedAssets: TrackedAsset[]
): TrackedAsset | null => {
  const combined = (title + ' ' + content).toLowerCase();
  for (const asset of trackedAssets) {
    for (const kw of asset.keywords) {
      // Escape special characters and check boundary
      const cleanKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${cleanKw}\\b`, 'i');
      if (regex.test(combined)) {
        return asset;
      }
    }
  }
  return null;
};
