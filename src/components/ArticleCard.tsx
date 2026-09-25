import { useState, useEffect, useRef, FC } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bookmark, Share2, ExternalLink, Sparkles, X, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { Article } from '../types';
import { useNews } from '../contexts/NewsContext';
import { aiService } from '../services/aiService';
import { news_sources } from '../services/newsSources';

interface ArticleCardProps {
  article: Article;
  keyword?: string;
  isFeatured?: boolean;
}

const ArticleCard: FC<ArticleCardProps> = ({ article, keyword, isFeatured }) => {
  const { savedArticles, saveArticle, removeFromSaved } = useNews();
  const [showSummary, setShowSummary] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSummary) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showSummary]);

  useEffect(() => {
    return () => {
      // Clean up on unmount in case modal was open
      document.body.style.overflow = '';
    };
  }, []);

  if (!article) return null;

  const isBookmarked = savedArticles?.some((a) => a.id === article.id) || false;

  const formatContent = (content: string) => {
    try {
      const stripped = content.replace(/<[^>]*>/g, '');
      const decoded = stripped.replace(/&[^;]+;/g, (match) => {
        const div = document.createElement('div');
        div.innerHTML = match;
        return div.textContent || div.innerText || match;
      });
      return decoded;
    } catch {
      return content;
    }
  };

  const highlightKeyword = (text: string, keyword?: string) => {
    if (!keyword || !text) return text;
    try {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.split(regex).map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-primary/20 dark:bg-primary-dark/20">{part}</span>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && typeof navigator.canShare === 'function') {
        await navigator.share({
          title: article.title || 'News Article',
          text: article.title || 'Check out this article',
          url: article.link,
        });
      } else {
        await navigator.clipboard.writeText(article.link || '');
        console.log('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleBookmarkToggle = () => {
    if (!article?.id) return;
    isBookmarked ? removeFromSaved(article.id) : saveArticle(article);
  };

  const handleSummarize = async () => {
    if (!showSummary) {
      if (!article.content) {
        setSummary('No content available to summarize.');
        setShowSummary(true);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await aiService.summarize(article.content);
        setSummary(result?.summary || 'No summary available.');
      } catch {
        setError('Failed to generate summary.');
      } finally {
        setIsLoading(false);
        setShowSummary(true);
      }
    } else {
      setShowSummary(false);
    }
  };

  const handleModalBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setShowSummary(false);
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? 'Unknown date' : format(d, 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getCategoryClass = () => {
    if (!article.source) return '';
    const sourceObj = news_sources.find(s => s.name.toLowerCase() === article.source.toLowerCase());
    const category = sourceObj?.category || 'news';
    return `card-${category.toLowerCase().replace(/\s+/g, '')}`;
  };

  const formattedContent = formatContent(article.content || '');

  const relatedCount = article.relatedArticles?.length || 0;
  const uniqueSources = article.relatedArticles && article.relatedArticles.length > 0
    ? Array.from(new Set([article.source, ...article.relatedArticles.map((a) => a.source)]))
    : [article.source];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className={`article-card glass-card rounded-xl overflow-hidden mb-6 relative card-glow-hover cursor-pointer ${getCategoryClass()}`}
      style={{ touchAction: 'pan-y' }}
    >
      <Link to={`/article/${article.id}`} className="block">
        {article.image && (
          <div className={`w-full overflow-hidden ${isFeatured ? 'h-64 md:h-72' : 'h-48'}`}>
            <img
              src={article.image}
              alt={article.title || 'Article image'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-6 pb-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
              {article.source || 'Unknown'} • {formatDate(article.pubDate)}
            </span>
            {relatedCount > 0 && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
                <Layers size={12} className="mr-1.5 text-indigo-500" />
                Covered by {uniqueSources.length} sources
              </span>
            )}
          </div>

          <h2
            className={`font-playfair font-bold mb-3 text-primary dark:text-primary-dark hover:underline ${
              isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'
            }`}
          >
            {highlightKeyword(article.title || 'Untitled', keyword)}
          </h2>

          {formattedContent && (
            <p className="font-source-serif text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              {highlightKeyword(formattedContent, keyword)}
            </p>
          )}
        </div>
      </Link>

      <div className="p-6 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/article/${article.id}`}
            className="fab whitespace-nowrap px-4 py-2 rounded-full text-white text-sm font-medium flex items-center"
          >
            Read more <ExternalLink size={14} className="ml-2" />
          </Link>

          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark text-sm font-medium flex items-center disabled:opacity-50"
          >
            <Sparkles size={14} className="mr-2" />
            {isLoading ? 'Loading...' : 'AI Summary'}
          </button>

          {relatedCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRelated(!showRelated);
              }}
              className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/70 transition-colors"
            >
              <Layers size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>{showRelated ? 'Hide' : 'Compare'} {relatedCount} other {relatedCount === 1 ? 'perspective' : 'perspectives'}</span>
              {showRelated ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Share article">
            <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isBookmarked ? 'text-accent dark:text-accent-dark' : 'text-gray-600 dark:text-gray-400'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRelated && article.relatedArticles && article.relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 px-6 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-600 dark:text-indigo-400" />
                Cross-Publisher Perspectives ({article.relatedArticles.length})
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Multi-source clustered coverage
              </span>
            </div>

            <div className="space-y-2.5">
              {article.relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {rel.source}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {formatDate(rel.pubDate)}
                      </span>
                    </div>
                    <Link
                      to={`/article/${rel.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 block"
                    >
                      {rel.title}
                    </Link>
                    {rel.content && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {formatContent(rel.content)}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/article/${rel.id}`}
                    title="Read article"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={handleModalBackdropClick}
              onTouchEnd={handleModalBackdropClick}
            />
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card relative max-w-lg w-full p-6 rounded-2xl max-h-[80vh] overflow-y-auto touch-pan-y overscroll-contain"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Sparkles className="text-accent dark:text-accent-dark mr-2" size={20} />
                  <h3 className="text-lg font-semibold gradient-text">AI Summary</h3>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent dark:border-accent-dark"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating summary...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 dark:text-red-400 text-center py-8">{error}</div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{summary}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ArticleCard;