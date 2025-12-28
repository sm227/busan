import { NextRequest, NextResponse } from 'next/server';
import { rejectClass } from '@/lib/admin';

/**
 * POST /api/admin/classes/[id]/reject
 * 클래스 거부
 *
 * Body:
 * - userId: 관리자 ID (필수)
 * - reason: 거부 사유 (필수)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '거부 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    const updatedClass = await rejectClass(params.id, parseInt(userId), reason);

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: '클래스가 거부되었습니다.'
    });
  } catch (error: any) {
    console.error('Reject class API error:', error);

    if (error.message === '관리자 권한이 필요합니다.') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
