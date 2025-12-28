import { NextRequest, NextResponse } from 'next/server';
import { toggleClassBookmark, getUserClassBookmarks } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const bookmarks = await getUserClassBookmarks(parseInt(userId));

    return NextResponse.json({
      success: true,
      data: bookmarks
    });
  } catch (error) {
    console.error('Bookmarks API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, classId } = await request.json();

    if (!userId || !classId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await toggleClassBookmark(parseInt(userId), classId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmarked: result.bookmarked,
      message: result.bookmarked ? '북마크에 추가했습니다.' : '북마크에서 제거했습니다.'
    });
  } catch (error) {
    console.error('Bookmark API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
