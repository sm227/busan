import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/factory';
import { AIModelType } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const { message, context, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Get model type from request or use default
    const modelType: AIModelType = model || AIProviderFactory.getDefaultModel();

    // Get appropriate AI provider
    const aiProvider = AIProviderFactory.getProvider(modelType);

    // Generate response
    const response = await aiProvider.generateConsultationResponse(message, context);

    return NextResponse.json({ response, modelUsed: modelType });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}