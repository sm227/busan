import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MatchingAlgorithm } from '@/lib/matching';
import { UserPreferences, RuralProperty } from '@/types';

// GET: 사용자의 모든 recommendation 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다' },
        { status: 400 }
      );
    }

    const recommendations = await prisma.recommendation.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(recommendations.length);

    // 사용자의 설문 결과 가져오기 (matchScore 계산용)
    const surveyResult = await prisma.surveyResult.findFirst({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let userPreferences: UserPreferences | null = null;
    if (surveyResult) {
      userPreferences = {
        livingStyle: surveyResult.livingStyle as any,
        socialStyle: surveyResult.socialStyle as any,
        workStyle: surveyResult.workStyle as any,
        hobbyStyle: surveyResult.hobbyStyle as any,
        pace: surveyResult.pace as any,
        budget: surveyResult.budget as any
      };
    }

    // Prisma 데이터를 RuralProperty 형식으로 변환
    const properties = recommendations.map((rec: any) => {
      // matchScore가 없고 userPreferences가 있으면 실시간 계산
      let matchScore = rec.matchScore;
      if (!matchScore && userPreferences) {
        const property: RuralProperty = {
          id: rec.villageId,
          title: rec.title,
          location: {
            district: rec.district,
            city: rec.city,
            region: rec.region || '',
            coordinates: [0, 0]
          },
          images: rec.images as string[],
          price: {
            rent: rec.rent,
            sale: rec.sale || undefined,
            deposit: rec.deposit || undefined
          },
          details: {
            rooms: rec.rooms,
            size: rec.size,
            type: rec.type as any,
            yearBuilt: rec.yearBuilt || undefined,
            condition: rec.condition as any
          },
          features: rec.features as string[],
          surroundings: rec.surroundings as any,
          communityInfo: rec.communityInfo as any
        };
        matchScore = MatchingAlgorithm.calculateMatchScore(userPreferences, property);
      }

      return {
        id: rec.villageId,
        dbId: rec.id,
        title: rec.title,
        location: {
          district: rec.district,
          city: rec.city,
          region: rec.region || '',
          coordinates: [0, 0]
        },
        images: rec.images as string[],
        price: {
          rent: rec.rent,
          sale: rec.sale || undefined,
          deposit: rec.deposit || undefined
        },
        details: {
          rooms: rec.rooms,
          size: rec.size,
          type: rec.type as any,
          yearBuilt: rec.yearBuilt || undefined,
          condition: rec.condition as any
        },
        features: rec.features as string[],
        surroundings: rec.surroundings as any,
        communityInfo: rec.communityInfo as any,
        aiReason: rec.aiReason || undefined,
        matchScore: matchScore || undefined
      };
    });

    return NextResponse.json({
      success: true,
      data: properties
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: 'recommendations 조회 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, property } = await request.json();

    // 이미 저장된 매물인지 확인
    const existing = await prisma.recommendation.findFirst({
      where: {
        villageId: String(property.id),
        userId: userId,
      }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '이미 저장된 매물입니다',
        recommendation: existing
      });
    }

    // 새로 저장
    const recommendation = await prisma.recommendation.create({
      data: {
        userId: userId,
        villageId: String(property.id),
        title: property.title,
        district: property.location.district,
        city: property.location.city,
        region: property.location.region || null,
        rent: property.price.rent || 0,
        sale: property.price.sale || null,
        deposit: property.price.deposit || null,
        rooms: property.details.rooms,
        size: property.details.size,
        type: property.details.type,
        yearBuilt: property.details.yearBuilt || null,
        condition: property.details.condition,
        images: property.images,
        features: property.features,
        surroundings: property.surroundings,
        communityInfo: property.communityInfo,
        aiReason: property.aiReason || null,
        matchScore: property.matchScore || null,
      },
    });


    return NextResponse.json({
      success: true,
      message: '매물이 저장되었습니다',
      recommendation
    });

  } catch (error) {
    console.error('저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '저장 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE: 왼쪽 스와이프 시 recommendation 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { userId, villageId } = await request.json();

    console.log({ userId, villageId });

    // 삭제 전 확인
    const existing = await prisma.recommendation.findMany({
      where: {
        userId: userId,
        villageId: villageId,
      }
    });

    const deleted = await prisma.recommendation.deleteMany({
      where: {
        userId: userId,
        villageId: villageId,
      }
    });

    return NextResponse.json({
      success: true,
      message: '매물이 삭제되었습니다',
      deletedCount: deleted.count
    });

  } catch (error) {
    console.error('❌ 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '삭제 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
