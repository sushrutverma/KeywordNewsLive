import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Article } from '../types';
import { news_sources } from './newsSources';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Build the edge function proxy URL
const getRssProxyUrl = (feedUrl: string) => {
  return `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(feedUrl)}`;
};

type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
  description?: string;
  'media:content'?: {
    $: {
      url: string;
    };
  };
  enclosure?: {
    url: string;
  };
  'media:thumbnail'?: {
    $: {
      url: string;
    };
  }[];
};

const parseRssXml = (xmlText: string): { items: CustomItem[] } => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML parsing error: ' + parserError.textContent);
  }

  const items: CustomItem[] = [];
  const itemElements = xmlDoc.querySelectorAll('item');

  itemElements.forEach((itemEl) => {
    const getTagText = (tagName: string): string => {
      let el = itemEl.getElementsByTagName(tagName)[0];
      if (!el && tagName.includes(':')) {
        const localName = tagName.split(':').pop();
        if (localName) {
          el = itemEl.getElementsByTagName(localName)[0];
        }
      }
      if (!el) {
        try {
          el = itemEl.querySelector(tagName.replace(':', '\\:')) as Element;
        } catch {}
      }
      return el ? el.textContent || '' : '';
    };

    const getMediaUrl = (tagName: string): string => {
      let el = itemEl.getElementsByTagName(tagName)[0];
      if (!el && tagName.includes(':')) {
        const localName = tagName.split(':').pop();
        if (localName) {
          el = itemEl.getElementsByTagName(localName)[0];
        }
      }
      if (!el) {
        try {
          el = itemEl.querySelector(tagName.replace(':', '\\:')) as Element;
        } catch {}
      }
      return el ? el.getAttribute('url') || '' : '';
    };

    const title = getTagText('title');
    const link = getTagText('link');
    const pubDate = getTagText('pubDate') || getTagText('pubdate') || getTagText('date');
    const content = getTagText('content:encoded') || getTagText('encoded') || getTagText('description') || getTagText('summary');
    const contentSnippet = getTagText('description') || getTagText('summary');

    const mediaContentUrl = getMediaUrl('media:content');
    const enclosureUrl = getMediaUrl('enclosure');
    const mediaThumbnailUrl = getMediaUrl('media:thumbnail');

    const customItem: CustomItem = {
      title,
      link,
      pubDate,
      content,
      contentSnippet,
      description: contentSnippet,
    };

    if (mediaContentUrl) {
      customItem['media:content'] = { $: { url: mediaContentUrl } };
    }
    if (enclosureUrl) {
      customItem.enclosure = { url: enclosureUrl };
    }
    if (mediaThumbnailUrl) {
      customItem['media:thumbnail'] = [{ $: { url: mediaThumbnailUrl } }];
    }

    items.push(customItem);
  });

  return { items };
};

// Reduced cache duration for fresher content
const CACHE_KEY = 'news_cache';
const CACHE_TIMESTAMP_KEY = 'news_cache_timestamp';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Optimized CORS proxies - fastest first
const sanitizeXml = (xml: string): string => {
  return xml
    .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, '&amp;')
    .replace(/&amp;amp;/g, '&amp;');
};

