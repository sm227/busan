import { RuralProperty } from '@/types';
import { HOUSE_IMAGES } from '@/config/constants';

// API 응답 데이터 타입 정의 (/infoVill 엔드포인트)
export interface RuralVillageApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: RuralVillageItem[] | RuralVillageItem; // 단일 항목일 때 배열이 아닐 수 있음
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// /infoVill API 응답 필드 (기본 정보)
export interface RuralVillageItem {
  villId?: number | string;       // 마을ID
  villNm?: string;                // 마을명
  sidoNm?: string;                // 시도명
  sggNm?: string;                 // 시군구명
  emdNm?: string;                 // 읍면동명
  legalCode?: number;             // 법정동코드
  villDescription?: string;       // 마을 설명

  // 인구 정보 (실제 응답 필드명)
  villMaleAge_0Cnt?: number;      // 남성 0-9세
  villMaleAge_10Cnt?: number;     // 남성 10-19세
  villMaleAge_20Cnt?: number;     // 남성 20-29세
  villMaleAge_30Cnt?: number;     // 남성 30-39세
  villMaleAge_40Cnt?: number;     // 남성 40-49세
  villMaleAge_50Cnt?: number;     // 남성 50-59세
  villMaleAge_60Cnt?: number;     // 남성 60-69세
  villMaleAge_65Cnt?: number;     // 남성 65세 이상

  villFemaleAge_0Cnt?: number;    // 여성 0-9세
  villFemaleAge_10Cnt?: number;   // 여성 10-19세
  villFemaleAge_20Cnt?: number;   // 여성 20-29세
  villFemaleAge_30Cnt?: number;   // 여성 30-39세
  villFemaleAge_40Cnt?: number;   // 여성 40-49세
  villFemaleAge_50Cnt?: number;   // 여성 50-59세
  villFemaleAge_60Cnt?: number;   // 여성 60-69세
  villFemaleAge_65Cnt?: number;   // 여성 65세 이상

  // 주택 정보 (실제 응답 필드명)
  villHouseTotCnt?: number;       // 총 세대수
  villHouseYear_5Cnt?: number;    // 5년 이하 주택
  villHouseYear_9Cnt?: number;    // 6-9년 주택
  villHouseYear_10Cnt?: number;   // 10-19년 주택
  villHouseYear_20Cnt?: number;   // 20-29년 주택
  villHouseYear_30Cnt?: number;   // 30년 이상 주택
  villHouseSlate?: number;        // 슬레이트 지붕 수
  villHouseEmpty?: number;        // 빈집 수
  villHouseOneCnt?: number;       // 단독주택 수

  villType?: string;              // 마을유형 (농촌형, 어촌형 등)
}

