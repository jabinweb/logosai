import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '../../../services/geminiAIService';
import { SearchHistoryService } from '../../../services/searchHistoryService';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const { query, language, context } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const geminiService = GeminiAIService.getInstance();
    const result = await geminiService.searchAndAnalyze({
      query,
      language: language || 'english',
      context
    });

    // Save to search history if user is authenticated
    try {
      const session = await auth();
      if (session?.user?.id) {
        await SearchHistoryService.saveSearch(
          session.user.id,
          query,
          language || 'english',
          result
        );
      }
    } catch (historyError) {
      // Don't fail the request if history saving fails
      console.warn('Failed to save search history:', historyError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
