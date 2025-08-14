import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserPreferences, RuralProperty } from '@/types';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async generateConsultationResponse(userMessage: string, context?: {
    userPreferences?: Partial<UserPreferences>;
    currentLocation?: string;
    previousMessages?: string[];
  }): Promise<string> {
    const systemPrompt = `
당신은 "빈집다방"의 친근한 시골 이주 전문 AI 상담사입니다. 

응답 스타일:
- 친근하고 편안한 말투 (존댓말 사용)
- 2-3줄의 간결한 답변 (최대 100자 이내)
- 이모지 적절히 활용 (😊🏡🌿 등)
- 실용적이고 핵심적인 정보만 제공
- 복잡한 설명보다는 간단명료하게

전문 분야:
- 시골 이주 준비사항
- 지역 생활비 정보  
- 농촌 생활 적응법
- 정부 지원 정책
- 커뮤니티 참여 방법

답변 예시:
"안녕하세요! 😊 시골 이주 준비금으로 보통 1000-2000만원 정도 준비하시면 좋아요. 보증금, 이사비용, 생활비 등을 고려한 금액입니다 🏡"

${context?.userPreferences ? `
사용자 선호도:
- 거주 스타일: ${context.userPreferences.livingStyle || '미설정'}
- 사회적 스타일: ${context.userPreferences.socialStyle || '미설정'}
- 업무 스타일: ${context.userPreferences.workStyle || '미설정'}
- 취미 스타일: ${context.userPreferences.hobbyStyle || '미설정'}
- 생활 페이스: ${context.userPreferences.pace || '미설정'}
- 예산: ${context.userPreferences.budget || '미설정'}
` : ''}

${context?.currentLocation ? `현재 거주지: ${context.currentLocation}` : ''}

사용자 질문: ${userMessage}
`;

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return '죄송합니다. 현재 AI 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  async generatePersonalizedStory(
    property: RuralProperty, 
    userPreferences: UserPreferences,
    mood?: 'peaceful' | 'vibrant' | 'traditional' | 'adventurous'
  ): Promise<{
    title: string;
    story: string;
    highlights: string[];
  }> {
    const prompt = `
다음 시골 집에 대한 개인화된 스토리를 작성해주세요.

집 정보:
- 제목: ${property.title}
- 위치: ${property.location.district}, ${property.location.city}, ${property.location.region}
- 집 유형: ${property.details.type}
- 방 수: ${property.details.rooms}개
- 크기: ${property.details.size}평
- 특징: ${property.features.join(', ')}
- 주변 시설: ${property.surroundings.nearbyFacilities.join(', ')}
- 자연 환경: ${property.surroundings.naturalFeatures.join(', ')}
- 마을 인구: ${property.communityInfo.population}명
- 주요 산업: ${property.communityInfo.mainIndustries.join(', ')}
- 문화 활동: ${property.communityInfo.culturalActivities.join(', ')}

사용자 취향:
- 거주 스타일: ${userPreferences.livingStyle}
- 사회적 스타일: ${userPreferences.socialStyle}  
- 업무 스타일: ${userPreferences.workStyle}
- 취미 스타일: ${userPreferences.hobbyStyle}
- 생활 페이스: ${userPreferences.pace}
- 예산: ${userPreferences.budget}

원하는 분위기: ${mood || 'peaceful'}

요구사항:
1. 사용자의 취향을 반영한 개인화된 스토리 작성
2. 구체적인 일상 시나리오 포함 (아침, 오후, 저녁 루틴)
3. 이 집에서만 경험할 수 있는 특별한 순간들 묘사
4. 감정적으로 와닿는 따뜻한 톤
5. 3-4개 문단으로 구성 (각 200-300자)
6. 제목은 감성적이고 매력적으로
7. 하이라이트는 4개 항목으로 구성

다음 JSON 형식으로 응답해주세요:
{
  "title": "감성적인 제목",
  "story": "개인화된 스토리 본문",
  "highlights": ["하이라이트1", "하이라이트2", "하이라이트3", "하이라이트4"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON 파싱 시도
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
      }
      
      // JSON 파싱 실패 시 기본값 반환
      return {
        title: `${property.location.city}에서의 새로운 시작`,
        story: text,
        highlights: ['평화로운 일상', '자연과의 조화', '지역 커뮤니티', '새로운 경험']
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        title: `${property.location.city}에서의 새로운 시작`,
        story: '이곳에서 당신만의 특별한 이야기를 시작해보세요.',
        highlights: ['평화로운 환경', '새로운 시작', '자연과의 조화', '지역 문화 체험']
      };
    }
  }

  async generateQuestionFollowUp(
    previousAnswers: { [key: string]: any },
    currentCategory: string
  ): Promise<{
    question: string;
    options: Array<{ text: string; value: string; description: string }>;
  } | null> {
    const prompt = `
사용자의 이전 답변을 바탕으로 더 구체적인 후속 질문을 생성해주세요.

이전 답변:
${Object.entries(previousAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

현재 카테고리: ${currentCategory}

다음 조건을 만족하는 후속 질문을 생성하세요:
1. 이전 답변과 연관된 더 구체적인 질문
2. 4개의 선택지 제공
3. 각 선택지는 구체적인 설명 포함
4. 시골 생활 매칭에 도움이 되는 실용적인 질문

다음 JSON 형식으로 응답:
{
  "question": "후속 질문 내용",
  "options": [
    {"text": "선택지1", "value": "value1", "description": "설명1"},
    {"text": "선택지2", "value": "value2", "description": "설명2"},
    {"text": "선택지3", "value": "value3", "description": "설명3"},
    {"text": "선택지4", "value": "value4", "description": "설명4"}
  ]
}

만약 후속 질문이 불필요하다고 판단되면 null을 반환하세요.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text.trim().toLowerCase() === 'null') {
        return null;
      }
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return null;
    }
  }
}

export const geminiAI = new GeminiAIService();