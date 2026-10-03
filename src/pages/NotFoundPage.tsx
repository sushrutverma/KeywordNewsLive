import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, AlertTriangle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-[60vh] flex items-center justify-center p-4">
      <SEOHead
        title="404 – Page Not Found | Keyword"
        description="The requested page could not be found on Keyword News."
        noindex={true}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto border border-gray-200/60 dark:border-zinc-800/80 shadow-xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center mb-6 text-amber-500">
          <AlertTriangle size={32} />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
          Error 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 max-w-md leading-relaxed">
          The page or article you are searching for might have been moved, archived, or is temporarily unavailable.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="fab px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium inline-flex items-center shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Home size={16} className="mr-2" />
            Back to Home
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60 inline-flex items-center transition-colors"
          >
            <Compass size={16} className="mr-2" />
            Explore Feed
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
