import { NextRequest, NextResponse } from 'next/server';
import {
  createGuestbookEntry,
  getGuestbookEntries,
  getGuestbookEntry,
  updateGuestbookEntry,
  deleteGuestbookEntry
} from '@/lib/database';

// 커뮤니티 글 작성
export async function POST(request: NextRequest) {
  try {
    const { userId, title, content, location, rating, category, propertyId, tags } = await request.json();

    // 입력 값 검증
    if (!userId || !title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 카테고리 검증
    const validCategories = ['experience', 'review', 'tip', 'question'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: '올바르지 않은 카테고리입니다.' },
        { status: 400 }
      );
    }

    // 제목과 내용 길이 검증
    if (title.length > 100) {
      return NextResponse.json(
        { success: false, error: '제목은 100자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: '내용은 2000자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    // 평점 검증
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: '평점은 1-5점 사이로 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await createGuestbookEntry(parseInt(userId), {
      title,
      content,
      location,
      rating,
      category,
      propertyId,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : []
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      entryId: result.entryId,
      message: '커뮤니티 글이 성공적으로 작성되었습니다.'
    });
  } catch (error) {
    console.error('커뮤니티 글 작성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const tag = searchParams.get('tag');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const entryId = searchParams.get('entryId');

    // 특정 글 조회
    if (entryId) {
      const entry = await getGuestbookEntry(parseInt(entryId));
      if (entry) {
        return NextResponse.json({
          success: true,
          data: entry
        });
      } else {
        return NextResponse.json(
          { success: false, error: '커뮤니티 글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 필터링 및 정렬 옵션
    const entries = await getGuestbookEntries({
      search: search || undefined,
      category: category && category !== 'all' ? category : undefined,
      location: location || undefined,
      tag: tag || undefined,
      minRating: minRating ? parseInt(minRating) : undefined,
      sortBy: sortBy as any,
      sortOrder,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('커뮤니티 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 글 수정
export async function PUT(request: NextRequest) {
  try {
    const { entryId, userId, title, content, location, rating, category, tags } = await request.json();

    if (!entryId || !userId) {
      return NextResponse.json(
        { success: false, error: '글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (location !== undefined) updates.location = location;
    if (rating !== undefined) updates.rating = rating;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    const result = await updateGuestbookEntry(
      parseInt(entryId),
      parseInt(userId),
      updates
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('권한') ? 403 : result.error?.includes('찾을 수 없습니다') ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '커뮤니티 글이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('커뮤니티 글 수정 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 글 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');
    const userId = searchParams.get('userId');

    if (!entryId || !userId) {
      return NextResponse.json(
        { success: false, error: '글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await deleteGuestbookEntry(
      parseInt(entryId),
      parseInt(userId)
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes('권한') ? 403 : result.error?.includes('찾을 수 없습니다') ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '커뮤니티 글이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('커뮤니티 글 삭제 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}