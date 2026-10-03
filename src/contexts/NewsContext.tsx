import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { useQuery } from 'react-query';
import { fetchNewsProgressively, interleaveArticles, clusterArticles } from '../services/newsService';
import { news_sources } from '../services/newsSources';
import { Article } from '../types';
import { TrackedAsset, ASSET_CATALOG, DEFAULT_WATCHLIST_IDS, findMatchedAsset } from '../services/marketAssets';
import { fetchQuotesForSymbols } from '../services/marketService';
import { supabase } from '../lib/supabase';

interface NewsContextType {
  articles: Article[];
  filteredArticles: Article[];
  isLoading: boolean;
  isError: boolean;
  refreshNews: () => Promise<void>;
  searchArticles: (keyword: string) => void;
  searchNews: (keyword: string) => void;
  savedArticles: Article[];
  saveArticle: (article: Article) => void;
  removeFromSaved: (articleId: string) => void;
  currentKeyword: string;
  isProgressiveLoading: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  followedTopics: string[];
  toggleFollowTopic: (topicId: string) => void;
  selectedTopicId: string;
  setSelectedTopicId: (topicId: string) => void;
  trackedAssets: TrackedAsset[];
  toggleTrackAsset: (assetOrId: string | TrackedAsset) => void;
  addCustomTrackedAsset: (name: string, keyword: string, category?: TrackedAsset['category']) => void;
  removeTrackedAsset: (assetId: string) => void;
  resetWatchlist: () => void;
  refreshTrackedQuotes: () => Promise<void>;
  isRefreshingQuotes: boolean;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider = ({ children }: NewsProviderProps) => {
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem('news_cache_v3');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_err) {
      // Fallback to empty articles on cache read failure
    }
    return [];
  });
  const [isProgressiveLoading, setIsProgressiveLoading] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('savedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Topics and filtering state
  const [followedTopics, setFollowedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('followedTopics');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (!parsed.includes('finance-markets')) {
            return [...parsed, 'finance-markets'];
          }
          return parsed;
        }
      } catch (err) {
        console.warn('Failed to parse saved followedTopics:', err);
      }
    }
    return [
      'daily-news',
      'upsc-policy',
      'tech-design',
      'mens-style',
      'running-fitness',
      'photography-video',
      'sports-auto',
      'finance-markets'
    ];
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string>('daily-news');

  // Watchlist & Tracked Assets state
  const WATCHLIST_STORAGE_KEY = 'userWatchlist_v3';
  const [trackedAssets, setTrackedAssets] = useState<TrackedAsset[]>(() => {
    // Purge legacy stale watchlist cache if present
    if (localStorage.getItem('userWatchlist')) {
      localStorage.removeItem('userWatchlist');
    }

    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Failed to parse userWatchlist:', err);
      }
    }
    return ASSET_CATALOG.filter(asset => DEFAULT_WATCHLIST_IDS.includes(asset.id));
  });

  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);
  const trackedAssetsRef = useRef(trackedAssets);
  useEffect(() => {
    trackedAssetsRef.current = trackedAssets;
  }, [trackedAssets]);

  // Synchronize live quotes for tracked assets
  const refreshTrackedQuotes = useCallback(async () => {
    const currentAssets = trackedAssetsRef.current;
    if (!currentAssets || currentAssets.length === 0) return;
    const symbols = currentAssets.map(a => a.symbol).filter(Boolean);
    if (symbols.length === 0) return;

    setIsRefreshingQuotes(true);
    try {
      const quotesMap = await fetchQuotesForSymbols(symbols);
      if (quotesMap.size > 0) {
        setTrackedAssets(prev => {
          let hasDiff = false;
          const updated = prev.map(asset => {
            const live = quotesMap.get(asset.symbol.toUpperCase());
            if (live && (asset.price !== live.formattedPrice || asset.percentChange !== live.percentChange)) {
              hasDiff = true;
              return {
                ...asset,
                price: live.formattedPrice,
                change: live.formattedChange,
                percentChange: live.percentChange
              };
            }
            return asset;
          });
          return hasDiff ? updated : prev;
        });
      }
    } catch (err) {
      console.warn('[NewsContext] Failed to refresh quotes for tracked assets:', err);
    } finally {
      setIsRefreshingQuotes(false);
    }
  }, []);

  // Fetch live prices on mount and periodically every 60s
  useEffect(() => {
    refreshTrackedQuotes();
    const interval = setInterval(refreshTrackedQuotes, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTrackedQuotes]);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(trackedAssets));
  }, [trackedAssets]);

  // Fast mapping from source name to its topic category
  const sourceToTopicMap = useMemo(() => {
    const map: Record<string, string> = {};
    news_sources.forEach(src => {
      map[src.name] = src.category;
    });
    return map;
  }, []);

  // Sync followedTopics to local storage
  useEffect(() => {
    localStorage.setItem('followedTopics', JSON.stringify(followedTopics));
  }, [followedTopics]);

  // Deriving filteredArticles efficiently via single-pass memoization (avoids double render cycles)
  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by topic first
    if (selectedTopicId !== 'all') {
      result = result.filter(article => {
        const topicId = sourceToTopicMap[article.source];
        return topicId === selectedTopicId;
      });
    }

    // Filter by keyword if search is active
    if (currentKeyword.trim()) {
      const lowerKeyword = currentKeyword.toLowerCase();
      result = result.filter(
        article =>
          article.title.toLowerCase().includes(lowerKeyword) ||
          (article.content && article.content.toLowerCase().includes(lowerKeyword))
      );
    }

    // 1. Cluster identical stories across publishers first (promoting longest content and unifying multi-source perspectives)
    const clusteredResult = clusterArticles(result);

    // 2. Apply the 70/30 regional mix and round-robin source interleaving (which ranks by content length & score)
    const interleavedResult = interleaveArticles(clusteredResult);

    // 3. Prioritize articles matching user's tracked assets / watchlist to the very top!
    // Smart ranking strictly applies ONLY when viewing the Finance & Markets section.
    if (selectedTopicId === 'finance-markets' && trackedAssets.length > 0) {
      const watchlistArticles: Article[] = [];
      const regularArticles: Article[] = [];

      interleavedResult.forEach((art) => {
        const match = findMatchedAsset(art.title, art.content, trackedAssets);
        if (match) {
          watchlistArticles.push({
            ...art,
            isWatchlistMatch: true,
            matchedAssetName: match.name
          });
        } else {
          regularArticles.push({
            ...art,
            isWatchlistMatch: false
          });
        }
      });

      return [...watchlistArticles, ...regularArticles];
    }

    // In all other sections (Daily News, UPSC, Tech, Sports, etc.), normal interleaving without finance prioritization
    return interleavedResult.map(art => ({ ...art, isWatchlistMatch: false }));
  }, [articles, currentKeyword, selectedTopicId, sourceToTopicMap, trackedAssets]);

  // Adjust active topic if the user unfollows their currently selected topic
  useEffect(() => {
    if (selectedTopicId !== 'all' && !followedTopics.includes(selectedTopicId)) {
      setSelectedTopicId('all');
    }
  }, [followedTopics, selectedTopicId]);

  // Fetch news using progressive updates
  const { refetch, isLoading, isError } = useQuery(
    'news',
    () => {
      setIsProgressiveLoading(true);
      return fetchNewsProgressively((progressArticles, isComplete) => {
        setArticles(progressArticles);
        if (isComplete) {
          setIsProgressiveLoading(false);
        }
      });
    },
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setArticles(data);
        setIsProgressiveLoading(false);
      },
      onError: () => {
        setIsProgressiveLoading(false);
      }
    }
  );

  // Synchronize saved articles with Supabase when authenticated
  useEffect(() => {
    const fetchCloudSaved = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('saved_articles')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data && data.length > 0) {
          interface SavedArticleRow {
            id: string;
            title: string;
            link?: string | null;
            pub_date?: string | null;
            content?: string | null;
            image?: string | null;
            source?: string | null;
          }
          const cloudArticles: Article[] = (data as unknown as SavedArticleRow[]).map(row => ({
            id: row.id,
            title: row.title,
            link: row.link || '',
            pubDate: row.pub_date || '',
            content: row.content || '',
            image: row.image || undefined,
            source: row.source || 'News'
          }));

          setSavedArticles(prev => {
            const map = new Map<string, Article>();
            prev.forEach(a => map.set(a.id, a));
            cloudArticles.forEach(a => map.set(a.id, a));
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Could not sync bookmarks from Supabase:', e);
      }
    };

    fetchCloudSaved();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchCloudSaved();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  const refreshNews = async () => {
    setIsProgressiveLoading(true);
    try {
      await refetch();
    } finally {
      setIsProgressiveLoading(false);
    }
  };

  const searchArticles = (keyword: string) => {
    setCurrentKeyword(keyword);
  };

  const searchNews = (keyword: string) => {
    setCurrentKeyword(keyword);
  };

  const saveArticle = (article: Article) => {
    setSavedArticles(prev => {
      if (prev.some(a => a.id === article.id)) {
        return prev;
      }
      return [...prev, article];
    });

    // Cloud sync to Supabase if logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('saved_articles').upsert({
          id: article.id,
          user_id: user.id,
          title: article.title,
          link: article.link,
          pub_date: article.pubDate,
          content: article.content,
          image: article.image || null,
          source: article.source
        }).then();
      }
    }).catch(() => {});
  };

  const removeFromSaved = (articleId: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));

    // Cloud sync removal to Supabase if logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('saved_articles').delete().match({ id: articleId, user_id: user.id }).then();
      }
    }).catch(() => {});
  };

  const toggleFollowTopic = (topicId: string) => {
    setFollowedTopics(prev => {
      if (prev.includes(topicId)) {
        if (prev.length <= 1) return prev; // Keep at least one followed topic
        return prev.filter(id => id !== topicId);
      }
      return [...prev, topicId];
    });
  };

  const toggleTrackAsset = (assetOrId: string | TrackedAsset) => {
    if (typeof assetOrId === 'object' && assetOrId !== null) {
      const asset = assetOrId;
      setTrackedAssets(prev => {
        const exists = prev.some(a => a.id === asset.id || a.symbol === asset.symbol);
        if (exists) {
          if (prev.length <= 1) return prev;
          return prev.filter(a => a.id !== asset.id && a.symbol !== asset.symbol);
        }
        return [asset, ...prev];
      });
      return;
    }

    const assetId = assetOrId;
    setTrackedAssets(prev => {
      const exists = prev.some(a => a.id === assetId);
      if (exists) {
        if (prev.length <= 1) return prev; // Keep at least one tracked asset
        return prev.filter(a => a.id !== assetId);
      }
      const foundInCatalog = ASSET_CATALOG.find(a => a.id === assetId);
      if (foundInCatalog) {
        return [foundInCatalog, ...prev];
      }
      return prev;
    });
  };

  const addCustomTrackedAsset = (name: string, keyword: string, category?: TrackedAsset['category']) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    const cleanKw = keyword.trim() || cleanName;
    const newAsset: TrackedAsset = {
      id: `custom-${Date.now()}`,
      symbol: cleanName.toUpperCase().replace(/\s+/g, '').slice(0, 10),
      name: cleanName,
      category: category || 'stock',
      price: 'Tracked',
      change: 'Live',
      percentChange: 0,
      region: 'GLOBAL',
      keywords: [cleanName.toLowerCase(), cleanKw.toLowerCase()]
    };
    setTrackedAssets(prev => [newAsset, ...prev]);
  };

  const removeTrackedAsset = (assetId: string) => {
    setTrackedAssets(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(a => a.id !== assetId);
    });
  };

  const resetWatchlist = () => {
    const defaults = ASSET_CATALOG.filter(asset => DEFAULT_WATCHLIST_IDS.includes(asset.id));
    setTrackedAssets(defaults);
    setTimeout(() => {
      refreshTrackedQuotes();
    }, 100);
  };

  return (
    <NewsContext.Provider value={{
      articles,
      filteredArticles,
      isLoading,
      isError,
      refreshNews,
      searchArticles,
      searchNews,
      savedArticles,
      saveArticle,
      removeFromSaved,
      currentKeyword,
      isProgressiveLoading,
      isSearchOpen,
      setIsSearchOpen,
      followedTopics,
      toggleFollowTopic,
      selectedTopicId,
      setSelectedTopicId,
      trackedAssets,
      toggleTrackAsset,
      addCustomTrackedAsset,
      removeTrackedAsset,
      resetWatchlist,
      refreshTrackedQuotes,
      isRefreshingQuotes
    }}>
      {children}
    </NewsContext.Provider>
  );
};