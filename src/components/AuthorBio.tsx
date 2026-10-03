import { ExternalLink, ShieldCheck, Newspaper } from 'lucide-react';

export interface AuthorBioProps {
  name?: string;
  source?: string;
  sourceUrl?: string;
  bio?: string;
  avatarUrl?: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  name,
  source = 'Editorial Feed',
  sourceUrl,
  bio,
  avatarUrl,
}) => {
  const authorName = name || source || 'Editorial Contributor';
  // TODO: Replace with verified author/journalist bio from CMS or publisher source
  const authorBioText = bio || 'TODO: Author bio placeholder. Contributing editorial journalist and market news analyst covering national policy, economics, and technological developments.';

  return (
    <section 
      aria-label="Author and Source Information"
      className="mt-8 pt-6 border-t border-gray-200/60 dark:border-zinc-800/60"
    >
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-gray-200/50 dark:border-zinc-800/60 bg-gray-50/50 dark:bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar / Source Icon */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-500/20">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={authorName}
                width={48}
                height={48}
                className="w-full h-full rounded-2xl object-cover"
                loading="lazy"
              />
            ) : (
              <Newspaper size={22} />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {authorName}
              </h3>
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={11} className="mr-1" />
                Verified Source
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
                {source}
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-3">
              {authorBioText}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <ExternalLink size={12} className="mr-1" />
                  View Original Publication
                </a>
              )}
              {/* TODO: Add author profile page link if supported */}
              <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                Author Profile: <span className="font-mono text-[10px]">TODO: https://keywordnews.netlify.app/author/TODO</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorBio;
