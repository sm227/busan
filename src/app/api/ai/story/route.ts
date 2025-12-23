import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/factory';
import { AIModelType } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const { property, userPreferences, mood, model } = await request.json();

    if (!property || !userPreferences) {
      return NextResponse.json(
        { error: 'Property and userPreferences are required' },
        { status: 400 }
      );
    }

    // Get model type from request or use default
    const modelType: AIModelType = model || AIProviderFactory.getDefaultModel();

    // Get appropriate AI provider
    const aiProvider = AIProviderFactory.getProvider(modelType);

    // Generate story
    const story = await aiProvider.generatePersonalizedStory({
      property,
      userPreferences,
      mood,
    });

    return NextResponse.json({ story, modelUsed: modelType });
  } catch (error) {
    console.error('AI Story API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}