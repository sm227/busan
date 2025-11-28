import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 위치 기반 특성 생성 함수
function generateLocationFeatures(district: string, city: string) {
  const locationData: { [key: string]: { [key: string]: any } } = {
    '충청북도': {
      attractionPoints: ['청정 자연환경', '한적한 시골 분위기', '전통 문화 체험'],
      nearbyFacilities: ['마을회관', '보건소', '농협'],
      transportation: ['시외버스', '마을버스'],
      naturalFeatures: ['산', '계곡', '저수지'],
      population: 150,
      averageAge: 55,
      mainIndustries: ['농업', '축산업'],
      culturalActivities: ['마을축제', '전통시장']
    },
    '충청남도': {
      attractionPoints: ['해안 접근성', '온천', '역사 유적지'],
      nearbyFacilities: ['편의점', '보건소', '농협', '우체국'],
      transportation: ['시외버스', '기차역'],
      naturalFeatures: ['바다', '산', '온천'],
      population: 200,
      averageAge: 52,
      mainIndustries: ['농업', '어업', '관광업'],
      culturalActivities: ['해변축제', '문화행사', '전통시장']
    },
    '전라북도': {
      attractionPoints: ['풍부한 먹거리', '전통 문화', '농촌 체험'],
      nearbyFacilities: ['전통시장', '보건소', '농협'],
      transportation: ['시외버스', '마을버스'],
      naturalFeatures: ['들판', '저수지', '산'],
      population: 180,
      averageAge: 58,
      mainIndustries: ['농업', '식품가공'],
      culturalActivities: ['전통축제', '마을행사', '전통시장']
    },
    '전라남도': {
      attractionPoints: ['아름다운 섬', '청정 해산물', '느긋한 삶'],
      nearbyFacilities: ['항구', '보건소', '수협'],
      transportation: ['시외버스', '여객선'],
      naturalFeatures: ['바다', '섬', '갯벌'],
      population: 120,
      averageAge: 60,
      mainIndustries: ['어업', '농업', '관광업'],
      culturalActivities: ['섬축제', '어촌체험', '전통시장']
    },
    '경상북도': {
      attractionPoints: ['역사 문화재', '산악 환경', '전통 마을'],
      nearbyFacilities: ['문화재', '보건소', '농협'],
      transportation: ['시외버스', '기차역'],
      naturalFeatures: ['산', '계곡', '사찰'],
      population: 160,
      averageAge: 57,
      mainIndustries: ['농업', '관광업', '전통공예'],
      culturalActivities: ['문화재탐방', '산악축제', '전통시장']
    },
    '경상남도': {
      attractionPoints: ['산과 바다', '온화한 기후', '풍부한 농산물'],
      nearbyFacilities: ['시장', '보건소', '농협', '항구'],
      transportation: ['시외버스', '기차역', '여객선'],
      naturalFeatures: ['산', '바다', '강'],
      population: 220,
      averageAge: 50,
      mainIndustries: ['농업', '어업', '제조업'],
      culturalActivities: ['지역축제', '해양체험', '전통시장']
    }
  };

  // 기본값
  const defaultData = {
    attractionPoints: ['한적한 시골', '자연 환경', '전원생활'],
    nearbyFacilities: ['마을회관', '보건소'],
    transportation: ['시외버스'],
    naturalFeatures: ['자연'],
    population: 100,
    averageAge: 55,
    mainIndustries: ['농업'],
    culturalActivities: ['마을축제']
  };

  return locationData[district] || defaultData;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // user_xxx 형식인 경우 사용자 매물 조회
    if (id.startsWith('user_')) {
      const userPropertyId = id.replace('user_', '');

      const userProperty = await prisma.userProperty.findUnique({
        where: { id: userPropertyId },
        include: {
          user: {
            select: { id: true, nickname: true }
          },
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!userProperty) {
        return NextResponse.json(
          { success: false, error: '매물을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      // 위치 기반 데이터 생성
      const locationFeatures = generateLocationFeatures(userProperty.district, userProperty.city);

      // 사용자 매물을 property 형식으로 변환
      const property = {
        id: `user_${userProperty.id}`,
        dbId: userProperty.id,
        title: userProperty.title,
        location: {
          district: userProperty.district,
          city: userProperty.city,
          region: userProperty.region || '',
          coordinates: [0, 0] as [number, number]
        },
        images: userProperty.images.map(img => img.url),
        price: {
          rent: userProperty.rent || undefined,
          sale: userProperty.sale || undefined,
          deposit: userProperty.deposit || undefined
        },
        details: {
          rooms: userProperty.rooms,
          size: userProperty.size,
          type: userProperty.type as 'hanok' | 'modern' | 'farm' | 'apartment',
          yearBuilt: userProperty.yearBuilt || undefined,
          condition: userProperty.condition as 'excellent' | 'good' | 'needs-repair'
        },
        features: [
          ...locationFeatures.attractionPoints,
          ...(Array.isArray(userProperty.features) ? userProperty.features as string[] : [])
        ],
        surroundings: {
          nearbyFacilities: locationFeatures.nearbyFacilities,
          transportation: locationFeatures.transportation,
          naturalFeatures: locationFeatures.naturalFeatures
        },
        communityInfo: {
          population: locationFeatures.population,
          averageAge: locationFeatures.averageAge,
          mainIndustries: locationFeatures.mainIndustries,
          culturalActivities: locationFeatures.culturalActivities
        },
        aiReason: `${userProperty.user?.nickname || '사용자'}님이 직접 등록한 매물입니다.`,
        isUserProperty: true,
        userNickname: userProperty.user?.nickname || '사용자',
        contact: userProperty.contact
      };

      return NextResponse.json({
        success: true,
        property
      });
    }

    // 기존 API 매물 조회
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        OR: [
          { id: id },
          { villageId: id }
        ]
      },
      orderBy: {
        createdAt: 'desc' // 최신 추천 정보
      }
    });

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: '매물을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Prisma가 반환한 데이터를 앱 형식으로 변환
    const property = {
      id: recommendation.villageId,
      dbId: recommendation.id,
      title: recommendation.title,
      location: {
        district: recommendation.district,
        city: recommendation.city,
        region: recommendation.region || '',
        coordinates: [0, 0] // 좌표 정보는 현재 저장하지 않음
      },
      images: recommendation.images as string[],
      price: {
        rent: recommendation.rent,
        sale: recommendation.sale || undefined,
        deposit: recommendation.deposit || undefined
      },
      details: {
        rooms: recommendation.rooms,
        size: recommendation.size,
        type: recommendation.type as 'hanok' | 'modern' | 'farm' | 'apartment',
        yearBuilt: recommendation.yearBuilt || undefined,
        condition: recommendation.condition as 'excellent' | 'good' | 'needs-repair'
      },
      features: recommendation.features as string[],
      surroundings: recommendation.surroundings as {
        nearbyFacilities?: string[];
        transportation?: string[];
        naturalFeatures?: string[];
      },
      communityInfo: recommendation.communityInfo as {
        population: number;
        averageAge: number;
        mainIndustries?: string[];
        culturalActivities?: string[];
      },
      aiReason: recommendation.aiReason || undefined
    };

    return NextResponse.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('❌ 추천 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '매물 조회 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
