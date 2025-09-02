'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// Remove BibleSearchService import as we'll use API instead
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
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
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

  // Load Bible versions from database
  useEffect(() => {
    const loadBibleVersions = async () => {
      try {
        const response = await fetch('/api/bible/versions');
        if (response.ok) {
          const versions: BibleVersion[] = await response.json();
          setBibleVersions(versions);
        } else {
          // Fallback to hardcoded versions if API fails
          const fallbackVersions: BibleVersion[] = [
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
          setBibleVersions(fallbackVersions);
        }
      } catch (error) {
        console.error('Failed to load Bible versions:', error);
        // Use fallback versions on error
        const fallbackVersions: BibleVersion[] = [
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
        setBibleVersions(fallbackVersions);
      }
    };
    
    loadBibleVersions();
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
        
        // Clear cached Bible data when version changes
        setBibleData(null);
        
        // First, get the list of books for this version
        const booksResponse = await fetch(`/api/bible/${selectedVersion}/books`);
        if (!booksResponse.ok) {
          throw new Error(`Failed to load books for ${selectedVersion} Bible`);
        }
        
        const bookList: string[] = await booksResponse.json();
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
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if we have a selected version
    if (selectedVersion) {
      loadBibleData();
    }
  }, [selectedVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load chapters when version or book changes
  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedVersion || !selectedBook) return;
      
      try {
        const chaptersResponse = await fetch(`/api/bible/${selectedVersion}/${encodeURIComponent(selectedBook)}/chapters`);
        if (!chaptersResponse.ok) {
          throw new Error(`Failed to load chapters for ${selectedBook}`);
        }
        
        const chapterList: string[] = await chaptersResponse.json();
        setChapters(chapterList);
      } catch (error) {
        console.error(`Error loading chapters for ${selectedBook}:`, error);
        setChapters([]);
      }
    };

    loadChapters();
  }, [selectedVersion, selectedBook]);

  // Validate and set default chapter when chapters list changes
  useEffect(() => {
    if (chapters.length > 0 && !chapters.includes(selectedChapter)) {
      setSelectedChapter(chapters[0] || '1');
    }
  }, [chapters, selectedChapter]);

  // Load specific chapter data when chapter changes - use ref to prevent infinite loops
  const loadingRef = useRef<string | null>(null);
  
  useEffect(() => {
    const loadChapterData = async () => {
      if (!selectedVersion || !selectedBook || !selectedChapter) return;
      
      const chapterKey = `${selectedVersion}-${selectedBook}-${selectedChapter}`;
      
      // Prevent duplicate requests
      if (loadingRef.current === chapterKey) return;
      
      // Check if chapter is already loaded
      if (bibleData?.[selectedBook]?.[selectedChapter]) {
        return;
      }
      
      loadingRef.current = chapterKey;
      
      try {
        const chapterResponse = await fetch(`/api/bible/${selectedVersion}/${encodeURIComponent(selectedBook)}/${selectedChapter}`);
        if (!chapterResponse.ok) {
          throw new Error(`Failed to load chapter ${selectedChapter} of ${selectedBook}`);
        }
        
        const chapterVerses = await chapterResponse.json();
        
        // Update the Bible data structure to include this chapter
        setBibleData(prevData => ({
          ...prevData,
          [selectedBook]: {
            ...prevData?.[selectedBook],
            [selectedChapter]: chapterVerses
          }
        }));
        
      } catch (error) {
        console.error(`Error loading chapter ${selectedChapter} of ${selectedBook}:`, error);
      } finally {
        loadingRef.current = null;
      }
    };

    loadChapterData();
  }, [selectedVersion, selectedBook, selectedChapter, bibleData]);

  // Preload adjacent chapters - use separate tracking to prevent infinite loops
  const preloadingRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const preloadAdjacentChapters = async () => {
      if (!selectedVersion || !selectedBook || !chapters.length || !selectedChapter) return;

      const currentChapterNum = parseInt(selectedChapter);
      const prevChapter = (currentChapterNum - 1).toString();
      const nextChapter = (currentChapterNum + 1).toString();

      // Preload previous chapter if it exists and not already loaded
      if (chapters.includes(prevChapter) && !bibleData?.[selectedBook]?.[prevChapter]) {
        const prevKey = `${selectedVersion}-${selectedBook}-${prevChapter}`;
        if (!preloadingRef.current.has(prevKey)) {
          preloadingRef.current.add(prevKey);
          
          try {
            const prevResponse = await fetch(`/api/bible/${selectedVersion}/${encodeURIComponent(selectedBook)}/${prevChapter}`);
            if (prevResponse.ok) {
              const prevVerses = await prevResponse.json();
              setBibleData(prevData => ({
                ...prevData,
                [selectedBook]: {
                  ...prevData?.[selectedBook],
                  [prevChapter]: prevVerses
                }
              }));
            }
          } catch {
            // Silently fail for preloading
            console.log(`Preload failed for ${selectedBook} ${prevChapter}`);
          } finally {
            preloadingRef.current.delete(prevKey);
          }
        }
      }

      // Preload next chapter if it exists and not already loaded
      if (chapters.includes(nextChapter) && !bibleData?.[selectedBook]?.[nextChapter]) {
        const nextKey = `${selectedVersion}-${selectedBook}-${nextChapter}`;
        if (!preloadingRef.current.has(nextKey)) {
          preloadingRef.current.add(nextKey);
          
          try {
            const nextResponse = await fetch(`/api/bible/${selectedVersion}/${encodeURIComponent(selectedBook)}/${nextChapter}`);
            if (nextResponse.ok) {
              const nextVerses = await nextResponse.json();
              setBibleData(prevData => ({
                ...prevData,
                [selectedBook]: {
                  ...prevData?.[selectedBook],
                  [nextChapter]: nextVerses
                }
              }));
            }
          } catch {
            // Silently fail for preloading
            console.log(`Preload failed for ${selectedBook} ${nextChapter}`);
          } finally {
            preloadingRef.current.delete(nextKey);
          }
        }
      }
    };

    // Extract the complex expression to a variable
    const isChapterLoaded = Boolean(bibleData?.[selectedBook]?.[selectedChapter]);
    
    // Only preload after the main chapter is loaded
    if (isChapterLoaded) {
      preloadAdjacentChapters();
    }
  }, [selectedVersion, selectedBook, selectedChapter, chapters, bibleData]);

  // Update chapters when book changes - removed since now handled above
  // Update chapters when book changes - removed since now handled above

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
    if (!selectedBook || !selectedChapter) {
      return null;
    }
    
    // Check if we have the chapter data loaded
    if (bibleData?.[selectedBook]?.[selectedChapter]) {
      return bibleData[selectedBook][selectedChapter];
    }
    
    // Return null if not loaded yet (will show loading state)
    return null;
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

  const performSearch = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchTotalCount(0);
      setSearchCurrentPage(1);
      setSearchHasMore(false);
      return;
    }

    // Prevent very short searches that could be slow (except verse references)
    const isVerseReference = /^\d?\s?\w+\s+\d+:\d+/.test(query.trim());
    if (!isVerseReference && query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchTotalCount(0);
      setSearchCurrentPage(1);
      setSearchHasMore(false);
      return;
    }

    if (page === 1) {
      setIsSearching(true);
      setSearchResults([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Build search API URL with parameters
      const searchParams = new URLSearchParams({
        q: query.trim(),
        version: selectedVersion,
        page: page.toString(),
        limit: '20'
      });
      
      // Add book parameter if searching current book only
      if (searchScope === 'current') {
        searchParams.append('book', selectedBook);
      }
      
      // For subsequent pages, pass the known total count to avoid recalculating
      if (page > 1 && searchTotalCount > 0) {
        searchParams.append('totalCount', searchTotalCount.toString());
      }
      
      // Call the search API
      const response = await fetch(`/api/bible/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the search results
      if (append && page > 1) {
        setSearchResults(prev => [...prev, ...(data.results || [])]);
      } else {
        setSearchResults(data.results || []);
      }
      
      setSearchTotalCount(data.totalCount || 0);
      setSearchCurrentPage(page);
      setSearchHasMore(data.hasMore || false);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(true);
      setSearchTotalCount(0);
      setSearchHasMore(false);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [selectedVersion, selectedBook, searchScope, searchTotalCount]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (!searchQuery.trim() || !searchHasMore || isLoadingMore) return;
    
    const nextPage = searchCurrentPage + 1;
    await performSearch(searchQuery, nextPage, true);
  }, [searchQuery, searchHasMore, searchCurrentPage, isLoadingMore, performSearch]);

  // Debounced search trigger for real-time search
  const triggerDebouncedSearch = useCallback((query: string) => {
    // Clear existing timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }

    // For short queries or verse references, search immediately
    // For longer queries, use shorter debounce to feel more responsive
    const isVerseReference = /^\d?\s?\w+\s+\d+:\d+/.test(query.trim());
    const delay = isVerseReference || query.trim().length <= 3 ? 100 : 200; // Reduced delay

    // Set new timeout for search
    debouncedSearchRef.current = setTimeout(() => {
      performSearch(query);
    }, delay);
  }, [performSearch]);

  // Custom search query handler with debounced search
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    triggerDebouncedSearch(query);
  }, [triggerDebouncedSearch]);

  // Re-run search when search scope changes
  useEffect(() => {
    if (searchQuery.trim() && showSearchResults) {
      // Reset pagination and trigger new search
      setSearchCurrentPage(1);
      performSearch(searchQuery, 1, false);
    }
  }, [searchScope, performSearch, searchQuery, showSearchResults]);

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
        totalCount={searchTotalCount}
        hasMore={searchHasMore}
        isLoadingMore={isLoadingMore}
        onResultClick={(result) => {
          setSelectedBook(result.book);
          setSelectedChapter(result.chapter);
          setShowSearchResults(false);
          updateURL(result.book, result.chapter, result.verse);
        }}
        onClose={() => setShowSearchResults(false)}
        onLoadMore={loadMoreSearchResults}
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
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading {getBookDisplayName(selectedBook)} {selectedChapter}...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}