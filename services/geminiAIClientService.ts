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
    // Simple language detection
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) {
      return 'hinglish';
    } else if (hasHindi) {
      return 'hindi';
    } else {
      return 'english';
    }
  }
}
