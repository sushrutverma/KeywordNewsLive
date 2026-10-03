import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 py-2 sm:py-4">
      <SEOHead
        title="Privacy Policy | Keyword"
        description="Privacy policy, data protection standards, and user privacy guarantees at Keyword News."
        canonicalPath="/privacy"
        noindex={false}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy' },
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
            <Lock size={14} />
            Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            Last Updated: October 2026 • We respect and protect your reading privacy.
          </p>
        </motion.div>

        {/* Privacy Content Body */}
        <div className="glass-card p-6 sm:p-10 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 space-y-8 text-gray-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              1. Our Core Privacy Philosophy
            </h2>
            <p>
              Keyword does not monetize personal data, sell behavioral profiles to advertising brokers, or deploy intrusive cross-site ad trackers. We believe a modern news reader should serve its reader, not data collectors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              2. What Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account Credentials:</strong> If you register an account, we collect your email address and encrypted password via Supabase Auth.
              </li>
              <li>
                <strong>Reading Preferences:</strong> Followed topics (e.g., Technology, Markets, Politics) and saved article references to personalize your feed.
              </li>
              <li>
                <strong>Local Device Storage:</strong> Search history and color theme toggles (Dark/Light mode) remain client-side on your local device.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              3. Third-Party Infrastructure Providers
            </h2>
            <p>
              We rely on trusted enterprise infrastructure to power our platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Supabase:</strong> Encrypted user authentication, row-level security database, and Edge Function proxying.
              </li>
              <li>
                <strong>Netlify:</strong> High-performance edge hosting, CDN delivery, and SSL encryption.
              </li>
              <li>
                <strong>Mistral AI:</strong> Stateless natural-language summarization of public news articles without storing user identifiers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              4. Cookies and Tracking Technologies
            </h2>
            <p>
              Keyword uses essential session cookies strictly necessary to maintain your logged-in authentication state. We do not use third-party marketing or tracking pixels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              5. Your Rights & Account Deletion
            </h2>
            <p>
              You have the right to request a complete copy of your stored profile data or request immediate account deletion. To exercise these rights, email our Data Privacy Officer at <strong className="text-gray-900 dark:text-white">TODO: privacy@keywordnews.netlify.app</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
