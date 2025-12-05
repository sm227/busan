import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 그룹 전용 필터 파라미터
    const occupation = searchParams.get('occupation');
    const hobbyStyle = searchParams.get('hobbyStyle');

    // 정렬 및 페이징
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';
    const limit = parseInt(searchParams.get('limit') || '50');

    // WHERE 조건 구성
    const where: any = {};

    // 그룹 필터: 작성자의 occupation, hobbyStyle로 필터링
    const userConditions: any = {};

    if (occupation) {
      // occupation은 User 테이블의 직접 필드가 아니라 SurveyResult의 occupation 필드
      // 텍스트 입력 + 드롭다운 선택 모두 지원하므로 부분 매칭
      userConditions.surveyResults = {
        some: {
          occupation: { contains: occupation, mode: 'insensitive' }
        }
      };
    }

    if (hobbyStyle) {
      if (userConditions.surveyResults) {
        // occupation과 hobbyStyle 둘 다 있을 경우
        userConditions.surveyResults.some = {
          ...userConditions.surveyResults.some,
          hobbyStyle
        };
      } else {
        userConditions.surveyResults = {
          some: {
            hobbyStyle
          }
        };
      }
    }

    if (Object.keys(userConditions).length > 0) {
      where.user = userConditions;
    }

    // ORDER BY 구성
    let orderBy: any;
    if (sortBy === 'created_at') {
      orderBy = { createdAt: sortOrder.toLowerCase() };
    } else if (sortBy === 'likes_count') {
      orderBy = { likesCount: sortOrder.toLowerCase() };
    } else if (sortBy === 'rating' && minRating) {
      orderBy = { rating: sortOrder.toLowerCase() };
    } else if (sortBy === 'comments_count') {
      orderBy = { comments: { _count: sortOrder.toLowerCase() } };
    } else if (sortBy === 'latest_comment') {
      // 최근 댓글순은 쿼리 후 정렬 필요
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Prisma 쿼리 - User와 SurveyResult JOIN
    const entries = await prisma.guestbook.findMany({
      where,
      include: {
        user: {
          select: {
            nickname: true,
            surveyResults: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                occupation: true,
                hobbyStyle: true
              }
            }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy,
      take: limit
    });

    // 최근 댓글순 정렬 (필요 시)
    let sortedEntries = entries;
    if (sortBy === 'latest_comment') {
      sortedEntries = entries.sort((a, b) => {
        const aDate = a.comments[0]?.createdAt || a.createdAt;
        const bDate = b.comments[0]?.createdAt || b.createdAt;
        return sortOrder === 'DESC'
          ? bDate.getTime() - aDate.getTime()
          : aDate.getTime() - bDate.getTime();
      });
    }

    // 응답 데이터 포맷팅
    const formattedEntries = sortedEntries.map(entry => ({
      id: entry.id,
      user_id: entry.userId,
      title: entry.title,
      content: entry.content,
      location: entry.location,
      rating: entry.rating,
      category: entry.category,
      property_id: entry.propertyId,
      tags: entry.tags,
      likes_count: entry.likesCount,
      created_at: entry.createdAt.toISOString(),
      updated_at: entry.updatedAt.toISOString(),
      author_nickname: entry.user.nickname,
      comments_count: entry._count.comments,
      author_occupation: entry.user.surveyResults[0]?.occupation || null,
      author_hobby_style: entry.user.surveyResults[0]?.hobbyStyle || null
    }));

    return NextResponse.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('그룹 필터링 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
