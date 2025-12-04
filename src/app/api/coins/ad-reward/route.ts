import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const AD_REWARD_AMOUNT = 5; // 광고 시청 시 지급할 코인 개수
const DAILY_AD_LIMIT = 3; // 하루 최대 광고 시청 횟수

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 오늘 광고 시청 횟수 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAdCount = await prisma.coinTransaction.count({
      where: {
        userId,
        type: 'ad_reward',
        createdAt: {
          gte: today
        }
      }
    });

    if (todayAdCount >= DAILY_AD_LIMIT) {
      return NextResponse.json(
        { success: false, error: '오늘의 광고 시청 횟수를 모두 사용했습니다.' },
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

      const balanceBefore = user.coinBalance;
      const balanceAfter = balanceBefore + AD_REWARD_AMOUNT;

      // 2. 거래 내역 생성
      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount: AD_REWARD_AMOUNT,
          type: 'ad_reward',
          description: `광고 시청 보상 (${todayAdCount + 1}/${DAILY_AD_LIMIT})`,
          balanceBefore,
          balanceAfter,
        }
      });

      // 3. 사용자 코인 잔액 업데이트
      await tx.user.update({
        where: { id: userId },
        data: { coinBalance: balanceAfter }
      });

      return {
        transaction,
        newBalance: balanceAfter,
        remainingAds: DAILY_AD_LIMIT - todayAdCount - 1,
      };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Ad reward error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '광고 보상 지급 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}