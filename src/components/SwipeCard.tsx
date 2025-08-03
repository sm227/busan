'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Heart, X, MapPin, Home, Users } from 'lucide-react';
import { RuralProperty, VillageStory } from '@/types';

interface SwipeCardProps {
  property: RuralProperty;
  story: VillageStory;
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onRemove: () => void;
}

export default function SwipeCard({ property, story, onSwipe, onRemove }: SwipeCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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
    // 버튼 클릭 시에도 x 값을 설정하여 애니메이션 방향 결정
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
      <div className="bg-white border border-amber-200 rounded-2xl shadow-lg overflow-hidden h-full relative">
        {/* Property Image */}
        <div className="relative h-48 bg-amber-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-amber-700">
              <Home size={32} className="mx-auto mb-1" />
              <p className="text-xs">사진 준비중</p>
            </div>
          </div>
          
          {/* Match Score Badge */}
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-amber-700">
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">
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

            <div className="text-xl font-bold text-amber-700 mb-3">
              월 {property.price.rent?.toLocaleString()}원
              {property.price.deposit && (
                <div className="text-sm text-gray-600 font-normal">
                  보증금 {(property.price.deposit / 10000).toFixed(0)}만원
                </div>
              )}
            </div>
          </div>

          {/* Story Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {story.story.split('\n')[0]}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-amber-100 rounded text-xs text-amber-700"
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
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-md"
          >
            <X size={20} />
          </button>
          
          <button
            onClick={() => handleButtonClick('right')}
            className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white shadow-md"
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}