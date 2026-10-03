import { motion } from 'framer-motion';
import { useNews } from '../contexts/NewsContext';
import { topics } from '../services/newsSources';

import ArticleCard from '../components/ArticleCard';
import { ArticleCardSkeleton } from '../components/ArticleSkeleton';
import MarketPulseRibbon from '../components/MarketPulseRibbon';
import { AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const HomePage = () => {
  const { 
    filteredArticles, 
    isLoading, 
    isError, 
    refreshNews, 
    currentKeyword,
    followedTopics,
    selectedTopicId,
    setSelectedTopicId
  } = useNews();

  const activeTabs = topics.filter(topic => followedTopics?.includes(topic.id)) || [];
  
  return (
    <div className="flex-1 min-h-0">
      <SEOHead
        title={currentKeyword ? `${currentKeyword} News – Keyword` : 'Keyword – Driven by you, Curated for you'}
        description="Real-time multi-source AI news intelligence, financial pulse, and unbiased story clustering."
        canonicalPath="/"
        noindex={false}
      />
      <h1 className="sr-only">Keyword – Driven by you, Curated for you</h1>
      {/* Horizontal Scrolling Topics Tab Bar */}
      <div className="mb-6 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center space-x-1.5 pb-2 border-b border-gray-200/60 dark:border-zinc-800/60 min-w-max">
          {activeTabs.map((tab) => {
            const isActive = selectedTopicId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTopicId(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none outline-none ${
                  isActive 
                    ? 'text-white shadow-xs' 
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 bg-gray-100/60 dark:bg-zinc-850/40 hover:bg-gray-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-primary dark:bg-primary-dark rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTopicId === 'finance-markets' && <MarketPulseRibbon />}

      {currentKeyword && (
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
            {filteredArticles.length} results for "{currentKeyword}"
          </span>
        </div>
      )}
      
      <div className="w-full">
        {isLoading && filteredArticles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        ) : isError && filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="text-rose-500 mb-3" size={28} />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Failed to load news articles.</p>
            <button
              onClick={refreshNews}
              className="fab px-4 py-2 rounded-xl text-white text-xs font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {currentKeyword
                ? `No articles found for "${currentKeyword}"`
                : 'No articles currently available.'}
            </p>
            {currentKeyword && (
              <button
                onClick={() => refreshNews()}
                className="fab px-4 py-2 rounded-xl text-white text-xs font-medium"
              >
                Show All Articles
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredArticles.map((article, index) => (
              <div 
                key={article.id} 
                className={`h-full flex flex-col ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <ArticleCard 
                  article={article} 
                  keyword={currentKeyword}
                  isFeatured={index === 0}
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;