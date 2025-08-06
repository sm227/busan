import { NextRequest, NextResponse } from 'next/server';
import { geminiAI } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await geminiAI.generateConsultationResponse(message, context);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}