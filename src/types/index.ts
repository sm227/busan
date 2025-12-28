// 원데이 클래스 타입
export * from './oneday-class';

// 사용자 라이프스타일 분석을 위한 타입 정의
export interface UserPreferences {
  occupation?: string;
  livingStyle: 'minimalist' | 'cozy' | 'traditional' | 'modern';
  socialStyle: 'community-oriented' | 'independent' | 'family-focused' | 'creative';
  workStyle: 'remote-worker' | 'farmer' | 'entrepreneur' | 'retiree';
  hobbyStyle: 'nature-lover' | 'culture-enthusiast' | 'sports-fan' | 'crafts-person';
  pace: 'slow' | 'balanced' | 'active';
  purchaseType: 'sale' | 'rent';
  budget: 'low' | 'medium' | 'high';
}

export interface QuestionOption {
  id: string;
  text: string;
  category: keyof UserPreferences;
  value: string;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  category: keyof UserPreferences;
  options: QuestionOption[];
  conditionalOn?: {
    category: keyof UserPreferences;
    value: string;
  };
}

export interface RuralProperty {
  id: string;
  title: string;
  location: {
    district: string;
    city: string;
    region: string;
    coordinates: [number, number];
  };
  images: string[];
  price: {
    rent?: number;
    sale?: number;
    deposit?: number;
  };
  details: {
    rooms: number;
    size: number;
    type: 'hanok' | 'modern' | 'farm' | 'apartment';
    yearBuilt?: number;
    condition: 'excellent' | 'good' | 'needs-repair';
  };
  features: string[];
  surroundings: {
    nearbyFacilities: string[];
    transportation: string[];
    naturalFeatures: string[];
  };
  communityInfo: {
    population: number;
    averageAge: number;
    mainIndustries: string[];
    culturalActivities: string[];
  };
  matchScore?: number;
  aiReason?: string; // AI가 추천한 이유
  isUserProperty?: boolean; // 사용자가 등록한 매물 여부
  userNickname?: string; // 등록한 사용자 닉네임
  contact?: string; // 연락처
}

export interface VillageStory {
  id: string;
  propertyId: string;
  title: string;
  story: string;
  highlights: string[];
  mood: 'peaceful' | 'vibrant' | 'traditional' | 'adventurous';
  images: string[];
}

export interface VisitedRegion {
  id: string;
  name: string;
  province: string;
  city: string;
  visitDate: Date;
  duration: number; // 머문 기간 (일)
  purpose: 'living' | 'visit' | 'work' | 'travel';
  rating: number; // 1-5 평점
  memo?: string;
  coordinates: [number, number]; // [longitude, latitude]
  populationRisk: 'high' | 'medium' | 'low'; // 인구 감소 위험도
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: 'explorer' | 'lifesaver' | 'pioneer' | 'community';
}

export interface User {
  id: string;
  preferences?: UserPreferences;
  matches: string[];
  favorites: string[];
  visitedRegions: VisitedRegion[];
  badges: UserBadge[];
  profile: {
    name: string;
    age?: number;
    currentLocation?: string;
    occupation?: string;
    explorerLevel: number; // 탐험가 레벨
    totalVisitDays: number; // 총 방문 일수
    riskyRegionsHelped: number; // 도움을 준 위험 지역 수
  };
}

export interface GuestbookEntry {
  id: number;
  user_id: number;
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question' | 'occupation-post' | 'hobby-post';
  property_id?: string;
  tags?: string | string[];
  occupation_tag?: string;
  hobby_style_tag?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author_nickname?: string;
  author_occupation?: string;
  author_hobby_style?: string;
}