import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 채팅방 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // occupation, hobby, region, topic

    const where: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    const rooms = await prisma.chatRoom.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        categoryTag: true,
        icon: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    // 최신 메시지 정보 추가
    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { roomId: room.id },
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                nickname: true,
              },
            },
          },
        });

        return {
          ...room,
          messageCount: room._count.messages,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                authorNickname: lastMessage.user.nickname,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: roomsWithLastMessage,
    });
  } catch (error) {
    console.error('채팅방 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
