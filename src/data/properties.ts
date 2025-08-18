import { RuralProperty } from '@/types';

export const sampleProperties: RuralProperty[] = [
  {
    id: 'modern-001',
    title: '제주 서귀포 펜션',
    location: {
      district: '안덕면',
      city: '서귀포시', 
      region: '제주특별자치도',
      coordinates: [126.2876, 33.2269]
    },
    images: [
      '/house/house2.jpeg',
      '/images/jeju-view.jpg',
      '/images/jeju-interior.jpg'
    ],
    price: {
      rent: 100000,
      deposit: 800000
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
      '/house/house3.jpeg',
      '/images/farm-field.jpg',
      '/images/farm-barn.jpg'
    ],
    price: {
      rent: 30000,
      deposit: 200000
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
      '/house/house4.jpeg',
      '/images/coastal-beach.jpg',
      '/images/coastal-sunrise.jpg'
    ],
    price: {
      rent: 70000,
      deposit: 400000
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
    title: '충북 단양 도담마을 한옥',
    location: {
      district: '단성면',
      city: '단양군',
      region: '충청북도',
      coordinates: [128.3656, 36.9659]
    },
    images: [
      '/house/house1.jpg',
      '/images/mountain-valley.jpg',
      '/images/mountain-trail.jpg'
    ],
    price: {
      rent: 50000,
      deposit: 300000
    },
    details: {
      rooms: 3,
      size: 90,
      type: 'hanok',
      yearBuilt: 1915,
      condition: 'good'
    },
    features: [
      '전통 구들',
      '나무 마루',
      '강 전망',
      '조용한 환경',
      '석회동굴 인근'
    ],
    surroundings: {
      nearbyFacilities: ['마을회관', '버스정류장', '도담삼봉 관광지'],
      transportation: ['단양읍 25분', '시내버스 운행'],
      naturalFeatures: ['남한강', '도담삼봉', '석회동굴군']
    },
    communityInfo: {
      population: 58,
      averageAge: 64,
      mainIndustries: ['관광업', '한방약초', '민박업'],
      culturalActivities: ['동굴 탐험', '강변 산책', '전통차 만들기']
    }
  },
  
  // 5. 제주도 서귀포 돌집
  {
    id: 'jeju-001',
    title: '서귀포 바다뷰 돌집',
    location: {
      district: '남원읍',
      city: '서귀포시',
      region: '제주특별자치도',
      coordinates: [126.6281, 33.2869]
    },
    images: [
      '/house/house7.jpeg',
      '/images/jeju-stone-house.jpg',
      '/images/jeju-ocean-view.jpg'
    ],
    price: {
      rent: 120000,
      deposit: 1000000
    },
    details: {
      rooms: 2,
      size: 85,
      type: 'modern',
      yearBuilt: 2010,
      condition: 'excellent'
    },
    features: [
      '바다 전망',
      '돌담 정원',
      '제주 돌집',
      '테라스',
      '감귤밭 인근'
    ],
    surroundings: {
      nearbyFacilities: ['남원포구', '위미항', '표선해수욕장'],
      transportation: ['서귀포시 20분', '제주공항 45분'],
      naturalFeatures: ['한라산', '태평양', '용눈이오름']
    },
    communityInfo: {
      population: 180,
      averageAge: 58,
      mainIndustries: ['감귤재배', '관광업', '어업'],
      culturalActivities: ['해녀 체험', '감귤 따기', '오름 등반']
    }
  },

  // 6. 전남 담양 대나무집
  {
    id: 'damyang-001',
    title: '담양 죽녹원 인근 전원주택',
    location: {
      district: '담양읍',
      city: '담양군',
      region: '전라남도',
      coordinates: [126.9880, 35.3214]
    },
    images: [
      '/house/house10.jpg',
      '/images/damyang-bamboo.jpg',
      '/images/country-house.jpg'
    ],
    price: {
      rent: 60000,
      deposit: 300000
    },
    details: {
      rooms: 3,
      size: 110,
      type: 'modern',
      yearBuilt: 2015,
      condition: 'excellent'
    },
    features: [
      '대나무숲 전망',
      '넓은 마당',
      '텃밭',
      '주차장',
      '친환경 소재'
    ],
    surroundings: {
      nearbyFacilities: ['죽녹원', '메타세쿼이아길', '담양시장'],
      transportation: ['담양역 10분', '광주 30분'],
      naturalFeatures: ['죽녹원', '관방제림', '영산강']
    },
    communityInfo: {
      population: 320,
      averageAge: 52,
      mainIndustries: ['대나무공예', '관광업', '농업'],
      culturalActivities: ['죽세공예 체험', '메타세쿼이아 축제', '전통시장 투어']
    }
  },

  // 7. 경남 하동 차밭집
  {
    id: 'hadong-001',
    title: '하동 녹차밭 전망집',
    location: {
      district: '화개면',
      city: '하동군',
      region: '경상남도',
      coordinates: [127.6158, 35.2031]
    },
    images: [
      '/house/house12.jpg',
      '/images/tea-field-house.jpg',
      '/images/hadong-view.jpg'
    ],
    price: {
      rent: 70000,
      deposit: 400000
    },
    details: {
      rooms: 2,
      size: 75,
      type: 'modern',
      yearBuilt: 2018,
      condition: 'excellent'
    },
    features: [
      '차밭 전망',
      '지리산 뷰',
      '원목 인테리어',
      '발코니',
      '조용한 환경'
    ],
    surroundings: {
      nearbyFacilities: ['화개장터', '쌍계사', '십리벚꽃길'],
      transportation: ['하동읍 25분', '진주 1시간'],
      naturalFeatures: ['지리산', '섬진강', '화개천']
    },
    communityInfo: {
      population: 95,
      averageAge: 61,
      mainIndustries: ['차재배', '관광업', '임업'],
      culturalActivities: ['차 만들기 체험', '벚꽃축제', '사찰 템플스테이']
    }
  },

  // 8. 충남 부여 백제마을
  {
    id: 'buyeo-001',
    title: '부여 백제문화단지 인근 한옥',
    location: {
      district: '규암면',
      city: '부여군',
      region: '충청남도',
      coordinates: [126.8957, 36.2756]
    },
    images: [
      '/house/house13.jpeg',
      '/images/buyeo-hanok.jpg',
      '/images/baekje-village.jpg'
    ],
    price: {
      rent: 85000,
      deposit: 600000
    },
    details: {
      rooms: 4,
      size: 130,
      type: 'hanok',
      yearBuilt: 2005,
      condition: 'good'
    },
    features: [
      '전통 한옥',
      '마당',
      '온돌',
      '역사문화 체험',
      '조용한 마을'
    ],
    surroundings: {
      nearbyFacilities: ['백제문화단지', '정림사지', '부여박물관'],
      transportation: ['부여읍 15분', '공주 30분'],
      naturalFeatures: ['금강', '부소산', '궁남지']
    },
    communityInfo: {
      population: 145,
      averageAge: 59,
      mainIndustries: ['관광업', '농업', '문화재 관리'],
      culturalActivities: ['백제문화축제', '전통공예 체험', '역사탐방']
    }
  },

  // 9. 강원 홍천 산골집
  {
    id: 'hongcheon-001',
    title: '홍천 숲속 통나무집',
    location: {
      district: '내면',
      city: '홍천군',
      region: '강원특별자치도',
      coordinates: [128.0851, 37.6895]
    },
    images: [
      '/house/house8.jpg',
      '/images/log-house.jpg',
      '/images/forest-view.jpg'
    ],
    price: {
      rent: 90000,
      deposit: 500000
    },
    details: {
      rooms: 3,
      size: 100,
      type: 'modern',
      yearBuilt: 2012,
      condition: 'good'
    },
    features: [
      '통나무집',
      '숲속 위치',
      '벽난로',
      '넓은 테라스',
      '자연친화적'
    ],
    surroundings: {
      nearbyFacilities: ['내면보건소', '산촌마을', '계곡'],
      transportation: ['홍천읍 40분', '춘천 1시간'],
      naturalFeatures: ['홍천강', '오음산', '계방산']
    },
    communityInfo: {
      population: 78,
      averageAge: 63,
      mainIndustries: ['임업', '산촌관광', '약초재배'],
      culturalActivities: ['산나물 채취', '계곡 물놀이', '등산']
    }
  },

  // 10. 경북 문경 도자기마을
  {
    id: 'mungyeong-001',
    title: '문경 전통 도자기마을 집',
    location: {
      district: '가은읍',
      city: '문경시',
      region: '경상북도',
      coordinates: [128.1426, 36.7694]
    },
    images: [
      '/house/house9.jpg',
      '/images/pottery-village.jpg',
      '/images/ceramic-house.jpg'
    ],
    price: {
      rent: 65000,
      deposit: 350000
    },
    details: {
      rooms: 2,
      size: 80,
      type: 'modern',
      yearBuilt: 2008,
      condition: 'good'
    },
    features: [
      '도자기 공방',
      '전통 가마',
      '작업실',
      '전시공간',
      '예술 마을'
    ],
    surroundings: {
      nearbyFacilities: ['도자기박물관', '전통시장', '문경새재'],
      transportation: ['문경시 20분', '점촌역 25분'],
      naturalFeatures: ['조령산', '문경새재', '영강']
    },
    communityInfo: {
      population: 112,
      averageAge: 55,
      mainIndustries: ['도자기 제작', '관광업', '전통공예'],
      culturalActivities: ['도자기 체험', '가마 축제', '전통공예 워크샵']
    }
  },

  // 11. 전북 고창 고인돌마을
  {
    id: 'gochang-001',
    title: '고창 고인돌공원 인근 농가',
    location: {
      district: '고창읍',
      city: '고창군',
      region: '전라북도',
      coordinates: [126.7017, 35.4350]
    },
    images: [
      '/house/house11.jpg',
      '/images/gochang-farm.jpg',
      '/images/dolmen-park.jpg'
    ],
    price: {
      rent: 55000,
      deposit: 250000
    },
    details: {
      rooms: 3,
      size: 95,
      type: 'farm',
      yearBuilt: 2000,
      condition: 'good'
    },
    features: [
      '농가주택',
      '큰 마당',
      '창고',
      '텃밭',
      '역사유적 인근'
    ],
    surroundings: {
      nearbyFacilities: ['고인돌박물관', '선운사', '고창읍성'],
      transportation: ['고창읍 10분', '정읍 30분'],
      naturalFeatures: ['선운산', '고창갯벌', '동림저수지']
    },
    communityInfo: {
      population: 280,
      averageAge: 58,
      mainIndustries: ['농업', '관광업', '수산업'],
      culturalActivities: ['고인돌 축제', '선운사 템플스테이', '갯벌 체험']
    }
  },

  // 12. 충북 영동 와인마을
  {
    id: 'yeongdong-001',
    title: '영동 와이너리 인근 주택',
    location: {
      district: '영동읍',
      city: '영동군',
      region: '충청북도',
      coordinates: [127.7764, 36.1750]
    },
    images: [
      '/house/house14.jpg',
      '/images/winery-house.jpg',
      '/images/vineyard-view.jpg'
    ],
    price: {
      rent: 75000,
      deposit: 400000
    },
    details: {
      rooms: 2,
      size: 85,
      type: 'modern',
      yearBuilt: 2016,
      condition: 'excellent'
    },
    features: [
      '포도밭 전망',
      '와인 저장고',
      '테라스',
      '바베큐 시설',
      '현대적 시설'
    ],
    surroundings: {
      nearbyFacilities: ['와이너리', '영동시장', '난계국악원'],
      transportation: ['영동역 15분', '대전 1시간'],
      naturalFeatures: ['금강', '민주지산', '포도밭']
    },
    communityInfo: {
      population: 195,
      averageAge: 54,
      mainIndustries: ['포도재배', '와인제조', '관광업'],
      culturalActivities: ['와인축제', '포도따기 체험', '국악공연']
    }
  },

  // 13. 경남 산청 한방마을
  {
    id: 'sancheong-001',
    title: '산청 한방약초마을 집',
    location: {
      district: '금서면',
      city: '산청군',
      region: '경상남도',
      coordinates: [127.8739, 35.4153]
    },
    images: [
      '/house/house5.jpeg',
      '/images/herb-village.jpg',
      '/images/mountain-house.jpg'
    ],
    price: {
      rent: 50000,
      deposit: 200000
    },
    details: {
      rooms: 2,
      size: 70,
      type: 'farm',
      yearBuilt: 1995,
      condition: 'needs-repair'
    },
    features: [
      '약초밭',
      '건조시설',
      '산속 위치',
      '약수터 인근',
      '전통 농가'
    ],
    surroundings: {
      nearbyFacilities: ['한방박물관', '약초시장', '덕천서원'],
      transportation: ['산청읍 30분', '진주 50분'],
      naturalFeatures: ['지리산', '경호강', '약수터']
    },
    communityInfo: {
      population: 65,
      averageAge: 67,
      mainIndustries: ['한방약초', '산촌관광', '임업'],
      culturalActivities: ['약초 캐기', '한방 체험', '산나물 축제']
    }
  },

  // 14. 전남 영광 굴비마을
  {
    id: 'yeonggwang-001',
    title: '영광 법성포 굴비마을 집',
    location: {
      district: '법성면',
      city: '영광군',
      region: '전라남도',
      coordinates: [126.5431, 35.3678]
    },
    images: [
      '/house/house15.jpg',
      '/images/gulbi-village.jpg',
      '/images/fishing-village.jpg'
    ],
    price: {
      rent: 45000,
      deposit: 180000
    },
    details: {
      rooms: 2,
      size: 65,
      type: 'modern',
      yearBuilt: 2005,
      condition: 'good'
    },
    features: [
      '바다 근처',
      '굴비 건조장',
      '어촌 마을',
      '소박한 집',
      '전통 어업'
    ],
    surroundings: {
      nearbyFacilities: ['법성포구', '굴비시장', '백제불교최초도래지'],
      transportation: ['영광읍 20분', '광주 1시간 30분'],
      naturalFeatures: ['서해바다', '법성포', '칠산바다']
    },
    communityInfo: {
      population: 89,
      averageAge: 62,
      mainIndustries: ['어업', '굴비 가공', '관광업'],
      culturalActivities: ['굴비축제', '어촌 체험', '갯벌 체험']
    }
  },

  // 15. 강원 인제 계곡집
  {
    id: 'inje-001',
    title: '인제 내린천 계곡집',
    location: {
      district: '기린면',
      city: '인제군',
      region: '강원특별자치도',
      coordinates: [128.1697, 38.0697]
    },
    images: [
      '/house/house16.jpg',
      '/images/valley-house.jpg',
      '/images/mountain-stream.jpg'
    ],
    price: {
      rent: 80000,
      deposit: 450000
    },
    details: {
      rooms: 3,
      size: 90,
      type: 'modern',
      yearBuilt: 2014,
      condition: 'excellent'
    },
    features: [
      '계곡 바로 앞',
      '산속 위치',
      '깨끗한 공기',
      '데크',
      '자연 친화'
    ],
    surroundings: {
      nearbyFacilities: ['내린천래프팅', '자작나무숲', '용늪'],
      transportation: ['인제읍 45분', '춘천 1시간 30분'],
      naturalFeatures: ['내린천', '점봉산', '설악산']
    },
    communityInfo: {
      population: 45,
      averageAge: 65,
      mainIndustries: ['산촌관광', '래프팅', '임업'],
      culturalActivities: ['래프팅', '등산', '자연 체험']
    }
  },

  // 17. 전북 무주 산골마을
  {
    id: 'muju-001',
    title: '무주 덕유산 산골집',
    location: {
      district: '설천면',
      city: '무주군',
      region: '전라북도',
      coordinates: [127.7361, 35.9075]
    },
    images: [
      '/house/house17.jpg',
      '/images/mountain-village.jpg',
      '/images/deogyusan-house.jpg'
    ],
    price: {
      rent: 70000,
      deposit: 350000
    },
    details: {
      rooms: 3,
      size: 95,
      type: 'modern',
      yearBuilt: 2011,
      condition: 'good'
    },
    features: [
      '덕유산 전망',
      '산속 마을',
      '온천 인근',
      '스키장 근처',
      '사계절 관광'
    ],
    surroundings: {
      nearbyFacilities: ['덕유산리조트', '구천동계곡', '무주온천'],
      transportation: ['무주읍 30분', '대전 1시간 30분'],
      naturalFeatures: ['덕유산', '구천동계곡', '향적봉']
    },
    communityInfo: {
      population: 98,
      averageAge: 59,
      mainIndustries: ['관광업', '임업', '농업'],
      culturalActivities: ['등산', '스키', '온천욕']
    }
  },

  // 18. 충남 서천 갯벌마을
  {
    id: 'seocheon-001',
    title: '서천 갯벌체험마을 집',
    location: {
      district: '비인면',
      city: '서천군',
      region: '충청남도',
      coordinates: [126.7344, 36.0567]
    },
    images: [
      '/house/house18.jpg',
      '/images/mudflat-village.jpg',
      '/images/tidal-flat.jpg'
    ],
    price: {
      rent: 55000,
      deposit: 250000
    },
    details: {
      rooms: 2,
      size: 70,
      type: 'modern',
      yearBuilt: 2007,
      condition: 'good'
    },
    features: [
      '갯벌 체험',
      '바다 인근',
      '어촌 마을',
      '자연학습장',
      '생태 관광'
    ],
    surroundings: {
      nearbyFacilities: ['국립생태원', '서천특산물시장', '한산모시관'],
      transportation: ['서천읍 20분', '대전 1시간'],
      naturalFeatures: ['서천갯벌', '금강하구', '희리산']
    },
    communityInfo: {
      population: 135,
      averageAge: 60,
      mainIndustries: ['어업', '갯벌체험', '생태관광'],
      culturalActivities: ['갯벌체험', '조개잡이', '생태학습']
    }
  },

  // 19. 경남 거창 수승대마을
  {
    id: 'geochang-001',
    title: '거창 수승대 계곡집',
    location: {
      district: '위천면',
      city: '거창군',
      region: '경상남도',
      coordinates: [127.9167, 35.6833]
    },
    images: [
      '/house/house19.jpg',
      '/images/suseungdae-valley.jpg',
      '/images/clear-stream.jpg'
    ],
    price: {
      rent: 65000,
      deposit: 320000
    },
    details: {
      rooms: 2,
      size: 80,
      type: 'modern',
      yearBuilt: 2013,
      condition: 'excellent'
    },
    features: [
      '계곡 바로 앞',
      '맑은 물',
      '여름 휴양',
      '바위 절경',
      '피서지'
    ],
    surroundings: {
      nearbyFacilities: ['수승대관광지', '요수정', '농산물직판장'],
      transportation: ['거창읍 25분', '대구 1시간 30분'],
      naturalFeatures: ['수승대계곡', '위천', '가야산']
    },
    communityInfo: {
      population: 67,
      averageAge: 63,
      mainIndustries: ['관광업', '농업', '민박업'],
      culturalActivities: ['계곡 물놀이', '바위 구경', '여름축제']
    }
  },

  // 20. 전남 장성 황룡강마을
  {
    id: 'jangseong-001',
    title: '장성 황룡강 노란꽃집',
    location: {
      district: '북이면',
      city: '장성군',
      region: '전라남도',
      coordinates: [126.8456, 35.3011]
    },
    images: [
      '/house/house20.jpg',
      '/images/yellow-flower-field.jpg',
      '/images/hwangryong-river.jpg'
    ],
    price: {
      rent: 50000,
      deposit: 220000
    },
    details: {
      rooms: 2,
      size: 75,
      type: 'farm',
      yearBuilt: 2006,
      condition: 'good'
    },
    features: [
      '유채꽃밭',
      '강변 위치',
      '꽃 축제장',
      '사진 명소',
      '봄철 장관'
    ],
    surroundings: {
      nearbyFacilities: ['황룡강체험관', '장성호', '백양사'],
      transportation: ['장성읍 15분', '광주 40분'],
      naturalFeatures: ['황룡강', '장성호', '백양산']
    },
    communityInfo: {
      population: 156,
      averageAge: 57,
      mainIndustries: ['농업', '관광업', '화훼재배'],
      culturalActivities: ['유채꽃축제', '강변 산책', '꽃구경']
    }
  },

  // 21. 경기 가평 펜션마을
  {
    id: 'gapyeong-001',
    title: '가평 청평호반 펜션',
    location: {
      district: '청평면',
      city: '가평군',
      region: '경기도',
      coordinates: [127.4056, 37.7431]
    },
    images: [
      '/house/house21.jpg',
      '/images/lake-pension.jpg',
      '/images/cheongpyeong-lake.jpg'
    ],
    price: {
      rent: 150000,
      deposit: 1500000
    },
    details: {
      rooms: 3,
      size: 120,
      type: 'modern',
      yearBuilt: 2017,
      condition: 'excellent'
    },
    features: [
      '호수 전망',
      '현대적 시설',
      '바베큐장',
      '수상레저',
      '서울 근교'
    ],
    surroundings: {
      nearbyFacilities: ['청평역', '청평유원지', '남이섬'],
      transportation: ['청평역 10분', '서울 1시간'],
      naturalFeatures: ['청평호', '명지산', '화악산']
    },
    communityInfo: {
      population: 450,
      averageAge: 48,
      mainIndustries: ['관광업', '펜션업', '수상레저'],
      culturalActivities: ['수상스키', '낚시', '호수 크루즈']
    }
  },

  // 22. 강원 태백 폐광촌
  {
    id: 'taebaek-001',
    title: '태백 구문소 산골집',
    location: {
      district: '동점동',
      city: '태백시',
      region: '강원특별자치도',
      coordinates: [128.9856, 37.1642]
    },
    images: [
      '/house/house22.jpg',
      '/images/mining-town.jpg',
      '/images/gumunsso.jpg'
    ],
    price: {
      rent: 40000,
      deposit: 150000
    },
    details: {
      rooms: 2,
      size: 60,
      type: 'modern',
      yearBuilt: 1985,
      condition: 'needs-repair'
    },
    features: [
      '저렴한 임대료',
      '산골 마을',
      '조용한 환경',
      '구문소 인근',
      '탄광 역사'
    ],
    surroundings: {
      nearbyFacilities: ['구문소', '태백석탄박물관', '365세이프타운'],
      transportation: ['태백역 15분', '동해 1시간'],
      naturalFeatures: ['구문소', '태백산', '낙동강 발원지']
    },
    communityInfo: {
      population: 78,
      averageAge: 68,
      mainIndustries: ['관광업', '임업', '서비스업'],
      culturalActivities: ['구문소 탐방', '태백산 등반', '탄광 역사 체험']
    }
  },

  // 23. 충남 청양 칠갑산마을
  {
    id: 'cheongyang-001',
    title: '청양 칠갑산 알프스마을',
    location: {
      district: '정산면',
      city: '청양군',
      region: '충청남도',
      coordinates: [126.8011, 36.4567]
    },
    images: [
      '/house/house23.jpg',
      '/images/chilgap-mountain.jpg',
      '/images/alpine-village.jpg'
    ],
    price: {
      rent: 55000,
      deposit: 280000
    },
    details: {
      rooms: 2,
      size: 85,
      type: 'modern',
      yearBuilt: 2009,
      condition: 'good'
    },
    features: [
      '산속 마을',
      '알프스 분위기',
      '청정 공기',
      '고추밭',
      '힐링 공간'
    ],
    surroundings: {
      nearbyFacilities: ['칠갑산자연휴양림', '장곡사', '모덕사'],
      transportation: ['청양읍 20분', '공주 45분'],
      naturalFeatures: ['칠갑산', '지천', '천장호']
    },
    communityInfo: {
      population: 92,
      averageAge: 61,
      mainIndustries: ['고추재배', '관광업', '임업'],
      culturalActivities: ['고추축제', '등산', '자연휴양']
    }
  },

  // 24. 경북 울진 바닷가마을
  {
    id: 'uljin-001',
    title: '울진 죽변항 어촌집',
    location: {
      district: '죽변면',
      city: '울진군',
      region: '경상북도',
      coordinates: [129.4156, 37.0531]
    },
    images: [
      '/house/house24.jpg',
      '/images/fishing-port.jpg',
      '/images/east-sea-village.jpg'
    ],
    price: {
      rent: 60000,
      deposit: 300000
    },
    details: {
      rooms: 2,
      size: 70,
      type: 'modern',
      yearBuilt: 2004,
      condition: 'good'
    },
    features: [
      '바다 전망',
      '어촌 마을',
      '신선한 해산물',
      '등대 근처',
      '일출 명소'
    ],
    surroundings: {
      nearbyFacilities: ['죽변항', '죽변등대', '울진시장'],
      transportation: ['울진읍 25분', '동해시 40분'],
      naturalFeatures: ['동해바다', '죽변해변', '응봉산']
    },
    communityInfo: {
      population: 167,
      averageAge: 58,
      mainIndustries: ['어업', '관광업', '수산가공업'],
      culturalActivities: ['해변 축제', '일출 감상', '어촌 체험']
    }
  }
];