// API 데이터를 앱의 RuralProperty 형식으로 변환
export function transformVillageToProperty(item: RuralVillageItem, index: number): RuralProperty {
  // 인구 계산 (연령대별 합산)
  const malePopulation = (item.villMaleAge_0Cnt || 0) + (item.villMaleAge_10Cnt || 0) +
                        (item.villMaleAge_20Cnt || 0) + (item.villMaleAge_30Cnt || 0) +
                        (item.villMaleAge_40Cnt || 0) + (item.villMaleAge_50Cnt || 0) +
                        (item.villMaleAge_60Cnt || 0) + (item.villMaleAge_65Cnt || 0);

  const femalePopulation = (item.villFemaleAge_0Cnt || 0) + (item.villFemaleAge_10Cnt || 0) +
                          (item.villFemaleAge_20Cnt || 0) + (item.villFemaleAge_30Cnt || 0) +
                          (item.villFemaleAge_40Cnt || 0) + (item.villFemaleAge_50Cnt || 0) +
                          (item.villFemaleAge_60Cnt || 0) + (item.villFemaleAge_65Cnt || 0);

  let population = malePopulation + femalePopulation;
  let households = item.villHouseTotCnt || 0;

  // 인구가 0인 경우 기본값 설정 (빈집 마을로 추정)
  if (population === 0) {
    population = 50 + Math.floor(Math.random() * 100); // 50-150명
    households = Math.floor(population / 3); // 평균 3명/세대
  }

  // 세대수가 0인 경우
  if (households === 0) {
    households = Math.floor(population / 3) || 20;
  }

  // 위치 정보 (현재 API 응답에 위도/경도가 없으므로 기본값 사용)
  // TODO: 주소 기반 geocoding 추가 필요
  const lat = 0;
  const lng = 0;

  // 평균 연령 계산 (연령대별 중간값 사용)
  const ageGroups = [
    { male: item.villMaleAge_0Cnt || 0, female: item.villFemaleAge_0Cnt || 0, midAge: 5 },
    { male: item.villMaleAge_10Cnt || 0, female: item.villFemaleAge_10Cnt || 0, midAge: 15 },
    { male: item.villMaleAge_20Cnt || 0, female: item.villFemaleAge_20Cnt || 0, midAge: 25 },
    { male: item.villMaleAge_30Cnt || 0, female: item.villFemaleAge_30Cnt || 0, midAge: 35 },
    { male: item.villMaleAge_40Cnt || 0, female: item.villFemaleAge_40Cnt || 0, midAge: 45 },
    { male: item.villMaleAge_50Cnt || 0, female: item.villFemaleAge_50Cnt || 0, midAge: 55 },
    { male: item.villMaleAge_60Cnt || 0, female: item.villFemaleAge_60Cnt || 0, midAge: 65 },
    { male: item.villMaleAge_65Cnt || 0, female: item.villFemaleAge_65Cnt || 0, midAge: 70 },
  ];

  let totalAgeSum = 0;
  let totalPeople = 0;
  ageGroups.forEach(group => {
    const count = group.male + group.female;
    totalAgeSum += count * group.midAge;
    totalPeople += count;
  });

  const averageAge = totalPeople > 0 ? Math.round(totalAgeSum / totalPeople) : 50;

  // 주택 연령 기반 추정
  const newHouses = (item.villHouseYear_5Cnt || 0) + (item.villHouseYear_9Cnt || 0);
  const oldHouses = (item.villHouseYear_20Cnt || 0) + (item.villHouseYear_30Cnt || 0);
  const totalHouses = households || 1;

  // 주택 상태 추정
  let condition: 'excellent' | 'good' | 'needs-repair' = 'good';
  if (newHouses / totalHouses > 0.5) condition = 'excellent';
  else if (oldHouses / totalHouses > 0.7) condition = 'needs-repair';

  // 주산업 추정 (마을 유형 기반)
  const mainIndustries: string[] = [];
  if (item.villType?.includes('농촌')) mainIndustries.push('농업');
  if (item.villType?.includes('어촌')) mainIndustries.push('어업');
  if (mainIndustries.length === 0) mainIndustries.push('농업');

  // 자연 특징 (실제 지역 특성 기반)
  const naturalFeatures: string[] = [];
  const sido = item.sidoNm || '';
  const sgg = item.sggNm || '';

  // 해안 도시 (바다)
  const coastalCities = ['여수', '순천', '고흥', '보성', '장흥', '강진', '해남', '완도', '진도', '신안', '목포', '영암',
    '통영', '거제', '남해', '사천', '고성', '창원', '마산', '진해', '김해',
    '포항', '영덕', '울진', '삼척', '동해', '속초', '고성', '양양',
    '태안', '서산', '당진', '보령', '서천'];

  if (coastalCities.some(city => sgg.includes(city)) || item.villType?.includes('어촌')) {
    naturalFeatures.push('바다');
  }

  // 산악 지역
  const mountainCities = ['평창', '정선', '영월', '태백', '철원', '화천', '양구', '인제', '홍천', '횡성',
    '봉화', '울진', '영양', '청송', '예천',
    '무주', '장수', '진안', '남원'];

  if (mountainCities.some(city => sgg.includes(city)) || sido.includes('강원')) {
    naturalFeatures.push('산');
    if (sido.includes('강원')) {
      naturalFeatures.push('침엽수림');
    }
  }

  // 강/호수 지역
  const riverCities = ['춘천', '홍천', '양평', '여주', '이천', '광주', '하남',
    '공주', '부여', '청양', '논산'];

  if (riverCities.some(city => sgg.includes(city))) {
    naturalFeatures.push('강');
  }

  // 평야 지역
  if (sido.includes('전남') || sido.includes('전북')) {
    if (!naturalFeatures.some(f => f.includes('바다'))) {
      naturalFeatures.push('평야지대');
    }
  }

  // 내륙 산림 지역
  if (sido.includes('경북') || sido.includes('경남') || sido.includes('충북')) {
    if (!naturalFeatures.some(f => f.includes('바다')) && !naturalFeatures.some(f => f.includes('산'))) {
      naturalFeatures.push('산림');
    }
  }

  // 기본값
  if (naturalFeatures.length === 0) {
    naturalFeatures.push('전원');
  }

  // 주택 타입 추정
  let propertyType: 'hanok' | 'modern' | 'farm' | 'apartment' = 'farm';
  if (condition === 'excellent' && newHouses / totalHouses > 0.6) {
    propertyType = 'modern';
  } else if (population > 1000) {
    propertyType = 'apartment';
  } else if (oldHouses / totalHouses > 0.8) {
    propertyType = 'hanok';
  }

  // 면적 추정 (시골 빈집 기준 - 30평/99㎡ 이하)
  let baseSize = 50;

  // 주택 연식에 따른 기본 면적
  if (condition === 'excellent') {
    baseSize = 40 + Math.floor(Math.random() * 20); // 40-60㎡ (12-18평)
  } else if (condition === 'needs-repair') {
    baseSize = 60 + Math.floor(Math.random() * 30); // 60-90㎡ (18-27평)
  } else {
    baseSize = 50 + Math.floor(Math.random() * 25); // 50-75㎡ (15-23평)
  }

  // 인구 규모에 따른 조정
  if (population < 100) {
    baseSize += Math.floor(Math.random() * 10); // 외곽은 약간 넓음
  } else if (population > 1000) {
    baseSize -= Math.floor(Math.random() * 10); // 도시 근처는 약간 좁음
  }

  // 최대 99㎡(30평)로 제한
  baseSize = Math.min(baseSize, 99);

  // 방 개수 추정 (최대 3개) - 최소 1개 보장
  let rooms = 2;
  if (baseSize < 50) rooms = 1;
  else if (baseSize < 70) rooms = 2;
  else rooms = 3;

  // 최소 보장
  if (rooms === 0) rooms = 2;
  if (baseSize === 0 || isNaN(baseSize)) baseSize = 60;

  // 가격 범위 추정 (시골 빈집 기준 - 저렴하게)
  let baseRent = 100000;
  let baseSale = 20000000;
  let baseDeposit = 500000;

  // 인구 규모에 따른 기본 가격 (시골 빈집 가격 반영)
  if (population < 100) {
    baseRent = 50000 + Math.floor(Math.random() * 80000); // 5-13만원
    baseSale = 5000000 + Math.floor(Math.random() * 15000000); // 500-2000만원
    baseDeposit = 300000 + Math.floor(Math.random() * 700000); // 30-100만원
  } else if (population < 300) {
    baseRent = 80000 + Math.floor(Math.random() * 120000); // 8-20만원
    baseSale = 10000000 + Math.floor(Math.random() * 20000000); // 1000-3000만원
    baseDeposit = 500000 + Math.floor(Math.random() * 1000000); // 50-150만원
  } else if (population < 800) {
    baseRent = 150000 + Math.floor(Math.random() * 150000); // 15-30만원
    baseSale = 20000000 + Math.floor(Math.random() * 30000000); // 2000-5000만원
    baseDeposit = 1000000 + Math.floor(Math.random() * 1500000); // 100-250만원
  } else {
    baseRent = 250000 + Math.floor(Math.random() * 150000); // 25-40만원
    baseSale = 35000000 + Math.floor(Math.random() * 35000000); // 3500-7000만원
    baseDeposit = 2000000 + Math.floor(Math.random() * 2000000); // 200-400만원
  }

  
  if (condition === 'excellent') {
    baseRent = Math.round(baseRent * (1.2 + Math.random() * 0.3)); // 1.2-1.5배
    baseSale = Math.round(baseSale * (1.3 + Math.random() * 0.4)); // 1.3-1.7배
    baseDeposit = Math.round(baseDeposit * (1.2 + Math.random() * 0.3));
  } else if (condition === 'needs-repair') {
    baseRent = Math.round(baseRent * (0.5 + Math.random() * 0.3)); // 0.5-0.8배
    baseSale = Math.round(baseSale * (0.4 + Math.random() * 0.3)); // 0.4-0.7배
    baseDeposit = Math.round(baseDeposit * (0.5 + Math.random() * 0.3));
  }

  // 면적에 따른 추가 조정
  const sizeMultiplier = baseSize / 80; // 80㎡ 기준
  baseRent = Math.round(baseRent * (0.8 + sizeMultiplier * 0.4));
  baseSale = Math.round(baseSale * (0.8 + sizeMultiplier * 0.4));

  // 최소 가격 보장
  if (baseRent < 50000) baseRent = 80000;
  if (baseSale < 5000000) baseSale = 15000000;
  if (baseDeposit < 300000) baseDeposit = 500000;

  // 특징 추출
  const features: string[] = [];
  if (condition === 'excellent') features.push('신축 주택');
  if (condition === 'needs-repair') features.push('수리 필요');
  if (population < 200) features.push('조용한 마을');
  if (population === 0) features.push('빈집 있음');
  if (households > 50) features.push('커뮤니티 활성화');
  if (baseSize > 80) features.push('넓은 공간');
  if (baseRent < 100000) features.push('저렴한 임대료');
  if (item.villType) features.push(item.villType);

  // 최소 1개 이상 특징 보장
  if (features.length === 0) features.push('농촌 주택');

  return {
    id: String(item.villId || `api-village-${index}`),
    title: item.villNm || '농촌 마을',
    location: {
      district: item.sidoNm || '',
      city: item.sggNm || '',
      region: item.emdNm || '',
      coordinates: [lng, lat],
    },
    images: getNextImages(3),
    price: {
      rent: Math.round(baseRent / 10000) * 10000, // 만원 단위로 반올림
      sale: Math.round(baseSale / 1000000) * 1000000, // 백만원 단위로 반올림
      deposit: Math.round(baseDeposit / 100000) * 100000, // 10만원 단위로 반올림
    },
    details: {
      rooms,
      size: Math.round(baseSize),
      type: propertyType,
      yearBuilt: condition === 'excellent' ? 2020 : condition === 'good' ? 2010 : 2000,
      condition,
    },
    features,
    surroundings: {
      nearbyFacilities: generateNearbyFacilities(population, item.sggNm, item.villId),
      transportation: generateTransportation(population, item.sidoNm, item.villId),
      naturalFeatures,
    },
    communityInfo: {
      population,
      averageAge,
      mainIndustries,
      culturalActivities: [],
    },
  };
}

