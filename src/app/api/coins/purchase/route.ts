import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, bonusAmount = 0, price, paymentMethod = 'card' } = body;

    if (!userId || !amount || !price) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 원자성 보장
    const result = await prisma.$transaction(async (tx) => {
      // 1. 현재 사용자 정보 가져오기
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { coinBalance: true }
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const totalCoins = amount + bonusAmount;
      const balanceBefore = user.coinBalance;
      const balanceAfter = balanceBefore + totalCoins;

      // 2. 구매 기록 생성
      const purchase = await tx.coinPurchase.create({
        data: {
          userId,
          amount,
          bonusAmount,
          price,
          paymentMethod,
          paymentStatus: 'completed',
          transactionId: `TXN_${Date.now()}_${userId}`, // 실제로는 결제 시스템의 ID 사용
        }
      });

      // 3. 거래 내역 생성 (구매)
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: totalCoins,
          type: 'purchase',
          description: `코인 ${amount}개 구매${bonusAmount > 0 ? ` (보너스 ${bonusAmount}개 포함)` : ''}`,
          relatedId: purchase.id,
          balanceBefore,
          balanceAfter,
        }
      });

      // 4. 사용자 코인 잔액 업데이트
      await tx.user.update({
        where: { id: userId },
        data: { coinBalance: balanceAfter }
      });

      return {
        purchase,
        newBalance: balanceAfter,
      };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Coin purchase error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '코인 구매 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}