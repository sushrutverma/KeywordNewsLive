import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, ExternalLink, Sparkles, AlertCircle, Clock, Eye } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import { Article } from '../types';
import { aiService, cleanAiSummary } from '../services/aiService';
import { scraperService, sanitizeArticleHtml } from '../services/scraperService';
import { ArticlePageSkeleton } from '../components/ArticleSkeleton';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import AuthorBio from '../components/AuthorBio';
import SentimentMeter from '../components/SentimentMeter';
import ConceptExplainerTooltip, { ConceptTooltipState } from '../components/ConceptExplainerTooltip';
import { decodeHtmlEntities, stripHtml, calculateReadingTime, formatArticleDate } from '../utils/textUtils';

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
  const { articles, savedArticles, saveArticle, removeFromSaved, isLoading } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  // Full text scraper state
  const [fullTextHtml, setFullTextHtml] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingError, setScrapingError] = useState('');

  // Tooltip explainer state
  const [tooltipState, setTooltipState] = useState<ConceptTooltipState>({
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
        setNotFound(false);
        setReadingTime(calculateReadingTime(foundArticle.content || ''));
      } else {
        // Check if it's in savedArticles
        const savedArticle = savedArticles.find(a => a.id === id);
        if (savedArticle) {
          setArticle(savedArticle);
          setNotFound(false);
          setReadingTime(calculateReadingTime(savedArticle.content || ''));
        } else if (!isLoading && articles.length > 0) {
          setNotFound(true);
        }
      }
    }
  }, [id, articles, savedArticles, isLoading]);

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
          setReadingTime(calculateReadingTime(scraped.textContent));
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
        ? stripHtml(fullTextHtml)
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

  const formatContent = (content: string) => {
    const decodedContent = decodeHtmlEntities(stripHtml(content));
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

  if (notFound) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <SEOHead
          title="Article Not Found | Keyword"
          description="The requested article could not be found or has expired."
          canonicalPath={`/article/${id || ''}`}
          noindex={true}
        />
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 max-w-md">
          This article might have been archived or removed from the live feed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="fab px-5 py-2.5 rounded-xl text-white text-sm font-medium inline-flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Feed
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <ArticlePageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${article.title} | Keyword`}
        description={article.content ? stripHtml(article.content).slice(0, 160) : 'Read the full story on Keyword.'}
        canonicalPath={`/article/${article.id}`}
        noindex={false}
        ogType="article"
        ogImage={article.image || '/keyword-logo.png'}
        publishedTime={article.pubDate}
        author={article.source}
      />
      {/* 1. If article has image: Hero Section */}
      {article.image ? (
        <div className="relative h-[36vh] sm:h-[45vh] overflow-hidden rounded-2xl mb-6 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent z-10" />
          <motion.img
            layoutId={`image-${article.id}`}
            src={article.image}
            alt={article.title}
            width={1200}
            height={630}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          
          {/* Floating Navigation Controls */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => navigate(-1)}
              className="backdrop-blur-md bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-xl transition-all duration-200 shadow-md border border-white/10"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="backdrop-blur-md bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-xl transition-all duration-200 shadow-md border border-white/10"
              title="Share"
            >
              <Share2 size={16} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmarkToggle}
              className={`backdrop-blur-md p-2.5 rounded-xl transition-all duration-200 shadow-md border border-white/10 ${
                isBookmarked 
                  ? 'bg-primary text-white' 
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title={isBookmarked ? 'Saved' : 'Save'}
            >
              <Bookmark 
                size={16} 
                fill={isBookmarked ? 'currentColor' : 'none'} 
              />
            </motion.button>
          </div>
        </div>
      ) : (
        /* 2. If article has NO image: Clean Top Bar */
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/60 dark:border-zinc-800/60">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 transition-colors"
              title="Share"
            >
              <Share2 size={16} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked 
                  ? 'text-primary dark:text-primary-dark bg-primary/10 dark:bg-primary-dark/15' 
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Breadcrumbs Navigation */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: article.source || 'News', href: '/' },
              { label: article.title },
            ]}
            className="mb-3 px-1"
          />

          {/* Article Card */}
          <motion.div
            layoutId={`card-${article.id}`}
            className="glass-card rounded-2xl shadow-xl overflow-hidden border border-gray-200/60 dark:border-zinc-800/60"
          >
            <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200/60 lg:dark:divide-zinc-800/60">
              
              {/* Left Column (60% width) - Main Reading Content */}
              <div className="w-full lg:w-3/5 flex flex-col justify-between">
                
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-gray-200/50 dark:border-zinc-800/50">
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-indigo-300 border border-primary/20 dark:border-indigo-400/30 font-medium">
                      {article.source}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-zinc-300">
                      <Clock size={14} className="mr-1" />
                      <span>{formatArticleDate(article.pubDate)}</span>
                    </div>
                    {readingTime > 0 && (
                      <div className="flex items-center text-gray-500 dark:text-zinc-300">
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

                {/* Author & Source Attribution */}
                <div className="px-6 md:px-8 pb-4">
                  <AuthorBio
                    name={article.source}
                    source={article.source}
                    sourceUrl={article.link}
                  />
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
                      {cleanAiSummary(summary)}
                    </p>
                  )}
                </div>

                {/* Tone & Sentiment Gauge */}
                <SentimentMeter content={article.content} />

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
        </motion.div>
      </div>

      {/* Floating AI Tooltip for Concept Explainer */}
      <ConceptExplainerTooltip
        tooltipState={tooltipState}
        onClose={closeTooltip}
      />
    </div>
  );
};

export default ArticlePage;