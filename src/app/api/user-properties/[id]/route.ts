import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.userProperty.findUnique({
      where: {
        id,
      },
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
    });

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: '매물을 찾을 수 없습니다',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('매물 조회 오류:', error);
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
