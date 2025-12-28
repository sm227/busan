import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/classes/[id]/resubmit
 * 거부된 클래스를 다시 승인 요청
 *
 * Body:
 * - userId: 강사 ID (필수)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 클래스 조회
    const classData = await prisma.oneDayClass.findUnique({
      where: { id: params.id },
      select: {
        instructorId: true,
        status: true
      }
    });

    if (!classData) {
      return NextResponse.json(
        { success: false, error: '클래스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크
    if (classData.instructorId !== parseInt(userId)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 거부된 클래스만 재신청 가능
    if (classData.status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: '거부된 클래스만 재신청할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 상태를 pending으로 변경하고 거부 사유 제거
    const updated = await prisma.oneDayClass.update({
      where: { id: params.id },
      data: {
        status: 'pending',
        rejectionReason: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: '재신청이 완료되었습니다.'
    });
  } catch (error) {
    console.error('Resubmit class API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
