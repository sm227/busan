'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  user: {
    id: number;
    nickname: string;
  };
}

interface ChatRoomProps {
  room: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
  };
  currentUser: { id: number; nickname: string };
  onBack: () => void;
}

export default function ChatRoom({ room, currentUser, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1); // 최소 1명 (나)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    loadMessages();

    // 폴링으로 새 메시지 확인 (5초마다)
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(true);
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [room.id]);

  // 스크롤 위치 감지
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserScrollingRef.current = !isAtBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 메시지 변경 시 조건부 스크롤
  useEffect(() => {
    // 메시지 개수가 변경된 경우에만 처리
    if (messages.length !== lastMessageCountRef.current) {
      // 사용자가 스크롤 중이 아닐 때만 자동 스크롤
      if (!isUserScrollingRef.current) {
        scrollToBottom();
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [messages]);

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/chat/messages?roomId=${room.id}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);

        // 최근 10개 메시지 기반으로 활성 사용자 수 추정
        const recentMessages = (data.data || []).slice(-10);
        const uniqueUsers = new Set(recentMessages.map((m: ChatMessage) => m.user.id));
        setOnlineCount(Math.max(1, uniqueUsers.size)); // 최소 1명
      }
    } catch (error) {
      console.error('메시지 로딩 실패:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    // 내가 메시지를 보낼 때는 강제로 하단으로 스크롤
    isUserScrollingRef.current = false;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          userId: currentUser.id,
          content,
          isSystem: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 즉시 메시지 목록에 추가 (낙관적 업데이트)
        setMessages((prev) => [
          ...prev,
          {
            id: data.data.id,
            content: data.data.content,
            isSystem: false,
            createdAt: data.data.createdAt,
            user: {
              id: currentUser.id,
              nickname: currentUser.nickname,
            },
          },
        ]);
      } else {
        alert('메시지 전송에 실패했습니다.');
        setInputValue(content); // 실패 시 입력값 복원
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
      setInputValue(content); // 실패 시 입력값 복원
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
  };

  // 날짜별로 메시지 그룹화
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-stone-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-2xl">{room.icon || '💬'}</div>
              <div>
                <h1 className="font-bold text-lg text-stone-800">{room.name}</h1>
                {room.description && (
                  <p className="text-xs text-stone-500">{room.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <Users className="w-4 h-4" />
            <span>{onlineCount > 0 ? onlineCount : '?'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 bg-[#FDFBF7]">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* 날짜 구분선 */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-stone-200 rounded-full text-xs text-stone-600">
                {formatDate(date)}
              </div>
            </div>

            {/* 메시지들 */}
            {msgs.map((message, idx) => {
              const isMyMessage = message.user.id === currentUser.id;
              const showAvatar = idx === 0 || msgs[idx - 1].user.id !== message.user.id;

              if (message.isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-2">
                    <p className="text-xs text-stone-400">{message.content}</p>
                  </div>
                );
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 mb-3 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* 아바타 */}
                  {!isMyMessage && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                          {message.user.nickname[0]}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {/* 닉네임 (내 메시지가 아닐 때만 표시) */}
                    {!isMyMessage && showAvatar && (
                      <span className="text-xs text-stone-500 mb-1 px-1">{message.user.nickname}</span>
                    )}

                    {/* 메시지 말풍선 */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMyMessage
                          ? 'bg-orange-500 text-white rounded-tr-sm'
                          : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>

                    {/* 시간 */}
                    <span className="text-[10px] text-stone-400 mt-1 px-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-stone-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition-colors"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              inputValue.trim() && !sending
                ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
