import { NextRequest, NextResponse } from 'next/server';
import { getPropertyDetailForAdmin, updatePropertyStatus, deleteProperty, isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/properties/[id]
 * 관리자용 빈집 매물 상세 조회
 *
 * Query Parameters:
 * - userId: 관리자 ID (필수)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 권한 체크
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const hasPermission = await isAdmin(parseInt(userId));
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const property = await getPropertyDetailForAdmin(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: '매물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Admin property detail API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/properties/[id]
 * 빈집 매물 상태 변경
 *
 * Body:
 * - status: active | inactive | sold | deleted
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 권한 체크
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const hasPermission = await isAdmin(parseInt(userId));
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'inactive', 'sold', 'deleted'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const updated = await updatePropertyStatus(id, parseInt(userId), status);

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Admin property update API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/properties/[id]
 * 빈집 매물 삭제 (소프트 삭제)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 권한 체크
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const hasPermission = await isAdmin(parseInt(userId));
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const deleted = await deleteProperty(id, parseInt(userId));

    return NextResponse.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Admin property delete API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
