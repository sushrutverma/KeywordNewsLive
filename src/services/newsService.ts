import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Article } from '../types';
import { news_sources } from './newsSources';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

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
  let itemElements = xmlDoc.querySelectorAll('item');
  let isAtom = false;

  if (itemElements.length === 0) {
    itemElements = xmlDoc.querySelectorAll('entry');
    isAtom = true;
  }

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
    
    // Atom links are inside href attribute: <link href="..."/>
    let link = '';
    if (isAtom) {
      const linkEl = itemEl.querySelector('link');
      link = linkEl ? linkEl.getAttribute('href') || '' : '';
    } else {
      link = getTagText('link');
    }

    const pubDate = getTagText('pubDate') || getTagText('pubdate') || getTagText('date') || getTagText('published') || getTagText('updated');
    const content = getTagText('content:encoded') || getTagText('encoded') || getTagText('content') || getTagText('description') || getTagText('summary');
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

// Cache keys (v3 for story clustering & length priority)
const CACHE_KEY = 'news_cache_v3';
const CACHE_TIMESTAMP_KEY = 'news_cache_timestamp_v3';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Optimized CORS proxies - fastest first
const sanitizeXml = (xml: string): string => {
  let cleaned = xml.trim();
  // Remove Byte Order Mark (BOM) if present
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.substring(1);
  }
  return cleaned
    .replace(/\s+crossorigin(?=\s|>|\/)/g, ' crossorigin="anonymous"')
    .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, '&amp;')
    .replace(/&amp;amp;/g, '&amp;');
};

// Fetch RSS feed via Supabase Edge Function proxy
const fetchRssFeed = async (sourceUrl: string, sourceName: string): Promise<Article[]> => {
  try {
    const proxyUrl = getRssProxyUrl(sourceUrl);
    const response = await axios.get(proxyUrl, {
      timeout: 8000,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.data) {
      throw new Error('No data received');
    }

    // Check if proxy returned a JSON error response
    if (typeof response.data === 'object' && response.data !== null) {
      if ('error' in response.data) {
        throw new Error((response.data as { error?: string }).error || 'Proxy error');
      }
      throw new Error('Received JSON response instead of XML feed');
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

    return articles;
  } catch (error) {
    console.warn(`❌ Failed to fetch ${sourceName}:`, error);
    return [];
  }
};

// Interleaves articles from different sources in a round-robin style to ensure source diversity and prioritizes rich content
export const interleaveBySource = (articles: Article[]): Article[] => {
  if (!articles || articles.length === 0) return [];

  // Group by source name
  const groups: Record<string, Article[]> = {};
  articles.forEach(art => {
    if (!groups[art.source]) {
      groups[art.source] = [];
    }
    groups[art.source].push(art);
  });

  // Map each source name to its richContent setting
  const sourceToIsRichMap: Record<string, boolean> = {};
  news_sources.forEach(src => {
    sourceToIsRichMap[src.name] = src.richContent;
  });

  const sources = Object.keys(groups);
  // Sort sources so rich content publications are checked first in the round-robin loop
  sources.sort((a, b) => {
    const isRichA = sourceToIsRichMap[a] ? 1 : 0;
    const isRichB = sourceToIsRichMap[b] ? 1 : 0;
    return isRichB - isRichA; // Rich content sources first
  });

  const result: Article[] = [];
  let added = true;
  const indexMap: Record<string, number> = {};
  
  sources.forEach(src => {
    // Sort articles from this publisher by quality score so longer, rich articles appear first
    groups[src].sort((a, b) => calculateArticleScore(b) - calculateArticleScore(a));
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
  if (!articles || articles.length === 0) return [];

  const sourceToIsIndianMap: Record<string, boolean> = {};
  news_sources.forEach(src => {
    sourceToIsIndianMap[src.name] = src.isIndian;
  });

  const indianArticles = articles.filter(art => sourceToIsIndianMap[art.source] !== false);
  const worldArticles = articles.filter(art => sourceToIsIndianMap[art.source] === false);

  if (indianArticles.length === 0 || worldArticles.length === 0) {
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

  return result;
};

// Common English news stop words to ignore during title tokenization
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under', 'above', 
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 
  'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 
  'must', 'that', 'this', 'these', 'those', 'it', 'its', 'as', 'if', 'says', 'said', 
  'say', 'news', 'update', 'updates', 'live', 'watch', 'video', 'photos', 'how', 
  'why', 'what', 'when', 'where', 'who', 'which', 'new', 'latest', 'today', 'amid', 
  'per', 'cent', 'than', 'more', 'first', 'all', 'out', 'off', 'down', 'no', 'not'
]);

const stemWord = (word: string): string => {
  if (word.length <= 3) return word;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
};

export const extractTokens = (text: string): Set<string> => {
  if (!text) return new Set();
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ');
  const tokens = new Set<string>();

  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      tokens.add(stemWord(word));
    } else if (/\d+/.test(word)) {
      tokens.add(word);
    }
  }

  return tokens;
};

export const areArticlesSimilar = (a: Article, b: Article): boolean => {
  if (a.id === b.id) return true;

  // 48-hour sliding window check
  const timeA = new Date(a.pubDate).getTime();
  const timeB = new Date(b.pubDate).getTime();
  if (!isNaN(timeA) && !isNaN(timeB)) {
    const diffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);
    if (diffHours > 48) return false;
  }

  const tokensA = extractTokens(a.title);
  const tokensB = extractTokens(b.title);

  if (tokensA.size < 2 || tokensB.size < 2) return false;

  let sharedCount = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) sharedCount++;
  });

  if (sharedCount < 2) return false;

  const minTokens = Math.min(tokensA.size, tokensB.size);
  const unionSize = tokensA.size + tokensB.size - sharedCount;

  const jaccard = sharedCount / unionSize;
  const overlap = sharedCount / minTokens;

  // Clustered if:
  // 1. High Jaccard similarity (>= 0.35)
  // 2. High overlap ratio (>= 0.50) with at least 3 shared keywords
  // 3. Significant absolute shared keywords (>= 4 shared tokens within the 48h window)
  if (jaccard >= 0.35) return true;
  if (overlap >= 0.50 && sharedCount >= 3) return true;
  if (sharedCount >= 4 && overlap >= 0.35) return true;
  if (sharedCount >= 5) return true;

  return false;
};

