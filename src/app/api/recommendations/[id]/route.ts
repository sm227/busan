import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 데이터베이스에서 추천 정보 조회
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
