import { NextRequest, NextResponse } from 'next/server';
import { geminiAI } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { property, userPreferences, mood } = await request.json();
    
    if (!property || !userPreferences) {
      return NextResponse.json(
        { error: 'Property and userPreferences are required' },
        { status: 400 }
      );
    }

    const story = await geminiAI.generatePersonalizedStory(
      property, 
      userPreferences, 
      mood
    );
    
    return NextResponse.json({ story });
  } catch (error) {
    console.error('AI Story API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}