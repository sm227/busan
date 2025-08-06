// 사용자 라이프스타일 분석을 위한 타입 정의
export interface UserPreferences {
  livingStyle: 'minimalist' | 'cozy' | 'traditional' | 'modern';
  socialStyle: 'community-oriented' | 'independent' | 'family-focused' | 'creative';
  workStyle: 'remote-worker' | 'farmer' | 'entrepreneur' | 'retiree';
  hobbyStyle: 'nature-lover' | 'culture-enthusiast' | 'sports-fan' | 'crafts-person';
  pace: 'slow' | 'balanced' | 'active';
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