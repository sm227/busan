import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/users/[id]
 * 회원 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const targetUserId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        surveyResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        userBadges: {
          include: {
            badge: true
          }
        },
        instructorClasses: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        classEnrollments: {
          select: {
            id: true,
            class: {
              select: {
                title: true
              }
            },
            status: true,
            enrolledAt: true,
          },
          orderBy: { enrolledAt: 'desc' },
          take: 5
        },
        guestbooks: {
          select: {
            id: true,
            title: true,
            category: true,
            likesCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        coinTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userProperties: {
          select: {
            id: true,
            title: true,
            status: true,
            sale: true,
            rent: true,
            deposit: true,
            district: true,
            city: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            instructorClasses: true,
            classEnrollments: true,
            guestbooks: true,
            comments: true,
            userBadges: true,
            coinTransactions: true,
            userProperties: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Admin user detail API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * 회원 정보 수정 (역할 변경, 코인 지급 등)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const targetUserId = parseInt(id);
    const body = await request.json();

    const updateData: any = {};

    // 역할 변경
    if (body.role !== undefined) {
      if (!['user', 'instructor', 'admin'].includes(body.role)) {
        return NextResponse.json(
          { success: false, error: '올바르지 않은 역할입니다.' },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    // 코인 지급/차감
    if (body.coinAmount !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { coinBalance: true }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: '회원을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const newBalance = user.coinBalance + body.coinAmount;

      if (newBalance < 0) {
        return NextResponse.json(
          { success: false, error: '코인 잔액이 부족합니다.' },
          { status: 400 }
        );
      }

      updateData.coinBalance = newBalance;

      // 코인 트랜잭션 기록
      await prisma.coinTransaction.create({
        data: {
          userId: targetUserId,
          amount: body.coinAmount,
          type: body.coinAmount > 0 ? 'bonus' : 'usage',
          description: body.coinReason || '관리자 지급/차감',
          balanceBefore: user.coinBalance,
          balanceAfter: newBalance,
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        role: true,
        coinBalance: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Admin user update API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
