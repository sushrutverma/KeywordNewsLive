import { FC } from 'react';
import { calculateSentimentScore } from '../utils/textUtils';

interface SentimentMeterProps {
  sentiment?: number;
  content?: string;
  className?: string;
}

export const SentimentMeter: FC<SentimentMeterProps> = ({ sentiment, content, className = '' }) => {
  const score = sentiment !== undefined ? sentiment : calculateSentimentScore(content);
  const label = score > 56 ? 'Optimistic / Positive' : score < 44 ? 'Cautious / Negative' : 'Neutral';
  const colorClass = score > 56 ? 'text-emerald-500' : score < 44 ? 'text-rose-500' : 'text-amber-500';

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-xl p-5 shadow-sm space-y-3 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-zinc-400 font-medium">Tone & Sentiment</span>
        <span className={`font-semibold ${colorClass}`}>{label}</span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 opacity-60" />
        <div 
          className="absolute top-0 w-2.5 h-2.5 rounded-full bg-gray-800 dark:bg-white shadow transition-all duration-700" 
          style={{ left: `${score}%`, transform: 'translateY(-0.5px) translateX(-50%)' }}
        />
      </div>
    </div>
  );
};

export default SentimentMeter;
