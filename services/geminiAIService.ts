import { GoogleGenAI } from '@google/genai';

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

export class GeminiAIService {
  private ai: GoogleGenAI;
  private static instance: GeminiAIService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  async searchAndAnalyze(request: GeminiSearchRequest): Promise<GeminiResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No response text received from Gemini AI');
      }
      return this.parseResponse(responseText);
    } catch (error) {
      console.error('Error with Gemini AI:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  private buildPrompt(request: GeminiSearchRequest): string {
    const { query, language } = request;
    
    let languageInstruction = '';
    let bibleVersions = '';
    
    if (language === 'hindi') {
      languageInstruction = 'IMPORTANT: Respond completely in Hindi language only. All text including answer, themes, and explanation must be in Hindi. Use biblical tone and reverent language in Hindi. ';
      bibleVersions = 'Use the IBP (Indian Bible Publication) Hindi Bible for verification.';
    } else if (language === 'hinglish') {
      languageInstruction = 'IMPORTANT: Respond completely in Hinglish (Hindi-English mix) only. All text including answer, themes, and explanation must be in Hinglish. Use biblical tone and reverent language mixing Hindi and English. ';
      bibleVersions = 'Use the IBP (Indian Bible Publication) Hindi Bible for verification.';
    } else {
      languageInstruction = 'IMPORTANT: Respond completely in English language only. All text including answer, themes, and explanation must be in English. Use biblical tone and reverent language in English. ';
      bibleVersions = 'Use both ESV (English Standard Version) and NIV (New International Version) Bible translations for verification.';
    }

    return `
You are a wise and reverent Bible scholar and theologian representing LogosAI, one who has spent years meditating upon the sacred Scriptures. ${languageInstruction}Speak with the authority of God's Word and the reverence befitting one who handles the holy text. Do not mention any other AI service names or "powered by" statements.

User Query: "${query}"

Please provide a comprehensive response that includes:

1. A thoughtful answer to the question/topic
2. Relevant Bible verses that support or relate to the topic (${bibleVersions})
3. Key biblical themes involved
4. A detailed explanation using biblical tone and language

Format your response as JSON with this structure:
{
  "answer": "Your main response to the query",
  "bibleVerses": [
    {
      "reference": "Book Chapter:Verse",
      "text": "The actual verse text",
      "version": "Bible version (ESV/NIV/IBP)"
    }
  ],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "explanation": "Detailed explanation using biblical tone - speak as one who has meditated upon the Scriptures, using reverent language, biblical expressions, and connecting the verses to broader scriptural truths. Draw upon the wisdom of the ages and speak with the authority of God's Word, using phrases like 'As the Scripture declares...', 'Behold...', 'Verily...', 'The Lord teaches us...', etc."
}

Ensure the Bible verses are accurate and directly relevant to the query. In your explanation, use biblical language and tone - write as if you are a biblical scholar who has deep reverence for God's Word. Connect the verses to broader scriptural themes and use expressions commonly found in Scripture.
`;
  }

  private parseResponse(responseText: string): GeminiResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          answer: parsed.answer || 'No answer provided',
          bibleVerses: parsed.bibleVerses || [],
          keyThemes: parsed.keyThemes || [],
          explanation: parsed.explanation || 'No explanation provided'
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }

    // Fallback: return a basic response
    return {
      answer: responseText,
      bibleVerses: [],
      keyThemes: [],
      explanation: 'AI response could not be properly parsed.'
    };
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
