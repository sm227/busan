import { Home, Users, Briefcase, Heart, Activity, Coins } from 'lucide-react';

export const preferenceCategoryLabels: Record<string, string> = {
  livingStyle: '주거 스타일',
  socialStyle: '사회적 성향',
  workStyle: '업무 스타일',
  hobbyStyle: '취미 스타일',
  pace: '생활 리듬',
  budget: '주거비 예산'
};

export const preferenceCategoryIcons: Record<string, any> = {
  livingStyle: Home,
  socialStyle: Users,
  workStyle: Briefcase,
  hobbyStyle: Heart,
  pace: Activity,
  budget: Coins
};

export const preferenceValueLabels: Record<string, Record<string, string>> = {
  livingStyle: {
    minimalist: '깔끔하고 단순한 공간',
    cozy: '따뜻하고 아늑한 분위기',
    traditional: '전통적이고 고풍스러운 멋',
    modern: '현대적이고 편리한 시설'
  },
  socialStyle: {
    'community-oriented': '마을 사람들과 깊은 유대관계',
    independent: '적당한 거리를 두며 독립적으로',
    'family-focused': '가족 중심의 조용한 생활',
    creative: '창작활동 공동체 참여'
  },
  workStyle: {
    'remote-worker': '도시 일을 원격으로',
    farmer: '농사나 전원생활 관련 일',
    entrepreneur: '시골에서 새로운 사업',
    retiree: '여유로운 은퇴 생활'
  },
  hobbyStyle: {
    'nature-lover': '등산, 낚시, 산책 등 자연 활동',
    'culture-enthusiast': '전통문화 체험, 박물관, 축제',
    'sports-fan': '운동, 자전거, 수영 등',
    'crafts-person': '도자기, 목공예, 텃밭 가꾸기'
  },
  pace: {
    slow: '천천히 여유롭게',
    balanced: '적당한 활동과 휴식의 균형',
    active: '활발하고 역동적으로'
  },
  budget: {
    low: '월 30만원 이하',
    medium: '월 30-80만원',
    high: '월 80만원 이상'
  }
};

export function getPreferenceLabel(category: string, value: string): string {
  return preferenceValueLabels[category]?.[value] || value;
}
