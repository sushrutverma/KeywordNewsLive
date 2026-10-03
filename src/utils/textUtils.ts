/**
 * High-performance text formatting, decoding, and parsing utilities.
 * Eliminates DOM thrashing (no document.createElement('div') in render paths).
 */

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
};

const ENTITY_REGEX = /&(?:[a-zA-Z]+|#\d+|#[xX][a-fA-F0-9]+);/g;

/**
 * Decodes HTML entities in pure JS memory without creating DOM nodes.
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return '';
  return text.replace(ENTITY_REGEX, (match) => {
    if (HTML_ENTITIES[match]) return HTML_ENTITIES[match];
    
    // Numeric decimal entities: &#160;
    if (match.startsWith('&#') && !match.startsWith('&#x') && !match.startsWith('&#X')) {
      const code = parseInt(match.slice(2, -1), 10);
      if (!isNaN(code)) return String.fromCharCode(code);
    }
    
    // Numeric hex entities: &#x2014;
    if (match.startsWith('&#x') || match.startsWith('&#X')) {
      const code = parseInt(match.slice(3, -1), 16);
      if (!isNaN(code)) return String.fromCharCode(code);
    }
    
    return match;
  });
};

/**
 * Strips HTML tags from raw content strings.
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Returns clean plain text snippet from raw RSS/HTML article content.
 */
export const formatContentSnippet = (content: string): string => {
  if (!content) return '';
  return decodeHtmlEntities(stripHtml(content)).trim();
};

/**
 * Calculates estimated reading time (default: 200 words/min).
 */
export const calculateReadingTime = (text: string, wordsPerMinute = 200): number => {
  if (!text) return 1;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Standard date formatter using native Intl for zero bundle weight.
 */
export const formatArticleDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (_e) {
    return 'Recent';
  }
};
