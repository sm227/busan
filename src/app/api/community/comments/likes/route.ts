import { NextRequest, NextResponse } from 'next/server';
import { toggleCommentLike, checkCommentLike } from '@/lib/database';

// 댓글 좋아요 처리
export async function POST(request: NextRequest) {
  try {
    const { userId, commentId } = await request.json();

    console.log('댓글 좋아요 API 호출:', { userId, commentId });

    if (!userId || !commentId) {
      console.log('필수 파라미터 누락');
      return NextResponse.json(
        { success: false, error: '사용자 ID와 댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('toggleCommentLike 함수 호출 전');
    const result = toggleCommentLike(userId, commentId);
    console.log('toggleCommentLike 함수 호출 후, 결과:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        action: result.action,
        message: result.action === 'added' ? '댓글에 좋아요를 눌렀습니다.' : '댓글 좋아요를 취소했습니다.'
      });
    } else {
      console.log('toggleCommentLike 실패:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('댓글 좋아요 처리 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 좋아요 상태 확인
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const commentId = searchParams.get('commentId');

    if (!userId || !commentId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const isLiked = checkCommentLike(parseInt(userId), parseInt(commentId));

    return NextResponse.json({
      success: true,
      isLiked
    });
  } catch (error) {
    console.error('댓글 좋아요 상태 확인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