export const getCleanContentLength = (content?: string): number => {
  if (!content) return 0;
  return content.replace(/<[^>]*>/g, '').trim().length;
};

/**
 * Calculates a composite priority score for an article.
 * Higher content length gives greater priority, heavily penalizing blank or near-empty articles.
 * Combines: Content Length + Recency Decay + Multi-source Consensus + Verified Visuals.
 */
export const calculateArticleScore = (article: Article): number => {
  const contentLength = getCleanContentLength(article.content);

  // 1. Content Length Multiplier (Explicitly prioritized per user requirement)
  // Blank / empty articles (< 100 chars) are severely penalized
  let lengthMultiplier: number;
  if (contentLength === 0) {
    lengthMultiplier = 0.05; // 95% penalty for blank articles
  } else if (contentLength < 120) {
    lengthMultiplier = 0.20; // 80% penalty for wire stubs / single lines
  } else if (contentLength < 350) {
    lengthMultiplier = 0.65; // Short summaries
  } else if (contentLength < 800) {
    lengthMultiplier = 1.00; // Standard news item
  } else if (contentLength < 1800) {
    lengthMultiplier = 1.35; // Rich editorial article
  } else {
    lengthMultiplier = 1.60; // Comprehensive / deep-dive reporting
  }

  // 2. Recency / Time Decay Factor (within 48 hours)
  const now = Date.now();
  const pubTime = new Date(article.pubDate).getTime();
  const ageHours = isNaN(pubTime) ? 24 : Math.max(0, (now - pubTime) / (1000 * 60 * 60));
  // Smooth gravity decay
  const recencyScore = 100 / Math.pow(ageHours + 2, 1.15);

  // 3. Multi-source Consensus Factor (Story importance)
  const consensusMultiplier = article.relatedArticles && article.relatedArticles.length > 0
    ? 1 + Math.min(0.8, article.relatedArticles.length * 0.25)
    : 1.0;

  // 4. Visual Imagery Factor (Only rewards articles that actually have real reading material)
  let visualMultiplier = 1.0;
  if (article.image) {
    // If it has real content (>= 150 chars), an image boosts its visual appeal.
    // If it is a blank article, do NOT allow an image to elevate it!
    visualMultiplier = contentLength >= 150 ? 1.25 : 0.80;
  } else {
    visualMultiplier = 0.90;
  }

  return recencyScore * lengthMultiplier * consensusMultiplier * visualMultiplier;
};

