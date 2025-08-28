import { NextRequest, NextResponse } from 'next/server';
import { 
  getComments, 
  createComment, 
  deleteComment 
} from '@/lib/database';

// 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestbookId = searchParams.get('guestbookId');

    if (!guestbookId) {
      return NextResponse.json(
        { success: false, error: '방명록 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const comments = getComments(parseInt(guestbookId));
    
    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('댓글 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 작성
export async function POST(request: NextRequest) {
  try {
    const { guestbookId, userId, content, parentId } = await request.json();

    // 입력 값 검증
    if (!guestbookId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 내용 길이 검증
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '댓글은 500자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    const result = createComment(guestbookId, userId, content, parentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        commentId: result.id,
        message: '댓글이 성공적으로 작성되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('댓글 작성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, error: '댓글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = deleteComment(parseInt(commentId), parseInt(userId));

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '댓글이 성공적으로 삭제되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: (result as any).error || '삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('댓글 삭제 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
