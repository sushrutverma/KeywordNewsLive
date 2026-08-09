import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactPullToRefresh from 'react-pull-to-refresh';
import { useNews } from '../contexts/NewsContext';
import { topics } from '../services/newsSources';

import ArticleCard from '../components/ArticleCard';
import { ArticleCardSkeleton } from '../components/ArticleSkeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

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
  
  useEffect(() => {
    refreshNews();
  }, []);
  
  const handleRefresh = async () => {
    await refreshNews();
    return Promise.resolve();
  };

  // Check if device is mobile for conditional pull-to-refresh
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const ContentSection = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-red-500 mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load news.</p>
          <button
            onClick={refreshNews}
            className="fab px-4 py-2 rounded-full text-white"
          >
            Try Again
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {currentKeyword
              ? `No articles found for "${currentKeyword}"`
              : 'No articles available.'}
          </p>
          {currentKeyword && (
            <button
              onClick={() => refreshNews()}
              className="fab px-4 py-2 rounded-full text-white"
            >
              Show All Articles
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredArticles.map((article, index) => (
            <div 
              key={article.id} 
              className={index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}
            >
              <ArticleCard 
                article={article} 
                keyword={currentKeyword}
                isFeatured={index === 0}
              />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );

  const activeTabs = [
    { id: 'all', name: 'All Feed' },
    ...topics.filter(topic => followedTopics.includes(topic.id))
  ];

  return (
    <div className="flex-1 pb-16 min-h-0">
      {/* Horizontal Scrolling Topics Tab Bar */}
      <div className="mb-6 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-2 pb-2 border-b border-gray-200/50 dark:border-zinc-800/50 min-w-max">
          {activeTabs.map((tab) => {
            const isActive = selectedTopicId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTopicId(tab.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 select-none outline-none ${
                  isActive 
                    ? 'text-white shadow-sm' 
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 bg-zinc-100/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-indigo-600 rounded-full z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentKeyword && (
          <div className="mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredArticles.length} results for "{currentKeyword}"
            </span>
          </div>
        )}
      </motion.div>
      
      {isMobile ? (
        <div className="w-full">
          <ContentSection />
        </div>
      ) : (
        <ReactPullToRefresh
          onRefresh={handleRefresh}
          icon={
            <div className="flex justify-center items-center py-2">
              <RefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400" size={24} />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Pull to refresh...
              </span>
            </div>
          }
          loading={
            <div className="flex justify-center items-center py-2">
              <RefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400" size={24} />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Refreshing...
              </span>
            </div>
          }
          className="ptr-container"
        >
          <ContentSection />
        </ReactPullToRefresh>
      )}
    </div>
  );
};

export default HomePage;