import { User, VisitedRegion, UserBadge } from '@/types';

// 더미 방문 지역 데이터
export const dummyVisitedRegions: VisitedRegion[] = [
  {
    id: 'visit-1',
    name: '하회마을',
    province: '경상북도',
    city: '안동시',
    visitDate: new Date('2023-08-15'),
    duration: 30,
    purpose: 'living',
    rating: 5,
    memo: '전통 한옥에서 한 달간 거주하며 전통 문화를 깊이 체험했습니다. 마을 주민들이 정말 따뜻하게 맞아주셨어요.',
    coordinates: [128.5183, 36.5392], // 안동 하회마을
    populationRisk: 'high'
  },
  {
    id: 'visit-2', 
    name: '봉평면',
    province: '강원특별자치도',
    city: '평창군',
    visitDate: new Date('2023-06-10'),
    duration: 14,
    purpose: 'work',
    rating: 4,
    memo: '메밀꽃밭에서 농업 체험 프로그램에 참여했습니다. 고랭지 농업의 매력을 느꼈어요.',
    coordinates: [128.4050, 37.6348], // 평창 봉평면
    populationRisk: 'high'
  },
  {
    id: 'visit-3',
    name: '임실읍',
    province: '전라북도',
    city: '임실군',
    visitDate: new Date('2023-04-20'),
    duration: 7,
    purpose: 'travel',
    rating: 4,
    memo: '치즈마을에서 치즈 만들기 체험을 했어요. 농촌의 새로운 가능성을 보았습니다.',
    coordinates: [127.2899, 35.6036], // 임실읍
    populationRisk: 'medium'
  },
  {
    id: 'visit-4',
    name: '서귀포시',
    province: '제주특별자치도',
    city: '서귀포시',
    visitDate: new Date('2023-12-01'),
    duration: 21,
    purpose: 'living',
    rating: 5,
    memo: '바다가 보이는 펜션에서 3주간 머물며 제주의 겨울을 경험했습니다. 관광업 분들과 좋은 인연을 맺었어요.',
    coordinates: [126.2876, 33.2269], // 서귀포시
    populationRisk: 'low'
  },
  {
    id: 'visit-5',
    name: '영양읍',
    province: '경상북도',
    city: '영양군',
    visitDate: new Date('2024-01-15'),
    duration: 10,
    purpose: 'visit',
    rating: 3,
    memo: '산간 마을에서 템플스테이 비슷한 경험을 했어요. 조용하지만 다소 외로웠습니다.',
    coordinates: [129.1123, 36.6696], // 영양읍
    populationRisk: 'high'
  },
  {
    id: 'visit-6',
    name: '의성읍',
    province: '경상북도', 
    city: '의성군',
    visitDate: new Date('2024-02-28'),
    duration: 5,
    purpose: 'travel',
    rating: 4,
    memo: '마늘과 양파로 유명한 지역을 탐방했습니다. 농업 기술의 발전이 인상적이었어요.',
    coordinates: [128.6969, 36.3525], // 의성읍
    populationRisk: 'high'
  }
];

// 더미 배지 데이터
export const dummyBadges: UserBadge[] = [
  {
    id: 'badge-1',
    name: '시골 탐험가',
    description: '5개 이상의 시골 지역을 방문했어요',
    icon: '🗺️',
    earnedDate: new Date('2023-08-15'),
    category: 'explorer'
  },
  {
    id: 'badge-2', 
    name: '위험 지역 수호자',
    description: '인구 감소 위험이 높은 지역에 1개월 이상 거주했어요',
    icon: '🛡️',
    earnedDate: new Date('2023-08-15'),
    category: 'lifesaver'
  },
  {
    id: 'badge-3',
    name: '농촌 체험왕',
    description: '농업 관련 활동에 3번 이상 참여했어요',
    icon: '🌾',
    earnedDate: new Date('2023-06-10'),
    category: 'community'
  },
  {
    id: 'badge-4',
    name: '사계절 여행자',
    description: '1년 동안 4계절 모두 지역 방문을 완주했어요',
    icon: '🎯',
    earnedDate: new Date('2024-02-28'),
    category: 'explorer'
  },
  {
    id: 'badge-5',
    name: '지역 친화 대사',
    description: '모든 방문 지역에서 평점 4점 이상을 기록했어요',
    icon: '⭐',
    earnedDate: new Date('2024-01-15'),
    category: 'community'
  }
];

// 더미 사용자 데이터
export const dummyUser: User = {
  id: 'user-1',
  preferences: {
    livingStyle: 'traditional',
    socialStyle: 'community-oriented',
    workStyle: 'remote-worker',
    hobbyStyle: 'nature-lover',
    pace: 'balanced',
    budget: 'medium'
  },
  matches: ['hanok-001', 'farm-001'],
  favorites: ['hanok-001', 'modern-001', 'farm-001'],
  visitedRegions: dummyVisitedRegions,
  badges: dummyBadges,
  profile: {
    name: '김라이즈',
    age: 29,
    currentLocation: '서울특별시',
    occupation: 'UI/UX 디자이너',
    explorerLevel: 3,
    totalVisitDays: 87,
    riskyRegionsHelped: 4
  }
};