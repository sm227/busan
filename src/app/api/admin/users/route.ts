import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/users
 * 관리자용 회원 목록 조회
 *
 * Query Parameters:
 * - userId: 관리자 ID (필수)
 * - role: user | instructor | admin (선택)
 * - search: 검색어 (선택)
 * - sortBy: createdAt | nickname | coinBalance (기본: createdAt)
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
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // where 조건 구성
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.nickname = { contains: search, mode: 'insensitive' };
    }

    // 정렬 조건
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder.toLowerCase();

    // 회원 조회
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          nickname: true,
          role: true,
          coinBalance: true,
          createdAt: true,
          _count: {
            select: {
              instructorClasses: true,
              classEnrollments: true,
              guestbooks: true,
              comments: true,
              userBadges: true,
              userProperties: true,
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
