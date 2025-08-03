import { Question } from '@/types';

export const personalityQuestions: Question[] = [
  {
    id: 'living-1',
    text: '새로운 집에서 가장 중요하게 생각하는 것은?',
    category: 'livingStyle',
    options: [
      {
        id: 'living-1-a',
        text: '깔끔하고 단순한 공간',
        category: 'livingStyle',
        value: 'minimalist',
        description: '불필요한 물건 없이 깔끔한 환경을 선호'
      },
      {
        id: 'living-1-b', 
        text: '따뜻하고 아늑한 분위기',
        category: 'livingStyle',
        value: 'cozy',
        description: '편안하고 아늑한 공간을 중요시'
      },
      {
        id: 'living-1-c',
        text: '전통적이고 고풍스러운 멋',
        category: 'livingStyle', 
        value: 'traditional',
        description: '한국의 전통미와 문화를 느낄 수 있는 공간'
      },
      {
        id: 'living-1-d',
        text: '현대적이고 편리한 시설',
        category: 'livingStyle',
        value: 'modern',
        description: '최신 시설과 편의성을 갖춘 공간'
      }
    ]
  },
  {
    id: 'social-1', 
    text: '시골에서의 인간관계는 어떻게 하고 싶나요?',
    category: 'socialStyle',
    options: [
      {
        id: 'social-1-a',
        text: '마을 사람들과 깊은 유대관계 형성',
        category: 'socialStyle',
        value: 'community-oriented',
        description: '마을 공동체에 적극 참여하며 이웃과 가까운 관계'
      },
      {
        id: 'social-1-b',
        text: '적당한 거리를 두며 독립적으로',
        category: 'socialStyle', 
        value: 'independent',
        description: '프라이버시를 지키며 필요할 때만 교류'
      },
      {
        id: 'social-1-c',
        text: '가족 중심의 조용한 생활',
        category: 'socialStyle',
        value: 'family-focused', 
        description: '가족과의 시간을 중요시하는 안정적인 생활'
      },
      {
        id: 'social-1-d',
        text: '창작활동 공동체 참여',
        category: 'socialStyle',
        value: 'creative',
        description: '예술, 공예 등 창작활동을 함께하는 사람들과 교류'
      }
    ]
  },
  {
    id: 'work-1',
    text: '시골에서 하고 싶은 일은?',
    category: 'workStyle', 
    options: [
      {
        id: 'work-1-a',
        text: '도시에서 하던 일을 원격으로',
        category: 'workStyle',
        value: 'remote-worker',
        description: '기존 직업을 유지하며 원격근무'
      },
      {
        id: 'work-1-b',
        text: '농사나 전원생활 관련 일',
        category: 'workStyle',
        value: 'farmer', 
        description: '농업이나 자연과 관련된 새로운 직업'
      },
      {
        id: 'work-1-c',
        text: '시골에서 새로운 사업 시작',
        category: 'workStyle',
        value: 'entrepreneur',
        description: '지역 특성을 활용한 창업이나 사업'
      },
      {
        id: 'work-1-d',
        text: '여유로운 은퇴 생활',
        category: 'workStyle',
        value: 'retiree',
        description: '경제적 여유를 바탕으로 한 휴식과 취미생활'
      }
    ]
  },
  {
    id: 'hobby-1',
    text: '여가시간에 가장 하고 싶은 활동은?',
    category: 'hobbyStyle',
    options: [
      {
        id: 'hobby-1-a', 
        text: '등산, 낚시, 산책 등 자연 활동',
        category: 'hobbyStyle',
        value: 'nature-lover',
        description: '자연 속에서 하는 다양한 야외활동'
      },
      {
        id: 'hobby-1-b',
        text: '전통문화 체험, 박물관, 축제',
        category: 'hobbyStyle',
        value: 'culture-enthusiast', 
        description: '지역 문화와 역사를 경험하는 활동'
      },
      {
        id: 'hobby-1-c',
        text: '운동, 자전거, 수영 등',
        category: 'hobbyStyle',
        value: 'sports-fan',
        description: '활동적인 스포츠와 운동'
      },
      {
        id: 'hobby-1-d',
        text: '도자기, 목공예, 텃밭 가꾸기',
        category: 'hobbyStyle',
        value: 'crafts-person',
        description: '손으로 만드는 창작활동과 취미'
      }
    ]
  },
  {
    id: 'pace-1',
    text: '원하는 생활 리듬은?',
    category: 'pace',
    options: [
      {
        id: 'pace-1-a',
        text: '천천히 여유롭게',
        category: 'pace',
        value: 'slow',
        description: '스트레스 없이 자연의 리듬에 맞춰 살기'
      },
      {
        id: 'pace-1-b',
        text: '적당한 활동과 휴식의 균형',
        category: 'pace',
        value: 'balanced', 
        description: '활동적인 시간과 휴식시간의 조화'
      },
      {
        id: 'pace-1-c',
        text: '활발하고 역동적으로',
        category: 'pace',
        value: 'active',
        description: '다양한 활동과 새로운 도전을 즐기며'
      }
    ]
  },
  {
    id: 'budget-1',
    text: '주거비 예산은 어느 정도인가요?',
    category: 'budget',
    options: [
      {
        id: 'budget-1-a',
        text: '월 30만원 이하',
        category: 'budget',
        value: 'low',
        description: '경제적 부담을 최소화한 저렴한 주거'
      },
      {
        id: 'budget-1-b',
        text: '월 30-80만원',
        category: 'budget', 
        value: 'medium',
        description: '적당한 수준의 주거비'
      },
      {
        id: 'budget-1-c',
        text: '월 80만원 이상',
        category: 'budget',
        value: 'high',
        description: '편의시설과 품질을 중시하는 주거'
      }
    ]
  }
];