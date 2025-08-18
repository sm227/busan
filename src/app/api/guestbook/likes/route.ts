import { NextRequest, NextResponse } from 'next/server';
import { incrementGuestbookLikes } from '@/lib/database';

// 방명록 좋아요 증가
export async function POST(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: '글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = incrementGuestbookLikes(entryId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        changes: result.changes,
        message: '좋아요가 반영되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('방명록 좋아요 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}