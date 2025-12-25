import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Socket.io 서버 인스턴스를 전역으로 저장
let io: ServerIO | undefined;

// 방별 온라인 사용자 수 추적
const roomUsers = new Map<string, Set<string>>();

export async function GET(req: NextRequest) {
  if (!io) {
    // Socket.io 서버 초기화
    const httpServer = (req as any).socket?.server as NetServer;

    if (httpServer) {
      io = new ServerIO(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      io.on('connection', (socket) => {
        console.log('🔌 클라이언트 연결:', socket.id);

        // 채팅방 입장
        socket.on('join-room', ({ roomId, userId, nickname }) => {
          socket.join(roomId);

          // 해당 방의 사용자 Set에 추가
          if (!roomUsers.has(roomId)) {
            roomUsers.set(roomId, new Set());
          }
          roomUsers.get(roomId)!.add(socket.id);

          // 방의 온라인 사용자 수 전송
          const onlineCount = roomUsers.get(roomId)?.size || 0;
          io?.to(roomId).emit('online-count', { roomId, count: onlineCount });

          console.log(`👤 ${nickname}님이 방 ${roomId}에 입장 (온라인: ${onlineCount}명)`);

          // 입장 시스템 메시지 전송
          socket.to(roomId).emit('user-joined', {
            nickname,
            timestamp: new Date().toISOString(),
          });
        });

        // 채팅방 나가기
        socket.on('leave-room', ({ roomId, nickname }) => {
          socket.leave(roomId);

          // 해당 방의 사용자 Set에서 제거
          roomUsers.get(roomId)?.delete(socket.id);

          // 방의 온라인 사용자 수 전송
          const onlineCount = roomUsers.get(roomId)?.size || 0;
          io?.to(roomId).emit('online-count', { roomId, count: onlineCount });

          console.log(`👋 ${nickname}님이 방 ${roomId}에서 퇴장 (온라인: ${onlineCount}명)`);

          // 퇴장 시스템 메시지 전송
          socket.to(roomId).emit('user-left', {
            nickname,
            timestamp: new Date().toISOString(),
          });
        });

        // 메시지 전송
        socket.on('send-message', async (data) => {
          const { roomId, userId, nickname, content } = data;

          try {
            // 메시지를 DB에 저장
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId,
                userId,
                content,
                isSystem: false,
              }),
            });

            const result = await response.json();

            if (result.success) {
              // 방의 모든 사용자에게 메시지 브로드캐스트
              io?.to(roomId).emit('new-message', {
                id: result.data.id,
                content: result.data.content,
                userId: result.data.user.id,
                nickname: result.data.user.nickname,
                createdAt: result.data.createdAt,
                isSystem: false,
              });

              console.log(`💬 [${roomId}] ${nickname}: ${content}`);
            }
          } catch (error) {
            console.error('메시지 저장 실패:', error);
            socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
          }
        });

        // 연결 해제
        socket.on('disconnect', () => {
          console.log('🔌 클라이언트 연결 해제:', socket.id);

          // 모든 방에서 사용자 제거 및 온라인 카운트 업데이트
          roomUsers.forEach((users, roomId) => {
            if (users.has(socket.id)) {
              users.delete(socket.id);
              const onlineCount = users.size;
              io?.to(roomId).emit('online-count', { roomId, count: onlineCount });
            }
          });
        });
      });

      console.log('✅ Socket.io 서버가 초기화되었습니다.');
    }
  }

  return NextResponse.json({ success: true, message: 'Socket.io 서버가 실행 중입니다.' });
}
