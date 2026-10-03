import { FC, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Article } from '../types';
import { aiService, cleanAiSummary } from '../services/aiService';

interface ArticleSummaryModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleSummaryModal: FC<ArticleSummaryModalProps> = ({
  article,
  isOpen,
  onClose,
}) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch summary on demand when modal opens
  useEffect(() => {
    let isCancelled = false;

    if (isOpen && !summary) {
      if (!article.content && !article.title) {
        setSummary('No content available to summarize.');
        return;
      }

      setIsLoading(true);
      setError(null);

      aiService.summarize(article.content || article.title)
        .then((result) => {
          if (!isCancelled) {
            setSummary(result?.summary || 'No summary available.');
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setError('Failed to generate summary.');
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, article, summary]);

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={handleBackdropClick}
            onTouchEnd={handleBackdropClick}
          />
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            className="glass-card relative max-w-lg w-full p-6 rounded-2xl max-h-[80vh] overflow-y-auto touch-pan-y overscroll-contain shadow-2xl border border-gray-200/80 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Sparkles className="text-accent dark:text-accent-dark mr-2" size={20} />
                <h3 className="text-lg font-semibold gradient-text">AI Summary</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close summary modal"
                className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent dark:border-accent-dark" />
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Generating grounded summary...</span>
              </div>
            ) : error ? (
              <div className="text-rose-500 dark:text-rose-400 text-center py-8 text-sm">{error}</div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                <p>{cleanAiSummary(summary)}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
