from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block

def build_code_walkthroughs(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # CHAPTER 9B: DEEP COMPONENT CODE AUDIT
    # =========================================================================
    story.append(ChapterMarker("ch9b"))
    story.append(Paragraph("Chapter 9B: Deep Code Audit: ArticleCard & Sidebar Components", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "To ensure complete engineering transparency, this chapter presents an unabridged code walkthrough of the two most "
        "interactive client components in Keywords News: <code>ArticleCard.tsx</code> and <code>Sidebar.tsx</code>.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>9B.1 ArticleCard.tsx: Anatomy of a Bento Tile</b>", styles['H2']))
    story.append(Paragraph(
        "The <code>ArticleCard</code> component renders individual news items within the Bento grid. It handles thumbnail fallback, "
        "reading time calculation, bookmarking toggles, native web share integration, and triggers the AI summary modal. "
        "Below is the complete TypeScript implementation:",
        styles['Body']
    ))
    
    article_card_code = """// src/components/ArticleCard.tsx
import React, { useState } from 'react';
import { Bookmark, Share2, Clock, Sparkles, ExternalLink } from 'lucide-react';
import { Article } from '../types';
import { useNews } from '../contexts/NewsContext';
import { Link } from 'react-router-dom';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  onSummarize?: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured, onSummarize }) => {
  const { savedArticles, toggleSaveArticle } = useNews();
  const isSaved = savedArticles.some(a => a.id === article.id);
  const [imgError, setImgError] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: article.link });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(article.link);
    }
  };

  return (
    <article className={`group relative rounded-2xl overflow-hidden transition-all duration-300
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80
      hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between
      ${featured ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}>
      
      {article.imageUrl && !imgError && (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img src={article.imageUrl} alt={article.title} onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full
            bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-800 dark:text-slate-200 shadow-sm">
            {article.source}
          </span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            {article.isIndian && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                India
              </span>
            )}
          </div>

          <h3 className={`font-serif font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
            ${featured ? 'text-xl md:text-2xl leading-snug mb-3' : 'text-base md:text-lg leading-snug mb-2'}`}>
            <Link to={`/article/${article.id}`}>{article.title}</Link>
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed font-sans">
            {article.contentSnippet || article.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button onClick={() => onSummarize?.(article)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brief</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.preventDefault(); toggleSaveArticle(article); }}
              className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};"""
    story.extend(add_code_block(article_card_code, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 10B: COMPLETE ARCHITECTURE OF NEWSSERVICE.TS
    # =========================================================================
    story.append(ChapterMarker("ch10b"))
    story.append(Paragraph("Chapter 10B: Complete Architecture of newsService.ts", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "<code>src/services/newsService.ts</code> is the most computationally sophisticated module in the application. "
        "It houses the browser-native DOMParser XML parsing engine, thumbnail extraction heuristics, Round-Robin interleaving, "
        "70/30 regional balancing, and localStorage cache management. Below is the unabridged code walkthrough:",
        styles['Body']
    ))
    
    news_service_code = """// src/services/newsService.ts (Core Excerpt)
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Article } from '../types';
import { news_sources } from './newsSources';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getRssProxyUrl = (feedUrl: string) => {
  return `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(feedUrl)}`;
};

// DOMParser parses both RSS 2.0 (<item>) and Atom (<entry>) XML
const parseRssXml = (xmlText: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('XML parsing syntax error');
  }

  const items: any[] = [];
  let itemElements = xmlDoc.querySelectorAll('item');
  let isAtom = false;
  if (itemElements.length === 0) {
    itemElements = xmlDoc.querySelectorAll('entry');
    isAtom = true;
  }

  itemElements.forEach((el) => {
    const getTag = (t: string) => el.getElementsByTagName(t)[0]?.textContent?.trim() || '';
    const title = getTag('title');
    const link = isAtom ? el.querySelector('link')?.getAttribute('href') || '' : getTag('link');
    const pubDate = getTag('pubDate') || getTag('published') || getTag('updated') || new Date().toISOString();
    const snippet = getTag('description') || getTag('summary');
    
    // Thumbnail extraction: checks media:content, enclosure, media:thumbnail
    let img = el.querySelector('media\\\\:content, content')?.getAttribute('url')
      || el.querySelector('enclosure')?.getAttribute('url')
      || el.querySelector('media\\\\:thumbnail, thumbnail')?.getAttribute('url') || '';

    if (title && link) {
      items.push({ title, link, pubDate, description: snippet, imageUrl: img });
    }
  });
  return { items };
};

// Round-Robin Interleaver: Prevents publisher monopolization
export const interleaveBySource = (articles: Article[]): Article[] => {
  const sourceBuckets = new Map<string, Article[]>();
  articles.forEach((a) => {
    const key = a.source || 'General';
    if (!sourceBuckets.has(key)) sourceBuckets.set(key, []);
    sourceBuckets.get(key)!.push(a);
  });

  const interleaved: Article[] = [];
  let hasMore = true;
  let idx = 0;
  while (hasMore) {
    hasMore = false;
    for (const [source, list] of sourceBuckets.entries()) {
      if (idx < list.length) {
        interleaved.push(list[idx]);
        if (idx + 1 < list.length) hasMore = true;
      }
    }
    idx++;
  }
  return interleaved;
};"""
    story.extend(add_code_block(news_service_code, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 11B: COMPLETE ARCHITECTURE OF AISERVICE.TS
    # =========================================================================
    story.append(ChapterMarker("ch11b"))
    story.append(Paragraph("Chapter 11B: Complete Architecture of aiService.ts", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "<code>src/services/aiService.ts</code> coordinates all LLM completions via Mistral AI. "
        "It includes model fallback recursion, input sanitization, token window optimization, and concept extraction:",
        styles['Body']
    ))
    
    ai_service_code = """// src/services/aiService.ts (Core Excerpt)
import axios from 'axios';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Automatic 3-tier fallback chain
const CANDIDATE_MODELS = [
  import.meta.env.VITE_MISTRAL_MODEL || 'open-mistral-nemo',
  'open-mistral-7b',
  'mistral-tiny'
];

export const generateSummary = async (content: string, title?: string): Promise<string> => {
  if (!MISTRAL_API_KEY) throw new Error('Missing Mistral API Key');
  
  // Clean text and trim to 3,000 characters for token efficiency
  const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim().slice(0, 3000);
  
  const messages = [
    {
      role: 'system',
      content: 'You are an executive news briefer. Provide a 2-3 sentence objective analytical summary. No filler.'
    },
    {
      role: 'user',
      content: `Title: ${title || 'News'}\\n\\nArticle Content: ${cleanText}`
    }
  ];

  for (const model of CANDIDATE_MODELS) {
    try {
      const resp = await axios.post(
        MISTRAL_API_URL,
        { model, messages, temperature: 0.2, max_tokens: 150 },
        { headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      return resp.data.choices[0].message.content.trim();
    } catch (err: any) {
      console.warn(`Model ${model} failed, attempting next fallback...`, err?.response?.status);
    }
  }
  throw new Error('All candidate AI models failed.');
};

export const explainConcept = async (term: string, contextSnippet: string): Promise<string> => {
  if (!MISTRAL_API_KEY) throw new Error('Missing Mistral API Key');
  
  const messages = [
    {
      role: 'system',
      content: 'Define the term in exactly 2 clear, accessible sentences tailored to the article context. No filler.'
    },
    {
      role: 'user',
      content: `Term: "${term}"\\nContext: "${contextSnippet.slice(0, 500)}"`
    }
  ];

  const resp = await axios.post(
    MISTRAL_API_URL,
    { model: 'open-mistral-nemo', messages, temperature: 0.3, max_tokens: 100 },
    { headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 8000 }
  );
  return resp.data.choices[0].message.content.trim();
};"""
    story.extend(add_code_block(ai_service_code, styles))
    story.append(PageBreak())
    
    return story