// Fetch RSS feed via Supabase Edge Function proxy
const fetchRssFeed = async (sourceUrl: string, sourceName: string): Promise<Article[]> => {
  console.log(`Fetching from ${sourceName}...`);
  
  try {
    const proxyUrl = getRssProxyUrl(sourceUrl);
    const response = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });

    if (!response.data) {
      throw new Error('No data received');
    }

    const sanitizedXml = sanitizeXml(String(response.data));
    const feed = parseRssXml(sanitizedXml);

    if (!feed.items || feed.items.length === 0) {
      throw new Error('No items in feed');
    }

    const articles = feed.items.map(item => {
      let imageUrl = '';
      if (item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url;
      } else if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } else if (item['media:thumbnail']?.[0]?.$?.url) {
        imageUrl = item['media:thumbnail'][0].$.url;
      }

      const content = item.content || item.contentSnippet || item.description || '';

      return {
        id: uuidv4(),
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: content,
        image: imageUrl,
        source: sourceName
      };
    });

    console.log(`✅ ${sourceName}: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.warn(`❌ Failed to fetch ${sourceName}:`, error);
    return [];
  }
};

// Interleaves articles from different sources in a round-robin style to ensure source diversity
export const interleaveBySource = (articles: Article[]): Article[] => {
  if (articles.length === 0) return articles;

  // Group by source name
  const groups: Record<string, Article[]> = {};
  articles.forEach(art => {
    if (!groups[art.source]) {
      groups[art.source] = [];
    }
    groups[art.source].push(art);
  });

  const sources = Object.keys(groups);
  const result: Article[] = [];
  let added = true;
  let indexMap: Record<string, number> = {};
  
  sources.forEach(src => {
    indexMap[src] = 0;
  });

  // Round-robin selection
  while (added) {
    added = false;
    for (const src of sources) {
      const idx = indexMap[src];
      if (idx < groups[src].length) {
        result.push(groups[src][idx]);
        indexMap[src] = idx + 1;
        added = true;
      }
    }
  }

  return result;
};

// Interleaves articles to enforce 70% Indian / 30% World mix, while preventing consecutive duplicates from same sources
export const interleaveArticles = (articles: Article[]): Article[] => {
  const sourceToIsIndianMap: Record<string, boolean> = {};
  news_sources.forEach(src => {
    sourceToIsIndianMap[src.name] = src.isIndian;
  });

  const indianArticles = articles.filter(art => sourceToIsIndianMap[art.source] === true);
  const worldArticles = articles.filter(art => sourceToIsIndianMap[art.source] === false);

  console.log(`[Interleave] Input: ${articles.length} articles. Indian: ${indianArticles.length}, World: ${worldArticles.length}`);

  if (indianArticles.length === 0 || worldArticles.length === 0) {
    console.log(`[Interleave] One of the categories is empty. Running pure source round-robin interleaving.`);
    return interleaveBySource(articles);
  }

  // Interleave each group by source first to get maximum diversity
  const indianInterleaved = interleaveBySource(indianArticles);
  const worldInterleaved = interleaveBySource(worldArticles);

  const result: Article[] = [];
  let indIdx = 0;
  let worldIdx = 0;

  while (indIdx < indianInterleaved.length || worldIdx < worldInterleaved.length) {
    let indAdded = 0;
    while (indAdded < 7 && indIdx < indianInterleaved.length) {
      result.push(indianInterleaved[indIdx]);
      indIdx++;
      indAdded++;
    }

    let worldAdded = 0;
    while (worldAdded < 3 && worldIdx < worldInterleaved.length) {
      result.push(worldInterleaved[worldIdx]);
      worldIdx++;
      worldAdded++;
    }
  }

  console.log(`[Interleave] Interleaving complete. Output: ${result.length} articles.`);
  return result;
};

// Optimized main fetch function
export const fetchNewsFromAllSources = async (): Promise<Article[]> => {
  console.log('🚀 Starting news fetch...');
  
  // Check cache first
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const now = new Date().getTime();
  
  if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const articles = JSON.parse(cachedData);
        console.log(`📦 Using cached data: ${articles.length} articles`);
        return articles;
      } catch (error) {
        console.warn('Cache parse error, fetching fresh data');
      }
    }
  }
  
  try {
    // Fetch all sources in parallel with individual timeouts
    const sourcePromises = news_sources.map(source => 
      Promise.race([
        fetchRssFeed(source.url, source.name),
        // Individual source timeout of 6 seconds
        new Promise<Article[]>((_, reject) => 
          setTimeout(() => reject(new Error(`${source.name} timeout`)), 6000)
        )
      ]).catch(error => {
        console.error(`Error fetching ${source.name}:`, error.message);
        return []; // Return empty array on error
      })
    );
    
    // Wait for all requests to complete (or timeout)
    const results = await Promise.allSettled(sourcePromises);
    
    const allArticles: Article[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      } else {
        console.warn(`Source ${news_sources[index].name} failed:`, result.reason);
      }
    });
    
    // Sort by date
    allArticles.sort((a, b) => {
      try {
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      } catch {
        return 0;
      }
    });

    const interleaved = interleaveArticles(allArticles);
    
    console.log(`🎉 Fetch complete: ${interleaved.length} total articles (interleaved)`);
    
    // Cache results
    if (interleaved.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(interleaved));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      } catch (error) {
        console.warn('Failed to cache results:', error);
      }
    }
    
    return interleaved;
    
  } catch (error) {
    console.error('❌ Fatal error during fetch:', error);
    
    // Return expired cache as fallback
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const articles = JSON.parse(cachedData);
        console.log(`📦 Using expired cache as fallback: ${articles.length} articles`);
        return articles;
      } catch {
        console.error('Failed to parse fallback cache');
      }
    }
    
    return [];
  }
};

// Progressive loading function - load priority sources first
export const fetchNewsProgressively = async (
  onProgress?: (articles: Article[], isComplete: boolean) => void
): Promise<Article[]> => {
  console.log('🚀 Starting progressive news fetch...');
  
  // Check cache first
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const now = new Date().getTime();
  
  if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const articles = JSON.parse(cachedData);
        console.log(`📦 Using cached data: ${articles.length} articles`);
        onProgress?.(articles, true);
        return articles;
      } catch (error) {
        console.warn('Cache parse error, fetching fresh data');
      }
    }
  }
  
  // Define priority sources (adjust based on your needs)
  const prioritySources = news_sources.slice(0, 3);
  const remainingSources = news_sources.slice(3);
  
  let allArticles: Article[] = [];
  
  try {
    // Fetch priority sources first
    const priorityPromises = prioritySources.map(source => 
      fetchRssFeed(source.url, source.name).catch(() => [])
    );
    
    const priorityResults = await Promise.all(priorityPromises);
    const priorityArticles = priorityResults.flat();
    
    // Sort and send initial results
    priorityArticles.sort((a, b) => {
      try {
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      } catch {
        return 0;
      }
    });
    
    const interleavedPriority = interleaveArticles(priorityArticles);
    allArticles = interleavedPriority;
    console.log(`📦 Priority sources loaded: ${interleavedPriority.length} articles`);
    onProgress?.(interleavedPriority, false);
    
    // Fetch remaining sources
    if (remainingSources.length > 0) {
      const remainingPromises = remainingSources.map(source => 
        fetchRssFeed(source.url, source.name).catch(() => [])
      );
      
      const remainingResults = await Promise.all(remainingPromises);
      const remainingArticles = remainingResults.flat();
      
      // Combine and sort all articles
      const combined = [...priorityArticles, ...remainingArticles];
      combined.sort((a, b) => {
        try {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        } catch {
          return 0;
        }
      });

      const interleavedAll = interleaveArticles(combined);
      allArticles = interleavedAll;
      
      console.log(`🎉 All sources loaded: ${interleavedAll.length} total articles (interleaved)`);
      onProgress?.(interleavedAll, true);
    }
    
    // Cache results
    if (allArticles.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(allArticles));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      } catch (error) {
        console.warn('Failed to cache results:', error);
      }
    }
    
    return allArticles;
    
  } catch (error) {
    console.error('❌ Error during progressive fetch:', error);
    const interleavedFallback = interleaveArticles(allArticles);
    onProgress?.(interleavedFallback, true);
    return interleavedFallback;
  }
};

export const testSingleSource = async (sourceName: string): Promise<Article[]> => {
  const source = news_sources.find(s => s.name === sourceName);
  if (!source) {
    throw new Error(`Source ${sourceName} not found`);
  }
  return await fetchRssFeed(source.url, source.name);
};