import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { instructorId, attendanceStatus } = body;

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: '강사 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!attendanceStatus || !['attended', 'absent', 'late'].includes(attendanceStatus)) {
      return NextResponse.json(
        { success: false, error: '올바른 출석 상태를 선택해주세요.' },
        { status: 400 }
      );
    }

    // 수강 내역 조회 및 권한 확인
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id },
      include: {
        class: {
          select: { instructorId: true }
        },
        session: {
          select: { sessionDate: true }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: '수강 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 강사 권한 확인
    if (enrollment.class.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 출석 체크는 세션 날짜 이후에만 가능
    const sessionDate = new Date(enrollment.session.sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate > today) {
      return NextResponse.json(
        { success: false, error: '세션 날짜 이후에 출석 체크가 가능합니다.' },
        { status: 400 }
      );
    }

    // 출석 상태 업데이트
    const updated = await prisma.classEnrollment.update({
      where: { id },
      data: {
        attendanceStatus,
        // 출석 체크를 하면 자동으로 completed 상태로 변경
        status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: '출석 상태가 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
