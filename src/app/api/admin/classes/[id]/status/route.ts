import { NextRequest, NextResponse } from 'next/server';
import { updateClassStatus } from '@/lib/admin';

/**
 * PATCH /api/admin/classes/[id]/status
 * 클래스 상태 변경 (활성화/비활성화)
 *
 * Body:
 * - userId: 관리자 ID (필수)
 * - status: active | inactive (필수)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      );
    }

    const updatedClass = await updateClassStatus(
      params.id,
      parseInt(userId),
      status
    );

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: `클래스가 ${status === 'active' ? '활성화' : '비활성화'}되었습니다.`
    });
  } catch (error: any) {
    console.error('Update class status API error:', error);

    if (error.message === '관리자 권한이 필요합니다.' || error.message === '승인되지 않은 클래스입니다.') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error.message === '클래스를 찾을 수 없습니다.') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
