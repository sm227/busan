import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats, isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/stats
 * 관리자 통계 조회
 *
 * Query Parameters:
 * - userId: 관리자 ID (필수)
 */
export async function GET(request: NextRequest) {
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

    const stats = await getAdminStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
