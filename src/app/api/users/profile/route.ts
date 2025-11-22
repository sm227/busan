import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 사용자 기본 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        nickname: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 사용자 설문 결과 조회
    const surveyResult = await prisma.surveyResult.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    // 사용자 관심목록 통계
    const likesCount = await prisma.userLike.count({
      where: { userId: parseInt(userId) }
    });

    // 방명록 작성 수
    const guestbookCount = await prisma.guestbook.count({
      where: { userId: parseInt(userId) }
    });

    // 가입일로부터 경과 일수 계산
    const joinDate = new Date(user.createdAt);
    const today = new Date();
    const daysSinceJoin = Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    // 레벨 계산 (관심목록 + 방명록 작성 수 기반)
    const totalActivity = likesCount + guestbookCount * 3;
    const explorerLevel = Math.min(Math.floor(totalActivity / 5) + 1, 10);

    // 사용자 프로필 데이터 구성
    const profile = {
      id: user.id,
      nickname: user.nickname,
      name: user.nickname, // nickname을 name으로 사용
      occupation: getOccupationFromWorkStyle(surveyResult?.workStyle || null),
      currentLocation: '서울특별시', // 기본값, 나중에 위치 정보 추가 가능
      explorerLevel,
      joinDate: user.createdAt,
      daysSinceJoin,
      totalLikes: likesCount,
      totalPosts: guestbookCount,
      riskyRegionsHelped: Math.floor(likesCount / 3), // 관심목록 3개당 1개 도움
      preferences: surveyResult ? {
        livingStyle: surveyResult.livingStyle,
        socialStyle: surveyResult.socialStyle,
        workStyle: surveyResult.workStyle,
        hobbyStyle: surveyResult.hobbyStyle,
        pace: surveyResult.pace,
        budget: surveyResult.budget
      } : null,
      badges: generateUserBadges(explorerLevel, likesCount, guestbookCount)
    };

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 업무 스타일에 따른 직업 매핑
function getOccupationFromWorkStyle(workStyle: string | null): string {
  switch (workStyle) {
    case 'remote-worker': return '원격근무자';
    case 'farmer': return '농업인';
    case 'entrepreneur': return '창업가';
    case 'retiree': return '은퇴자';
    default: return '시골 생활 탐험가';
  }
}

// 사용자 뱃지 생성
function generateUserBadges(level: number, likes: number, posts: number) {
  const badges = [];

  // 레벨 기반 뱃지
  if (level >= 5) {
    badges.push({
      id: 'explorer',
      name: '탐험가',
      description: '레벨 5 달성',
      icon: '🗺️',
      earned: true,
      earnedDate: new Date().toISOString()
    });
  }

  if (level >= 10) {
    badges.push({
      id: 'master',
      name: '마스터 탐험가',
      description: '레벨 10 달성',
      icon: '🏆',
      earned: true,
      earnedDate: new Date().toISOString()
    });
  }

  // 활동 기반 뱃지
  if (likes >= 10) {
    badges.push({
      id: 'collector',
      name: '수집가',
      description: '관심목록 10개 이상',
      icon: '❤️',
      earned: true,
      earnedDate: new Date().toISOString()
    });
  }

  if (posts >= 5) {
    badges.push({
      id: 'storyteller',
      name: '이야기꾼',
      description: '방명록 5개 이상 작성',
      icon: '📝',
      earned: true,
      earnedDate: new Date().toISOString()
    });
  }

  // 기본 뱃지
  badges.push({
    id: 'newcomer',
    name: '새로운 시작',
    description: '빈집다방에 가입',
    icon: '🌱',
    earned: true,
    earnedDate: new Date().toISOString()
  });

  return badges;
}
