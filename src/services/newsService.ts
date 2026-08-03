import axios from 'axios';
import Parser from 'rss-parser';
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

const parser = new Parser<any, CustomItem>({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      'enclosure',
      'content',
      'description',
      'contentSnippet',
    ],
  },
});

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
    const feed = await parser.parseString(sanitizedXml);

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
    
    console.log(`🎉 Fetch complete: ${allArticles.length} total articles`);
    
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
    
    allArticles = priorityArticles;
    console.log(`📦 Priority sources loaded: ${priorityArticles.length} articles`);
    onProgress?.(priorityArticles, false);
    
    // Fetch remaining sources
    if (remainingSources.length > 0) {
      const remainingPromises = remainingSources.map(source => 
        fetchRssFeed(source.url, source.name).catch(() => [])
      );
      
      const remainingResults = await Promise.all(remainingPromises);
      const remainingArticles = remainingResults.flat();
      
      // Combine and sort all articles
      allArticles = [...priorityArticles, ...remainingArticles];
      allArticles.sort((a, b) => {
        try {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        } catch {
          return 0;
        }
      });
      
      console.log(`🎉 All sources loaded: ${allArticles.length} total articles`);
      onProgress?.(allArticles, true);
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
    onProgress?.(allArticles, true);
    return allArticles;
  }
};

export const testSingleSource = async (sourceName: string): Promise<Article[]> => {
  const source = news_sources.find(s => s.name === sourceName);
  if (!source) {
    throw new Error(`Source ${sourceName} not found`);
  }
  return await fetchRssFeed(source.url, source.name);
};