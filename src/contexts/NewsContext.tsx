import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useQuery } from 'react-query';
import { fetchNewsProgressively, interleaveArticles } from '../services/newsService';
import { news_sources } from '../services/newsSources';
import { Article } from '../types';

interface NewsContextType {
  articles: Article[];
  filteredArticles: Article[];
  isLoading: boolean;
  isError: boolean;
  refreshNews: () => Promise<void>;
  searchArticles: (keyword: string) => void;
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
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
    return saved ? JSON.parse(saved) : [
      'daily-news',
      'upsc-policy',
      'tech-design',
      'mens-style',
      'running-fitness',
      'photography-video',
      'sports-auto'
    ];
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string>('daily-news');

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

  // Deriving filteredArticles reactively
  useEffect(() => {
    let result = articles;
    console.log(`[NewsContext] useEffect - articles size: ${articles.length}, selectedTopicId: ${selectedTopicId}, keyword: "${currentKeyword}"`);

    // Filter by topic first
    if (selectedTopicId !== 'all') {
      result = result.filter(article => {
        const topicId = sourceToTopicMap[article.source];
        return topicId === selectedTopicId;
      });
      console.log(`[NewsContext] filtered by topic - remaining: ${result.length}`);
    }

    // Filter by keyword if search is active
    if (currentKeyword.trim()) {
      const lowerKeyword = currentKeyword.toLowerCase();
      result = result.filter(
        article =>
          article.title.toLowerCase().includes(lowerKeyword) ||
          (article.content && article.content.toLowerCase().includes(lowerKeyword))
      );
      console.log(`[NewsContext] filtered by keyword - remaining: ${result.length}`);
    }

    // Apply the 70/30 regional mix and round-robin source interleaving reactively on the final list
    const interleavedResult = interleaveArticles(result);
    console.log(`[NewsContext] final interleaved size: ${interleavedResult.length}`);

    setFilteredArticles(interleavedResult);
  }, [articles, currentKeyword, selectedTopicId, sourceToTopicMap]);

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

  const saveArticle = (article: Article) => {
    setSavedArticles(prev => {
      if (prev.some(a => a.id === article.id)) {
        return prev;
      }
      return [...prev, article];
    });
  };

  const removeFromSaved = (articleId: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));
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

  return (
    <NewsContext.Provider value={{
      articles,
      filteredArticles,
      isLoading,
      isError,
      refreshNews,
      searchArticles,
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
      setSelectedTopicId
    }}>
      {children}
    </NewsContext.Provider>
  );
};