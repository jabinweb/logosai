'use client';

import { useEffect, useRef } from 'react';

interface SearchResult {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

interface SearchResultsPanelProps {
  showSearchResults: boolean;
  searchResults: SearchResult[];
  searchQuery: string;
  totalCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
  onLoadMore: () => void;
}

export default function SearchResultsPanel({
  showSearchResults,
  searchResults,
  searchQuery,
  totalCount,
  hasMore,
  isLoadingMore,
  onResultClick,
  onClose,
  onLoadMore
}: SearchResultsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle scroll to detect when user reaches bottom
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      
      if (isNearBottom && hasMore && !isLoadingMore) {
        onLoadMore();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (!showSearchResults || searchResults.length === 0) return null;

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-700/50 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="fixed top-16 right-3 sm:right-6 w-96 max-w-[calc(100vw-1.5rem)] max-h-[32rem] bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Search Results ({searchResults.length}{totalCount > searchResults.length ? ` of ${totalCount.toLocaleString()}` : ''})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div ref={scrollRef} className="max-h-[26rem] overflow-y-auto">
        {searchResults.map((result, index) => (
          <button
            key={index}
            onClick={() => onResultClick(result)}
            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded flex-shrink-0">
                {result.book} {result.chapter}:{result.verse}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white line-clamp-4 leading-relaxed">
                  {highlightSearchTerm(result.text, searchQuery)}
                </p>
              </div>
            </div>
          </button>
        ))}
        
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading more results...</span>
            </div>
          </div>
        )}
        
        {/* Load more button (fallback for users who prefer clicking) */}
        {hasMore && !isLoadingMore && (
          <div className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Load More Results
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click any result to navigate to that verse
          {totalCount > 1000 && !hasMore && (
            <span className="block mt-1 text-blue-600 dark:text-blue-400">
              Showing {searchResults.length} of {totalCount.toLocaleString()} total results
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
