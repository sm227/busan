"use client";

import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import Comments from "@/components/Comments";

interface GuestbookEntry {
  id: number;
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: string;
  tags?: string;
  likes_count: number;
  created_at: string;
  author_nickname: string;
  user_id: number;
}

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useApp();
  const [entry, setEntry] = useState<GuestbookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [params.id]);

  useEffect(() => {
    if (currentUser && entry) {
      checkLikeStatus();
    }
  }, [currentUser, entry]);

  const loadEntry = async () => {
    try {
      const response = await fetch(`/api/community?entryId=${params.id}`);
      const data = await response.json();

      if (data.success) {
        setEntry(data.data);
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    if (!currentUser || !entry) return;

    try {
      const response = await fetch(`/api/community/likes?userId=${currentUser.id}&entryId=${entry.id}`);
      const data = await response.json();

      if (data.success) {
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUser || !entry) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch('/api/community/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          entryId: entry.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.action === 'added') {
          setIsLiked(true);
          setEntry({ ...entry, likes_count: entry.likes_count + 1 });
        } else {
          setIsLiked(false);
          setEntry({ ...entry, likes_count: Math.max(0, entry.likes_count - 1) });
        }
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">커뮤니티 상세</h1>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{entry.title}</h2>

          <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
            <span>{entry.author_nickname}</span>
            <span>•</span>
            <span>{new Date(entry.created_at).toLocaleDateString('ko-KR')}</span>
          </div>

          {entry.location && (
            <div className="text-sm text-gray-600 mb-4">
              📍 {entry.location}
            </div>
          )}

          {entry.rating && (
            <div className="flex items-center mb-4">
              {'⭐'.repeat(entry.rating)}
            </div>
          )}

          <div className="prose prose-sm max-w-none mb-6">
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </div>

          {entry.tags && (() => {
            try {
              const tags = JSON.parse(entry.tags);
              return (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              );
            } catch (e) {
              return null;
            }
          })()}

          {/* 좋아요 버튼 */}
          <div className="flex items-center gap-4 py-4 border-y">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{entry.likes_count}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">댓글</span>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold mb-4">댓글</h3>
            <Comments
              guestbookId={entry.id}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
