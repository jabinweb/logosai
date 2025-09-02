'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AISearchBar from './AISearchBar';
import AISearchResults from './AISearchResults';
import UserFeedback from './feedback/UserFeedback';
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
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<GeminiResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('english');
  const [isFromCache, setIsFromCache] = useState(false);
  const [feedbackGivenForSearch, setFeedbackGivenForSearch] = useState<Set<string>>(new Set());
  const [showFeedbackConfirmation, setShowFeedbackConfirmation] = useState(false);
  const router = useRouter();

  const geminiService = GeminiAIClientService.getInstance();

  // Generate unique key for each search to track feedback
  const generateSearchKey = (query: string, language: string) => {
    return `${query.toLowerCase().trim()}_${language}`;
  };

  // Handle feedback submission
  const handleFeedbackSubmitted = () => {
    if (searchQuery && currentLanguage) {
      const searchKey = generateSearchKey(searchQuery, currentLanguage);
      setFeedbackGivenForSearch(prev => new Set([...prev, searchKey]));
      setShowFeedbackConfirmation(true);
      
      // Hide the confirmation message after 3 seconds
      setTimeout(() => {
        setShowFeedbackConfirmation(false);
      }, 3000);
      
      console.log('Feedback submitted for training');
    }
  };

  // Check if feedback has been given for current search
  const hasFeedbackBeenGiven = () => {
    if (!searchQuery || !currentLanguage) return false;
    const searchKey = generateSearchKey(searchQuery, currentLanguage);
    return feedbackGivenForSearch.has(searchKey);
  };

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

    // Restore feedback tracking from localStorage
    try {
      const savedFeedback = localStorage.getItem('ai_search_feedback_given');
      if (savedFeedback) {
        const feedbackArray = JSON.parse(savedFeedback);
        setFeedbackGivenForSearch(new Set(feedbackArray));
      }
    } catch (error) {
      console.warn('Error restoring feedback tracking:', error);
    }
  }, []);

  // Save feedback tracking to localStorage whenever it changes
  useEffect(() => {
    try {
      const feedbackArray = Array.from(feedbackGivenForSearch);
      localStorage.setItem('ai_search_feedback_given', JSON.stringify(feedbackArray));
    } catch (error) {
      console.warn('Error saving feedback tracking:', error);
    }
  }, [feedbackGivenForSearch]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    setSearchQuery(query);
    setSearchResult(null);
    setIsFromCache(false);
    setShowFeedbackConfirmation(false); // Reset feedback confirmation on new search

    // Clear any existing feedback tracking for this new search
    // (This allows feedback for the same query if searched again)
    
    try {
      // Detect language
      const language = await geminiService.detectLanguage(query);
      console.log('🔍 Detected language for query:', query, '→', language);
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
      
      console.log('📡 Sending to AI API with language:', language);
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
    setShowFeedbackConfirmation(false);
    
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
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={handleClearResults}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">New Search</span>
              <span className="sm:hidden">New</span>
            </button>
            
            {/* Cache Indicator */}
            {isFromCache && (
              <div className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Cached Result</span>
                <span className="sm:hidden">Cached</span>
              </div>
            )}
            
            {/* Language Indicator */}
            {searchResult && (
              <div className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full">
                <span className="hidden sm:inline">🌐 {currentLanguage === 'english' ? 'English' : currentLanguage === 'hindi' ? 'Hindi' : 'Hinglish'}</span>
                <span className="sm:hidden">{currentLanguage === 'english' ? '🇺🇸' : currentLanguage === 'hindi' ? '🇮🇳' : '🌐'}</span>
              </div>
            )}
            
            {/* Clear Cache Button */}
            <button
              onClick={() => {
                AIResponseCache.clearCache();
                handleClearResults();
                console.log('🗑️ Cache cleared');
              }}
              className="inline-flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Clear all cached responses"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear Cache</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasResults && (
        <>
          <AISearchResults
            query={searchQuery}
            result={searchResult!}
            isLoading={isSearching}
            error={error || undefined}
            onVerseClick={handleVerseClick}
          />
          
          {/* User Feedback - Only show for logged-in users and new searches */}
          {session && 
           searchResult && 
           !isSearching && 
           !error && 
           !hasFeedbackBeenGiven() && (
            <UserFeedback
              query={searchQuery}
              response={searchResult.answer}
              language={currentLanguage}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          )}

          {/* Login prompt for non-logged-in users */}
          {!session && 
           searchResult && 
           !isSearching && 
           !error && (
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 max-w-sm shadow-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  Want to help improve AI responses?
                </p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Sign in to give feedback
                </button>
              </div>
            </div>
          )}

          {/* Feedback confirmation message (shows temporarily after feedback submission) */}
          {session && 
           searchResult && 
           !isSearching && 
           !error && 
           showFeedbackConfirmation && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 max-w-sm shadow-lg">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Feedback submitted for this search
                </p>
              </div>
            </div>
          )}

          {/* Persistent feedback status (shows for previously rated searches) */}
          {session && 
           searchResult && 
           !isSearching && 
           !error && 
           !showFeedbackConfirmation &&
           hasFeedbackBeenGiven() && (
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl p-3 max-w-sm shadow-lg opacity-75">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                  <svg className="h-3 w-3 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Already rated
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Welcome Content (shown when no search has been performed) */}
      {!hasResults && !isSearching && (
        <HowItWorks />
      )}
    </div>
  );
}
