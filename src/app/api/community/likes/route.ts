import { NextRequest, NextResponse } from 'next/server';
import { toggleGuestbookLike, checkGuestbookLike } from '@/lib/database';

// 커뮤니티 글 좋아요 처리
export async function POST(request: NextRequest) {
  try {
    const { userId, entryId } = await request.json();

    if (!userId || !entryId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = toggleGuestbookLike(userId, entryId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        action: result.action,
        message: result.action === 'added' ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('좋아요 처리 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 글 좋아요 상태 확인
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const entryId = searchParams.get('entryId');

    if (!userId || !entryId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const isLiked = checkGuestbookLike(parseInt(userId), parseInt(entryId));

    return NextResponse.json({
      success: true,
      isLiked
    });
  } catch (error) {
    console.error('좋아요 상태 확인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
