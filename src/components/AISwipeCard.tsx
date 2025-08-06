'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, X, MapPin, Home, Sparkles, Loader2 } from 'lucide-react';
import { RuralProperty, UserPreferences } from '@/types';

interface AISwipeCardProps {
  property: RuralProperty;
  userPreferences: UserPreferences;
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onRemove: () => void;
}

interface AIStory {
  title: string;
  story: string;
  highlights: string[];
}

export default function AISwipeCard({ 
  property, 
  userPreferences, 
  onSwipe, 
  onRemove 
}: AISwipeCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [aiStory, setAiStory] = useState<AIStory | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    generatePersonalizedStory();
  }, [property.id, userPreferences]);

  const generatePersonalizedStory = async () => {
    setIsLoadingStory(true);
    try {
      const response = await fetch('/api/ai/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property,
          userPreferences,
          mood: 'peaceful'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.story) {
        setAiStory(data.story);
      } else {
        // 기본 스토리로 폴백
        setAiStory({
          title: `${property.location.city}에서의 새로운 시작`,
          story: `${property.title}에서 당신만의 특별한 이야기를 시작해보세요. 
          이곳에서는 매일이 새로운 발견의 연속일 것입니다.`,
          highlights: ['평화로운 환경', '새로운 시작', '자연과의 조화', '지역 문화 체험']
        });
      }
    } catch (error) {
      console.error('Story generation error:', error);
      setAiStory({
        title: `${property.location.city}에서의 새로운 시작`,
        story: '이곳에서 당신만의 특별한 이야기를 시작해보세요.',
        highlights: ['평화로운 환경', '새로운 시작']
      });
    } finally {
      setIsLoadingStory(false);
    }
  };

  const handleDragEnd = () => {
    const threshold = 100;
    if (Math.abs(x.get()) > threshold) {
      setIsRemoving(true);
      const direction = x.get() > 0 ? 'right' : 'left';
      onSwipe(direction, property);
      setTimeout(onRemove, 300);
    }
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    setIsRemoving(true);
    x.set(direction === 'right' ? 200 : -200);
    onSwipe(direction, property);
    setTimeout(onRemove, 300);
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={isRemoving ? { 
        x: x.get() > 0 ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.3 }
      } : {}}
    >
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-full relative">
        {/* Property Image */}
        <div className="relative h-52 bg-gradient-to-br from-emerald-100 to-emerald-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-emerald-700">
              <Home size={36} className="mx-auto mb-2" />
              <p className="text-xs opacity-80">AI 맞춤 추천</p>
            </div>
          </div>
          
          {/* AI 생성 표시 */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full px-3 py-1 shadow-sm">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">AI 스토리</span>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-emerald-700">
              {property.matchScore}% 매칭
            </span>
          </div>

          {/* Swipe Indicators */}
          <motion.div 
            className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            <X size={64} className="text-white" />
          </motion.div>
          
          <motion.div 
            className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <Heart size={64} className="text-white" />
          </motion.div>
        </div>

        {/* Property Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={14} className="mr-1" />
              <span className="text-sm">
                {property.location.district}, {property.location.city}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>{property.details.rooms}룸 · {property.details.size}평</span>
              <span>인구 {property.communityInfo.population}명</span>
            </div>

            <div className="text-xl font-bold text-emerald-700 mb-3">
              월 {property.price.rent?.toLocaleString()}원
              {property.price.deposit && (
                <div className="text-sm text-gray-600 font-normal">
                  보증금 {(property.price.deposit / 10000).toFixed(0)}만원
                </div>
              )}
            </div>
          </div>

          {/* AI Generated Story */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 border border-blue-200">
            {isLoadingStory ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">개인화된 스토리 생성 중...</span>
              </div>
            ) : aiStory ? (
              <>
                <h4 className="font-medium text-blue-900 text-sm mb-2">
                  {aiStory.title}
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed line-clamp-3">
                  {aiStory.story.split('\n')[0]}
                </p>
                {aiStory.highlights.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {aiStory.highlights.slice(0, 2).map((highlight, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-blue-700">
                이곳에서 당신만의 특별한 이야기를 시작해보세요.
              </p>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-emerald-100 rounded text-xs text-emerald-700"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
          <button
            onClick={() => handleButtonClick('left')}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-md transition-colors"
            disabled={isLoadingStory}
          >
            <X size={20} />
          </button>
          
          <button
            onClick={() => handleButtonClick('right')}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
            disabled={isLoadingStory}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}