'use client';

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
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}

export default function SearchResultsPanel({
  showSearchResults,
  searchResults,
  searchQuery,
  onResultClick,
  onClose
}: SearchResultsPanelProps) {
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
    <div className="fixed top-16 right-3 sm:right-6 w-96 max-w-[calc(100vw-1.5rem)] max-h-96 bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Search Results ({searchResults.length})
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
      <div className="max-h-80 overflow-y-auto">
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
                <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                  {highlightSearchTerm(result.text, searchQuery)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click any result to navigate to that verse
        </p>
      </div>
    </div>
  );
}
