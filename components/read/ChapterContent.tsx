'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AudioPlayer from './AudioPlayer';

interface BibleVersion {
  id: string;
  name: string;
  language: string;
  description?: string;
}

interface ChapterContentProps {
  selectedBook: string;
  displayBookName: string;
  selectedChapter: string;
  chapterText: { [verse: string]: string };
  bibleVersions: BibleVersion[];
  selectedVersion: string;
  highlightedVerse: string | null;
  searchQuery: string;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  fontFamily: 'serif' | 'sans' | 'mono' | 'eczar';
  lineHeight: 'compact' | 'normal' | 'relaxed' | 'loose';
  showMobileSearch: boolean;
  updateURL: (book?: string, chapter?: string, verse?: string, version?: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export default function ChapterContent({
  selectedBook,
  displayBookName,
  selectedChapter,
  chapterText,
  bibleVersions,
  selectedVersion,
  highlightedVerse,
  searchQuery,
  fontSize,
  fontFamily,
  lineHeight,
  showMobileSearch,
  updateURL,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: ChapterContentProps) {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showVerseActions, setShowVerseActions] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{ number: string; text: string } | null>(null);
  const [verseActionsPosition, setVerseActionsPosition] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
  
  const { data: session } = useSession();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowVerseActions(false);
      }
    };

