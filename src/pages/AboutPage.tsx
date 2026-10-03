import { motion } from 'framer-motion';
import { Shield, Sparkles, Cpu, Globe2, Building2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 py-2 sm:py-4">
      <SEOHead
        title="About Keyword – Driven by you, Curated for you"
        description="Learn about Keyword, the transparent real-time AI news aggregator, market intelligence feed, and story clustering reader."
        canonicalPath="/about"
        noindex={false}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'About Us' },
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
            <Sparkles size={14} />
            About Keyword
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Driven by you, Curated for you
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Keyword is a next-generation news reader that unifies multi-publisher feeds into an intelligent, unbiased, and clutter-free digest powered by real-time AI.
          </p>
        </motion.div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Cpu size={20} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">AI-Assisted Summaries</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Extract key figures, key statistics, and neutral bullet takeaways in seconds without sensory overload or misleading clickbait.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Globe2 size={20} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Multi-Source Clustering</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Algorithms group identical headlines across national, business, and international outlets, exposing divergent perspectives on developing events.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <Shield size={20} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Editorial Integrity</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Transparent source citations and direct linkbacks to primary investigative reporting. Original rights and credits always remain with publishers.
            </p>
          </div>
        </div>

        {/* Company & Editorial Verification Placeholder Box */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Organization & Governance</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Keyword News is committed to verifiable metadata and ethical syndication standards. Below are official corporate governance credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-800/50">
              <span className="text-gray-400 block mb-1">Corporate Entity</span>
              <span className="font-semibold text-gray-800 dark:text-zinc-200">
                TODO: Keyword Media Technologies Pvt. Ltd. / Legal Name
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-800/50">
              <span className="text-gray-400 block mb-1">Editorial Contact</span>
              <span className="font-semibold text-gray-800 dark:text-zinc-200">
                TODO: editorial@keywordnews.netlify.app
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-800/50">
              <span className="text-gray-400 block mb-1">Corporate Identification Number (CIN)</span>
              <span className="font-mono text-gray-800 dark:text-zinc-200">
                TODO: U72900XX2026PTC000000
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-800/50">
              <span className="text-gray-400 block mb-1">Registered Address</span>
              <span className="font-semibold text-gray-800 dark:text-zinc-200">
                TODO: Corporate Registered Address, City, Country, PIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
