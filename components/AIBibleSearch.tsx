'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AISearchBar from './AISearchBar';
import AISearchResults from './AISearchResults';
import { GeminiAIClientService, GeminiResponse } from '../services/geminiAIClientService';
import { createVerseUrl } from '../utils/bibleUtils';
import { AIResponseCache } from '../utils/aiResponseCache';
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
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isFromCache, setIsFromCache] = useState(false);
  const router = useRouter();

  const geminiService = GeminiAIClientService.getInstance();

  // Restore search state on component mount (page refresh persistence)
  useEffect(() => {
    const savedState = AIResponseCache.getCurrentSearchState();
    if (savedState) {
      setSearchQuery(savedState.query);
      setSearchResult(savedState.result);
      setCurrentLanguage(savedState.language);
      setIsFromCache(true);
      console.log('Restored search state from cache:', savedState.query);
    }
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    setSearchQuery(query);
    setSearchResult(null);
    setIsFromCache(false);

    try {
      // Detect language
      const language = await geminiService.detectLanguage(query);
      setCurrentLanguage(language);
      
      // Check cache first
      const cachedResponse = AIResponseCache.getCachedResponse(query, language);
      if (cachedResponse) {
        console.log('Using cached response for:', query);
        setSearchResult(cachedResponse.result);
        setSearchQuery(cachedResponse.query);
        setIsFromCache(true);
        
        // Update current search state for page refresh persistence
        AIResponseCache.saveCurrentSearchState(cachedResponse.query, cachedResponse.result, language);
        return;
      }
      
      // Search with LogosAI
      const result = await geminiService.searchAndAnalyze({
        query,
        language,
        context: 'Bible study and theological inquiry'
      });

      setSearchResult(result);
      setIsFromCache(false);
      
      // Cache the response
      AIResponseCache.cacheResponse(query, result, language);
      
      // Save current search state for page refresh persistence
      AIResponseCache.saveCurrentSearchState(query, result, language);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerseClick = (verse: { reference: string; version: string }) => {
    // Use the utility function to create the verse URL with version
    const url = createVerseUrl(verse.reference, verse.version);
    router.push(url);
  };

  const handleClearResults = () => {
    setSearchResult(null);
    setSearchQuery('');
    setError(null);
    setCurrentLanguage('en');
    setIsFromCache(false);
    
    // Clear the current search state but keep the cache for future use
    AIResponseCache.clearCurrentSearchState();
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
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleClearResults}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New Search
            </button>
            
            {/* Cache Indicator */}
            {isFromCache && (
              <div className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Cached Result
              </div>
            )}
            
            {/* Clear Cache Button */}
            <button
              onClick={() => {
                AIResponseCache.clearCache();
                handleClearResults();
              }}
              className="inline-flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Clear all cached responses"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cache
            </button>
          </div>
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
