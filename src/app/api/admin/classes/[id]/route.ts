import { NextRequest, NextResponse } from 'next/server';
import { getClassDetailForAdmin, isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/classes/[id]
 * 관리자용 클래스 상세 조회
 *
 * Query Parameters:
 * - userId: 관리자 ID (필수)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 권한 체크
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const hasPermission = await isAdmin(parseInt(userId));
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const classData = await getClassDetailForAdmin(params.id);

    if (!classData) {
      return NextResponse.json(
        { success: false, error: '클래스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Admin class detail API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
