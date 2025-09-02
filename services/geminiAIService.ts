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
      languageInstruction = 'IMPORTANT: Respond completely in Hinglish (Hindi-English mix using Roman script for Hindi words) only. Write Hindi words in Roman script like "bhagwan", "prabhu", "ishwar", "pyar", "vishwas", "mukti" etc. Mix English and Romanized Hindi naturally. Use biblical tone and reverent language mixing Hindi and English. Example: "Bhagwan ka pyar bahut great hai aur uske through hume salvation milti hai." ';
      bibleVersions = 'Use ONLY the IBP (Indian Bible Publication) Hindi Bible for verification. IMPORTANT: Provide the actual Hindi Bible verses in proper Devanagari script (Hindi), NOT in Roman transliteration. The verse text must be exactly as written in the Hindi Bible using Hindi script.';
    } else {
      languageInstruction = 'CRITICAL REQUIREMENT: You MUST respond ONLY in English language. DO NOT use Hindi, Devanagari script, or any Indian language. ALL content including answer, themes, and explanation MUST be written in English using Latin alphabet only. Use biblical tone and reverent language in English ONLY. If you detect the user query is in English, you must respond in English. ';
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
  "answer": "Your main response to the query in the specified language",
  "bibleVerses": [
    {
      "reference": "Book Chapter:Verse (use appropriate script for book names based on language)",
      "text": "The actual verse text in proper script - Hindi verses in Devanagari, English verses in Latin script",
      "version": "Bible version (ESV/NIV/IBP)"
    }
  ],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "explanation": "Detailed explanation using biblical tone in the specified language - speak as one who has meditated upon the Scriptures, using reverent language, biblical expressions, and connecting the verses to broader scriptural truths. Draw upon the wisdom of the ages and speak with the authority of God's Word."
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