    if (showVerseActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVerseActions]);

  // Check bookmark status for all verses when component loads
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session?.user?.id || !chapterText) return;

      const bookmarkedSet = new Set<string>();
      
      // Check each verse
      for (const verse of Object.keys(chapterText)) {
        const reference = `${displayBookName} ${selectedChapter}:${verse}`;
        try {
          const response = await fetch(`/api/bookmarks/check?reference=${encodeURIComponent(reference)}&version=${selectedVersion}`);
          if (response.ok) {
            const { isBookmarked } = await response.json();
            if (isBookmarked) {
              bookmarkedSet.add(verse);
            }
          }
        } catch (error) {
          console.error('Failed to check bookmark status:', error);
        }
      }
      
      setBookmarkedVerses(bookmarkedSet);
    };

    checkBookmarkStatus();
  }, [session, chapterText, displayBookName, selectedChapter, selectedVersion]);

  // Verse action handlers
  const handleVerseClick = (verse: string) => {
    // Regular click still updates URL as before
    updateURL(undefined, undefined, verse);
  };

  const handleContextMenu = (verse: string, text: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setVerseActionsPosition({
      x: event.clientX,
      y: event.clientY - 10
    });
    
    setSelectedVerse({ number: verse, text });
    setShowVerseActions(true);
  };

  const handleVerseLongPress = (verse: string, text: string, event: React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setVerseActionsPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    
    setSelectedVerse({ number: verse, text });
    setShowVerseActions(true);
  };

  const handleTouchStart = (verse: string, text: string, event: React.TouchEvent) => {
    const timer = setTimeout(() => {
      handleVerseLongPress(verse, text, event);
    }, 500);
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Action handlers
  const handleBookmark = async () => {
    if (!session?.user?.id || !selectedVerse) {
      alert('Please sign in to bookmark verses');
      setShowVerseActions(false);
      return;
    }

    const reference = `${displayBookName} ${selectedChapter}:${selectedVerse.number}`;
    setBookmarkLoading(prev => new Set(prev).add(selectedVerse.number));

    try {
      const response = await fetch('/api/bookmarks/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          version: selectedVersion,
          text: selectedVerse.text,
          bookName: displayBookName,
          chapter: selectedChapter,
          verse: selectedVerse.number,
        }),
      });

      if (response.ok) {
        const { action, isBookmarked } = await response.json();
        
        // Update bookmarked verses state
        setBookmarkedVerses(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.add(selectedVerse.number);
          } else {
            newSet.delete(selectedVerse.number);
          }
          return newSet;
        });

        // Show success message
        if (action === 'added') {
          alert(`Bookmarked: ${reference}`);
        } else {
          alert(`Removed bookmark: ${reference}`);
        }
      } else {
        alert('Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      alert('Failed to toggle bookmark');
    } finally {
      setBookmarkLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedVerse.number);
        return newSet;
      });
      setShowVerseActions(false);
    }
  };

  const handleStudy = () => {
    // TODO: Implement study notes functionality
    console.log(`Study notes for: ${displayBookName} ${selectedChapter}:${selectedVerse?.number}`);
    alert(`Study notes for: ${displayBookName} ${selectedChapter}:${selectedVerse?.number}`);
    setShowVerseActions(false);
  };

  const handleShare = async () => {
    const verseRef = `${displayBookName} ${selectedChapter}:${selectedVerse?.number}`;
    const shareText = `"${selectedVerse?.text}" - ${verseRef}`;
    const shareUrl = `${window.location.origin}/read?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}&verse=${selectedVerse?.number}&version=${selectedVersion}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: verseRef,
          text: shareText,
          url: shareUrl
        });
      } catch {
        console.log('Share was cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      alert('Verse copied to clipboard!');
    }
    setShowVerseActions(false);
  };

  const handleCopy = async () => {
    const verseRef = `${displayBookName} ${selectedChapter}:${selectedVerse?.number}`;
    const copyText = `"${selectedVerse?.text}" - ${verseRef}`;
    
    try {
      await navigator.clipboard.writeText(copyText);
      alert('Verse copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      alert('Failed to copy verse');
    }
    setShowVerseActions(false);
  };

  const handleHighlight = () => {
    // TODO: Implement highlight functionality
    console.log(`Highlighted: ${displayBookName} ${selectedChapter}:${selectedVerse?.number}`);
    alert(`Highlighted: ${displayBookName} ${selectedChapter}:${selectedVerse?.number}`);
    setShowVerseActions(false);
  };

  const getFontSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'text-base';
      case 'medium':
        return 'text-lg';
      case 'large':
        return 'text-xl';
      case 'xl':
        return 'text-2xl';
      default:
        return 'text-lg';
    }
  };

  const getFontFamilyClasses = (family: string) => {
    switch (family) {
      case 'serif':
        return 'font-serif';
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      case 'eczar':
        return 'font-eczar';
      default:
        return 'font-serif';
    }
  };

  const getLineHeightClasses = (height: string) => {
    switch (height) {
      case 'compact':
        return 'leading-tight';
      case 'normal':
        return 'leading-normal';
      case 'relaxed':
        return 'leading-relaxed';
      case 'loose':
        return 'leading-loose';
      default:
        return 'leading-normal';
    }
  };

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

  // Convert chapter text to full text for audio
  const getFullChapterText = () => {
    return Object.entries(chapterText)
      .map(([, text]) => text) // Only include the text, not the verse number
      .join(' ');
  };

  return (
    <div 
      className={`max-w-4xl mx-auto px-3 sm:px-6 py-12 pb-20 sm:pb-12 ${showMobileSearch ? 'pt-5' : 'pt-5'} transition-all duration-300`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Chapter Title */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className={`text-2xl sm:text-4xl font-light mb-2 ${getFontFamilyClasses(fontFamily)}`}>
          {displayBookName} {selectedChapter}
        </h1>
        <p className="opacity-60 text-sm sm:text-base">
          {bibleVersions.find(v => v.id === selectedVersion)?.name}
        </p>
        {/* Mobile swipe hint */}
        <div className="sm:hidden mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Swipe to navigate chapters</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Audio Player Toggle */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowAudioPlayer(!showAudioPlayer)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showAudioPlayer 
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM8.5 8.7a.7.7 0 0 1 1.4 0v6.6a.7.7 0 0 1-1.4 0zm3-1.2a.7.7 0 0 1 1.4 0v9a.7.7 0 0 1-1.4 0zm3-1.5a.7.7 0 0 1 1.4 0v12a.7.7 0 0 1-1.4 0z"/>
          </svg>
          <span>{showAudioPlayer ? 'Hide Audio Player' : 'Show Audio Player'}</span>
        </button>
      </div>

      {/* Audio Player */}
      {showAudioPlayer && (
        <div className="mb-8">
          <AudioPlayer 
            text={getFullChapterText()}
            bookName={displayBookName}
            chapter={selectedChapter}
            language={selectedVersion === 'IBP' ? 'hi' : 'en'}
          />
        </div>
      )}

      {/* Bible Text */}
      <div className="space-y-6 sm:space-y-8">
        {Object.entries(chapterText).map(([verse, text]) => (
          <div 
            key={verse} 
            id={`verse-${verse}`} 
            className="group"
          >
            <div className="flex items-start space-x-3 sm:space-x-6">
              <div className="relative">
                <button
                  onClick={() => updateURL(undefined, undefined, verse)}
                  className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm font-medium flex-shrink-0 mt-1 group-hover:opacity-75 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer ${
                    highlightedVerse === verse 
                      ? 'opacity-100 text-blue-600 dark:text-blue-400' 
                      : 'opacity-50'
                  }`}
                  title={`Click to get link to ${selectedBook} ${selectedChapter}:${verse}`}
                >
                  {verse}
                </button>
                {bookmarkedVerses.has(verse) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}
              </div>
              <p 
                className={`flex-1 cursor-pointer select-none ${getFontSizeClasses(fontSize)} ${getLineHeightClasses(lineHeight)} ${getFontFamilyClasses(fontFamily)} selection:bg-blue-100 dark:selection:bg-blue-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1 transition-colors ${
                  highlightedVerse === verse ? 'border-l-2 border-blue-400 dark:border-blue-500 pl-3' : ''
                }`}
                onClick={() => handleVerseClick(verse)}
                onContextMenu={(e) => handleContextMenu(verse, text, e)}
                onTouchStart={(e) => handleTouchStart(verse, text, e)}
                onTouchEnd={handleTouchEnd}
                title="Click to link, right-click or long press for options"
              >
                {searchQuery.trim() ? highlightSearchTerm(text, searchQuery) : text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verse Actions Context Menu */}
      {showVerseActions && selectedVerse && (
        <div 
          ref={contextMenuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 py-2 min-w-48 animate-in fade-in-0 zoom-in-95"
          style={{
            left: `${verseActionsPosition.x}px`,
            top: `${verseActionsPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {displayBookName} {selectedChapter}:{selectedVerse.number}
            </p>
          </div>
          
          <button
            onClick={handleBookmark}
            disabled={selectedVerse ? bookmarkLoading.has(selectedVerse.number) : false}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
              selectedVerse && bookmarkedVerses.has(selectedVerse.number)
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${selectedVerse && bookmarkLoading.has(selectedVerse.number) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedVerse && bookmarkLoading.has(selectedVerse.number) ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg 
                className="w-4 h-4" 
                fill={selectedVerse && bookmarkedVerses.has(selectedVerse.number) ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
            <span>
              {selectedVerse && bookmarkedVerses.has(selectedVerse.number) 
                ? 'Remove Bookmark' 
                : 'Bookmark'
              }
            </span>
          </button>

          <button
            onClick={handleStudy}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Study Notes</span>
          </button>

          <button
            onClick={handleHighlight}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3" />
            </svg>
            <span>Highlight</span>
          </button>

          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Verse</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      )}
    </div>
  );
}
