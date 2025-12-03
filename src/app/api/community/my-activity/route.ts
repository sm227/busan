import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 사용자의 활동 내역 조회 (커뮤니티)
 * - 작성한 글
 * - 좋아요를 누른 글
 * - 댓글을 작성한 글
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    // 1. 내가 작성한 글
    const myPosts = await prisma.guestbook.findMany({
      where: { userId: userIdNum },
      orderBy: { createdAt: 'desc' }
    });

    // 2. 내가 좋아요를 누른 글
    const likedPosts = await prisma.guestbookLike.findMany({
      where: { userId: userIdNum },
      include: {
        guestbook: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. 내가 댓글을 작성한 글 (중복 제거)
    const commentedPosts = await prisma.comment.findMany({
      where: { userId: userIdNum },
      include: {
        guestbook: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 좋아요 누른 글만 추출
    const likedGuestbooks = likedPosts.map(like => like.guestbook);

    // 댓글 작성한 글만 추출 (중복 제거)
    const commentedGuestbooksMap = new Map();
    commentedPosts.forEach(comment => {
      if (!commentedGuestbooksMap.has(comment.guestbook.id)) {
        commentedGuestbooksMap.set(comment.guestbook.id, comment.guestbook);
      }
    });
    const commentedGuestbooks = Array.from(commentedGuestbooksMap.values());

    // 모든 활동을 합치기 (중복 제거)
    const allActivitiesMap = new Map();

    // 내가 작성한 글 추가
    myPosts.forEach(post => {
      allActivitiesMap.set(post.id, {
        ...post,
        activityType: 'written' as const,
        activityDate: post.createdAt
      });
    });

    // 좋아요 누른 글 추가
    likedGuestbooks.forEach(post => {
      if (!allActivitiesMap.has(post.id)) {
        const likeRecord = likedPosts.find(like => like.guestbook.id === post.id);
        allActivitiesMap.set(post.id, {
          ...post,
          activityType: 'liked' as const,
          activityDate: likeRecord?.createdAt || post.createdAt
        });
      }
    });

    // 댓글 작성한 글 추가
    commentedGuestbooks.forEach(post => {
      if (!allActivitiesMap.has(post.id)) {
        const commentRecord = commentedPosts.find(comment => comment.guestbook.id === post.id);
        allActivitiesMap.set(post.id, {
          ...post,
          activityType: 'commented' as const,
          activityDate: commentRecord?.createdAt || post.createdAt
        });
      }
    });

    // 배열로 변환하고 최신순 정렬
    const allActivities = Array.from(allActivitiesMap.values()).sort((a, b) => {
      return new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime();
    });

    // 각 글에 작성자 정보 및 댓글 수 추가
    const enrichedActivities = await Promise.all(
      allActivities.map(async (activity) => {
        const author = await prisma.user.findUnique({
          where: { id: activity.userId },
          select: { nickname: true }
        });

        // 댓글 수 조회
        const commentsCount = await prisma.comment.count({
          where: { guestbookId: activity.id }
        });

        // tags를 파싱 (JSON 문자열인 경우)
        let parsedTags = activity.tags;
        if (typeof activity.tags === 'string') {
          try {
            parsedTags = JSON.parse(activity.tags);
          } catch {
            parsedTags = [];
          }
        }

        return {
          id: activity.id,
          title: activity.title,
          content: activity.content,
          location: activity.location,
          rating: activity.rating,
          category: activity.category,
          property_id: activity.propertyId,
          tags: parsedTags,
          likes_count: activity.likesCount,
          comments_count: commentsCount,
          created_at: activity.createdAt.toISOString(),
          author_nickname: author?.nickname || '알 수 없음',
          user_id: activity.userId,
          activity_type: activity.activityType,
          activity_date: activity.activityDate
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedActivities
    });

  } catch (error) {
    console.error('내 활동 조회 실패:', error);
    return NextResponse.json(
      { success: false, message: '내 활동을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
