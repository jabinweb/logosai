'use client';

import { useState } from 'react';

interface MobileNavModalProps {
  showMobileNav: boolean;
  selectedBook: string;
  selectedChapter: string;
  chapters: string[];
  onMobileNavToggle: () => void;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  updateURL: (book?: string, chapter?: string, verse?: string, version?: string) => void;
}

export default function MobileNavModal({
  showMobileNav,
  selectedBook,
  selectedChapter,
  chapters,
  onMobileNavToggle,
  onBookChange,
  onChapterChange,
  updateURL
}: MobileNavModalProps) {
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Basic Bible books list for mobile navigation
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

  const filteredBooks = basicBooks.filter(book => 
    book.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  if (!showMobileNav) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onMobileNavToggle} />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-lg max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Navigate</h3>
          <button
            onClick={onMobileNavToggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book</label>
            <input
              type="text"
              placeholder="Search books..."
              value={bookSearchQuery}
              onChange={(e) => setBookSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {filteredBooks.map((book) => (
                <button
                  key={book}
                  onClick={() => {
                    onBookChange(book);
                    onChapterChange('1');
                    onMobileNavToggle();
                    setBookSearchQuery('');
                    updateURL(book, '1');
                  }}
                  className={`p-2 text-sm rounded-lg border transition-colors text-left ${
                    selectedBook === book
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chapter</label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => {
                    onChapterChange(chapter);
                    onMobileNavToggle();
                    updateURL(undefined, chapter);
                  }}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    selectedChapter === chapter
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
