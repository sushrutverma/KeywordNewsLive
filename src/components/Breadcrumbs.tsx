import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getSiteUrl } from '../lib/seoConfig';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const siteUrl = getSiteUrl();

  // Inject BreadcrumbList JSON-LD into head
  useEffect(() => {
    const breadcrumbListSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => {
        const itemUrl = item.href 
          ? (item.href.startsWith('http') ? item.href : `${siteUrl}${item.href.startsWith('/') ? item.href : `/${item.href}`}`)
          : undefined;

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          ...(itemUrl ? { item: itemUrl } : {})
        };
      })
    };

    const scriptId = 'breadcrumbs-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(breadcrumbListSchema);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) {
        tag.remove();
      }
    };
  }, [items, siteUrl]);

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-gray-500 dark:text-zinc-400 ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-1.5">
              {index > 0 && (
                <ChevronRight size={12} className="text-gray-400 dark:text-zinc-600 shrink-0" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-gray-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
                >
                  {index === 0 && <Home size={12} className="shrink-0" />}
                  <span className="truncate max-w-[150px] sm:max-w-none">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`truncate max-w-[200px] sm:max-w-[320px] ${
                    isLast ? 'font-medium text-gray-800 dark:text-zinc-200' : ''
                  }`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
