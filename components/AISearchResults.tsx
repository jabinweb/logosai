'use client';

import { SparklesIcon, BookOpenIcon, TagIcon, LightBulbIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { GeminiResponse } from '../services/geminiAIService';
import { getFontClassForText } from '../utils/textUtils';

interface AISearchResultsProps {
  query: string;
  result: GeminiResponse;
  isLoading?: boolean;
  error?: string;
  onVerseClick?: (reference: string) => void;
}

export default function AISearchResults({
  query,
  result,
  isLoading = false,
  error,
  onVerseClick
}: AISearchResultsProps) {
  const { data: session } = useSession();
  const [bookmarkingVerse, setBookmarkingVerse] = useState<string | null>(null);

  const bookmarkVerse = async (verse: typeof result.bibleVerses[0]) => {
    if (!session?.user?.id) {
      alert('Please sign in to bookmark verses');
      return;
    }

    setBookmarkingVerse(verse.reference);
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: verse.reference,
          reference: verse.reference,
          text: verse.text,
          version: verse.version,
          tags: [query.toLowerCase()],
          description: `Bookmarked from AI search: "${query}"`
        }),
      });

      if (response.ok) {
        alert('Verse bookmarked successfully!');
      } else {
        alert('Failed to bookmark verse');
      }
    } catch (error) {
      console.error('Error bookmarking verse:', error);
      alert('Failed to bookmark verse');
    } finally {
      setBookmarkingVerse(null);
    }
  };
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI is analyzing your question...</h2>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Query Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Response for: &ldquo;{query}&rdquo;
        </h2>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <SparklesIcon className="w-4 h-4" />
          <span>LogosAI</span>
        </div>
      </div>

      {/* Main Answer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Answer</h3>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p className={`text-gray-700 dark:text-gray-300 leading-relaxed text-lg ${getFontClassForText(result.answer)}`}>
            {result.answer}
          </p>
        </div>
      </div>

      {/* Bible Verses */}
      {result.bibleVerses && result.bibleVerses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Supporting Bible Verses</h3>
          </div>
          <div className="space-y-4">
            {result.bibleVerses.map((verse, index) => (
              <div
                key={index}
                className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {verse.reference}
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      {verse.version}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onVerseClick && onVerseClick(verse.reference)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 rounded text-sm font-medium transition-colors"
                      title="Go to this verse"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Go to Verse</span>
                    </button>
                    {session?.user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          bookmarkVerse(verse);
                        }}
                        disabled={bookmarkingVerse === verse.reference}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        title="Bookmark this verse"
                      >
                        {bookmarkingVerse === verse.reference ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        ) : (
                          <BookmarkIcon className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${getFontClassForText(verse.text)}`}>
                  &ldquo;{verse.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Themes */}
      {result.keyThemes && result.keyThemes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Key Biblical Themes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keyThemes.map((theme, index) => (
              <span
                key={index}
                className={`px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium ${getFontClassForText(theme)}`}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Explanation */}
      {result.explanation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
              <LightBulbIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Explanation</h3>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${getFontClassForText(result.explanation)}`}>
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
