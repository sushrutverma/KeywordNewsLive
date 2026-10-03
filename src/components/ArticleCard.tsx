import { useState, useEffect, useRef, FC } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bookmark, Share2, ExternalLink, Sparkles, X, Layers, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Article } from '../types';
import { useNews } from '../contexts/NewsContext';
import { aiService, cleanAiSummary } from '../services/aiService';
import { news_sources } from '../services/newsSources';

interface ArticleCardProps {
  article: Article;
  keyword?: string;
  isFeatured?: boolean;
  priority?: boolean;
}

const DETECTED_TICKERS: { match: RegExp; label: string }[] = [
  { match: /\b(reliance|ril)\b/i, label: '$RELIANCE' },
  { match: /\b(tcs|tata consultancy)\b/i, label: '$TCS' },
  { match: /\b(hdfc|hdfc bank)\b/i, label: '$HDFCBANK' },
  { match: /\b(infosys|infy)\b/i, label: '$INFY' },
  { match: /\b(tata motors|tatamotors)\b/i, label: '$TATAMOTORS' },
  { match: /\b(icici|icici bank)\b/i, label: '$ICICIBANK' },
  { match: /\b(sbi|state bank of india)\b/i, label: '$SBIN' },
  { match: /\b(adani)\b/i, label: '$ADANI' },
  { match: /\b(nifty|nifty 50)\b/i, label: 'NIFTY 50' },
  { match: /\b(sensex)\b/i, label: 'SENSEX' },
  { match: /\b(rbi|reserve bank)\b/i, label: 'RBI POLICY' },
  { match: /\b(ipo|listings)\b/i, label: 'IPO RADAR' },
  { match: /\b(gold|bullion)\b/i, label: 'GOLD' },
  { match: /\b(crude oil|brent)\b/i, label: 'CRUDE' },
];

const getDetectedTicker = (title: string): string | null => {
  for (const item of DETECTED_TICKERS) {
    if (item.match.test(title)) {
      return item.label;
    }
  }
  return null;
};

const ArticleCard: FC<ArticleCardProps> = ({ article, keyword, isFeatured, priority }) => {
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
    if (isBookmarked) {
      removeFromSaved(article.id);
    } else {
      saveArticle(article);
    }
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

  const detectedTicker = getDetectedTicker(article.title || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`article-card glass-card rounded-2xl overflow-hidden relative card-glow-hover cursor-pointer h-full flex flex-col justify-between group ${
        article.isWatchlistMatch
          ? 'border-l-4 border-l-amber-500/90 dark:border-l-amber-400/90'
          : ''
      }`}
      style={{ touchAction: 'pan-y' }}
    >
      <div>
        <Link to={`/article/${article.id}`} className="block">
          {article.image && (
            <div className={`w-full overflow-hidden bg-gray-100 dark:bg-zinc-800 ${isFeatured ? 'h-60 sm:h-72' : 'h-48'} aspect-video`}>
              <img
                src={article.image}
                alt={article.title || 'Article image'}
                width={isFeatured ? 800 : 480}
                height={isFeatured ? 450 : 270}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading={isFeatured || priority ? 'eager' : 'lazy'}
                fetchPriority={isFeatured || priority ? 'high' : 'low'}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-5 sm:p-6 pb-2">
            {/* Meta & Badges Hierarchy */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                {article.source || 'News'}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                {formatDate(article.pubDate)}
              </span>

              {article.isWatchlistMatch && (
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Sparkles size={10} className="mr-1 text-amber-500" />
                  {article.matchedAssetName || 'Watchlist'}
                </span>
              )}

              {detectedTicker && (
                <span className="inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp size={10} className="mr-1" />
                  {detectedTicker}
                </span>
              )}

              {relatedCount > 0 && (
                <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  <Layers size={10} className="mr-1 text-indigo-500" />
                  {uniqueSources.length} sources
                </span>
              )}
            </div>

            {/* Headline */}
            <h2
              className={`font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-dark transition-colors mb-2.5 line-clamp-2 ${
                isFeatured ? 'text-xl sm:text-2xl leading-snug' : 'text-lg leading-snug'
              }`}
            >
              {highlightKeyword(article.title || 'Untitled', keyword)}
            </h2>

            {/* Description */}
            {formattedContent && (
              <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                {highlightKeyword(formattedContent, keyword)}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          <Link
            to={`/article/${article.id}`}
            className="fab whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center"
          >
            Read <ExternalLink size={12} className="ml-1.5" />
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSummarize();
            }}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium flex items-center transition-colors disabled:opacity-50 border border-purple-200/60 dark:border-purple-800/40"
          >
            <Sparkles size={12} className="mr-1 text-purple-500" />
            {isLoading ? '...' : 'AI Summary'}
          </button>

          {relatedCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRelated(!showRelated);
              }}
              className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-300 transition-colors"
            >
              <Layers size={11} className="text-gray-500" />
              <span>{showRelated ? 'Hide' : `+${relatedCount}`}</span>
              {showRelated ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
            title="Share article"
          >
            <Share2 size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookmarkToggle();
            }}
            className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
              isBookmarked ? 'text-primary dark:text-primary-dark' : 'text-gray-500 dark:text-zinc-400'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
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
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{cleanAiSummary(summary)}</p>
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