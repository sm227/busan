import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/classes/instructor
 * 강사 본인이 등록한 클래스 목록 조회
 *
 * Query Parameters:
 * - userId: 강사 ID (필수)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const classes = await prisma.oneDayClass.findMany({
      where: {
        instructorId: parseInt(userId)
      },
      include: {
        _count: {
          select: {
            sessions: true,
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Instructor classes API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
