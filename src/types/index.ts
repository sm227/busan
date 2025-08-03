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

export interface User {
  id: string;
  preferences?: UserPreferences;
  matches: string[];
  favorites: string[];
  profile: {
    name: string;
    age?: number;
    currentLocation?: string;
    occupation?: string;
  };
}