// Calculate story quality score specifically for selecting the best primary card in a cluster
const getStoryQualityScore = (art: Article): number => {
  const len = getCleanContentLength(art.content);
  const hasImage = Boolean(art.image);
  
  if (len < 100) {
    // Blank or near-blank stubs get very low score even if they have an image
    return hasImage ? 150 : 20;
  }
  
  // Base score is length, with a healthy bonus for visual imagery if substantial content exists
  return len + (hasImage ? 400 : 0);
};

// Clusters articles reporting on the same event across publishers
export const clusterArticles = (articles: Article[]): Article[] => {
  if (!articles || articles.length === 0) return [];

  interface Cluster {
    primary: Article;
    related: Article[];
  }

  const clusters: Cluster[] = [];

  for (const article of articles) {
    let matchedCluster: Cluster | null = null;

    for (const cluster of clusters) {
      if (areArticlesSimilar(cluster.primary, article)) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      const primaryScore = getStoryQualityScore(matchedCluster.primary);
      const incomingScore = getStoryQualityScore(article);

      if (incomingScore > primaryScore) {
        const oldPrimary = matchedCluster.primary;
        // Promote incoming article, but keep lead image if incoming lacked one
        matchedCluster.primary = {
          ...article,
          image: article.image || oldPrimary.image
        };
        matchedCluster.related.push(oldPrimary);
      } else {
        // If current primary has no image, but incoming has one, borrow the image!
        if (!matchedCluster.primary.image && article.image) {
          matchedCluster.primary.image = article.image;
        }
        matchedCluster.related.push(article);
      }
    } else {
      clusters.push({
        primary: { ...article },
        related: []
      });
    }
  }

  return clusters.map(c => {
    if (c.related.length > 0) {
      return {
        ...c.primary,
        relatedArticles: c.related
      };
    }
    return c.primary;
  });
};

// Progressive loading function - load sources in fast concurrent batches across all categories
export const fetchNewsProgressively = async (
  onProgress?: (articles: Article[], isComplete: boolean) => void
): Promise<Article[]> => {
  console.log('🚀 Starting progressive news fetch...');
  
  // Check cache first (only if non-empty)
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const now = new Date().getTime();
  
  if (cachedTimestamp && (now - parseInt(cachedTimestamp, 10)) < CACHE_DURATION) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const cachedArticles: Article[] = JSON.parse(cachedData);
        if (Array.isArray(cachedArticles) && cachedArticles.length > 0) {
          console.log(`📦 Using cached data: ${cachedArticles.length} articles`);
          onProgress?.(cachedArticles, true);
          return cachedArticles;
        }
      } catch {
        console.warn('Cache parse error, fetching fresh data');
      }
    }
  }

  const allArticlesMap = new Map<string, Article>();

  // Fetch in concurrent batches of 6 sources so the UI receives articles across topics immediately
  const batchSize = 6;
  const totalBatches = Math.ceil(news_sources.length / batchSize);

  try {
    for (let b = 0; b < totalBatches; b++) {
      const batchSources = news_sources.slice(b * batchSize, (b + 1) * batchSize);
      const batchPromises = batchSources.map(source => 
        fetchRssFeed(source.url, source.name).catch(() => [])
      );

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach(res => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          res.value.forEach(art => {
            if (art && art.id && !allArticlesMap.has(art.id)) {
              allArticlesMap.set(art.id, art);
            }
          });
        }
      });

      const currentArticles = Array.from(allArticlesMap.values());
      currentArticles.sort((a, b) => calculateArticleScore(b) - calculateArticleScore(a));

      const isLastBatch = b === totalBatches - 1;
      if (currentArticles.length > 0) {
        onProgress?.(currentArticles, isLastBatch);
      }
    }

    const finalArticles = Array.from(allArticlesMap.values());
    finalArticles.sort((a, b) => calculateArticleScore(b) - calculateArticleScore(a));

    if (finalArticles.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(finalArticles));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      } catch (error) {
        console.warn('Failed to cache results:', error);
      }
    }

    onProgress?.(finalArticles, true);
    return finalArticles;
  } catch (error) {
    console.error('❌ Error during progressive fetch:', error);
    const fallbackArticles = Array.from(allArticlesMap.values());
    onProgress?.(fallbackArticles, true);
    return fallbackArticles;
  }
};

export const testSingleSource = async (sourceName: string): Promise<Article[]> => {
  const source = news_sources.find(s => s.name === sourceName);
  if (!source) {
    throw new Error(`Source ${sourceName} not found`);
  }
  return await fetchRssFeed(source.url, source.name);
};