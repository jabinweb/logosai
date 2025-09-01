// Bible book name mappings for URL compatibility
export const BIBLE_BOOK_MAPPINGS: { [key: string]: string } = {
  // Old Testament
  'genesis': 'genesis',
  'exodus': 'exodus',
  'leviticus': 'leviticus',
  'numbers': 'numbers',
  'deuteronomy': 'deuteronomy',
  'joshua': 'joshua',
  'judges': 'judges',
  'ruth': 'ruth',
  '1 samuel': '1-samuel',
  '2 samuel': '2-samuel',
  '1 kings': '1-kings',
  '2 kings': '2-kings',
  '1 chronicles': '1-chronicles',
  '2 chronicles': '2-chronicles',
  'ezra': 'ezra',
  'nehemiah': 'nehemiah',
  'esther': 'esther',
  'job': 'job',
  'psalms': 'psalms',
  'psalm': 'psalms',
  'proverbs': 'proverbs',
  'ecclesiastes': 'ecclesiastes',
  'song of songs': 'song-of-songs',
  'song of solomon': 'song-of-songs',
  'isaiah': 'isaiah',
  'jeremiah': 'jeremiah',
  'lamentations': 'lamentations',
  'ezekiel': 'ezekiel',
  'daniel': 'daniel',
  'hosea': 'hosea',
  'joel': 'joel',
  'amos': 'amos',
  'obadiah': 'obadiah',
  'jonah': 'jonah',
  'micah': 'micah',
  'nahum': 'nahum',
  'habakkuk': 'habakkuk',
  'zephaniah': 'zephaniah',
  'haggai': 'haggai',
  'zechariah': 'zechariah',
  'malachi': 'malachi',
  // New Testament
  'matthew': 'matthew',
  'mark': 'mark',
  'luke': 'luke',
  'john': 'john',
  'acts': 'acts',
  'romans': 'romans',
  '1 corinthians': '1-corinthians',
  '2 corinthians': '2-corinthians',
  'galatians': 'galatians',
  'ephesians': 'ephesians',
  'philippians': 'philippians',
  'colossians': 'colossians',
  '1 thessalonians': '1-thessalonians',
  '2 thessalonians': '2-thessalonians',
  '1 timothy': '1-timothy',
  '2 timothy': '2-timothy',
  'titus': 'titus',
  'philemon': 'philemon',
  'hebrews': 'hebrews',
  'james': 'james',
  '1 peter': '1-peter',
  '2 peter': '2-peter',
  '1 john': '1-john',
  '2 john': '2-john',
  '3 john': '3-john',
  'jude': 'jude',
  'revelation': 'revelation'
};

// Bible book interface matching books.json structure
interface BibleBook {
  id: number;
  book_hindi: string;
  book_english: string;
  abbreviations: string[];
}

// Cache for loaded books data
let booksCache: BibleBook[] | null = null;

/**
 * Load books data asynchronously for client-side usage
 */
export async function loadBooksDataAsync(): Promise<BibleBook[]> {
  if (booksCache) {
    return booksCache;
  }
  
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/books.json');
      if (!response.ok) {
        throw new Error('Failed to load books.json');
      }
      booksCache = await response.json();
      return booksCache || [];
    } catch (error) {
      console.warn('Failed to load books.json:', error);
      return [];
    }
  }
  
  return loadBooksDataSync();
}

/**
 * Load books data synchronously for server-side usage
 */
function loadBooksDataSync(): BibleBook[] {
  if (typeof window !== 'undefined') {
    // Client-side: use cached data or return empty array (will be loaded async)
    return booksCache || [];
  }
  
  try {
    // Server-side: read file synchronously
    const fs = eval('require')('fs');
    const path = eval('require')('path');
    const filePath = path.join(process.cwd(), 'public', 'books.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const books = JSON.parse(data);
    booksCache = books; // Cache the data
    return books;
  } catch (error) {
    console.warn('Failed to load books.json synchronously:', error);
    return [];
  }
}

/**
 * Get English book name from Hindi book name using books.json
 */
function getEnglishBookName(hindiName: string): string | null {
  const books = loadBooksDataSync();
  const book = books.find(b => b.book_hindi === hindiName.trim());
  return book ? book.book_english : null;
}

/**
 * Initialize books cache (call this on app startup for better performance)
 */
export function initializeBooksCache(): void {
  if (typeof window !== 'undefined' && !booksCache) {
    loadBooksDataAsync().catch(console.warn);
  }
}

/**
 * Get all available book names (for debugging and testing)
 */
export function getAllBookNames(): { hindi: string; english: string }[] {
  const books = loadBooksDataSync();
  return books.map(book => ({
    hindi: book.book_hindi,
    english: book.book_english
  }));
}

/**
 * Converts a Bible book name to a URL-friendly slug
 */
export function normalizeBookName(bookName: string): string {
  const trimmedName = bookName.trim();
  
  // First check if it's a Hindi book name and convert to English using books.json
  const englishName = getEnglishBookName(trimmedName);
  if (englishName) {
    const englishKey = englishName.toLowerCase();
    return BIBLE_BOOK_MAPPINGS[englishKey] || englishKey.replace(/\s+/g, '-');
  }
  
  // Then check English mappings
  const bookKey = trimmedName.toLowerCase();
  return BIBLE_BOOK_MAPPINGS[bookKey] || bookKey.replace(/\s+/g, '-');
}

/**
 * Creates a URL for navigating to a specific Bible verse
 */
export function createVerseUrl(reference: string, version?: string): string {
  // Parse reference like "John 3:16" or "1 Corinthians 13:4-7"
  const regex = /^(.+?)\s+(\d+):(\d+)(?:-\d+)?$/;
  const match = reference.match(regex);
  
  if (match) {
    const [, book, chapter, verse] = match;
    const bookSlug = normalizeBookName(book);
    const params = new URLSearchParams({
      book: bookSlug,
      chapter,
      verse
    });
    
    if (version) {
      params.append('version', version);
    }
    
    return `/read?${params.toString()}`;
  }
  
  // Fallback: try to navigate to just the book and chapter
  const chapterRegex = /^(.+?)\s+(\d+)/;
  const chapterMatch = reference.match(chapterRegex);
  if (chapterMatch) {
    const [, book, chapter] = chapterMatch;
    const bookSlug = normalizeBookName(book);
    const params = new URLSearchParams({
      book: bookSlug,
      chapter
    });
    
    if (version) {
      params.append('version', version);
    }
    
    return `/read?${params.toString()}`;
  }
  
  // Last fallback: go to read page
  return '/read';
}

/**
 * Parses a Bible reference into its components
 */
export function parseReference(reference: string): {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
} | null {
  // Handle ranges like "John 3:16-17"
  const rangeMatch = reference.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, book, chapter, startVerse, endVerse] = rangeMatch;
    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verse: parseInt(startVerse),
      endVerse: parseInt(endVerse)
    };
  }
  
  // Handle single verse like "John 3:16"
  const verseMatch = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (verseMatch) {
    const [, book, chapter, verse] = verseMatch;
    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verse: parseInt(verse)
    };
  }
  
  // Handle chapter only like "John 3"
  const chapterMatch = reference.match(/^(.+?)\s+(\d+)$/);
  if (chapterMatch) {
    const [, book, chapter] = chapterMatch;
    return {
      book: book.trim(),
      chapter: parseInt(chapter)
    };
  }
  
  return null;
}
