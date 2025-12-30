import { NextRequest, NextResponse } from 'next/server';
import { getPropertiesForAdmin, isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/properties
 * 관리자용 빈집 매물 목록 조회
 *
 * Query Parameters:
 * - userId: 관리자 ID (필수)
 * - status: active | inactive | sold | deleted (선택)
 * - search: 검색어 (선택)
 * - district: 지역 (선택)
 * - city: 도시 (선택)
 * - type: 매물 유형 (선택)
 * - ownerId: 등록자 ID (선택)
 * - sortBy: createdAt | title | rent | sale (기본: createdAt)
 * - sortOrder: ASC | DESC (기본: DESC)
 * - limit: 페이지당 항목 수 (기본: 20)
 * - offset: 오프셋 (기본: 0)
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

    // 필터 파라미터
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      district: searchParams.get('district') || undefined,
      city: searchParams.get('city') || undefined,
      type: searchParams.get('type') || undefined,
      userId: searchParams.get('ownerId') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const result = await getPropertiesForAdmin(filters);

    return NextResponse.json({
      success: true,
      data: result.properties,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset
    });
  } catch (error) {
    console.error('Admin properties API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
