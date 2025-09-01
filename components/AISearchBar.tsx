'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getFontClassForText } from '../utils/textUtils';

interface AISearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
}

export default function AISearchBar({
  onSearch,
  isSearching = false,
  placeholder = "Ask any question about the Bible or search for topics (e.g., 'प्रेम क्या है', 'What is love?', 'faith in Hindi')",
  className = ""
}: AISearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const suggestions = [
    'प्रेम क्या है?', // What is love?
    'विश्वास का क्या मतलब है?', // What does faith mean?
    'What is salvation?',
    'How to pray?',
    'पाप की क्षमा कैसे मिलती है?', // How to get forgiveness of sins?
    'What does the Bible say about hope?',
    'Christmas का क्या significance है?', // What is the significance of Christmas?
    'How to have peace in difficult times?',
    'भगवान का प्रेम क्या है?', // What is God's love? (Hindi)
    'विश्वास और कर्म का क्या संबंध है?', // What's the connection between faith and works? (Hindi)
    'यीशु कौन है?', // Who is Jesus? (Hindi)
    'प्रार्थना कैसे करते हैं?', // How to pray? (Hindi)
    'मुक्ति क्या है और कैसे मिलती है?', // What is salvation and how to get it? (Hindi)
    'What does the Bible say about forgiveness?', // English
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI</span>
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isSearching}
            className={`w-full pl-16 pr-24 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getFontClassForText(query)}`}
          />
          
          {/* Clear button */}
          {query && !isSearching && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="hidden sm:inline">Thinking...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Search suggestions */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-medium">Try:</span>
          {suggestions.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setQuery(suggestion)}
              className={`px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs ${getFontClassForText(suggestion)}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          <span className="inline-flex items-center space-x-1">
            <SparklesIcon className="w-3 h-3" />
            <span>LogosAI • Supports Hindi, English & Hinglish</span>
          </span>
        </div>
      </div>
    </div>
  );
}