// 시드 기반 난수 생성 (같은 시드면 항상 같은 결과)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 편의시설 생성 함수
function generateNearbyFacilities(population: number, sggNm?: string, villId?: string | number): string[] {
  const facilities: string[] = ['마을회관'];

  // villId를 숫자로 변환하여 시드로 사용
  const seed = typeof villId === 'number' ? villId : parseInt(String(villId || '0').replace(/\D/g, '')) || 0;

  // 인구 규모별 편의시설
  if (population > 50) {
    facilities.push('농협마트');
  }
  if (population > 100) {
    facilities.push('보건소', '우체국');
  }
  if (population > 200) {
    facilities.push('초등학교', '식당');
  }
  if (population > 500) {
    facilities.push('편의점', '약국');
  }
  if (population > 800) {
    facilities.push('은행', '카페');
  }

  // 지역 특성별 시설
  const locationLower = sggNm?.toLowerCase() || '';
  if (locationLower.includes('군')) {
    facilities.push('농기계센터');
  }

  // 시드 기반으로 추가 시설 선택 (항상 같은 결과)
  const additionalFacilities = ['낚시터', '등산로', '공원', '운동장', '도서관'];
  const randomCount = Math.floor(seededRandom(seed) * 2) + 1;
  for (let i = 0; i < randomCount && i < additionalFacilities.length; i++) {
    const random = additionalFacilities[Math.floor(seededRandom(seed + i + 1) * additionalFacilities.length)];
    if (!facilities.includes(random)) {
      facilities.push(random);
    }
  }

  return facilities.slice(0, 8); // 최대 8개
}

