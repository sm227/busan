import { NextRequest, NextResponse } from 'next/server';
import { 
  createGuestbookEntry, 
  getGuestbookEntries, 
  getGuestbookEntry,
  updateGuestbookEntry,
  deleteGuestbookEntry,
  incrementGuestbookLikes
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

    const result = createGuestbookEntry(userId, {
      title,
      content,
      location,
      rating,
      category,
      propertyId,
      tags
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        entryId: result.entryId,
        message: '커뮤니티 글이 성공적으로 작성되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('커뮤니티 글 작성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const entryId = searchParams.get('entryId');

    // 특정 글 조회
    if (entryId) {
      const entry = getGuestbookEntry(parseInt(entryId));
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

    // 목록 조회 (고도화된 필터 지원)
    const filters: any = {};
    
    // 검색/필터 파라미터들
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    if (category) filters.category = category;
    if (searchParams.get('location')) filters.location = searchParams.get('location');
    if (searchParams.get('tag')) filters.tag = searchParams.get('tag');
    if (searchParams.get('minRating')) filters.minRating = parseInt(searchParams.get('minRating')!);
    if (searchParams.get('sortBy')) {
      const sortBy = searchParams.get('sortBy');
      if (['created_at', 'likes_count', 'rating', 'comments_count', 'latest_comment'].includes(sortBy!)) {
        filters.sortBy = sortBy as any;
      }
    }
    if (searchParams.get('sortOrder')) {
      const sortOrder = searchParams.get('sortOrder');
      if (['ASC', 'DESC'].includes(sortOrder!)) {
        filters.sortOrder = sortOrder as any;
      }
    }
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const entries = getGuestbookEntries(filters);
    
    return NextResponse.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('커뮤니티 글 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 글 수정
export async function PUT(request: NextRequest) {
  try {
    const { entryId, userId, title, content, location, rating, tags } = await request.json();

    if (!entryId || !userId) {
      return NextResponse.json(
        { success: false, error: '글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (location !== undefined) updates.location = location;
    if (rating !== undefined) updates.rating = rating;
    if (tags !== undefined) updates.tags = tags;

    const result = updateGuestbookEntry(entryId, userId, updates);

    if (result.success) {
      return NextResponse.json({
        success: true,
        changes: result.changes,
        message: '커뮤니티 글이 성공적으로 수정되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
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
    // URL 파라미터에서 데이터 추출
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');
    const userId = searchParams.get('userId');

    if (!entryId || !userId) {
      return NextResponse.json(
        { success: false, error: '글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = deleteGuestbookEntry(parseInt(entryId), parseInt(userId));

    if (result.success) {
      return NextResponse.json({
        success: true,
        changes: result.changes,
        message: '커뮤니티 글이 성공적으로 삭제되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('커뮤니티 글 삭제 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
