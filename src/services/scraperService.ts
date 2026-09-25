import axios from 'axios';
import { Readability } from '@mozilla/readability';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getProxyUrl = (url: string) => {
  return `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(url)}`;
};

export interface ScrapedArticle {
  title: string;
  content: string; // HTML clean format
  textContent: string; // Plain text
  byline: string;
  excerpt: string;
  length: number;
}

import DOMPurify from 'dompurify';

export const sanitizeArticleHtml = (dirtyHtml: string): string => {
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'cite',
      'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
      'section', 'article', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'width', 'height'],
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|\/|#)/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  });
};

const resolveRelativeUrls = (htmlContent: string, baseUrl: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Resolve absolute URLs for images and strip dangerous protocols
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (!src) return;
      const trimmed = src.trim();
      if (/^(?:javascript|vbscript):/i.test(trimmed)) {
        img.removeAttribute('src');
        return;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
        try {
          img.setAttribute('src', new URL(trimmed, baseUrl).href);
        } catch {
          img.removeAttribute('src');
        }
      }
      img.setAttribute('loading', 'lazy');
    });

    // Resolve absolute URLs for anchors and strip javascript:/data: URLs
    const links = doc.querySelectorAll('a');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const trimmed = href.trim();
      if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
        a.removeAttribute('href');
        return;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('#')) {
        try {
          a.setAttribute('href', new URL(trimmed, baseUrl).href);
        } catch {
          a.removeAttribute('href');
        }
      }
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });

    return sanitizeArticleHtml(doc.body.innerHTML);
  } catch (err) {
    console.error('Error resolving relative URLs:', err);
    return sanitizeArticleHtml(htmlContent);
  }
};

export const scraperService = {
  async scrapeFullText(url: string): Promise<ScrapedArticle> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase client is not configured.');
    }

    try {
      const proxyUrl = getProxyUrl(url);
      const response = await axios.get(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      });

      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Empty or invalid response from scraping proxy');
      }

      // Parse with DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');

      // Check if document was parsed correctly or if it's an XML/JSON error
      if (doc.body.textContent && doc.body.textContent.trim().startsWith('{') && doc.body.textContent.includes('"error"')) {
        const errObj = JSON.parse(doc.body.textContent.trim());
        throw new Error(errObj.error || 'Failed to fetch external page via proxy');
      }

      // Use Readability
      const reader = new Readability(doc);
      const parsedArticle = reader.parse();

      if (!parsedArticle) {
        throw new Error('Could not parse article content using Readability algorithm');
      }

      const resolvedHtml = resolveRelativeUrls(parsedArticle.content || '', url);

      return {
        title: parsedArticle.title || '',
        content: resolvedHtml || '',
        textContent: parsedArticle.textContent || '',
        byline: parsedArticle.byline || '',
        excerpt: parsedArticle.excerpt || '',
        length: parsedArticle.length || 0,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Scraper failed to retrieve article content';
      console.error('Scraper service error for url:', url, error);
      throw new Error(msg);
    }
  }
};
