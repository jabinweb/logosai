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

// Bible search service
export class BibleSearchService {
  private static instance: BibleSearchService;
  
  static getInstance(): BibleSearchService {
    if (!BibleSearchService.instance) {
      BibleSearchService.instance = new BibleSearchService();
    }
    return BibleSearchService.instance;
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
      
      // If we found verses, generate AI commentary
      let aiCommentary: AICommentary | undefined;
      if (searchResults.length > 0) {
        aiCommentary = await this.generateAICommentary(query, searchResults, version);
      }

      return {
        results: searchResults,
        aiCommentary
      };
    } catch (error) {
      console.error('Error in Bible search:', error);
      throw new Error('Failed to search Bible. Please try again.');
    }
  }

  /**
   * Search for specific verses in the Bible
   */
  private async searchVerses(
    query: string,
    version: string,
    selectedBook?: string
  ): Promise<SearchResult[]> {
    try {
      // Load the Bible data from local JSON files
      const response = await fetch(`/bibles/${version}_bible.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${version} Bible`);
      }
      
      const bibleData = await response.json();
      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase();

      // Check if the query is a specific verse reference (e.g., "John 3:16")
      const verseMatch = query.match(/^(\d?\s?\w+)\s+(\d+):(\d+)$/);
      if (verseMatch) {
        const [, bookName, chapter, verse] = verseMatch;
        const normalizedBookName = this.normalizeBookName(bookName, bibleData);
        
        if (normalizedBookName && bibleData[normalizedBookName]?.[chapter]?.[verse]) {
          results.push({
            book: normalizedBookName,
            chapter,
            verse,
            text: bibleData[normalizedBookName][chapter][verse]
          });
        }
        return results;
      }

      // Check if the query is a chapter reference (e.g., "John 3" or "Psalm 23")
      const chapterMatch = query.match(/^(\d?\s?\w+)\s+(\d+)$/);
      if (chapterMatch) {
        const [, bookName, chapter] = chapterMatch;
        const normalizedBookName = this.normalizeBookName(bookName, bibleData);
        
        if (normalizedBookName && bibleData[normalizedBookName]?.[chapter]) {
          const verses = bibleData[normalizedBookName][chapter];
          Object.entries(verses).forEach(([verse, text]) => {
            results.push({
              book: normalizedBookName,
              chapter,
              verse,
              text: text as string
            });
          });
        }
        return results;
      }

      // Otherwise, perform a keyword search
      const booksToSearch = selectedBook ? [selectedBook] : Object.keys(bibleData);
      
      for (const book of booksToSearch) {
        const bookData = bibleData[book];
        if (!bookData) continue;

        for (const [chapter, verses] of Object.entries(bookData)) {
          for (const [verse, text] of Object.entries(verses as Record<string, string>)) {
            if (text.toLowerCase().includes(searchTerm)) {
              results.push({
                book,
                chapter,
                verse,
                text
              });
            }
          }
        }
      }

      // Limit results to prevent overwhelming the user
      return results.slice(0, 20);
    } catch (error) {
      console.error('Error searching verses:', error);
      throw new Error('Failed to search Bible verses');
    }
  }

  /**
   * Generate AI commentary using Gemini AI
   */
  private async generateAICommentary(
    query: string,
    searchResults: SearchResult[],
    version: string
  ): Promise<AICommentary> {
    try {
      // For now, we'll return a placeholder commentary
      // In a real implementation, you would call the Gemini AI API here
      
      // This is where you would make the actual AI API call
      // const aiResponse = await this.callGeminiAPI(query, versesText, version);
      
      // For demonstration, return a mock response
      return this.generateMockCommentary(query, searchResults);
    } catch (error) {
      console.error('Error generating AI commentary:', error);
      // Return a basic commentary even if AI fails
      return {
        explanation: `The search for "${query}" returned ${searchResults.length} verse${searchResults.length === 1 ? '' : 's'} from the ${version} Bible. These passages contain important spiritual insights that can guide our faith and understanding.`,
        keyThemes: this.extractThemes(query, searchResults),
      };
    }
  }

  /**
   * Generate mock commentary for demonstration
   */
  private generateMockCommentary(query: string, searchResults: SearchResult[]): AICommentary {
    const themes = this.extractThemes(query, searchResults);
    
    return {
      explanation: `The search for "${query}" reveals profound spiritual truths found across ${searchResults.length} verse${searchResults.length === 1 ? '' : 's'}. These passages work together to illuminate God's character and His relationship with humanity, offering both timeless wisdom and practical guidance for daily living.`,
      keyThemes: themes,
      historicalContext: `These verses were written in various historical contexts, from ancient Israel's covenant relationship with God to the early Christian church's formation. Understanding the original audience and circumstances helps us better appreciate the depth and relevance of these teachings.`,
      applicationToday: `These scriptures remain deeply relevant for modern believers. They offer guidance for navigating life's challenges, understanding God's love and grace, and living out our faith in practical ways. The principles found here can be applied to relationships, decision-making, and spiritual growth.`,
      relatedVerses: this.suggestRelatedVerses(query, themes)
    };
  }

  /**
   * Extract themes from query and search results
   */
  private extractThemes(query: string, searchResults: SearchResult[]): string[] {
    const themes: string[] = [];
    const queryLower = query.toLowerCase();
    const allText = searchResults.map(r => r.text.toLowerCase()).join(' ');

    // Common biblical themes mapping
    const themeMapping: Record<string, string[]> = {
      'love': ['Love', 'Compassion', 'Grace'],
      'faith': ['Faith', 'Trust', 'Belief'],
      'hope': ['Hope', 'Promise', 'Future'],
      'peace': ['Peace', 'Rest', 'Comfort'],
      'salvation': ['Salvation', 'Redemption', 'Forgiveness'],
      'prayer': ['Prayer', 'Communication with God', 'Worship'],
      'wisdom': ['Wisdom', 'Understanding', 'Knowledge'],
      'strength': ['Strength', 'Power', 'Courage'],
      'joy': ['Joy', 'Celebration', 'Blessing'],
      'forgiveness': ['Forgiveness', 'Mercy', 'Grace']
    };

    // Check query for themes
    Object.entries(themeMapping).forEach(([key, values]) => {
      if (queryLower.includes(key)) {
        themes.push(...values);
      }
    });

    // Check text content for themes
    if (allText.includes('love') || allText.includes('beloved')) themes.push('Love');
    if (allText.includes('faith') || allText.includes('believe')) themes.push('Faith');
    if (allText.includes('hope')) themes.push('Hope');
    if (allText.includes('peace')) themes.push('Peace');
    if (allText.includes('salvation') || allText.includes('saved')) themes.push('Salvation');
    if (allText.includes('forgive') || allText.includes('mercy')) themes.push('Forgiveness');
    if (allText.includes('wisdom') || allText.includes('wise')) themes.push('Wisdom');

    // Remove duplicates and limit to 5 themes
    return [...new Set(themes)].slice(0, 5);
  }

  /**
   * Suggest related verses based on themes
   */
  private suggestRelatedVerses(query: string, themes: string[]): string[] {
    const relatedVerses: Record<string, string[]> = {
      'Love': ['1 John 4:8', '1 Corinthians 13:4', 'Romans 8:38'],
      'Faith': ['Hebrews 11:1', 'Romans 10:17', 'Mark 11:24'],
      'Hope': ['Romans 15:13', 'Jeremiah 29:11', '1 Peter 1:3'],
      'Peace': ['Philippians 4:7', 'Isaiah 26:3', 'John 14:27'],
      'Salvation': ['Romans 10:9', 'Ephesians 2:8', 'Acts 4:12'],
      'Forgiveness': ['1 John 1:9', 'Ephesians 4:32', 'Matthew 6:14'],
      'Wisdom': ['Proverbs 3:5', 'James 1:5', 'Proverbs 9:10']
    };

    const suggestions: string[] = [];
    themes.forEach(theme => {
      if (relatedVerses[theme]) {
        suggestions.push(...relatedVerses[theme]);
      }
    });

    // Add some general popular verses if no specific themes found
    if (suggestions.length === 0) {
      suggestions.push('John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Psalm 23:1');
    }

    return [...new Set(suggestions)].slice(0, 6);
  }

  /**
   * Normalize book names to match the JSON structure
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
