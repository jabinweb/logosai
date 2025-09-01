'use client';

import { useState, useCallback } from 'react';
import { BibleSearchService, SearchResult, AICommentary, BibleSearchResponse } from '../services/bibleSearchService';

interface UseBibleSearchOptions {
  defaultVersion?: string;
  selectedBook?: string;
}

interface UseBibleSearchReturn {
  searchResults: SearchResult[];
  aiCommentary: AICommentary | null;
  isSearching: boolean;
  error: string | null;
  searchBible: (query: string) => Promise<void>;
  clearResults: () => void;
  retrySearch: () => void;
  lastQuery: string;
}

export function useBibleSearch(options: UseBibleSearchOptions = {}): UseBibleSearchReturn {
  const { defaultVersion = 'ESV', selectedBook } = options;
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiCommentary, setAiCommentary] = useState<AICommentary | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const bibleSearchService = BibleSearchService.getInstance();

  const searchBible = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);
    setLastQuery(query);
    setSearchResults([]);
    setAiCommentary(null);

    try {
      const response: BibleSearchResponse = await bibleSearchService.searchBible(
        query,
        defaultVersion,
        selectedBook
      );

      setSearchResults(response.results);
      setAiCommentary(response.aiCommentary || null);

      if (response.results.length === 0) {
        setError(`No verses found for "${query}" in ${defaultVersion}. Try different keywords or check spelling.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Bible search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [defaultVersion, selectedBook, bibleSearchService]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setAiCommentary(null);
    setError(null);
    setLastQuery('');
  }, []);

  const retrySearch = useCallback(() => {
    if (lastQuery) {
      searchBible(lastQuery);
    }
  }, [lastQuery, searchBible]);

  return {
    searchResults,
    aiCommentary,
    isSearching,
    error,
    searchBible,
    clearResults,
    retrySearch,
    lastQuery
  };
}
