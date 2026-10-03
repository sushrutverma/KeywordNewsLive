import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNews } from '../contexts/NewsContext';
import ArticleCard from '../components/ArticleCard';
import { Bookmark, Trash2, Compass } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const SavedArticlesPage = () => {
  const { savedArticles, removeFromSaved } = useNews();

  const clearAllSaved = () => {
    if (window.confirm('Are you sure you want to remove all saved articles?')) {
      savedArticles.forEach(article => removeFromSaved(article.id));
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <SEOHead
        title="Saved Articles | Keyword"
        description="Access and manage your saved and bookmarked news articles."
        canonicalPath="/saved"
        noindex={true}
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200/60 dark:border-zinc-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary-dark/15 flex items-center justify-center text-primary dark:text-primary-dark">
              <Bookmark size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Saved Articles</h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {savedArticles.length} {savedArticles.length === 1 ? 'article' : 'articles'} bookmarked for reading
              </p>
            </div>
          </div>
          
          {savedArticles.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearAllSaved}
              className="flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 size={14} className="mr-1.5" />
              Clear All
            </motion.button>
          )}
        </div>

        {savedArticles.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center my-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 text-gray-400 dark:text-zinc-500">
              <Bookmark size={24} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">No saved articles yet</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Bookmark stories by clicking the bookmark icon on any article card to read them anytime.
            </p>
            <Link
              to="/"
              className="fab px-4 py-2 rounded-xl text-white text-xs font-medium inline-flex items-center"
            >
              <Compass size={14} className="mr-1.5" />
              Explore News
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {savedArticles.map((article) => (
              <div key={article.id} className="h-full flex flex-col">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SavedArticlesPage;