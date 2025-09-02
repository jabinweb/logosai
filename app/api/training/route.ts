import { NextRequest, NextResponse } from 'next/server';
import { AIModelTrainingService } from '@/services/aiModelTrainingService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, response, language, userFeedback, category, userId } = body;

    if (!query || !response || !language || !userFeedback) {
      return NextResponse.json(
        { error: 'Missing required fields: query, response, language, userFeedback' },
        { status: 400 }
      );
    }

    const trainingService = AIModelTrainingService.getInstance();
    await trainingService.addTrainingData({
      query,
      response,
      language,
      userFeedback,
      category,
      userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding training data:', error);
    return NextResponse.json(
      { error: 'Failed to add training data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const trainingService = AIModelTrainingService.getInstance();

    switch (action) {
      case 'stats':
        const stats = await trainingService.getTrainingStats();
        return NextResponse.json(stats);

      case 'performance':
        const performance = await trainingService.validateModelPerformance();
        return NextResponse.json(performance);

      case 'prompts':
        const prompts = await trainingService.generateOptimizedPrompts();
        return NextResponse.json(prompts);

      case 'export':
        const format = searchParams.get('format') as 'jsonl' | 'csv' | 'txt' || 'jsonl';
        const data = await trainingService.exportTrainingData(format);
        
        return new NextResponse(data, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename=training-data.${format}`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, performance, prompts, or export' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling training request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
