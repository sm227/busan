import { RuralProperty } from '@/types';

export const sampleProperties: RuralProperty[] = [
  {
    id: 'hanok-001',
    title: '안동 하회마을 전통한옥',
    location: {
      district: '하회마을',
      city: '안동시',
      region: '경상북도',
      coordinates: [128.5183, 36.5392]
    },
    images: [
      '/images/hanok-exterior.jpg',
      '/images/hanok-interior.jpg', 
      '/images/hanok-garden.jpg'
    ],
    price: {
      rent: 400000,
      deposit: 5000000
    },
    details: {
      rooms: 3,
      size: 120,
      type: 'hanok',
      yearBuilt: 1890,
      condition: 'good'
    },
    features: [
      '전통 온돌',
      '마당',
      '텃밭',
      '한옥 구조',
      '문화재 보호구역'
    ],
    surroundings: {
      nearbyFacilities: ['하회마을 전시관', '전통시장', '보건소'],
      transportation: ['마을버스 10분', '안동역 30분'],
      naturalFeatures: ['낙동강', '부용대', '전통정원']
    },
    communityInfo: {
      population: 240,
      averageAge: 65,
      mainIndustries: ['관광업', '전통공예', '농업'],
      culturalActivities: ['탈춤 공연', '전통 축제', '서원 강학']
    }
  },
  {
    id: 'modern-001',
    title: '제주 서귀포 모던 펜션',
    location: {
      district: '안덕면',
      city: '서귀포시', 
      region: '제주특별자치도',
      coordinates: [126.2876, 33.2269]
    },
    images: [
      '/images/jeju-modern.jpg',
      '/images/jeju-view.jpg',
      '/images/jeju-interior.jpg'
    ],
    price: {
      rent: 800000,
      deposit: 10000000
    },
    details: {
      rooms: 2,
      size: 85,
      type: 'modern',
      yearBuilt: 2018,
      condition: 'excellent'
    },
    features: [
      '바다 전망',
      '테라스',
      '현대식 주방',
      '무선인터넷',
      '에어컨'
    ],
    surroundings: {
      nearbyFacilities: ['중문관광단지', '카페거리', '마트'],
      transportation: ['제주공항 40분', '시내버스 5분'],
      naturalFeatures: ['중문해수욕장', '한라산', '올레길']
    },
    communityInfo: {
      population: 1200,
      averageAge: 45,
      mainIndustries: ['관광업', '농업', '카페운영'],
      culturalActivities: ['올레길 걷기', '서핑', '요가 클래스']
    }
  },
  {
    id: 'farm-001',
    title: '전북 임실 농가주택',
    location: {
      district: '관촌면',
      city: '임실군',
      region: '전라북도',
      coordinates: [127.2899, 35.6036]
    },
    images: [
      '/images/farm-house.jpg',
      '/images/farm-field.jpg',
      '/images/farm-barn.jpg'
    ],
    price: {
      rent: 250000,
      deposit: 3000000
    },
    details: {
      rooms: 4,
      size: 150,
      type: 'farm',
      yearBuilt: 1985,
      condition: 'good'
    },
    features: [
      '넓은 마당',
      '창고',
      '농기구 보관소',
      '우물',
      '텃밭 3000평'
    ],
    surroundings: {
      nearbyFacilities: ['농협', '보건소', '초등학교'],
      transportation: ['임실읍 15분', '전주 1시간'],
      naturalFeatures: ['옥정호', '산림욕장', '계곡']
    },
    communityInfo: {
      population: 85,
      averageAge: 62,
      mainIndustries: ['농업', '축산업', '치즈제조'],
      culturalActivities: ['농촌체험', '치즈축제', '등산모임']
    }
  },
  {
    id: 'coastal-001',
    title: '강원 강릉 바다 전망 주택',
    location: {
      district: '사천면',
      city: '강릉시',
      region: '강원특별자치도', 
      coordinates: [128.9012, 37.7519]
    },
    images: [
      '/images/coastal-house.jpg',
      '/images/coastal-beach.jpg',
      '/images/coastal-sunrise.jpg'
    ],
    price: {
      rent: 600000,
      deposit: 8000000
    },
    details: {
      rooms: 3,
      size: 95,
      type: 'modern',
      yearBuilt: 2015,
      condition: 'excellent'
    },
    features: [
      '바다 전망',
      '보일러',
      '주차장',
      '베란다',
      '방음시설'
    ],
    surroundings: {
      nearbyFacilities: ['해변', '항구', '수산시장'],
      transportation: ['강릉역 20분', '고속버스 10분'],
      naturalFeatures: ['동해바다', '해변가', '소나무숲']
    },
    communityInfo: {
      population: 450,
      averageAge: 52,
      mainIndustries: ['어업', '관광업', '펜션운영'],
      culturalActivities: ['해변 산책', '낚시', '카페 투어']
    }
  },
  {
    id: 'mountain-001',
    title: '경북 봉화 산골마을 한옥',
    location: {
      district: '소천면',
      city: '봉화군',
      region: '경상북도',
      coordinates: [128.7326, 36.8924]
    },
    images: [
      '/images/mountain-hanok.jpg',
      '/images/mountain-valley.jpg',
      '/images/mountain-trail.jpg'
    ],
    price: {
      rent: 200000,
      deposit: 2000000
    },
    details: {
      rooms: 2,
      size: 80,
      type: 'traditional',
      yearBuilt: 1920,
      condition: 'needs-repair'
    },
    features: [
      '전통 구들',
      '나무 마루',
      '산 전망',
      '조용한 환경',
      '별관 창고'
    ],
    surroundings: {
      nearbyFacilities: ['마을회관', '버스정류장', '약수터'],
      transportation: ['봉화읍 40분', '대중교통 제한적'],
      naturalFeatures: ['태백산맥', '계곡', '자연휴양림']
    },
    communityInfo: {
      population: 32,
      averageAge: 68,
      mainIndustries: ['임업', '산나물', '약초재배'],
      culturalActivities: ['등산', '산나물 채취', '전통주 빚기']
    }
  }
];