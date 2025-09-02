export interface GeminiSearchRequest {
  query: string;
  language: 'hindi' | 'english' | 'hinglish';
  context?: string;
}

export interface GeminiResponse {
  answer: string;
  bibleVerses: Array<{
    reference: string;
    text: string;
    version: string;
  }>;
  keyThemes: string[];
  explanation: string;
}

export class GeminiAIClientService {
  private static instance: GeminiAIClientService;

  static getInstance(): GeminiAIClientService {
    if (!GeminiAIClientService.instance) {
      GeminiAIClientService.instance = new GeminiAIClientService();
    }
    return GeminiAIClientService.instance;
  }

  async searchAndAnalyze(request: GeminiSearchRequest): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error with Gemini AI client:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async detectLanguage(text: string): Promise<'hindi' | 'english' | 'hinglish'> {
    // Enhanced language detection with strict English preference
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    // Common Hindi words in Roman script - be more selective
    const hindiWordsInRoman = [
      /\b(bhagwan|ishwar|prabhu|yesu|yeshu|masih|dharma|karma|seva|bhakti|moksha|swarg|narak|punya|paap|mandir|gurudwara|gita|ramayana|mahabharata|guru|pandit|prarthana|puja|aarti|bhajan|kirtan|satsang|darshan|tilak|prasad|langar|vrat|tyohar|diwali|holi|navratri)\b/gi,
      /\b(kya|hai|hain|kaise|kyun|kyu|kab|kahan|kon|kaun|mere|mera|meri|tera|teri|tumhara|tumhari|apna|apni|apne|uska|uski|iske|iska|woh|yeh|ye)\b/gi
    ];
    
    // Common English religious/biblical words that should stay English
    const englishBiblicalWords = [
      /\b(god|jesus|christ|lord|prayer|pray|bible|scripture|verse|church|faith|believe|salvation|heaven|hell|sin|forgiveness|love|hope|peace|blessing|worship|praise|holy|spirit|father|son|gospel|apostle|prophet|disciple|miracle|parable|psalm|proverb|commandment|covenant|grace|mercy|eternal|resurrection|kingdom|angel|demon|satan|devil|trinity|baptism|communion|cross|crucifixion|redemption|atonement|righteousness|sanctification|justification)\b/gi
    ];
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    // Check for Hindi words in Roman script
    const hasHindiWordsInRoman = hindiWordsInRoman.some(pattern => pattern.test(text));
    
    // Check for English biblical words
    const hasEnglishBiblicalWords = englishBiblicalWords.some(pattern => pattern.test(text));
    
    // If actual Hindi script is present, always prefer Hindi
    if (hasHindi) {
      return 'hindi';
    }
    
    // If contains English biblical words, strongly prefer English
    if (hasEnglishBiblicalWords && hasEnglish) {
      return 'english';
    }
    
    // If Roman script has significant Hindi words AND no strong English indicators, treat as Hindi
    if (hasHindiWordsInRoman && hasEnglish && !hasEnglishBiblicalWords) {
      return 'hindi';
    }
    
    // If it's purely English characters and common English words, return English
    if (hasEnglish && !hasHindiWordsInRoman) {
      return 'english';
    }
    
    // Default to English for ambiguous cases
    return 'english';
  }
}
