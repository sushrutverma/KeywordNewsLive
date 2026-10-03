import { FC, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export interface ConceptTooltipState {
  isOpen: boolean;
  text: string;
  explanation: string;
  isLoading: boolean;
  error: string;
  x: number;
  y: number;
}

interface ConceptExplainerTooltipProps {
  tooltipState: ConceptTooltipState;
  onClose: () => void;
}

export const ConceptExplainerTooltip: FC<ConceptExplainerTooltipProps> = ({
  tooltipState,
  onClose
}) => {
  // Close tooltip on click away or scroll (using capture phase for scrolling in scrollable container divs)
  useEffect(() => {
    if (!tooltipState.isOpen) return;

    const handleScrollOrClick = (e: MouseEvent | Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ai-tooltip')) {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleScrollOrClick);
    window.addEventListener('scroll', handleScrollOrClick, true);

    return () => {
      window.removeEventListener('mousedown', handleScrollOrClick);
      window.removeEventListener('scroll', handleScrollOrClick, true);
    };
  }, [tooltipState.isOpen, onClose]);

  if (!tooltipState.isOpen) return null;

  return (
    <div 
      className="ai-tooltip fixed z-50 p-4 w-72 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border border-indigo-500/20 dark:border-indigo-400/25 rounded-2xl shadow-xl transition-all duration-300"
      style={{ 
        left: `${tooltipState.x}px`, 
        top: `${tooltipState.y}px`, 
        transform: 'translate(-50%, -105%)', // Position above the text
      }}
    >
      {/* Tooltip caret (arrow at bottom center) */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-950 border-r border-b border-indigo-500/20 dark:border-indigo-400/25 rotate-45" />

      {/* Tooltip Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-indigo-650 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500 dark:text-indigo-450" />
            AI Concept Explainer
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 truncate">
          "{tooltipState.text}"
        </div>

        {tooltipState.isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary dark:border-primary-dark"></div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Defining...</span>
          </div>
        ) : tooltipState.error ? (
          <div className="text-xs text-rose-500 dark:text-rose-450 py-1">
            {tooltipState.error}
          </div>
        ) : (
          <p className="text-xs text-gray-650 dark:text-zinc-300 leading-relaxed font-sans font-medium">
            {tooltipState.explanation}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConceptExplainerTooltip;
