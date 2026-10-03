/**
 * SEO and Domain Configuration for Keyword News
 * 
 * Domain is loaded via SITE_URL / VITE_SITE_URL environment variable.
 * Fallback domain uses TODO placeholder until custom production domain is fully verified.
 */

// Production default fallback domain
export const DEFAULT_SITE_URL = 'https://keywordnews.netlify.app';

/**
 * Resolves the absolute site URL from environment variables or runtime location.
 */
export function getSiteUrl(): string {
  // Check Vite client-side env
  const viteSiteUrl = import.meta.env.VITE_SITE_URL;
  if (viteSiteUrl && typeof viteSiteUrl === 'string' && viteSiteUrl.trim() !== '') {
    return viteSiteUrl.replace(/\/+$/, '');
  }

  // Check process.env.SITE_URL or Netlify's automatic process.env.URL
  if (typeof process !== 'undefined' && process.env) {
    const envUrl = process.env.SITE_URL || process.env.URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      return envUrl.replace(/\/+$/, '');
    }
  }

  // Runtime browser origin check
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // Only use local/deployed origin if not localhost, otherwise use default production URL for SEO canonicals
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }

  return DEFAULT_SITE_URL;
}

/**
 * Builds an absolute canonical URL for a given path.
 * Normalizes trailing slashes and handles query params.
 */
export function getCanonicalUrl(path: string = '/'): string {
  const siteUrl = getSiteUrl();
  // Strip any query strings and hashes for canonical URLs
  const cleanPath = (path.split('?')[0] || '/').split('#')[0] || '/';
  
  if (cleanPath === '/' || cleanPath === '') {
    return `${siteUrl}/`;
  }
  
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${siteUrl}${normalized.replace(/\/+$/, '')}`;
}
