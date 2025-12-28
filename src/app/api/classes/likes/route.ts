import { NextRequest, NextResponse } from 'next/server';
import { toggleClassLike } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, classId } = await request.json();

    if (!userId || !classId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await toggleClassLike(parseInt(userId), classId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      liked: result.liked,
      message: result.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.'
    });
  } catch (error) {
    console.error('Class like API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
