import { NextRequest, NextResponse } from 'next/server';
import { getClassEnrollments } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: '강사 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const result = await getClassEnrollments(
      id,
      parseInt(instructorId)
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === '권한이 없습니다.' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Enrollments API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
