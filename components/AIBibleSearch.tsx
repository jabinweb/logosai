'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AISearchBar from './AISearchBar';
import AISearchResults from './AISearchResults';
import { GeminiAIClientService, GeminiResponse } from '../services/geminiAIClientService';
import { createVerseUrl } from '../utils/bibleUtils';
import HowItWorks from './home/HowItWorks';

interface AIBibleSearchProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export default function AIBibleSearch({
  className = "",
  showTitle = true,
  title = "AI-Powered Bible Search & Study"
}: AIBibleSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<GeminiResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const geminiService = GeminiAIClientService.getInstance();

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    setSearchQuery(query);
    setSearchResult(null);

    try {
      // Detect language
      const language = await geminiService.detectLanguage(query);
      
      // Search with LogosAI
      const result = await geminiService.searchAndAnalyze({
        query,
        language,
        context: 'Bible study and theological inquiry'
      });

      setSearchResult(result);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerseClick = (reference: string) => {
    // Use the utility function to create the verse URL
    const url = createVerseUrl(reference);
    router.push(url);
  };

  const handleClearResults = () => {
    setSearchResult(null);
    setSearchQuery('');
    setError(null);
  };

  const hasResults = searchResult || error;

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Title */}
      {showTitle && (
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ask any question about the Bible in Hindi, English, or Hinglish. 
            Get AI-powered answers with verified biblical references and detailed explanations.
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <AISearchBar
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </div>

      {/* Clear Results Button */}
      {hasResults && (
        <div className="text-center mb-6">
          <button
            onClick={handleClearResults}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New Search
          </button>
        </div>
      )}

      {/* Search Results */}
      {hasResults && (
        <AISearchResults
          query={searchQuery}
          result={searchResult!}
          isLoading={isSearching}
          error={error || undefined}
          onVerseClick={handleVerseClick}
        />
      )}

      {/* Welcome Content (shown when no search has been performed) */}
      {!hasResults && !isSearching && (
        <HowItWorks />
      )}
    </div>
  );
}
