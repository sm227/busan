import { NextRequest, NextResponse } from 'next/server';
import { createClassReview, getClassReviews } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { success: false, error: '클래스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const options = {
      sortBy: (searchParams.get('sortBy') || 'createdAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const reviews = await getClassReviews(classId, options);

    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, userId, ...reviewData } = await request.json();

    if (!enrollmentId || !userId || !reviewData.rating || !reviewData.content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json(
        { success: false, error: '평점은 1-5점 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (reviewData.content.length < 10) {
      return NextResponse.json(
        { success: false, error: '리뷰는 최소 10자 이상 작성해주세요.' },
        { status: 400 }
      );
    }

    const result = await createClassReview(enrollmentId, parseInt(userId), reviewData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reviewId: result.reviewId,
      message: '리뷰가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('Review creation API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
