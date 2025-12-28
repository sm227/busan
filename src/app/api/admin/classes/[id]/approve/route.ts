import { NextRequest, NextResponse } from 'next/server';
import { approveClass } from '@/lib/admin';

/**
 * POST /api/admin/classes/[id]/approve
 * 클래스 승인
 *
 * Body:
 * - userId: 관리자 ID (필수)
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
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const updatedClass = await approveClass(params.id, parseInt(userId));

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: '클래스가 승인되었습니다.'
    });
  } catch (error: any) {
    console.error('Approve class API error:', error);

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
