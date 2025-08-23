'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Heart, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

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

  // 인기 방명록 로드 (좋아요 많은 순)
  useEffect(() => {
    const loadPopularPosts = async () => {
      try {
        const response = await fetch('/api/guestbook?limit=5');
        const data = await response.json();
        
        if (data.success) {
          // 좋아요 수가 많은 순으로 정렬
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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
    setIsAutoPlaying(false);
  };

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return '📖';
      case 'review': return '⭐';
      case 'tip': return '💡';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'experience': return '이주 경험';
      case 'review': return '후기';
      case 'tip': return '팁';
      case 'question': return '질문';
      default: return '일반';
    }
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

  const getImageForLocation = (location?: string) => {
    if (!location) return '/house/house1.jpg';
    
    // 지역명에 따른 이미지 매핑
    if (location.includes('강원도') || location.includes('홍천')) return '/house/house2.jpeg';
    if (location.includes('제주도') || location.includes('서귀포')) return '/house/house3.jpeg';
    if (location.includes('전라북도') || location.includes('임실')) return '/house/house4.jpeg';
    if (location.includes('충청남도') || location.includes('논산')) return '/house/house5.jpeg';
    if (location.includes('경상남도') || location.includes('하동')) return '/house/house6.jpeg';
    if (location.includes('부산')) return '/house/house7.jpeg';
    if (location.includes('경기도')) return '/house/house8.jpg';
    if (location.includes('인천')) return '/house/house9.jpg';
    if (location.includes('대구')) return '/house/house10.jpg';
    if (location.includes('대전')) return '/house/house11.jpg';
    if (location.includes('광주')) return '/house/house12.jpg';
    
    // 기본 이미지들을 순환해서 사용
    const imageList = [
      '/house/house13.jpeg', '/house/house14.jpg', '/house/house15.jpg',
      '/house/house16.jpg', '/house/house17.jpg', '/house/house18.jpg'
    ];
    const index = location.length % imageList.length;
    return imageList[index];
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-slate-800 text-lg">인기 게시글</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => handlePostClick(posts[currentIndex].id)}
          >
            <div className="relative h-full">
              {/* 배경 이미지 */}
              <div className="absolute inset-0">
                <Image
                  src={getImageForLocation(posts[currentIndex].location)}
                  alt={posts[currentIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* 콘텐츠 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm">
                    {getCategoryIcon(posts[currentIndex].category)}
                  </span>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {getCategoryName(posts[currentIndex].category)}
                  </span>
                  {posts[currentIndex].location && (
                    <div className="flex items-center space-x-1 text-xs text-white/90">
                      <MapPin className="w-3 h-3" />
                      <span>{posts[currentIndex].location}</span>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
                  {posts[currentIndex].title}
                </h4>

                <p className="text-sm text-white/90 line-clamp-2 mb-3 leading-relaxed">
                  {posts[currentIndex].content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-white/80">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{posts[currentIndex].likes_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(posts[currentIndex].created_at)}</span>
                    </div>
                    {posts[currentIndex].rating && (
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{posts[currentIndex].rating}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-white/80 font-medium">
                    by {posts[currentIndex].author_nickname}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 인디케이터 */}
      {posts.length > 1 && (
        <div className="flex justify-center space-x-2 p-3 bg-slate-50">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-emerald-500' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
