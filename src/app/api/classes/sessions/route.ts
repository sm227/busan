import { NextRequest, NextResponse } from 'next/server';
import { createClassSession } from '@/lib/database';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { classId, instructorId, ...sessionData } = await request.json();

    if (!classId || !instructorId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Verify instructor owns the class
    const classData = await prisma.oneDayClass.findUnique({
      where: { id: classId }
    });

    if (!classData || classData.instructorId !== parseInt(instructorId)) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const result = await createClassSession(classId, sessionData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      message: '세션이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('Session creation API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
