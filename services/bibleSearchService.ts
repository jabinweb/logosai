import { PrismaClient } from '@prisma/client';

// Types for Bible search and AI commentary
export interface SearchResult {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

export interface AICommentary {
  explanation: string;
  keyThemes: string[];
  historicalContext?: string;
  applicationToday?: string;
  relatedVerses?: string[];
}

export interface BibleSearchResponse {
  results: SearchResult[];
  aiCommentary?: AICommentary;
}

export interface BibleSearchPaginatedResponse {
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
}

// Bible search service
export class BibleSearchService {
  private static instance: BibleSearchService;
  private prisma: PrismaClient;
  private countCache: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  
  private constructor() {
    this.prisma = new PrismaClient();
  }
  
  static getInstance(): BibleSearchService {
    if (!BibleSearchService.instance) {
      BibleSearchService.instance = new BibleSearchService();
    }
    return BibleSearchService.instance;
  }

  /**
   * Cleanup method to disconnect Prisma client
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Get cached count or fetch new one
   */
  private async getCachedCount(cacheKey: string, whereClause: { 
    versionId: number; 
    text: { contains: string; mode: 'insensitive' }; 
    book?: string 
  }): Promise<number> {
    const cached = this.countCache.get(cacheKey);
    const now = Date.now();
    
    // Return cached count if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.count;
    }
    
    // Fetch new count and cache it
    const count = await this.prisma.bibleVerse.count({ where: whereClause });
    this.countCache.set(cacheKey, { count, timestamp: now });
    
    // Clean up old cache entries
    for (const [key, value] of this.countCache.entries()) {
      if ((now - value.timestamp) >= this.CACHE_TTL) {
        this.countCache.delete(key);
      }
    }
    
    return count;
  }

  /**
   * Search for Bible verses and generate AI commentary
   */
  async searchBible(
    query: string, 
    version: string = 'ESV',
    selectedBook?: string
  ): Promise<BibleSearchResponse> {
    try {
      // First, search for verses in the Bible
      const searchResults = await this.searchVerses(query, version, selectedBook);

      return {
        results: searchResults,
      };
    } catch (error) {
      console.error('Error in Bible search:', error);
      throw new Error('Failed to search Bible. Please try again.');
    }
  }

