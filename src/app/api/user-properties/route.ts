import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 모든 사용자 매물 조회 (또는 특정 사용자의 매물)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'active';

    const where: any = { status };
    if (userId) {
      where.userId = parseInt(userId);
    }

    const properties = await prisma.userProperty.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('사용자 매물 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '매물 조회 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: 새로운 매물 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      district,
      city,
      region,
      address,
      rent,
      sale,
      deposit,
      rooms,
      size,
      type,
      yearBuilt,
      condition,
      images,
      features,
      contact,
    } = body;

    // 필수 필드 검증
    if (!userId || !title || !district || !city || !contact) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    const property = await prisma.userProperty.create({
      data: {
        userId,
        title,
        description: description || '',
        district,
        city,
        region,
        address,
        rent: rent || null,
        sale: sale || null,
        deposit: deposit || null,
        rooms: rooms || 0,
        size: size || 0,
        type: type || '단독주택',
        yearBuilt: yearBuilt || null,
        condition: condition || '양호',
        features: features || [],
        contact,
        status: 'active',
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            order: index,
            isPrimary: index === 0, // 첫 번째 이미지를 대표 이미지로 설정
          })),
        },
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '매물이 등록되었습니다',
      data: property,
    });
  } catch (error) {
    console.error('매물 등록 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '매물 등록 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: 매물 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { propertyId, userId } = await request.json();

    if (!propertyId || !userId) {
      return NextResponse.json(
        { success: false, error: '매물 ID와 사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 본인의 매물인지 확인
    const property = await prisma.userProperty.findFirst({
      where: {
        id: propertyId,
        userId: userId,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없거나 매물을 찾을 수 없습니다' },
        { status: 403 }
      );
    }

    await prisma.userProperty.delete({
      where: {
        id: propertyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '매물이 삭제되었습니다',
    });
  } catch (error) {
    console.error('매물 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '매물 삭제 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
