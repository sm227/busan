'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
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
      <div className="card h-full relative">
        {/* Property Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
          />
          {/* 이미지가 없을 경우 폴백 */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center -z-10">
            <div className="text-center text-emerald-700">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Image 
                  src="/logo.png" 
                  alt="빈집다방 로고" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-medium">시골 주택</p>
            </div>
          </div>
          
          {/* Match Score Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <span className="text-sm font-bold text-emerald-600">
              {property.matchScore}% 매칭
            </span>
          </div>

          {/* Swipe Indicators */}
          <motion.div 
            className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex items-center justify-center rounded-t-2xl"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            <X size={80} className="text-white drop-shadow-lg" />
          </motion.div>
          
          <motion.div 
            className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center rounded-t-2xl"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <Heart size={80} className="text-white drop-shadow-lg" />
          </motion.div>
        </div>

        {/* Property Info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-slate-600 mb-3">
              <MapPin size={16} className="mr-2" />
              <span className="font-medium">
                {property.location.district}, {property.location.city}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-slate-600 mb-4">
              <span className="font-medium">{property.details.rooms}룸 · {property.details.size}평</span>
              <span className="font-medium">인구 {property.communityInfo.population}명</span>
            </div>

            <div className="text-2xl font-bold text-emerald-600 mb-4">
              월 {property.price.rent?.toLocaleString()}원
              {property.price.deposit && (
                <div className="text-sm text-slate-600 font-medium mt-1">
                  보증금 {(property.price.deposit / 10000).toFixed(0)}만원
                </div>
              )}
            </div>
          </div>

          {/* Story Preview */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-slate-700 leading-relaxed font-medium">
              {story.story.split('\n')[0]}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {property.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-emerald-100 rounded-full text-sm text-emerald-700 font-medium"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600 font-medium">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-center space-x-6">
          <button
            onClick={() => handleButtonClick('left')}
            className="w-14 h-14 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-lg transition-all duration-200"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={() => handleButtonClick('right')}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-105"
          >
            <Heart size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}