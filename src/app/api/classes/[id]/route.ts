import { NextRequest, NextResponse } from 'next/server';
import { updateOneDayClass } from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, ...classData } = body;

    // userId 검증
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 필수 필드 검증
    if (!classData.title || !classData.description || !classData.category) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (classData.price < 0) {
      return NextResponse.json(
        { success: false, error: '가격은 0 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 업데이트 실행
    const result = await updateOneDayClass(id, parseInt(userId), classData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      classId: result.classId,
      message: '클래스가 수정되었습니다.'
    });
  } catch (error) {
    console.error('Class update API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
