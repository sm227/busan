'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Users, ChevronRight, Filter } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  category: string;
  categoryTag: string;
  icon: string | null;
  messageCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
    authorNickname: string;
  } | null;
}

interface ChatRoomListProps {
  onSelectRoom: (room: ChatRoom) => void;
  currentUser?: { id: number; nickname: string } | null;
}

export default function ChatRoomList({ onSelectRoom, currentUser }: ChatRoomListProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRooms();
  }, [selectedCategory]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/chat/rooms?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRooms(data.data || []);
      }
    } catch (error) {
      console.error('채팅방 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'occupation': return '직업별';
      case 'hobby': return '취미별';
      case 'region': return '지역별';
      case 'topic': return '주제별';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'occupation': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'hobby': return 'bg-green-50 text-green-600 border-green-100';
      case 'region': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'topic': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 카테고리 필터 */}
      <div className="px-6 py-4 border-b border-stone-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { value: 'all', label: '전체' },
            { value: 'occupation', label: '직업별' },
            { value: 'hobby', label: '취미별' },
            { value: 'region', label: '지역별' },
            { value: 'topic', label: '주제별' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 relative">
        {rooms.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-sm">
            채팅방이 없습니다.
          </div>
        ) : (
          <>
            <div className={`space-y-3 ${!currentUser ? 'filter blur-sm select-none' : ''}`}>
              {rooms.map((room, idx) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectRoom(room)}
                  className="bg-white p-4 rounded-xl border border-stone-100 hover:border-stone-300 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    {/* 아이콘 */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-2xl flex-shrink-0">
                      {room.icon || '💬'}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-stone-800 text-sm truncate pr-2">
                          {room.name}
                        </h3>
                        {room.lastMessage && (
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">
                            {formatDate(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 mb-2">
                          {room.description}
                        </p>
                      )}

                      {/* 마지막 메시지 */}
                      {room.lastMessage ? (
                        <p className="text-xs text-stone-400 line-clamp-1">
                          <span className="font-medium">{room.lastMessage.authorNickname}</span>: {room.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic">아직 메시지가 없습니다</p>
                      )}

                      {/* 카테고리 & 메시지 수 */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getCategoryColor(room.category)}`}>
                          {getCategoryLabel(room.category)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-stone-400">
                          <MessageCircle className="w-3 h-3" />
                          {room.messageCount}
                        </span>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0 mt-2" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 비로그인 사용자 오버레이 */}
            {!currentUser && (
              <div
                onClick={() => router.push('/login')}
                className="absolute inset-0 flex items-start justify-center pt-16 bg-white/30 cursor-pointer hover:bg-white/40 transition-colors z-10"
              >
                <div className="text-stone-800 text-sm font-bold bg-white px-4 py-2 rounded-full shadow-lg pointer-events-none">
                  로그인하고 전체 보기 →
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!currentUser && (
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50">
          <p className="text-xs text-stone-500 text-center">
            채팅에 참여하려면 로그인이 필요합니다
          </p>
        </div>
      )}
    </div>
  );
}
