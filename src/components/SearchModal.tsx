import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '../contexts/NewsContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, articles, searchArticles } = useNews();
  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();
  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setKeyword('');
    }
  }, [isSearchOpen]);

  // Handle global Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSearchSubmit = (searchTerm: string = keyword) => {
    if (searchTerm.trim()) {
      searchArticles(searchTerm.trim());
      addToHistory(searchTerm.trim());
      setIsSearchOpen(false);
      navigate('/');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSearchOpen(false);
    }
  };

  // Real-time keyword matching from current loaded articles
  const liveResults = keyword.trim().length >= 2
    ? articles
        .filter(
          (article) =>
            article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
            article.content?.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const defaultCategories = ['Technology', 'Business', 'Top Stories', 'Sports', 'Entertainment'];

  return (
    <AnimatePresence>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/65 backdrop-blur-md z-50 flex items-start justify-center pt-20 md:pt-28 px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          ref={modalRef}
          className="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col space-y-4"
        >
          {/* Search Input Box */}
          <div className="flex items-center border border-gray-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl px-3 py-2">
            <Search className="text-gray-400 dark:text-zinc-500 mr-2 flex-shrink-0" size={18} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search articles, keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="w-full bg-transparent focus:outline-none text-sm dark:text-white"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 mr-1"
              >
                <X size={14} className="text-gray-400 dark:text-zinc-500" />
              </button>
            )}
            <div className="hidden sm:flex items-center space-x-1 text-zinc-400 dark:text-zinc-500 text-[10px] bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700/50 font-medium">
              <CornerDownLeft size={10} />
              <span>Enter</span>
            </div>
          </div>

          {/* Live Search Results (Spotlight Style) */}
          {keyword.trim().length >= 2 && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase flex items-center">
                <Sparkles size={11} className="mr-1 text-indigo-500" />
                Live Matching Stories
              </div>
              <div className="space-y-1">
                {liveResults.length > 0 ? (
                  liveResults.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block p-3 rounded-xl border border-transparent hover:border-gray-200/50 dark:hover:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all duration-200 group"
                    >
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
                        {article.source}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-zinc-100 line-clamp-1 group-hover:underline">
                        {article.title}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 py-2">
                    No exact title or content matches in current cache.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Searches (History) */}
          {searchHistory.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                Recent Keywords
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 6).map((term) => (
                  <div
                    key={term}
                    className="flex items-center bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/20 dark:border-zinc-700/10 px-3 py-1.5 rounded-full text-xs"
                  >
                    <button
                      onClick={() => handleSearchSubmit(term)}
                      className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white mr-1.5 transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(term);
                      }}
                      className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Categories */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
              Trending Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleSearchSubmit(category)}
                  className="bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-gray-200 dark:border-zinc-800 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Help Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-150 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>Click outside or press <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-200 dark:border-zinc-700">Esc</kbd> to exit</span>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
