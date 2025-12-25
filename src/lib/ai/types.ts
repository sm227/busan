import { UserPreferences, RuralProperty } from '@/types';

// AI 모델 타입 정의
export type AIModelType = 'gemini-2.5-flash' | 'claude-3.5-sonnet';

// 상담 컨텍스트 인터페이스
export interface ConsultationContext {
  userPreferences?: Partial<UserPreferences>;
  currentLocation?: string;
  previousMessages?: string[];
}

// 스토리 생성 요청 인터페이스
export interface StoryGenerationRequest {
  property: RuralProperty;
  userPreferences: UserPreferences;
  mood?: 'peaceful' | 'vibrant' | 'traditional' | 'adventurous';
}

// 스토리 생성 응답 인터페이스
export interface StoryGenerationResponse {
  title: string;
  story: string;
  highlights: string[];
}

// 후속 질문 요청 인터페이스
export interface QuestionFollowUpRequest {
  previousAnswers: { [key: string]: any };
  currentCategory: string;
}

// 후속 질문 응답 인터페이스
export interface QuestionFollowUpResponse {
  question: string;
  options: Array<{ text: string; value: string; description: string }>;
}
