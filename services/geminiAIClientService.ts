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
    // Enhanced language detection - avoid Hinglish, prefer Hindi or English
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    // Common Hindi words in Roman script
    const hindiWordsInRoman = [
      /\b(bhagwan|ishwar|prabhu|yesu|yeshu|masih|dharma|karma|seva|bhakti|moksha|swarg|narak|punya|paap|mandir|gurudwara|gita|ramayana|mahabharata|guru|pandit|prayer|prarthana|puja|aarti|bhajan|kirtan|satsang|darshan|tilak|prasad|langar|vrat|tyohar|diwali|holi|navratri)\b/gi,
      /\b(kya|hai|hain|ka|ki|ke|me|main|aur|ya|toh|to|jo|ji|bhi|nahi|nahin|hum|tum|aap|uska|uski|iske|iska|woh|yeh|ye|kaise|kyun|kyu|kab|kahan|kon|kaun|kuch|sab|sabko|sabse|mere|mera|meri|tera|teri|tumhara|tumhari|apna|apni|apne)\b/gi
    ];
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    // Check for Hindi words in Roman script
    const hasHindiWordsInRoman = hindiWordsInRoman.some(pattern => pattern.test(text));
    
    // If actual Hindi script is present, always prefer Hindi
    if (hasHindi) {
      return 'hindi';
    }
    
    // If Roman script has significant Hindi words, treat as Hindi
    if (hasHindiWordsInRoman && hasEnglish) {
      return 'hindi'; // Changed from 'hinglish' to 'hindi'
    }
    
    // Default to English
    return 'english';
  }
}
