import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 특정 채팅방의 메시지 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // cursor-based pagination

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: '채팅방 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const where: any = {
      roomId,
    };

    // cursor-based pagination을 위한 조건
    if (before) {
      where.createdAt = {
        lt: new Date(before),
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc', // 최신 메시지부터
      },
      select: {
        id: true,
        content: true,
        isSystem: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    // 오래된 메시지부터 표시하도록 역순으로 정렬
    const reversedMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      data: reversedMessages,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('메시지 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메시지 저장 (Socket.io에서 호출됨)
export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, content, isSystem } = await request.json();

    if (!roomId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 메시지 길이 검증 (1000자 제한)
    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: '메시지는 1000자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        userId: parseInt(userId),
        content,
        isSystem: isSystem || false,
      },
      select: {
        id: true,
        content: true,
        isSystem: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('메시지 저장 실패:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