// 교통수단 생성 함수
function generateTransportation(population: number, sidoNm?: string, villId?: string | number): string[] {
  const transportation: string[] = ['마을버스'];

  // villId를 숫자로 변환하여 시드로 사용
  const seed = typeof villId === 'number' ? villId : parseInt(String(villId || '0').replace(/\D/g, '')) || 0;

  if (population > 100) {
    transportation.push('시외버스');
  }
  if (population > 300) {
    transportation.push('택시');
  }
  if (population > 800) {
    transportation.push('카셰어링');
  }

  // 지역별 특성
  if (sidoNm?.includes('강원') || sidoNm?.includes('경북')) {
    // 산간지역
    if (!transportation.includes('시외버스')) {
      transportation.push('시외버스');
    }
  }
  if (sidoNm?.includes('전남') || sidoNm?.includes('경남')) {
    // 해안지역 - 시드 기반으로 결정 (항상 같은 결과)
    const hasBoat = seededRandom(seed + 1000) > 0.5;
    if (hasBoat) {
      transportation.push('여객선');
    }
  }

  return transportation.slice(0, 5); // 최대 5개
}

// 이미지 풀 생성 및 관리
let imagePool: number[] = [];
const TOTAL_IMAGES = 49; // house1.jpeg ~ house49.jpeg

function getNextImages(count: number = 3): string[] {
  // 풀이 부족하면 새로 채우기
  if (imagePool.length < count) {
    const newNumbers = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
    // 랜덤으로 섞기
    const shuffled = newNumbers.sort(() => Math.random() - 0.5);
    imagePool = [...imagePool, ...shuffled];
  }

  // 풀에서 앞에서부터 꺼내기
  const selected = imagePool.splice(0, count);
  return selected.map(num => HOUSE_IMAGES.getUrl(num));
}

// API 응답 전체를 변환
export function transformApiResponse(apiData: RuralVillageApiResponse): RuralProperty[] {
  const items = apiData?.response?.body?.items?.item;

  if (!items) {
    return [];
  }

  // 단일 항목인 경우 배열로 변환
  const itemArray = Array.isArray(items) ? items : [items];

  // 새로운 변환 시작 시 이미지 풀 초기화
  imagePool = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

  return itemArray.map((item, index) => transformVillageToProperty(item, index));
}
