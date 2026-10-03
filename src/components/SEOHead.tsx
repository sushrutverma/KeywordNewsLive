import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCanonicalUrl, getSiteUrl } from '../lib/seoConfig';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  author?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Keyword – Driven by you, Curated for you',
  description = 'Real-time AI-powered news aggregator and market intelligence feed.',
  canonicalPath,
  noindex = false,
  ogType = 'website',
  ogImage = '/keyword-logo.png',
  publishedTime,
  author,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to get or create a meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to get or create a link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Set Meta Description
    setMetaTag('name', 'description', description);

    // 3. Set Robots Directive (noindex on private routes only)
    const robotsDirective = noindex ? 'noindex, nofollow' : 'index, follow';
    setMetaTag('name', 'robots', robotsDirective);
    setMetaTag('name', 'googlebot', robotsDirective);

    // 4. Set Canonical Link Tag
    const resolvedPath = canonicalPath !== undefined ? canonicalPath : location.pathname;
    const canonicalUrl = getCanonicalUrl(resolvedPath);
    setLinkTag('canonical', canonicalUrl);

    // 5. OpenGraph & Social Metadata
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    const siteUrl = getSiteUrl();
    const resolvedOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
    setMetaTag('property', 'og:image', resolvedOgImage);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', resolvedOgImage);

    if (ogType === 'article' && publishedTime) {
      setMetaTag('property', 'article:published_time', publishedTime);
    }
    if (ogType === 'article' && author) {
      setMetaTag('property', 'article:author', author);
    }
  }, [title, description, canonicalPath, noindex, ogType, ogImage, publishedTime, author, location.pathname]);

  return null;
};

export default SEOHead;
