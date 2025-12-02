'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, MapPin, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { HOUSE_IMAGES } from '@/config/constants';

interface PopularPost {
  id: number;
  title: string;
  content: string;
  author_nickname: string;
  category: 'experience' | 'review' | 'tip' | 'question';
  location?: string;
  rating?: number;
  tags?: string | string[];
  likes_count: number;
  created_at: string;
}

interface PopularPostsSliderProps {
  onPostClick?: (postId: number) => void;
}

export default function PopularPostsSlider({ onPostClick }: PopularPostsSliderProps) {
  const [posts, setPosts] = useState<PopularPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 인기 게시글 로드
  useEffect(() => {
    const loadPopularPosts = async () => {
      try {
        const response = await fetch('/api/guestbook?limit=5');
        const data = await response.json();
        
        if (data.success) {
          const sortedPosts = (data.data || []).sort((a: PopularPost, b: PopularPost) => 
            b.likes_count - a.likes_count
          );
          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error('인기 게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularPosts();
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || posts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, posts.length]);

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    setIsAutoPlaying(false);
    // 5초 후 자동 재생 재개
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % posts.length);
    setIsAutoPlaying(false);
    // 5초 후 자동 재생 재개
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handlePostClick = (postId: number) => {
    if (onPostClick) onPostClick(postId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '오늘';
    if (diffDays <= 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 지역별 이미지 매핑 (기존 로직 유지)
  const getImageForLocation = (location?: string) => {
    if (!location) return HOUSE_IMAGES.getUrl(1);
    if (location.includes('강원도') || location.includes('홍천')) return HOUSE_IMAGES.getUrl(2);
    if (location.includes('제주도') || location.includes('서귀포')) return HOUSE_IMAGES.getUrl(3);
    if (location.includes('전라북도') || location.includes('임실')) return HOUSE_IMAGES.getUrl(4);
    if (location.includes('충청남도') || location.includes('논산')) return HOUSE_IMAGES.getUrl(5);
    if (location.includes('경상남도') || location.includes('하동')) return HOUSE_IMAGES.getUrl(6);
    if (location.includes('부산')) return HOUSE_IMAGES.getUrl(7);
    if (location.includes('경기도')) return HOUSE_IMAGES.getUrl(8);
    if (location.includes('인천')) return HOUSE_IMAGES.getUrl(9);
    if (location.includes('대구')) return HOUSE_IMAGES.getUrl(10);
    if (location.includes('대전')) return HOUSE_IMAGES.getUrl(11);
    if (location.includes('광주')) return HOUSE_IMAGES.getUrl(12);

    const imageNumbers = [13, 14, 15, 16, 17, 18];
    const index = (location?.length || 0) % imageNumbers.length;
    return HOUSE_IMAGES.getUrl(imageNumbers[index]);
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-stone-100 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group">
      {/* 슬라이드 영역 */}
      <div className="relative h-72 md:h-80 overflow-hidden bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => handlePostClick(posts[currentIndex].id)}
          >
            {/* 배경 이미지 */}
            <div className="absolute inset-0">
              <Image
                src={getImageForLocation(posts[currentIndex].location)}
                alt={posts[currentIndex].title}
                fill
                className="object-cover opacity-90"
                priority
              />
              {/* 그라데이션 오버레이 (텍스트 가독성용) */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
            </div>

            {/* 콘텐츠 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
              {/* 상단 태그 라인 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-medium text-white">
                   {posts[currentIndex].category === 'experience' ? '📖 이주 경험' :
                    posts[currentIndex].category === 'review' ? '⭐ 솔직 후기' :
                    posts[currentIndex].category === 'tip' ? '💡 꿀팁' : '❓ 질문'}
                </span>
                {posts[currentIndex].location && (
                  <span className="inline-flex items-center gap-1 bg-stone-900/40 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] text-stone-200">
                    <MapPin className="w-3 h-3" /> {posts[currentIndex].location}
                  </span>
                )}
              </div>

              {/* 제목 & 내용 */}
              <h4 className="text-xl font-serif font-bold text-white mb-2 line-clamp-1 leading-tight drop-shadow-sm">
                {posts[currentIndex].title}
              </h4>
              <p className="text-sm text-stone-200 line-clamp-2 mb-4 font-light leading-relaxed opacity-90">
                {posts[currentIndex].content}
              </p>

              {/* 하단 정보 (작성자, 좋아요, 날짜) */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-medium text-stone-300">
                  by {posts[currentIndex].author_nickname}
                </span>
                
                <div className="flex items-center gap-4 text-xs text-stone-300">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span className="font-bold text-white">{posts[currentIndex].likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(posts[currentIndex].created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 컨트롤러 (화살표) - 항상 표시 */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 left-1 z-20 p-1 active:scale-90 transition-transform"
      >
        <ChevronLeft className="w-5 h-5 text-white/70 drop-shadow-lg" strokeWidth={2.5} />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-1 z-20 p-1 active:scale-90 transition-transform"
      >
        <ChevronRight className="w-5 h-5 text-white/70 drop-shadow-lg" strokeWidth={2.5} />
      </button>

      {/* 인디케이터 (점) */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-20">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
              index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}