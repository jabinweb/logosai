'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ReadHeader, 
  MobileNavigation, 
  MobileNavModal, 
  ChapterContent, 
  ReadingSettings, 
  SearchResultsPanel 
} from '@/components/read';

interface BibleVersion {
  id: string;
  name: string;
  language: string;
  description?: string;
}

interface BookData {
  id: number;
  book_hindi: string;
  book_english: string;
  abbreviations: string[];
}

interface BibleData {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
}

export default function ReadBible() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Bible...</p>
        </div>
      </div>
    }>
      <ReadBibleContent />
    </Suspense>
  );
}

function ReadBibleContent() {
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('ESV');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState('1');
  const [bibleData, setBibleData] = useState<BibleData | null>(null);
  const [booksData, setBooksData] = useState<BookData[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{book: string, chapter: string, verse: string, text: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchScope, setSearchScope] = useState<'current' | 'all'>('current');
  
  // State for verse highlighting from URL
  const [highlightedVerse, setHighlightedVerse] = useState<string | null>(null);
  
  // Reading customization states
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xl'>('medium');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono' | 'eczar'>('serif');
  const [lineHeight, setLineHeight] = useState<'compact' | 'normal' | 'relaxed' | 'loose'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  
  // Mobile-specific states
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  // Touch gesture states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  
  // Get URL search parameters
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper function to normalize book names
  const normalizeBookName = useCallback((bookName: string): string | null => {
    // Decode URL-encoded book name but preserve case for initial matching
    const decodedInput = decodeURIComponent(bookName).trim();
    const lowerInput = decodedInput.toLowerCase();
    
    // If we have books data loaded, use it for normalization
    if (booksData.length > 0) {
      // For IBP version, check Hindi names first
      if (selectedVersion === 'IBP') {
        // Check if input matches a Hindi name (exact match)
        const hindiBookMatch = booksData.find(book => 
          book.book_hindi.toLowerCase() === lowerInput
        );
        if (hindiBookMatch) return hindiBookMatch.book_english;
        
        // Check partial match in Hindi names
        const hindiPartialMatch = booksData.find(book => 
          book.book_hindi.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(book.book_hindi.toLowerCase())
        );
        if (hindiPartialMatch) return hindiPartialMatch.book_english;
      }
      
      // Check English names (exact match - case insensitive)
      const exactEnglishMatch = booksData.find(book => 
        book.book_english.toLowerCase() === lowerInput
      );
      if (exactEnglishMatch) return exactEnglishMatch.book_english;
      
      // Check partial match in English names
      const partialEnglishMatch = booksData.find(book => 
        book.book_english.toLowerCase().includes(lowerInput) ||
        lowerInput.includes(book.book_english.toLowerCase())
      );
      if (partialEnglishMatch) return partialEnglishMatch.book_english;
      
      // Check abbreviations from books.json
      const abbreviationMatch = booksData.find(book => 
        book.abbreviations && book.abbreviations.some(abbr => 
          abbr.toLowerCase() === lowerInput
        )
      );
      if (abbreviationMatch) return abbreviationMatch.book_english;
    }
    
    // Fallback: If we have Bible data loaded, check against actual book names
    if (books.length > 0) {
      // Try exact match (case insensitive)
      const exactMatch = books.find(book => 
        book.toLowerCase() === lowerInput
      );
      if (exactMatch) return exactMatch;
      
      // Try partial match
      const partialMatch = books.find(book => 
        book.toLowerCase().includes(lowerInput) ||
        lowerInput.includes(book.toLowerCase())
      );
      if (partialMatch) return partialMatch;
    }
    
    // Default case: return the input with proper casing if no match found
    return decodedInput;
  }, [books, booksData, selectedVersion]);

  // Function to update URL with current state
  const updateURL = (book?: string, chapter?: string, verse?: string, version?: string) => {
    const params = new URLSearchParams();
    
    params.set('book', book || selectedBook);
    params.set('chapter', chapter || selectedChapter);
    params.set('version', version || selectedVersion);
    
    if (verse) {
      params.set('verse', verse);
    }
    
    // Update URL without causing page reload
    const newURL = `/read?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // Navigation functions for mobile
  const navigateChapter = (direction: 'prev' | 'next') => {
    const currentChapterNum = parseInt(selectedChapter);
    if (direction === 'prev' && currentChapterNum > 1) {
      const newChapter = (currentChapterNum - 1).toString();
      setSelectedChapter(newChapter);
      updateURL(undefined, newChapter);
    } else if (direction === 'next' && currentChapterNum < chapters.length) {
      const newChapter = (currentChapterNum + 1).toString();
      setSelectedChapter(newChapter);
      updateURL(undefined, newChapter);
    }
  };

  const canNavigatePrevChapter = () => {
    return parseInt(selectedChapter) > 1;
  };

  const canNavigateNextChapter = () => {
    return parseInt(selectedChapter) < chapters.length;
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Otherwise the swipe is fired even with usual touch events
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart.x - touchEnd.x;
    const verticalDistance = Math.abs(touchStart.y - touchEnd.y);
    const timeDiff = touchEnd.time - touchStart.time;
    
    // Only trigger swipe if:
    // 1. Horizontal distance is greater than 50px
    // 2. Vertical distance is less than 100px (to avoid interfering with scrolling)
    // 3. Swipe was completed within 300ms
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const isValidSwipe = verticalDistance < 100 && timeDiff < 300;
    
    if (isValidSwipe) {
      if (isLeftSwipe && canNavigateNextChapter()) {
        navigateChapter('next');
      } else if (isRightSwipe && canNavigatePrevChapter()) {
        navigateChapter('prev');
      }
    }
  };

  // Handle URL query parameters - run after versions are loaded
  useEffect(() => {
    // Only run if bibleVersions are loaded
    if (bibleVersions.length === 0) return;
    
    const urlBook = searchParams.get('book');
    const urlChapter = searchParams.get('chapter');
    const urlVerse = searchParams.get('verse');
    const urlVersion = searchParams.get('version');

    console.log('Processing URL params:', { urlBook, urlChapter, urlVerse, urlVersion });

    // Set version from URL if provided and valid
    if (urlVersion && bibleVersions.some(v => v.id === urlVersion)) {
      setSelectedVersion(urlVersion);
      console.log('Set version from URL:', urlVersion);
    }

    // Set book from URL if provided
    if (urlBook) {
      // Normalize book name (handle variations like "Psalm" vs "Psalms")
      const normalizedBook = normalizeBookName(urlBook);
      if (normalizedBook) {
        setSelectedBook(normalizedBook);
        console.log('Set book from URL:', normalizedBook);
      }
    }

    // Set chapter from URL if provided
    if (urlChapter && !isNaN(parseInt(urlChapter))) {
      setSelectedChapter(urlChapter);
      console.log('Set chapter from URL:', urlChapter);
    }

    // Set verse to highlight from URL if provided
    if (urlVerse && !isNaN(parseInt(urlVerse))) {
      setHighlightedVerse(urlVerse);
      console.log('Set highlighted verse from URL:', urlVerse);
    } else {
      setHighlightedVerse(null);
    }
  }, [searchParams, bibleVersions, normalizeBookName]);

  // Load Bible versions
  useEffect(() => {
    const versions: BibleVersion[] = [
      {
        id: 'ESV',
        name: 'English Standard Version',
        language: 'English',
        description: 'English Standard Version - A literal translation emphasizing word-for-word accuracy'
      },
      {
        id: 'NIV',
        name: 'New International Version',
        language: 'English',
        description: 'New International Version - A thought-for-thought translation for modern readers'
      },
      {
        id: 'IBP',
        name: 'Indian Bible Publishers',
        language: 'Hindi',
        description: 'Indian Bible in Hindi - हिंदी में बाइबल'
      }
    ];
    setBibleVersions(versions);
  }, []);

  // Auto-select Eczar font for Hindi Bible (IBP version)
  useEffect(() => {
    if (selectedVersion === 'IBP') {
      setFontFamily('eczar');
    } else if (fontFamily === 'eczar') {
      // Reset to serif when switching away from IBP
      setFontFamily('serif');
    }
  }, [selectedVersion, fontFamily]);

  // Load books data
  useEffect(() => {
    const loadBooksData = async () => {
      try {
        const response = await fetch('/books.json');
        if (response.ok) {
          const data: BookData[] = await response.json();
          setBooksData(data);
        }
      } catch (error) {
        console.error('Failed to load books data:', error);
      }
    };
    loadBooksData();
  }, []);

  // Function to get display name for a book based on selected version
  const getBookDisplayName = useCallback((englishBookName: string): string => {
    if (selectedVersion === 'IBP' && booksData.length > 0) {
      const bookInfo = booksData.find(book => book.book_english === englishBookName);
      return bookInfo ? bookInfo.book_hindi : englishBookName;
    }
    return englishBookName;
  }, [selectedVersion, booksData]);

  // Function to convert display name back to English book name
  const getEnglishBookName = useCallback((displayName: string): string => {
    if (selectedVersion === 'IBP' && booksData.length > 0) {
      const bookInfo = booksData.find(book => book.book_hindi === displayName);
      return bookInfo ? bookInfo.book_english : displayName;
    }
    return displayName;
  }, [selectedVersion, booksData]);

  // Function to handle book selection with proper conversion
  const handleBookSelection = useCallback((displayBookName: string) => {
    const englishBookName = getEnglishBookName(displayBookName);
    setSelectedBook(englishBookName);
  }, [getEnglishBookName]);

  // Load Bible data when version changes
  useEffect(() => {
    const loadBibleData = async () => {
      try {
        setIsLoading(true);
        console.log(`🔄 Loading ${selectedVersion} Bible data...`);
        
        const response = await fetch(`/bibles/${selectedVersion}_bible.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${selectedVersion} Bible`);
        }

        const data: BibleData = await response.json();
        setBibleData(data);
        
        // Extract books from the data
        const bookList = Object.keys(data);
        setBooks(bookList);
        
        // Set default book if current selection doesn't exist in this version
        if (!bookList.includes(selectedBook)) {
          console.log(`📖 Book "${selectedBook}" not found in ${selectedVersion}, setting to ${bookList[0] || 'Genesis'}`);
          setSelectedBook(bookList[0] || 'Genesis');
        }
        
        console.log(`✅ Loaded ${selectedVersion} Bible with ${bookList.length} books`);
      } catch (error) {
        console.error('Error loading Bible data:', error);
        setBibleData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if we have a selected version
    if (selectedVersion) {
      loadBibleData();
    }
  }, [selectedVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate and update book selection when Bible data changes
  useEffect(() => {
    if (bibleData && books.length > 0 && selectedBook) {
      // Check if the current book exists in the loaded Bible data
      if (!books.includes(selectedBook)) {
        console.log(`📖 Book "${selectedBook}" not found in loaded Bible data, setting to ${books[0] || 'Genesis'}`);
        setSelectedBook(books[0] || 'Genesis');
      }
    }
  }, [bibleData, books, selectedBook]);

  // Update chapters when book changes
  useEffect(() => {
    if (bibleData && selectedBook && bibleData[selectedBook]) {
      const chapterList = Object.keys(bibleData[selectedBook]).sort((a, b) => parseInt(a) - parseInt(b));
      setChapters(chapterList);
      
      // Set default chapter if current selection doesn't exist
      if (!chapterList.includes(selectedChapter)) {
        setSelectedChapter(chapterList[0] || '1');
      }
    }
  }, [bibleData, selectedBook, selectedChapter]);

  // Handle verse highlighting and scrolling after data loads
  useEffect(() => {
    if (highlightedVerse && !isLoading && bibleData) {
      // Wait a bit for the DOM to update
      const scrollToVerse = () => {
        const verseElement = document.getElementById(`verse-${highlightedVerse}`);
        if (verseElement) {
          // Scroll to the verse
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add highlight class
          verseElement.classList.add('verse-highlighted');
          
          // Remove highlighting after 5 seconds
          setTimeout(() => {
            if (verseElement) {
              verseElement.classList.remove('verse-highlighted');
            }
          }, 5000);
        }
      };

      // Use a longer timeout to ensure the content is fully rendered
      const timeoutId = setTimeout(scrollToVerse, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [highlightedVerse, isLoading, bibleData, selectedBook, selectedChapter]);

  // Clear highlighted verse when changing book or chapter (unless it's from URL)
  useEffect(() => {
    const urlVerse = searchParams.get('verse');
    if (!urlVerse) {
      setHighlightedVerse(null);
    }
  }, [selectedBook, selectedChapter, searchParams]);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (event.target instanceof HTMLInputElement) return;
      
      if (event.key === 'ArrowLeft') {
        const currentChapterNum = parseInt(selectedChapter);
        if (currentChapterNum > 1) {
          setSelectedChapter(String(currentChapterNum - 1));
        }
      } else if (event.key === 'ArrowRight') {
        const currentChapterNum = parseInt(selectedChapter);
        const maxChapter = Math.max(...chapters.map(c => parseInt(c)));
        if (currentChapterNum < maxChapter) {
          setSelectedChapter(String(currentChapterNum + 1));
        }
      } else if (event.key === '/' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if (event.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedChapter, chapters]);

  const getCurrentChapterText = () => {
    if (!bibleData || !selectedBook || !selectedChapter || !bibleData[selectedBook]?.[selectedChapter]) {
      return null;
    }
    
    return bibleData[selectedBook][selectedChapter];
  };

  // Callback function to update verse text without page refresh
  const handleVerseUpdate = useCallback((book: string, chapter: string, verse: string, newText: string) => {
    setBibleData(prevData => {
      if (!prevData || !prevData[book] || !prevData[book][chapter]) {
        return prevData;
      }

      return {
        ...prevData,
        [book]: {
          ...prevData[book],
          [chapter]: {
            ...prevData[book][chapter],
            [verse]: newText
          }
        }
      };
    });
  }, []);

  // Debounced search function for real-time search
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    if (!bibleData) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const results: Array<{book: string, chapter: string, verse: string, text: string}> = [];
      const searchTerm = query.toLowerCase();

      if (searchScope === 'current') {
        // Search in the current book only
        const currentBookData = bibleData[selectedBook];
        if (currentBookData) {
          Object.entries(currentBookData).forEach(([chapter, verses]) => {
            Object.entries(verses as {[key: string]: string}).forEach(([verse, text]) => {
              if (text.toLowerCase().includes(searchTerm)) {
                results.push({
                  book: selectedBook,
                  chapter,
                  verse,
                  text
                });
              }
            });
          });
        }
      } else {
        // Search across all books
        Object.entries(bibleData).forEach(([book, bookData]) => {
          Object.entries(bookData).forEach(([chapter, verses]) => {
            Object.entries(verses as {[key: string]: string}).forEach(([verse, text]) => {
              if (text.toLowerCase().includes(searchTerm)) {
                results.push({
                  book,
                  chapter,
                  verse,
                  text
                });
              }
            });
          });
        });
      }

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [bibleData, searchScope, selectedBook]);

  // Debounced search trigger for real-time search
  const triggerDebouncedSearch = useCallback((query: string) => {
    // Clear existing timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }

    // Set new timeout for search
    debouncedSearchRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay
  }, [performSearch]);

  // Custom search query handler with debounced search
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    triggerDebouncedSearch(query);
  }, [triggerDebouncedSearch]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const chapterText = getCurrentChapterText();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header Component */}
      <ReadHeader
        bibleVersions={bibleVersions}
        selectedVersion={selectedVersion}
        selectedBook={getBookDisplayName(selectedBook)}
        selectedChapter={selectedChapter}
        chapters={chapters}
        searchQuery={searchQuery}
        searchScope={searchScope}
        isSearching={isSearching}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        showMobileSearch={showMobileSearch}
        onVersionChange={setSelectedVersion}
        onBookChange={handleBookSelection}
        onChapterChange={setSelectedChapter}
        onSearchQueryChange={handleSearchQueryChange}
        onSearchScopeChange={setSearchScope}
        onSearchSubmit={handleSearchSubmit}
        onSearchResultsToggle={() => setShowSearchResults(!showSearchResults)}
        onMobileSearchToggle={() => setShowMobileSearch(!showMobileSearch)}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        updateURL={updateURL}
      />

      {/* Mobile Navigation Modal */}
      <MobileNavModal
        showMobileNav={showMobileNav}
        selectedBook={getBookDisplayName(selectedBook)}
        selectedChapter={selectedChapter}
        chapters={chapters}
        onMobileNavToggle={() => setShowMobileNav(!showMobileNav)}
        onBookChange={handleBookSelection}
        onChapterChange={setSelectedChapter}
        updateURL={updateURL}
      />

      {/* Mobile Navigation Bar */}
      <MobileNavigation
        selectedBook={getBookDisplayName(selectedBook)}
        selectedChapter={selectedChapter}
        showMobileNav={showMobileNav}
        onMobileNavToggle={() => setShowMobileNav(!showMobileNav)}
        onNavigateChapter={navigateChapter}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        canNavigatePrevChapter={canNavigatePrevChapter}
        canNavigateNextChapter={canNavigateNextChapter}
      />

      {/* Reading Settings Panel */}
      <ReadingSettings
        showSettings={showSettings}
        fontSize={fontSize}
        fontFamily={fontFamily}
        lineHeight={lineHeight}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onLineHeightChange={setLineHeight}
        onSettingsToggle={() => setShowSettings(!showSettings)}
      />

      {/* Search Results Panel */}
      <SearchResultsPanel
        showSearchResults={showSearchResults}
        searchResults={searchResults}
        searchQuery={searchQuery}
        onResultClick={(result) => {
          setSelectedBook(result.book);
          setSelectedChapter(result.chapter);
          setShowSearchResults(false);
          updateURL(result.book, result.chapter, result.verse);
        }}
        onClose={() => setShowSearchResults(false)}
      />

      {/* Main Content */}
      <main className={`${showMobileSearch ? 'pt-28' : 'pt-16'} sm:pt-16 min-h-screen transition-all duration-300`}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading {getBookDisplayName(selectedBook)} {selectedChapter}...</p>
            </div>
          </div>
        ) : chapterText ? (
          <ChapterContent
            selectedBook={selectedBook}
            displayBookName={getBookDisplayName(selectedBook)}
            selectedChapter={selectedChapter}
            chapterText={chapterText}
            bibleVersions={bibleVersions}
            selectedVersion={selectedVersion}
            highlightedVerse={highlightedVerse}
            searchQuery={searchQuery}
            fontSize={fontSize}
            fontFamily={fontFamily}
            lineHeight={lineHeight}
            showMobileSearch={showMobileSearch}
            updateURL={updateURL}
            onVerseUpdate={handleVerseUpdate}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Chapter not found</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
