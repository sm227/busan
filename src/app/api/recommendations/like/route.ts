import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, property } = await request.json();

    // 이미 저장된 매물인지 확인
    const existing = await prisma.recommendation.findFirst({
      where: {
        villageId: String(property.id),
        userId: userId || null,
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
        userId: userId || null,
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
      },
    });

    console.log('💾 좋아요 매물 DB 저장:', recommendation.villageId);

    return NextResponse.json({
      success: true,
      message: '좋아요 매물이 저장되었습니다',
      recommendation
    });

  } catch (error) {
    console.error('❌ 좋아요 저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '좋아요 저장 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
