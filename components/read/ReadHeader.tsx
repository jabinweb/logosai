'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
// import { ThemeToggle } from '../ThemeToggle';

interface BibleVersion {
  id: string;
  name: string;
  language: string;
  description?: string;
}

interface ReadHeaderProps {
  bibleVersions: BibleVersion[];
  selectedVersion: string;
  selectedBook: string;
  selectedChapter: string;
  chapters: string[];
  searchQuery: string;
  searchScope: 'current' | 'all';
  isSearching: boolean;
  searchResults: Array<{book: string, chapter: string, verse: string, text: string}>;
  showSearchResults: boolean;
  showMobileSearch: boolean;
  onVersionChange: (version: string) => void;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onSearchQueryChange: (query: string) => void;
  onSearchScopeChange: (scope: 'current' | 'all') => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchResultsToggle: () => void;
  onMobileSearchToggle: () => void;
  onSettingsToggle: () => void;
  updateURL: (book?: string, chapter?: string, verse?: string, version?: string) => void;
}

export default function ReadHeader({
  bibleVersions,
  selectedVersion,
  selectedBook,
  selectedChapter,
  chapters,
  searchQuery,
  searchScope,
  isSearching,
  searchResults,
  showMobileSearch,
  onVersionChange,
  onBookChange,
  onChapterChange,
  onSearchQueryChange,
  onSearchScopeChange,
  onSearchSubmit,
  onSearchResultsToggle,
  onMobileSearchToggle,
  onSettingsToggle,
  updateURL
}: ReadHeaderProps) {
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  const versionDropdownRef = useRef<HTMLDivElement>(null);
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  // Basic Bible books list for dropdown
  const basicBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];

  const getFilteredBooks = () => {
    if (!bookSearchQuery) return basicBooks;
    return basicBooks.filter(book =>
      book.toLowerCase().includes(bookSearchQuery.toLowerCase())
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(event.target as Node)) {
        setShowVersionDropdown(false);
      }
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target as Node)) {
        setShowBookDropdown(false);
      }
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(event.target as Node)) {
        setShowChapterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile-Friendly Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          {/* Back Button */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm sm:text-base hidden xs:inline">Back</span>
          </Link>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={onMobileSearchToggle}
              className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Desktop Search Box */}
            <div className="hidden sm:flex items-center space-x-2">
              <form onSubmit={onSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder={searchScope === 'current' ? `Search in ${selectedBook}...` : 'Search entire Bible...'}
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="w-48 md:w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </form>

              {/* Desktop Search Scope Toggle */}
              <button
                onClick={() => onSearchScopeChange(searchScope === 'current' ? 'all' : 'current')}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                  searchScope === 'current' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={searchScope === 'current' ? 'Click to search entire Bible' : 'Click to search current book only'}
              >
                {searchScope === 'current' ? 'Book' : 'All'}
              </button>
            </div>

            {/* Search Results Indicator */}
            {searchResults.length > 0 && (
              <button
                onClick={onSearchResultsToggle}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {searchResults.length} results
              </button>
            )}

            {/* Version Selector */}
            <div className="relative" ref={versionDropdownRef}>
              <button
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {bibleVersions.find(v => v.id === selectedVersion)?.id || 'ESV'}
              </button>
              {showVersionDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 min-w-48 z-10">
                  {bibleVersions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => {
                        onVersionChange(version.id);
                        setShowVersionDropdown(false);
                        updateURL(undefined, undefined, undefined, version.id);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedVersion === version.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      <div className="font-medium">{version.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{version.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Book Selector */}
            <div className="relative" ref={bookDropdownRef}>
              <button
                onClick={() => setShowBookDropdown(!showBookDropdown)}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {selectedBook}
              </button>
              {showBookDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-64 overflow-auto min-w-48 z-10">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {getFilteredBooks().map((book) => (
                    <button
                      key={book}
                      onClick={() => {
                        onBookChange(book);
                        setShowBookDropdown(false);
                        setBookSearchQuery('');
                        updateURL(book, '1');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedBook === book ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Selector */}
            <div className="relative" ref={chapterDropdownRef}>
              <button
                onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {selectedChapter}
              </button>
              {showChapterDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-64 overflow-auto min-w-24 z-10">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => {
                        onChapterChange(chapter);
                        setShowChapterDropdown(false);
                        updateURL(undefined, chapter);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedChapter === chapter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle and Settings Button */}
            <div className="flex items-center space-x-3">
              {/* <ThemeToggle /> */}
              <button
                onClick={onSettingsToggle}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Reading Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sm:hidden">
          <div className="px-3 py-3">
            <form onSubmit={onSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={searchScope === 'current' ? `Search in ${selectedBook}...` : 'Search entire Bible...'}
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pr-20"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onSearchScopeChange(searchScope === 'current' ? 'all' : 'current')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    searchScope === 'current' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {searchScope === 'current' ? 'Book' : 'All'}
                </button>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
