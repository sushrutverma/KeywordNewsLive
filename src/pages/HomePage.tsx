import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactPullToRefresh from 'react-pull-to-refresh';
import { useNews } from '../contexts/NewsContext';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import DurationFilter from '../components/DurationFilter';
import Header from '../components/Header';
import { ArticleCardSkeleton } from '../components/ArticleSkeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

const HomePage = () => {
  const { filteredArticles, isLoading, isError, refreshNews, currentKeyword } = useNews();
  
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

  return (
    <div className="flex-1 pb-16 min-h-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <SearchBar />
        <DurationFilter />
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