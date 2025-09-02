import { NextRequest, NextResponse } from 'next/server';
import { AIModelTrainingService } from '../../../../services/aiModelTrainingService';

export async function GET() {
  try {
    const trainingService = AIModelTrainingService.getInstance();
    const config = await trainingService.getModelConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting model config:', error);
    return NextResponse.json(
      { error: 'Failed to get model configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const trainingService = AIModelTrainingService.getInstance();
    
    await trainingService.updateModelConfig(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating model config:', error);
    return NextResponse.json(
      { error: 'Failed to update model configuration' },
      { status: 500 }
    );
  }
}
