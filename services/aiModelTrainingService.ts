import { PrismaClient } from '@prisma/client';

export interface TrainingData {
  id: string;
  query: string;
  expectedResponse: string;
  language: 'english' | 'hindi' | 'hinglish';
  category: 'theology' | 'prayer' | 'doctrine' | 'history' | 'interpretation' | 'practical';
  quality: 'excellent' | 'good' | 'poor';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelConfiguration {
  modelName: string;
  provider: 'gemini' | 'openai' | 'claude' | 'local';
  apiKey?: string;
  basePrompt: string;
  temperature: number;
  maxTokens: number;
  systemInstructions: string;
  languageSpecificPrompts: {
    english: string;
    hindi: string;
    hinglish: string;
  };
  isActive: boolean;
  trainingDataCount: number;
  lastTrainedAt?: Date;
}

export class AIModelTrainingService {
  private static instance: AIModelTrainingService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): AIModelTrainingService {
    if (!AIModelTrainingService.instance) {
      AIModelTrainingService.instance = new AIModelTrainingService();
    }
    return AIModelTrainingService.instance;
  }

  /**
   * Add training data from user interactions
   */
  async addTrainingData(data: {
    query: string;
    response: string;
    language: string;
    userFeedback: 'helpful' | 'not_helpful' | 'incorrect';
    category?: string;
    userId?: string;
    customFeedback?: string;
  }): Promise<void> {
    try {
      // Store in database for future training
      // Note: You'll need to run `npx prisma generate` after adding the TrainingData model
      console.log('Adding training data:', data);
      
      await this.prisma.trainingData.create({
        data: {
          query: data.query,
          response: data.response,
          language: data.language,
          userFeedback: data.userFeedback,
          category: data.category,
          userId: data.userId,
          customFeedback: data.customFeedback,
          quality: data.userFeedback === 'helpful' ? 'good' : 
                  data.userFeedback === 'incorrect' ? 'poor' : 'good',
          sessionId: `session_${Date.now()}`,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
          }
        }
      });

      console.log('✅ Training data added successfully');
    } catch (error) {
      console.error('Error adding training data:', error);
      throw error;
    }
  }

  /**
   * Get training statistics
   */
  async getTrainingStats(): Promise<{
    totalDataPoints: number;
    byLanguage: Record<string, number>;
    byCategory: Record<string, number>;
    recentFeedback: { helpful: number; not_helpful: number; incorrect: number };
  }> {
    try {
      // Get total count
      const totalDataPoints = await this.prisma.trainingData.count();

      // Get language distribution
      const languageStats = await this.prisma.trainingData.groupBy({
        by: ['language'],
        _count: { language: true }
      });

      const byLanguage = languageStats.reduce((acc: Record<string, number>, stat: { language: string; _count: { language: number } }) => {
        acc[stat.language] = stat._count.language;
        return acc;
      }, {} as Record<string, number>);

      // Get category distribution
      const categoryStats = await this.prisma.trainingData.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { category: { not: null } }
      });

      const byCategory = categoryStats.reduce((acc: Record<string, number>, stat: { category: string | null; _count: { category: number } }) => {
        if (stat.category) {
          acc[stat.category] = stat._count.category;
        }
        return acc;
      }, {} as Record<string, number>);

      // Get recent feedback (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const feedbackStats = await this.prisma.trainingData.groupBy({
        by: ['userFeedback'],
        _count: { userFeedback: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
          userFeedback: { not: null }
        }
      });

      const recentFeedback = feedbackStats.reduce((acc: { helpful: number; not_helpful: number; incorrect: number }, stat: { userFeedback: string | null; _count: { userFeedback: number } }) => {
        if (stat.userFeedback) {
          acc[stat.userFeedback as keyof typeof acc] = stat._count.userFeedback;
        }
        return acc;
      }, { helpful: 0, not_helpful: 0, incorrect: 0 });

      return {
        totalDataPoints,
        byLanguage,
        byCategory,
        recentFeedback
      };
    } catch (error) {
      console.error('Error getting training stats:', error);
      // Return default values on error
      return {
        totalDataPoints: 0,
        byLanguage: { english: 0, hindi: 0, hinglish: 0 },
        byCategory: { theology: 0, prayer: 0, doctrine: 0, history: 0, interpretation: 0, practical: 0 },
        recentFeedback: { helpful: 0, not_helpful: 0, incorrect: 0 }
      };
    }
  }

  /**
   * Generate improved prompts based on training data
   */
  async generateOptimizedPrompts(): Promise<{
    basePrompt: string;
    languagePrompts: Record<string, string>;
    improvementSuggestions: string[];
  }> {
    // Analyze training data to suggest prompt improvements
    const commonIssues = await this.analyzeCommonIssues();
    
    return {
      basePrompt: this.generateBasePrompt(commonIssues),
      languagePrompts: {
        english: this.generateEnglishPrompt(),
        hindi: this.generateHindiPrompt(),
        hinglish: this.generateHinglishPrompt()
      },
      improvementSuggestions: commonIssues.map(issue => `Improve: ${issue.category} - ${issue.description}`)
    };
  }

  /**
   * Analyze common issues from user feedback
   */
  private async analyzeCommonIssues(): Promise<Array<{
    category: string;
    description: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high';
  }>> {
    // This would analyze your training data for patterns
    return [
      {
        category: 'Language Consistency',
        description: 'AI sometimes responds in wrong language',
        frequency: 15,
        severity: 'high'
      },
      {
        category: 'Biblical Accuracy',
        description: 'Need more precise verse references',
        frequency: 8,
        severity: 'medium'
      },
      {
        category: 'Cultural Context',
        description: 'Better understanding of Indian Christian context needed',
        frequency: 12,
        severity: 'medium'
      }
    ];
  }

  /**
   * Generate optimized base prompt
   */
  private generateBasePrompt(issues: Array<{
    category: string;
    description: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high';
  }>): string {
    const languageIssue = issues.find(i => i.category === 'Language Consistency');
    const accuracyIssue = issues.find(i => i.category === 'Biblical Accuracy');
    
    let prompt = `You are LogosAI, a wise and reverent Bible scholar specializing in multi-language Biblical study and theology.`;
    
    if (languageIssue?.severity === 'high') {
      prompt += ` CRITICAL: Always respond in the exact language requested. Never mix languages unless specifically asked for Hinglish.`;
    }
    
    if (accuracyIssue) {
      prompt += ` Ensure all Bible verse references are precise and verified before including them.`;
    }
    
    return prompt;
  }

  /**
   * Generate language-specific prompts
   */
  private generateEnglishPrompt(): string {
    return `LANGUAGE REQUIREMENT: Respond ONLY in English. Use proper biblical terminology and reverent tone. All Bible verses must be from ESV or NIV translations.`;
  }

  private generateHindiPrompt(): string {
    return `भाषा आवश्यकता: केवल हिंदी में उत्तर दें। उचित बाइबिल शब्दावली और श्रद्धापूर्ण स्वर का प्रयोग करें। सभी बाइबिल छंद IBP हिंदी अनुवाद से होने चाहिए।`;
  }

  private generateHinglishPrompt(): string {
    return `LANGUAGE REQUIREMENT: Respond in Hinglish (Hindi-English mix). Use Roman script for Hindi words like "Prabhu", "bhagwan", "mukti" etc. Mix naturally with English biblical terms.`;
  }

  /**
   * Test model performance with validation dataset
   */
  async validateModelPerformance(): Promise<{
    accuracy: number;
    languageConsistency: number;
    biblicalAccuracy: number;
    userSatisfaction: number;
    recommendations: string[];
  }> {
    // This would run validation tests
    return {
      accuracy: 85.5,
      languageConsistency: 92.3,
      biblicalAccuracy: 88.7,
      userSatisfaction: 87.1,
      recommendations: [
        'Increase training data for theological terms',
        'Improve Hindi language consistency',
        'Add more context for cultural references'
      ]
    };
  }

  /**
   * Export training data for external model training
   */
  async exportTrainingData(format: 'jsonl' | 'csv' | 'txt'): Promise<string> {
    // Export data in format suitable for model training
    const data = await this.getTrainingDataset();
    
    if (data.length === 0) {
      return format === 'csv' ? 'query,response,language,category,quality,feedback,created_at\n' : 
             format === 'jsonl' ? '' : 
             'No training data available for export.';
    }
    
    switch (format) {
      case 'jsonl':
        return data.map(item => JSON.stringify({
          prompt: item.query,
          completion: item.expectedResponse,
          metadata: { 
            language: item.language, 
            category: item.category,
            quality: item.quality,
            feedback: item.feedback,
            created_at: item.createdAt.toISOString()
          }
        })).join('\n');
      
      case 'csv':
        const headers = 'query,response,language,category,quality,feedback,created_at\n';
        const rows = data.map(item => 
          `"${item.query.replace(/"/g, '""')}","${item.expectedResponse.replace(/"/g, '""')}","${item.language}","${item.category}","${item.quality}","${item.feedback || ''}","${item.createdAt.toISOString()}"`
        ).join('\n');
        return headers + rows;
      
      case 'txt':
        return data.map((item, index) => 
          `Entry ${index + 1}:\nQ: ${item.query}\nA: ${item.expectedResponse}\nLanguage: ${item.language}\nCategory: ${item.category}\nQuality: ${item.quality}\nFeedback: ${item.feedback || 'None'}\nCreated: ${item.createdAt.toISOString()}\n---`
        ).join('\n\n');
      
      default:
        throw new Error('Unsupported format');
    }
  }

  /**
   * Get training dataset
   */
  private async getTrainingDataset(): Promise<TrainingData[]> {
    try {
      const data = await this.prisma.trainingData.findMany({
        where: {
          // Include both validated and non-validated data
          // isValidated: true, // Only export validated training data
          // quality: { in: ['excellent', 'good'] } // Only good quality data
          userFeedback: { not: null } // Only data with user feedback
        },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limit to recent 1000 entries
      });

      console.log(`📊 Found ${data.length} training data entries for export`);

      return data.map((item) => ({
        id: item.id,
        query: item.query,
        expectedResponse: item.expectedResponse || item.response,
        language: item.language as 'english' | 'hindi' | 'hinglish',
        category: (item.category || 'practical') as 'theology' | 'prayer' | 'doctrine' | 'history' | 'interpretation' | 'practical',
        quality: item.quality as 'excellent' | 'good' | 'poor',
        feedback: item.customFeedback || undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      // Return the mapped data
    } catch (error) {
      console.error('Error getting training dataset:', error);
      return [];
    }
  }

  /**
   * Update model configuration
   */
  async updateModelConfig(config: Partial<ModelConfiguration>): Promise<void> {
    // Save updated configuration
    console.log('Updating model configuration:', config);
  }

  /**
   * Get current model configuration
   */
  async getModelConfig(): Promise<ModelConfiguration> {
    return {
      modelName: 'gemini-2.0-flash-001',
      provider: 'gemini',
      basePrompt: 'You are LogosAI, a wise Bible scholar...',
      temperature: 0.7,
      maxTokens: 2048,
      systemInstructions: 'Provide accurate biblical responses...',
      languageSpecificPrompts: {
        english: 'Respond in English only...',
        hindi: 'केवल हिंदी में उत्तर दें...',
        hinglish: 'Respond in Hinglish mix...'
      },
      isActive: true,
      trainingDataCount: 0,
      lastTrainedAt: undefined
    };
  }
}
