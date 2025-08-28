import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserBadges, 
  getAllBadges, 
  getUserStats, 
  checkAndAwardBadges 
} from '@/lib/database';

// 사용자 뱃지 및 통계 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (action === 'stats') {
      // 사용자 통계 조회
      const stats = getUserStats(parseInt(userId));
      return NextResponse.json({
        success: true,
        data: stats
      });
    } else if (action === 'all') {
      // 모든 뱃지 목록과 사용자 뱃지 조회
      const allBadges = getAllBadges();
      const userBadges = getUserBadges(parseInt(userId));
      const userBadgeIds = new Set(userBadges.map((badge: any) => badge.id));
      
      const badgesWithStatus = allBadges.map((badge: any) => {
        const userBadge = userBadges.find((ub: any) => ub.id === badge.id) as any;
        return {
          ...badge,
          earned: userBadgeIds.has(badge.id),
          earnedAt: userBadge?.earned_at || null
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          badges: badgesWithStatus,
          userBadges,
          stats: getUserStats(parseInt(userId))
        }
      });
    } else {
      // 사용자 뱃지만 조회
      const userBadges = getUserBadges(parseInt(userId));
      return NextResponse.json({
        success: true,
        data: userBadges
      });
    }
  } catch (error) {
    console.error('뱃지 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 뱃지 조건 확인 및 지급
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = checkAndAwardBadges(userId);

    if (result.success) {
      const newBadges = result.newBadges || [];
      return NextResponse.json({
        success: true,
        newBadges: newBadges,
        message: newBadges.length > 0 
          ? `${newBadges.length}개의 새로운 뱃지를 획득했습니다!`
          : '새로운 뱃지가 없습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('뱃지 확인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
