import { NextRequest, NextResponse } from 'next/server';
import { enrollInClass, cancelEnrollment, getUserEnrollments } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const statusFilter = status ? status.split(',') : undefined;
    const enrollments = await getUserEnrollments(parseInt(userId), statusFilter);

    return NextResponse.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Enrollments API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, participants, specialRequests } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await enrollInClass(parseInt(userId), sessionId, {
      participants: participants || 1,
      specialRequests
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollmentId: result.enrollmentId,
      message: '수강 신청이 완료되었습니다.'
    });
  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const userId = searchParams.get('userId');

    if (!enrollmentId || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await cancelEnrollment(enrollmentId, parseInt(userId));

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      refundAmount: result.refundAmount,
      message: '수강 신청이 취소되었습니다.'
    });
  } catch (error) {
    console.error('Cancellation API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
