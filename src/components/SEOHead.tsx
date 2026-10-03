import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCanonicalUrl, getSiteUrl } from '../lib/seoConfig';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  authorUrl?: string;
  faqItems?: FAQItem[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Keyword – Driven by you, Curated for you',
  description = 'Real-time AI-powered news aggregator, financial market pulse, and automated multi-source story clustering.',
  canonicalPath,
  noindex = false,
  ogType = 'website',
  ogImage = '/keyword-logo.png',
  publishedTime,
  modifiedTime,
  author,
  authorUrl,
  faqItems,
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

    // Helper to inject or update JSON-LD scripts
    const setJsonLd = (id: string, schema: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    };

    const removeJsonLd = (id: string) => {
      const script = document.getElementById(id);
      if (script) {
        script.remove();
      }
    };

    // 6. Base Organization Schema (TODO placeholders for author bios, sameAs links and company details)
    if (!noindex) {
      const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'Keyword News',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/keyword-logo.png`,
        },
        description: 'Real-time multi-source AI news intelligence and market aggregation platform.',
        sameAs: [
          'https://twitter.com/TODO_handle',
          'https://linkedin.com/company/TODO_company',
          'https://github.com/TODO_org'
        ],
        founder: {
          '@type': 'Person',
          name: 'TODO: Founder Name',
          description: 'TODO: Founder biography and background.'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Editorial & Customer Support',
          email: 'TODO: contact@keywordnews.netlify.app'
        }
      };
      setJsonLd('schema-organization', organizationSchema);

      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Keyword',
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      };
      setJsonLd('schema-website', websiteSchema);
    } else {
      removeJsonLd('schema-organization');
      removeJsonLd('schema-website');
    }

    // 7. NewsArticle Schema (for Article views)
    if (ogType === 'article' && !noindex) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        headline: title.replace(/\s*\|\s*Keyword.*$/, ''),
        description: description,
        image: [resolvedOgImage],
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || publishedTime || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: author || 'TODO: Contributing Author',
          url: authorUrl || 'TODO: Author Profile URL',
          jobTitle: 'TODO: Author Role',
          worksFor: {
            '@type': 'Organization',
            name: author || 'Keyword News'
          }
        },
        publisher: {
          '@type': 'Organization',
          name: 'Keyword News',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/keyword-logo.png`
          }
        }
      };
      setJsonLd('schema-article', articleSchema);
    } else {
      removeJsonLd('schema-article');
    }

    // 8. FAQ Schema (STRICT RULE: Only where visible Q&A exists!)
    if (faqItems && faqItems.length > 0 && !noindex) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      };
      setJsonLd('schema-faq', faqSchema);
    } else {
      removeJsonLd('schema-faq');
    }

    return () => {
      removeJsonLd('schema-article');
      removeJsonLd('schema-faq');
    };
  }, [
    title,
    description,
    canonicalPath,
    noindex,
    ogType,
    ogImage,
    publishedTime,
    modifiedTime,
    author,
    authorUrl,
    faqItems,
    location.pathname,
  ]);

  return null;
};

export default SEOHead;
