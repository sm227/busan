import { NextRequest, NextResponse } from 'next/server';
import { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '@/lib/database';

// 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestbookId = searchParams.get('guestbookId');

    if (!guestbookId) {
      return NextResponse.json(
        { success: false, error: '게시글 ID가 필요합니다.' },
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

    if (!guestbookId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 댓글 내용 길이 검증
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '댓글은 500자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    const result = createComment(guestbookId, userId, content.trim(), parentId);

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

// 댓글 수정
export async function PUT(request: NextRequest) {
  try {
    const { commentId, userId, content } = await request.json();

    if (!commentId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 댓글 내용 길이 검증
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '댓글은 500자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    const result = updateComment(commentId, userId, content.trim());

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '댓글이 성공적으로 수정되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || '댓글 수정에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('댓글 수정 API 에러:', error);
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
      const type = (result as any).type;
      return NextResponse.json({
        success: true,
        type: type,
        message: type === 'soft_delete' 
          ? '댓글이 삭제 처리되었습니다.' 
          : '댓글이 완전히 삭제되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: (result as any).error || '댓글 삭제에 실패했습니다.' },
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
