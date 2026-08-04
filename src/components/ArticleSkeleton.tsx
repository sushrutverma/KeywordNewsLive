import React from 'react';

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-xl overflow-hidden mb-6 p-6 space-y-4">
      {/* Image placeholder */}
      <div className="w-full h-48 rounded-lg shimmer mb-4" />
      
      {/* Meta tag placeholder */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-32 rounded-full shimmer" />
      </div>

      {/* Title lines placeholder */}
      <div className="space-y-2">
        <div className="h-6 w-11/12 rounded shimmer" />
        <div className="h-6 w-3/4 rounded shimmer" />
      </div>

      {/* Content lines placeholder */}
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-2/3 rounded shimmer" />
      </div>

      {/* Footer controls placeholder */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex space-x-2">
          <div className="h-9 w-28 rounded-full shimmer" />
          <div className="h-9 w-28 rounded-full shimmer" />
        </div>
        <div className="flex space-x-2">
          <div className="h-9 w-9 rounded-full shimmer" />
          <div className="h-9 w-9 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
};

export const ArticlePageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Back button + Actions top bar placeholder */}
      <div className="flex justify-between items-center py-2">
        <div className="h-10 w-10 rounded-full shimmer" />
        <div className="flex space-x-2">
          <div className="h-10 w-10 rounded-full shimmer" />
          <div className="h-10 w-10 rounded-full shimmer" />
        </div>
      </div>

      {/* Hero Image placeholder */}
      <div className="w-full h-[40vh] md:h-[50vh] rounded-2xl shimmer mb-6" />

      {/* Meta placeholder */}
      <div className="flex items-center space-x-3">
        <div className="h-6 w-36 rounded-full shimmer" />
      </div>

      {/* Title lines placeholder */}
      <div className="space-y-3">
        <div className="h-9 w-full rounded shimmer" />
        <div className="h-9 w-5/6 rounded shimmer" />
      </div>

      {/* Content paragraphs placeholder */}
      <div className="space-y-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-11/12 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-5/6 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
      </div>
    </div>
  );
};
