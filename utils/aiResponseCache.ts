import { GeminiResponse } from '../services/geminiAIService';

interface CachedResponse {
  query: string;
  result: GeminiResponse;
  timestamp: number;
  language: string;
}

interface CacheEntry {
  data: CachedResponse;
  expiresAt: number;
}

const CACHE_KEY = 'logosai_search_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_ENTRIES = 50; // Maximum number of cached responses

/**
 * AI Response Cache Utility
 * Provides persistent caching for AI search responses with expiration
 */
export class AIResponseCache {
  /**
   * Generate a cache key for a search query
   */
  private static generateCacheKey(query: string, language: string): string {
    // Normalize query for consistent caching
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${normalizedQuery}_${language}`;
  }

  /**
   * Get cached responses from localStorage
   */
  private static getCacheData(): Map<string, CacheEntry> {
    if (typeof window === 'undefined') return new Map();
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return new Map();
      
      const parsed = JSON.parse(cached);
      const cache = new Map<string, CacheEntry>();
      
      // Convert array back to Map and filter expired entries
      const now = Date.now();
      Object.entries(parsed).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry;
        if (cacheEntry.expiresAt > now) {
          cache.set(key, cacheEntry);
        }
      });
      
      return cache;
    } catch (error) {
      console.warn('Failed to parse cache data:', error);
      return new Map();
    }
  }

  /**
   * Save cache data to localStorage
   */
  private static saveCacheData(cache: Map<string, CacheEntry>): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to object for JSON serialization
      const cacheObject = Object.fromEntries(cache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save cache data:', error);
    }
  }

  /**
   * Cache an AI response
   */
  static cacheResponse(query: string, result: GeminiResponse, language: string): void {
    const cache = this.getCacheData();
    const key = this.generateCacheKey(query, language);
    const now = Date.now();
    
    // Create cache entry
    const entry: CacheEntry = {
      data: {
        query: query.trim(),
        result,
        timestamp: now,
        language
      },
      expiresAt: now + CACHE_DURATION
    };
    
    // Add to cache
    cache.set(key, entry);
    
    // Limit cache size by removing oldest entries
    if (cache.size > MAX_CACHE_ENTRIES) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].data.timestamp - b[1].data.timestamp);
      
      // Remove oldest entries
      const entriesToRemove = entries.slice(0, cache.size - MAX_CACHE_ENTRIES);
      entriesToRemove.forEach(([key]) => cache.delete(key));
    }
    
    this.saveCacheData(cache);
  }

  /**
   * Get a cached response
   */
  static getCachedResponse(query: string, language: string): CachedResponse | null {
    const cache = this.getCacheData();
    const key = this.generateCacheKey(query, language);
    const entry = cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is still valid
    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      this.saveCacheData(cache);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Get the current search state from session storage (for page refresh persistence)
   */
  static getCurrentSearchState(): { query: string; result: GeminiResponse; language: string } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const currentState = sessionStorage.getItem('logosai_current_search');
      return currentState ? JSON.parse(currentState) : null;
    } catch (error) {
      console.warn('Failed to get current search state:', error);
      return null;
    }
  }

  /**
   * Save the current search state to session storage
   */
  static saveCurrentSearchState(query: string, result: GeminiResponse, language: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const state = { query: query.trim(), result, language };
      sessionStorage.setItem('logosai_current_search', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save current search state:', error);
    }
  }

  /**
   * Clear the current search state
   */
  static clearCurrentSearchState(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem('logosai_current_search');
    } catch (error) {
      console.warn('Failed to clear current search state:', error);
    }
  }

  /**
   * Clear all cached responses
   */
  static clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem('logosai_current_search');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { totalEntries: number; oldestEntry: number | null; newestEntry: number | null } {
    const cache = this.getCacheData();
    const entries = Array.from(cache.values());
    
    if (entries.length === 0) {
      return { totalEntries: 0, oldestEntry: null, newestEntry: null };
    }
    
    const timestamps = entries.map(entry => entry.data.timestamp);
    return {
      totalEntries: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }
}
