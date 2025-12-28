import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const UNLOCK_COST = 100; // 매물 해제 비용 (코인)

export async function POST(request: NextRequest) {
  try {
    const { userId, propertyId } = await request.json();

    if (!userId || !propertyId) {
      return NextResponse.json(
        { success: false, error: 'userId와 propertyId가 필요합니다.' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    // 1. 사용자 코인 잔액 확인
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      select: { coinBalance: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (user.coinBalance < UNLOCK_COST) {
      return NextResponse.json(
        {
          success: false,
          error: '코인이 부족합니다.',
          currentBalance: user.coinBalance,
          requiredAmount: UNLOCK_COST
        },
        { status: 400 }
      );
    }

    // 2. 코인 차감 및 거래 기록 생성 (트랜잭션)
    const balanceBefore = user.coinBalance;

    const result = await prisma.$transaction(async (tx) => {
      // 코인 차감
      const updatedUser = await tx.user.update({
        where: { id: userIdNum },
        data: { coinBalance: { decrement: UNLOCK_COST } }
      });

      // 거래 기록 생성
      await tx.coinTransaction.create({
        data: {
          userId: userIdNum,
          amount: UNLOCK_COST,
          balanceBefore: balanceBefore,
          balanceAfter: updatedUser.coinBalance,
          type: 'usage',
          description: `매물 해제: ${propertyId}`,
          relatedId: propertyId
        }
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: '매물 잠금이 해제되었습니다.',
      newBalance: result.coinBalance,
      unlockedPropertyId: propertyId
    });

  } catch (error: any) {
    console.error('매물 잠금 해제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '매물 잠금 해제 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
