import { NextRequest, NextResponse } from 'next/server';
import { toggleGuestbookLike, checkGuestbookLike } from '@/lib/database';

// 커뮤니티 좋아요 토글
export async function POST(request: NextRequest) {
  try {
    const { userId, entryId } = await request.json();
    console.log('🔵 좋아요 요청 받음:', { userId, entryId });

    if (!userId || !entryId) {
      console.log('❌ 필수 파라미터 누락');
      return NextResponse.json(
        { success: false, error: '사용자 ID와 글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await toggleGuestbookLike(parseInt(userId), parseInt(entryId));

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`${result.action === 'added' ? '➕ 좋아요 추가' : '➖ 좋아요 취소'}:`, { userId, entryId });

    return NextResponse.json({
      success: true,
      action: result.action,
      message: result.action === 'added' ? '좋아요가 추가되었습니다.' : '좋아요가 취소되었습니다.'
    });
  } catch (error) {
    console.error('커뮤니티 좋아요 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 커뮤니티 좋아요 상태 확인
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

    const isLiked = await checkGuestbookLike(parseInt(userId), parseInt(entryId));

    return NextResponse.json({
      success: true,
      isLiked
    });
  } catch (error) {
    console.error('커뮤니티 좋아요 상태 확인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}