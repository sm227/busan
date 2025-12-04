import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // balance, purchases, transactions, all

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    switch (action) {
      case 'balance': {
        // 코인 잔액만 조회
        const user = await prisma.user.findUnique({
          where: { id: userIdNum },
          select: { coinBalance: true }
        });

        return NextResponse.json({
          success: true,
          data: {
            balance: user?.coinBalance || 0
          }
        });
      }

      case 'purchases': {
        // 구매 내역 조회
        const purchases = await prisma.coinPurchase.findMany({
          where: { userId: userIdNum },
          orderBy: { createdAt: 'desc' },
          take: 50 // 최근 50개
        });

        return NextResponse.json({
          success: true,
          data: { purchases }
        });
      }

      case 'transactions': {
        // 거래 내역 조회 (사용 내역 포함)
        const transactions = await prisma.coinTransaction.findMany({
          where: { userId: userIdNum },
          orderBy: { createdAt: 'desc' },
          take: 100 // 최근 100개
        });

        return NextResponse.json({
          success: true,
          data: { transactions }
        });
      }

      case 'usage': {
        // 사용 내역만 조회
        const usageTransactions = await prisma.coinTransaction.findMany({
          where: {
            userId: userIdNum,
            type: 'usage'
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        });

        return NextResponse.json({
          success: true,
          data: { transactions: usageTransactions }
        });
      }

      case 'all':
      default: {
        // 모든 정보 조회
        const [user, purchases, transactions] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userIdNum },
            select: { coinBalance: true }
          }),
          prisma.coinPurchase.findMany({
            where: { userId: userIdNum },
            orderBy: { createdAt: 'desc' },
            take: 50
          }),
          prisma.coinTransaction.findMany({
            where: { userId: userIdNum },
            orderBy: { createdAt: 'desc' },
            take: 100
          })
        ]);

        return NextResponse.json({
          success: true,
          data: {
            balance: user?.coinBalance || 0,
            purchases,
            transactions
          }
        });
      }
    }

  } catch (error: any) {
    console.error('Coin info fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '코인 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}