  /**
   * Search for Bible verses with pagination
   */
  async searchBibleWithPagination(
    query: string, 
    version: string = 'ESV',
    selectedBook?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<BibleSearchPaginatedResponse> {
    try {
      // First, get the total count and paginated results
      const { results, totalCount } = await this.searchVersesWithPagination(query, version, selectedBook, page, limit);
      
      return {
        results,
        totalCount,
        hasMore: totalCount > page * limit
      };
    } catch (error) {
      console.error('Error in paginated Bible search:', error);
      throw new Error('Failed to search Bible. Please try again.');
    }
  }

  /**
   * Search for specific verses in the Bible using database
   */
  private async searchVerses(
    query: string,
    version: string,
    selectedBook?: string
  ): Promise<SearchResult[]> {
    try {
      // Get the Bible version from database
      const bibleVersion = await this.prisma.bibleVersion.findUnique({
        where: { code: version.toUpperCase() }
      });

      if (!bibleVersion) {
        throw new Error(`Bible version ${version} not found`);
      }

      const results: SearchResult[] = [];

      // Check if the query is a specific verse reference (e.g., "John 3:16")
      const verseMatch = query.match(/^(\d?\s?\w+)\s+(\d+):(\d+)$/);
      if (verseMatch) {
        const [, bookName, chapterNum, verseNum] = verseMatch;
        const normalizedBookName = await this.normalizeBookNameFromDB(bookName, bibleVersion.id);
        
        if (normalizedBookName) {
          const verse = await this.prisma.bibleVerse.findFirst({
            where: {
              versionId: bibleVersion.id,
              book: normalizedBookName,
              chapter: parseInt(chapterNum),
              verse: parseInt(verseNum)
            }
          });

          if (verse) {
            results.push({
              book: verse.book,
              chapter: verse.chapter.toString(),
              verse: verse.verse.toString(),
              text: verse.text
            });
          }
        }
        return results;
      }

      // Check if the query is a chapter reference (e.g., "John 3" or "Psalm 23")
      const chapterMatch = query.match(/^(\d?\s?\w+)\s+(\d+)$/);
      if (chapterMatch) {
        const [, bookName, chapterNum] = chapterMatch;
        const normalizedBookName = await this.normalizeBookNameFromDB(bookName, bibleVersion.id);
        
        if (normalizedBookName) {
          const verses = await this.prisma.bibleVerse.findMany({
            where: {
              versionId: bibleVersion.id,
              book: normalizedBookName,
              chapter: parseInt(chapterNum)
            },
            orderBy: { verse: 'asc' }
          });

          verses.forEach(verse => {
            results.push({
              book: verse.book,
              chapter: verse.chapter.toString(),
              verse: verse.verse.toString(),
              text: verse.text
            });
          });
        }
        return results;
      }

      // Otherwise, perform a keyword search
      const searchTerm = query.toLowerCase();
      const whereClause: {
        versionId: number;
        text: { contains: string; mode: 'insensitive' };
        book?: string;
      } = {
        versionId: bibleVersion.id,
        text: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      };

      // Add book filter if specified
      if (selectedBook) {
        const normalizedBookName = await this.normalizeBookNameFromDB(selectedBook, bibleVersion.id);
        if (normalizedBookName) {
          whereClause.book = normalizedBookName;
        }
      }

      const verses = await this.prisma.bibleVerse.findMany({
        where: whereClause,
        orderBy: [
          { book: 'asc' },
          { chapter: 'asc' },
          { verse: 'asc' }
        ],
        take: 100 // Increased limit to show more results for common terms
      });

      verses.forEach(verse => {
        results.push({
          book: verse.book,
          chapter: verse.chapter.toString(),
          verse: verse.verse.toString(),
          text: verse.text
        });
      });

      return results;
    } catch (error) {
      console.error('Error searching verses:', error);
      throw new Error('Failed to search Bible verses');
    }
  }

  /**
   * Search for specific verses in the Bible using database with pagination
   */
  private async searchVersesWithPagination(
    query: string,
    version: string,
    selectedBook?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ results: SearchResult[]; totalCount: number }> {
    const results: SearchResult[] = [];
    
    try {
      // Get the Bible version from database
      const bibleVersion = await this.prisma.bibleVersion.findUnique({
        where: { code: version.toUpperCase() }
      });

      if (!bibleVersion) {
        throw new Error(`Bible version ${version} not found`);
      }

      // Check if query looks like a verse reference (e.g., "John 3:16", "1 John 1:1")
      const versePattern = /^(\d?\s?\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i;
      const match = query.match(versePattern);
      
      if (match) {
        const [, bookName, chapterStr, startVerseStr, endVerseStr] = match;
        const chapter = parseInt(chapterStr);
        const startVerse = parseInt(startVerseStr);
        const endVerse = endVerseStr ? parseInt(endVerseStr) : startVerse;

        // Normalize the book name to match database format
        const normalizedBookName = await this.normalizeBookNameFromDB(bookName.trim(), bibleVersion.id);
        
        if (normalizedBookName) {
          const verses = await this.prisma.bibleVerse.findMany({
            where: {
              versionId: bibleVersion.id,
              book: normalizedBookName,
              chapter: chapter,
              verse: {
                gte: startVerse,
                lte: endVerse
              }
            },
            orderBy: [
              { verse: 'asc' }
            ]
          });

          verses.forEach(verse => {
            results.push({
              book: verse.book,
              chapter: verse.chapter.toString(),
              verse: verse.verse.toString(),
              text: verse.text
            });
          });
        }
        return { results, totalCount: results.length };
      }

      // Otherwise, perform a keyword search with pagination
      const searchTerm = query.toLowerCase().trim();
      
      // Build the base where clause
      const whereClause: {
        versionId: number;
        text: { contains: string; mode: 'insensitive' };
        book?: string;
      } = {
        versionId: bibleVersion.id,
        text: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      };

      // Add book filter if specified
      if (selectedBook) {
        const normalizedBookName = await this.normalizeBookNameFromDB(selectedBook, bibleVersion.id);
        if (normalizedBookName) {
          whereClause.book = normalizedBookName;
        }
      }

      // For the first page, we can get both count and results efficiently
      // For subsequent pages, we can skip the count query to improve performance
      let totalCount: number;
      
      if (page === 1) {
        // Create cache key for this search
        const cacheKey = `${bibleVersion.id}_${searchTerm}_${selectedBook || 'all'}`;
        totalCount = await this.getCachedCount(cacheKey, whereClause);
      } else {
        // For subsequent pages, we'll estimate or use a cached count
        // For now, set to a high number to indicate more results exist
        totalCount = 9999; // Will be replaced by actual count from first page
      }

      // Get paginated results with optimized query
      const offset = (page - 1) * limit;
      const verses = await this.prisma.bibleVerse.findMany({
        where: whereClause,
        select: {
          book: true,
          chapter: true,
          verse: true,
          text: true
        },
        orderBy: [
          { book: 'asc' },
          { chapter: 'asc' },
          { verse: 'asc' }
        ],
        skip: offset,
        take: limit
      });

      verses.forEach(verse => {
        results.push({
          book: verse.book,
          chapter: verse.chapter.toString(),
          verse: verse.verse.toString(),
          text: verse.text
        });
      });

      return { results, totalCount };
    } catch (error) {
      console.error('Error searching verses with pagination:', error);
      throw new Error('Failed to search Bible verses');
    }
  }

  
  /**
   * Normalize book names using database book names
   */
  private async normalizeBookNameFromDB(bookName: string, versionId: number): Promise<string | null> {
    const inputName = bookName.toLowerCase().trim();
    
    // Get all distinct book names from the database for this version
    const books = await this.prisma.bibleVerse.findMany({
      where: { versionId },
      distinct: ['book'],
      select: { book: true }
    });
    
    const bookNames = books.map(b => b.book);
    
    // Try exact match first
    const exactMatch = bookNames.find(name => name.toLowerCase() === inputName);
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = bookNames.find(name => 
      name.toLowerCase().includes(inputName) || inputName.includes(name.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Common abbreviations
    const abbreviations: Record<string, string> = {
      'gen': 'Genesis',
      'ex': 'Exodus',
      'exod': 'Exodus',
      'lev': 'Leviticus',
      'num': 'Numbers',
      'deut': 'Deuteronomy',
      'josh': 'Joshua',
      'judg': 'Judges',
      'ruth': 'Ruth',
      '1 sam': '1 Samuel',
      '2 sam': '2 Samuel',
      '1 kings': '1 Kings',
      '2 kings': '2 Kings',
      '1 chr': '1 Chronicles',
      '2 chr': '2 Chronicles',
      'ezra': 'Ezra',
      'neh': 'Nehemiah',
      'esth': 'Esther',
      'job': 'Job',
      'ps': 'Psalm',
      'psalm': 'Psalm',
      'psalms': 'Psalm',
      'prov': 'Proverbs',
      'eccl': 'Ecclesiastes',
      'song': 'Song of Solomon',
      'isa': 'Isaiah',
      'jer': 'Jeremiah',
      'lam': 'Lamentations',
      'ezek': 'Ezekiel',
      'dan': 'Daniel',
      'hos': 'Hosea',
      'joel': 'Joel',
      'amos': 'Amos',
      'obad': 'Obadiah',
      'jonah': 'Jonah',
      'mic': 'Micah',
      'nah': 'Nahum',
      'hab': 'Habakkuk',
      'zeph': 'Zephaniah',
      'hag': 'Haggai',
      'zech': 'Zechariah',
      'mal': 'Malachi',
      'matt': 'Matthew',
      'mt': 'Matthew',
      'mark': 'Mark',
      'mk': 'Mark',
      'luke': 'Luke',
      'lk': 'Luke',
      'john': 'John',
      'jn': 'John',
      'acts': 'Acts',
      'rom': 'Romans',
      '1 cor': '1 Corinthians',
      '2 cor': '2 Corinthians',
      'gal': 'Galatians',
      'eph': 'Ephesians',
      'phil': 'Philippians',
      'col': 'Colossians',
      '1 thess': '1 Thessalonians',
      '2 thess': '2 Thessalonians',
      '1 tim': '1 Timothy',
      '2 tim': '2 Timothy',
      'titus': 'Titus',
      'philem': 'Philemon',
      'heb': 'Hebrews',
      'james': 'James',
      'jas': 'James',
      '1 pet': '1 Peter',
      '2 pet': '2 Peter',
      '1 john': '1 John',
      '2 john': '2 John',
      '3 john': '3 John',
      'jude': 'Jude',
      'rev': 'Revelation'
    };
    
    const abbreviatedName = abbreviations[inputName];
    if (abbreviatedName) {
      return bookNames.find(name => name.toLowerCase() === abbreviatedName.toLowerCase()) || null;
    }
    
    return null;
  }

  /**
   * Normalize book names to match the JSON structure (legacy method, kept for compatibility)
   */
  private normalizeBookName(bookName: string, bibleData: Record<string, unknown>): string | null {
    const inputName = bookName.toLowerCase().trim();
    const bookNames = Object.keys(bibleData);
    
    // Try exact match first
    const exactMatch = bookNames.find(name => name.toLowerCase() === inputName);
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = bookNames.find(name => 
      name.toLowerCase().includes(inputName) || inputName.includes(name.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Common abbreviations
    const abbreviations: Record<string, string> = {
      'gen': 'Genesis',
      'ex': 'Exodus',
      'lev': 'Leviticus',
      'num': 'Numbers',
      'deut': 'Deuteronomy',
      'josh': 'Joshua',
      'judg': 'Judges',
      'ruth': 'Ruth',
      '1 sam': '1 Samuel',
      '2 sam': '2 Samuel',
      '1 kings': '1 Kings',
      '2 kings': '2 Kings',
      'ps': 'Psalms',
      'prov': 'Proverbs',
      'eccl': 'Ecclesiastes',
      'song': 'Song of Solomon',
      'isa': 'Isaiah',
      'jer': 'Jeremiah',
      'lam': 'Lamentations',
      'ezek': 'Ezekiel',
      'dan': 'Daniel',
      'hos': 'Hosea',
      'joel': 'Joel',
      'amos': 'Amos',
      'obad': 'Obadiah',
      'jonah': 'Jonah',
      'mic': 'Micah',
      'nah': 'Nahum',
      'hab': 'Habakkuk',
      'zeph': 'Zephaniah',
      'hag': 'Haggai',
      'zech': 'Zechariah',
      'mal': 'Malachi',
      'matt': 'Matthew',
      'mark': 'Mark',
      'luke': 'Luke',
      'john': 'John',
      'acts': 'Acts',
      'rom': 'Romans',
      '1 cor': '1 Corinthians',
      '2 cor': '2 Corinthians',
      'gal': 'Galatians',
      'eph': 'Ephesians',
      'phil': 'Philippians',
      'col': 'Colossians',
      '1 thess': '1 Thessalonians',
      '2 thess': '2 Thessalonians',
      '1 tim': '1 Timothy',
      '2 tim': '2 Timothy',
      'titus': 'Titus',
      'philem': 'Philemon',
      'heb': 'Hebrews',
      'james': 'James',
      '1 pet': '1 Peter',
      '2 pet': '2 Peter',
      '1 john': '1 John',
      '2 john': '2 John',
      '3 john': '3 John',
      'jude': 'Jude',
      'rev': 'Revelation'
    };
    
    const abbreviatedName = abbreviations[inputName];
    if (abbreviatedName) {
      return bookNames.find(name => name.toLowerCase() === abbreviatedName.toLowerCase()) || null;
    }
    
    return null;
  }
}
