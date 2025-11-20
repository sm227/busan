'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, forwardRef, useImperativeHandle } from 'react'; // forwardRef 추가
import { Home, MapPin, Users, Sparkles, Quote } from 'lucide-react';
import { RuralProperty, VillageStory } from '@/types';

// 외부에서 호출할 수 있는 함수 타입 정의
export interface SwipeCardRef {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

interface SwipeCardProps {
  property: RuralProperty;
  story: VillageStory;
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onRemove: () => void;
}

// forwardRef로 감싸기
const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({ property, story, onSwipe, onRemove }, ref) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); 
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);

  // 부모(SwipeStack)에게 triggerSwipe 함수 노출
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction) => {
      handleButtonClick(direction);
    }
  }));

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
    if (isRemoving) return;
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
      <div className="card h-full relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 flex flex-col cursor-grab active:cursor-grabbing">
        {/* ... 기존 내부 디자인 코드 (이미지, 정보 등) 그대로 유지 ... */}
        {/* 아래 내용은 아까 드린 코드와 동일하므로 생략하지 않고 그대로 두시면 됩니다 */}
        
        <div className="relative h-[35%] shrink-0 bg-stone-100">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover pointer-events-none"
            style={{ display: 'block' }}
          />
          <div className="absolute inset-0 -z-10 flex items-center justify-center bg-stone-100">
            <div className="text-center text-stone-400">
              <Home className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <span className="text-xs">이미지 로딩중</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-white/10">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span className="text-xs font-bold text-white">
                {property.matchScore}% 일치
              </span>
            </div>
          </div>
          <motion.div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center z-10"
            style={{ opacity: nopeOpacity, pointerEvents: 'none' }}
          >
            <div className="border-4 border-white text-white px-6 py-2 rounded-xl transform -rotate-12">
              <span className="text-4xl font-bold tracking-wider">NOPE</span>
            </div>
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-orange-500/60 backdrop-blur-[2px] flex items-center justify-center z-10"
            style={{ opacity: likeOpacity, pointerEvents: 'none' }}
          >
             <div className="border-4 border-white text-white px-6 py-2 rounded-xl transform rotate-12">
              <span className="text-4xl font-bold tracking-wider">LIKE</span>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 p-6 flex flex-col bg-white">
          <div className="mb-4">
            <h3 className="text-2xl font-serif font-bold text-stone-800 leading-snug mb-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-stone-500 text-sm mb-3">
              <MapPin size={14} />
              <span>{property.location.district}, {property.location.city}</span>
            </div>
            <div className="text-xl font-bold text-orange-600">
              월 {property.price.rent?.toLocaleString()}원
              {property.price.deposit && (
                <span className="text-sm text-stone-400 font-normal ml-2">
                  (보증금 {(property.price.deposit / 10000).toFixed(0)}만)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5 text-xs text-stone-600 font-medium">
              <div className="px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-100">
                {property.details.rooms}룸
              </div>
              <div className="px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-100">
                {property.details.size}평
              </div>
              <div className="px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-100 flex items-center gap-1">
                <Users size={12} /> {property.communityInfo.population}명
              </div>
          </div>

          <div className="relative bg-stone-50 rounded-xl p-4 border border-stone-100 mb-auto">
            <Quote className="absolute top-3 left-3 w-3 h-3 text-stone-300 fill-stone-300" />
            <p className="text-stone-600 text-sm leading-relaxed pl-4 italic line-clamp-3">
              {story.story}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {property.features.slice(0, 5).map((feature, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-white border border-stone-200 rounded-full text-[11px] text-stone-600 font-medium"
              >
                #{feature}
              </span>
            ))}
            {property.features.length > 5 && (
               <span className="px-2.5 py-1 bg-stone-50 border border-stone-100 rounded-full text-[11px] text-stone-400">
                 +{property.features.length - 5}
               </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;