import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200/60 dark:border-zinc-850 pt-10 pb-12 w-full text-xs text-gray-500 dark:text-zinc-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block group">
              <picture>
                <source srcSet="/keyword-logo.webp" type="image/webp" />
                <img
                  src="/keyword-logo.png"
                  alt="Keyword"
                  width={120}
                  height={28}
                  className="h-6 w-auto object-contain dark:invert transition-transform group-hover:scale-105 duration-200 select-none"
                  loading="lazy"
                />
              </picture>
            </Link>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Keyword aggregates real-time multi-publisher news feeds into clean, unbiased digests with instant AI takeaways and market intelligence.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 dark:text-zinc-500">
              {/* TODO: Add verified social profiles */}
              <a
                href="https://twitter.com/TODO"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Twitter / X
              </a>
              <span>•</span>
              <a
                href="https://linkedin.com/company/TODO"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                LinkedIn
              </a>
              <span>•</span>
              <a
                href="https://github.com/TODO"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Trust & Legal Links */}
          <div className="space-y-2.5">
            <span className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Transparency & Trust
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  About Keyword
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Editorial & Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Reader Navigation */}
          <div className="space-y-2.5">
            <span className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Reader Navigation
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Live Feed
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Saved Stories
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Reading Preferences
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  XML Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-6 border-t border-gray-200/40 dark:border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-zinc-500">
          <p>
            © {currentYear} Keyword News. All rights reserved. Syndicated content belongs to original publishers.
          </p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Independent & Ad-Free Reader</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
