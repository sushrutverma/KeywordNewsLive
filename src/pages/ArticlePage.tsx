import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Bookmark, ExternalLink, Sparkles, AlertCircle, Clock, Eye, X } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { Article } from '../types';
import { aiService } from '../services/aiService';
import { scraperService, sanitizeArticleHtml } from '../services/scraperService';
import { ArticlePageSkeleton } from '../components/ArticleSkeleton';

const isSafeUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles, savedArticles, saveArticle, removeFromSaved } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  
  // Full text scraper state
  const [fullTextHtml, setFullTextHtml] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingError, setScrapingError] = useState('');

  // Tooltip explainer state
  const [tooltipState, setTooltipState] = useState<{
    isOpen: boolean;
    text: string;
    explanation: string;
    isLoading: boolean;
    error: string;
    x: number;
    y: number;
  }>({
    isOpen: false,
    text: '',
    explanation: '',
    isLoading: false,
    error: '',
    x: 0,
    y: 0
  });

  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string>('');
  const [readingTime, setReadingTime] = useState(0);
  const isBookmarked = article ? savedArticles.some(a => a.id === article.id) : false;

  useEffect(() => {
    if (id) {
      const foundArticle = articles.find(a => a.id === id);
      if (foundArticle) {
        setArticle(foundArticle);
        // Calculate reading time (average 200 words per minute)
        const wordCount = foundArticle.content?.split(' ').length || 0;
        setReadingTime(Math.ceil(wordCount / 200));
      } else {
        // Check if it's in savedArticles
        const savedArticle = savedArticles.find(a => a.id === id);
        if (savedArticle) {
          setArticle(savedArticle);
          const wordCount = savedArticle.content?.split(' ').length || 0;
          setReadingTime(Math.ceil(wordCount / 200));
        } else {
          navigate('/');
        }
      }
    }
  }, [id, articles, navigate, savedArticles]);

  // Load full article text via scraperService
  useEffect(() => {
    const loadFullArticle = async () => {
      if (article?.link) {
        setIsScraping(true);
        setScrapingError('');
        setFullTextHtml(null);
        try {
          const scraped = await scraperService.scrapeFullText(article.link);
          setFullTextHtml(scraped.content);
          
          // Re-calculate reading time based on full text
          const wordCount = scraped.textContent.split(/\s+/).length || 0;
          setReadingTime(Math.ceil(wordCount / 200));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to fetch the full article. Showing preview instead.';
          console.warn('Scraping full text failed:', error);
          setScrapingError(message);
        } finally {
          setIsScraping(false);
        }
      }
    };

    if (article) {
      loadFullArticle();
    }
  }, [article]);

  // Generate AI summary based on scraped full text (or fallback snippet)
  useEffect(() => {
    const generateSummary = async () => {
      // Use clean text content if available, fallback to RSS snippet content or title
      const textToSummarize = fullTextHtml
        ? fullTextHtml.replace(/<[^>]*>/g, '') // Strip HTML tags
        : (article?.content || article?.title);

      if (textToSummarize) {
        setIsSummarizing(true);
        setSummaryError('');
        try {
          const result = await aiService.summarize(textToSummarize);
          setSummary(result.summary);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to generate summary. Please try again later.';
          setSummaryError(message);
          console.error('Summary generation error:', error);
        } finally {
          setIsSummarizing(false);
        }
      }
    };

    if (article && !isScraping) {
      generateSummary();
    }
  }, [article, fullTextHtml, isScraping]);

  // Concept Explainer text selection handler
  const handleTextSelection = async () => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    
    // We only explain terms that are 2-6 words or up to 60 characters long
    if (selectedText.length > 2 && selectedText.length < 60 && !selectedText.includes('\n')) {
      try {
        if (selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate tooltip position (centered above selection, using viewport fixed coordinates)
        const x = rect.left + rect.width / 2;
        const y = rect.top;

        setTooltipState({
          isOpen: true,
          text: selectedText,
          explanation: '',
          isLoading: true,
          error: '',
          x,
          y
        });

        const articleContext = article 
          ? `Title: "${article.title}" Description: "${article.content?.substring(0, 200)}"` 
          : '';
        const result = await aiService.explainConcept(selectedText, articleContext);
        
        setTooltipState(prev => {
          if (prev.text !== selectedText) return prev;
          return {
            ...prev,
            isLoading: false,
            explanation: result.explanation || 'No definition found.'
          };
        });
      } catch (err: unknown) {
        console.error('Failed to get concept definition:', err);
        setTooltipState(prev => {
          if (prev.text !== selectedText) return prev;
          return {
            ...prev,
            isLoading: false,
            error: 'Failed to explain concept. Please try again.'
          };
        });
      }
    }
  };

  const closeTooltip = () => {
    setTooltipState(prev => ({ ...prev, isOpen: false }));
    window.getSelection()?.removeAllRanges();
  };

  // Close tooltip on click away or scroll (using capture phase for scrolling in scrollable container divs)
  useEffect(() => {
    const handleScrollOrClick = (e: MouseEvent | Event) => {
      if (tooltipState.isOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.ai-tooltip')) {
          closeTooltip();
        }
      }
    };

    window.addEventListener('mousedown', handleScrollOrClick);
    window.addEventListener('scroll', handleScrollOrClick, true);

    return () => {
      window.removeEventListener('mousedown', handleScrollOrClick);
      window.removeEventListener('scroll', handleScrollOrClick, true);
    };
  }, [tooltipState.isOpen]);

  const formatContent = (content: string) => {
    // Remove HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    const decodedContent = strippedContent.replace(/&[^;]+;/g, match => {
      const div = document.createElement('div');
      div.innerHTML = match;
      return div.textContent || match;
    });
    // Format paragraphs
    return decodedContent.split('\n').filter(Boolean).map((paragraph, index) => (
      <p key={index} className="mb-6 leading-relaxed text-lg">{paragraph}</p>
    ));
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.title,
          url: article?.link,
        });
      } else {
        navigator.clipboard.writeText(article?.link || '');
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookmarkToggle = () => {
    if (!article) return;
    
    if (isBookmarked) {
      removeFromSaved(article.id);
    } else {
      saveArticle(article);
    }
  };

  const getSentiment = () => {
    if (!article) return 50;
    const text = (article.content || '').toLowerCase();
    let score = 50;
    const positiveWords = ['gain', 'profit', 'rise', 'success', 'benefit', 'growth', 'positive', 'win', 'improve', 'advance', 'bullish', 'innovat', 'lead', 'excellent'];
    const negativeWords = ['loss', 'decline', 'crash', 'fail', 'drop', 'negative', 'lose', 'fall', 'warning', 'bearish', 'risk', 'danger', 'concern', 'threat', 'difficult'];
    positiveWords.forEach(w => { if (text.includes(w)) score += 4; });
    negativeWords.forEach(w => { if (text.includes(w)) score -= 4; });
    return Math.max(15, Math.min(85, score));
  };

  const sentiment = getSentiment();
  const sentimentLabel = sentiment > 56 ? 'Optimistic / Positive' : sentiment < 44 ? 'Cautious / Negative' : 'Neutral';
  const sentimentColor = sentiment > 56 ? 'text-emerald-500' : sentiment < 44 ? 'text-rose-500' : 'text-amber-500';

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 max-w-3xl mx-auto">
        <ArticlePageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Image */}
      {article.image && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
          <motion.img
            layoutId={`image-${article.id}`}
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          
          {/* Floating Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-6 z-20"
          >
            <button
              onClick={() => navigate(-1)}
              className="backdrop-blur-md bg-white/20 dark:bg-black/20 p-3 rounded-full hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute top-6 right-6 z-20 flex space-x-3"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="backdrop-blur-md bg-white/20 dark:bg-black/20 p-3 rounded-full hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 shadow-lg"
            >
              <Share2 size={18} className="text-white" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmarkToggle}
              className={`backdrop-blur-md p-3 rounded-full transition-all duration-300 shadow-lg ${
                isBookmarked 
                  ? 'bg-indigo-600/80 hover:bg-indigo-700/80' 
                  : 'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30'
              }`}
            >
              <Bookmark 
                size={18} 
                className="text-white" 
                fill={isBookmarked ? 'currentColor' : 'none'} 
              />
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative -mt-16 md:-mt-20 z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          {/* Article Card */}
          <motion.div
            layoutId={`card-${article.id}`}
            className="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200/50 lg:dark:divide-zinc-800/50">
              
              {/* Left Column (60% width) - Main Reading Content */}
              <div className="w-full lg:w-3/5 flex flex-col justify-between">
                
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-gray-200/50 dark:border-zinc-800/50">
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark font-medium">
                      {article.source}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Clock size={14} className="mr-1" />
                      <span>{format(new Date(article.pubDate), 'MMM dd, yyyy')}</span>
                    </div>
                    {readingTime > 0 && (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Eye size={14} className="mr-1" />
                        <span>{readingTime} min read</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <motion.h1
                    layoutId={`title-${article.id}`}
                    className="text-3xl font-playfair font-bold text-gray-900 dark:text-white leading-tight"
                  >
                    {article.title}
                  </motion.h1>
                </div>

                {/* Article Content */}
                <div className="p-6 md:p-8 flex-1">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none select-text"
                    onMouseUp={handleTextSelection}
                  >
                    {isScraping ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-11/12 animate-pulse"></div>
                        <div className="pt-4 space-y-4">
                          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-4/5 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6 animate-pulse"></div>
                        </div>
                      </div>
                    ) : scrapingError ? (
                      <div className="space-y-6">
                        <div className="flex items-start p-3.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-550/20">
                          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>We couldn't load the full text. Displaying the article preview instead.</span>
                        </div>
                        {article.content ? (
                          <div className="font-source-serif text-gray-800 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">
                            {formatContent(article.content)}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle className="text-gray-400 dark:text-gray-500" size={24} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No content available for this article.</p>
                          </div>
                        )}
                      </div>
                    ) : fullTextHtml ? (
                      <div 
                        className="reader-content font-source-serif text-gray-800 dark:text-gray-200 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(fullTextHtml) }}
                      />
                    ) : article.content ? (
                      <div className="font-source-serif text-gray-800 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">
                        {formatContent(article.content)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="text-gray-400 dark:text-gray-500" size={24} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No content available for this article.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 md:p-8 bg-gray-50/30 dark:bg-zinc-950/10 border-t border-gray-200/50 dark:border-zinc-800/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Want to read the complete article with all details?
                    </div>
                    {isSafeUrl(article?.link) && (
                      <motion.a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow shadow-indigo-500/10 font-medium"
                      >
                        Read Full Article
                        <ExternalLink size={16} className="ml-2" />
                      </motion.a>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (40% width) - Sticky AI Insights Panel */}
              <div className="w-full lg:w-2/5 p-6 md:p-8 bg-gray-50/30 dark:bg-zinc-950/10 flex flex-col space-y-6 lg:max-h-[85vh] lg:overflow-y-auto lg:sticky lg:top-6">
                
                {/* AI Summary Section */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3 shadow shadow-indigo-500/10">
                      <Sparkles className="text-white" size={16} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h2>
                  </div>
                  
                  {isSummarizing ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary dark:border-primary-dark"></div>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Generating summary...</span>
                    </div>
                  ) : summaryError ? (
                    <div className="flex items-center text-red-500 dark:text-red-400 py-3">
                      <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                      <span className="text-sm">{summaryError}</span>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                      {summary}
                    </p>
                  )}
                </div>

                {/* Tone & Sentiment Gauge */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-zinc-400 font-medium">Tone & Sentiment</span>
                    <span className={`font-semibold ${sentimentColor}`}>{sentimentLabel}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 opacity-60" />
                    <div 
                      className="absolute top-0 w-2.5 h-2.5 rounded-full bg-gray-800 dark:bg-white shadow transition-all duration-700" 
                      style={{ left: `${sentiment}%`, transform: 'translateY(-0.5px) translateX(-50%)' }}
                    />
                  </div>
                </div>

                {/* Reading Analytics Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-5 shadow-sm space-y-2 text-xs text-gray-500 dark:text-zinc-400">
                  <div className="font-semibold text-gray-700 dark:text-zinc-300 text-sm mb-2">Reading Analytics</div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span>Estimate reading time</span>
                    <span className="font-medium text-gray-800 dark:text-zinc-200">{readingTime} min</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Average reading speed</span>
                    <span className="font-medium text-gray-800 dark:text-zinc-200">200 WPM</span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

          {/* No Image Fallback Header */}
          {!article.image && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                >
                  <ArrowLeft className="text-gray-600 dark:text-gray-400" size={20} />
                </button>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-3 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                  >
                    <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmarkToggle}
                    className={`p-3 rounded-full transition-colors backdrop-blur-sm ${
                      isBookmarked 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating AI Tooltip for Concept Explainer */}
      {tooltipState.isOpen && (
        <div 
          className="ai-tooltip fixed z-50 p-4 w-72 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border border-indigo-500/20 dark:border-indigo-400/25 rounded-2xl shadow-xl transition-all duration-300"
          style={{ 
            left: `${tooltipState.x}px`, 
            top: `${tooltipState.y}px`, 
            transform: 'translate(-50%, -105%)', // Position above the text
          }}
        >
          {/* Tooltip caret (arrow at bottom center) */}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-950 border-r border-b border-indigo-500/20 dark:border-indigo-400/25 rotate-45" />

          {/* Tooltip Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-indigo-650 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500 dark:text-indigo-450" />
                AI Concept Explainer
              </div>
              <button 
                onClick={closeTooltip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 truncate">
              "{tooltipState.text}"
            </div>

            {tooltipState.isLoading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary dark:border-primary-dark"></div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Defining...</span>
              </div>
            ) : tooltipState.error ? (
              <div className="text-xs text-rose-500 dark:text-rose-450 py-1">
                {tooltipState.error}
              </div>
            ) : (
              <p className="text-xs text-gray-650 dark:text-zinc-300 leading-relaxed font-sans font-medium">
                {tooltipState.explanation}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;