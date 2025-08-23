import { NextRequest, NextResponse } from 'next/server';
import { 
  toggleBookmark, 
  checkBookmark, 
  getUserBookmarks 
} from '@/lib/database';

// 북마크 상태 확인 & 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestbookId = searchParams.get('guestbookId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (action === 'list') {
      // 사용자의 북마크 목록 조회
      const bookmarks = getUserBookmarks(parseInt(userId));
      return NextResponse.json({
        success: true,
        data: bookmarks
      });
    } else if (guestbookId) {
      // 특정 게시글의 북마크 상태 확인
      const isBookmarked = checkBookmark(parseInt(userId), parseInt(guestbookId));
      return NextResponse.json({
        success: true,
        bookmarked: isBookmarked
      });
    } else {
      return NextResponse.json(
        { success: false, error: '올바른 요청 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('북마크 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 북마크 토글 (추가/제거)
export async function POST(request: NextRequest) {
  try {
    const { userId, guestbookId } = await request.json();

    if (!userId || !guestbookId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 방명록 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = toggleBookmark(userId, guestbookId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        bookmarked: result.bookmarked,
        message: result.bookmarked ? '북마크에 추가되었습니다.' : '북마크에서 제거되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('북마크 토글 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
