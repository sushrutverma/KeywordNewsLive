import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 py-2 sm:py-4">
      <SEOHead
        title="Terms of Service | Keyword"
        description="Terms of service, content syndication guidelines, and acceptable use policies for Keyword News."
        canonicalPath="/terms"
        noindex={false}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Terms of Service' },
          ]}
          className="px-1"
        />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-3xl p-8 sm:p-12 border border-gray-200/60 dark:border-zinc-800/80 shadow-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark text-xs font-semibold mb-4">
            <Scale size={14} />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            Last Updated: October 2026 • Effective Date: October 2026
          </p>
        </motion.div>

        {/* Terms Content Body */}
        <div className="glass-card p-6 sm:p-10 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 space-y-8 text-gray-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or utilizing the Keyword application (accessible via https://keywordnews.netlify.app), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service and our Privacy Policy. If you do not agree with any provision, you must discontinue use immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              2. Intellectual Property & Syndicated News Feeds
            </h2>
            <p>
              Keyword is a news aggregator and market intelligence curation platform. All original news articles, full text reports, trademarks, and associated imagery belong exclusively to their respective publishing entities (e.g., The Hindu, Indian Express, LiveMint, Reuters, etc.).
            </p>
            <p>
              Keyword indexes publicly accessible RSS feeds, parses headlines, and renders transformative summaries under fair-dealing and fair-use principles. We provide direct canonical hyperlinks to original stories for full readership.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              3. AI-Generated Summaries Disclaimer
            </h2>
            <p>
              Articles summarized by artificial intelligence models (including Mistral AI) are generated automatically. While designed to extract core statistics and neutral facts, AI summaries may occasionally contain imperfections, omissions, or interpretive nuances. Users should always consult primary source links before making financial, legal, or investment decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              4. Financial Ticker & Market Data
            </h2>
            <p>
              Market pulse feeds, index metrics, and stock ticker movements displayed across the interface are provided strictly for educational and informational purposes. Keyword is not an investment advisor, registered broker, or financial fiduciary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              5. Publisher Removal & Content Take-down
            </h2>
            <p>
              Publishers wishing to exclude their publications or update their attribution references can submit a formal request to our editorial desk at <strong className="text-gray-900 dark:text-white">TODO: editorial@keywordnews.netlify.app</strong>. Requests are processed within 24 to 48 business hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              6. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of <strong className="text-gray-900 dark:text-white">TODO: Legal Jurisdiction State/Country</strong>, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
