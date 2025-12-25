'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard, { SwipeCardRef } from './SwipeCard';
import { RuralProperty, VillageStory } from '@/types';
import { Sparkles } from 'lucide-react';

export interface SwipeStackRef {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

interface SwipeStackProps {
  properties: RuralProperty[];
  stories: VillageStory[];
  purchaseType?: 'sale' | 'rent';
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onComplete: () => void;
  currentUserId?: number;
  coinBalance?: number;
  onCoinBalanceUpdate?: (newBalance: number) => void;
}

const SwipeStack = forwardRef<SwipeStackRef, SwipeStackProps>(({
  properties,
  stories,
  purchaseType,
  onSwipe,
  onComplete,
  currentUserId,
  coinBalance,
  onCoinBalanceUpdate
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards] = useState(3);
  const [removingCard, setRemovingCard] = useState<string | null>(null);
  const [stackRenderKey, setStackRenderKey] = useState(0);
  const [unlockedProperties, setUnlockedProperties] = useState<Set<string>>(new Set());

  const currentCardRef = useRef<SwipeCardRef>(null);

  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction) => {
      if (currentCardRef.current) {
        currentCardRef.current.triggerSwipe(direction);
      }
    }
  }));

  useEffect(() => {
    if (currentIndex >= properties.length) {
      onComplete();
    }
  }, [currentIndex, properties.length, onComplete]);

  useEffect(() => {
    setStackRenderKey(0);
    setCurrentIndex(0);
    setRemovingCard(null);
  }, [properties]);

  const handleSwipe = (direction: 'left' | 'right', property: RuralProperty) => {
    onSwipe(direction, property);
  };

  const handleRemove = () => {
    const currentProperty = properties[currentIndex];
    if (currentProperty) {
      setRemovingCard(currentProperty.id);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setRemovingCard(null);
        setStackRenderKey(prev => prev + 1);
      }, 100);
    }
  };

  const handleUnlock = async (propertyId: string) => {
    if (!currentUserId) return;

    try {
      const response = await fetch('/api/unlock-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          propertyId
        })
      });

      const data = await response.json();

      if (data.success) {
        setUnlockedProperties(prev => new Set(prev).add(propertyId));
        if (onCoinBalanceUpdate) {
          onCoinBalanceUpdate(data.newBalance);
        }
      }
    } catch (error) {
      console.error('잠금 해제 오류:', error);
    }
  };

  const getStoryForProperty = (propertyId: string) => {
    return stories.find(story => story.propertyId === propertyId) || {
      id: 'default',
      propertyId,
      title: '새로운 시작의 이야기',
      story: '이곳에서 새로운 삶의 이야기를 시작해보세요.',
      highlights: ['새로운 시작', '평화로운 환경'],
      mood: 'peaceful' as const,
      images: []
    };
  };

  if (currentIndex >= properties.length) {
    return (
      <div className="h-[500px] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white border border-stone-100 rounded-3xl p-10 shadow-xl max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">
            모든 추천을 확인했어요!
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            마음에 드는 집이 있으셨나요?<br/>
            결과 페이지에서 모아볼 수 있어요.
          </p>
          <button 
            onClick={onComplete}
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
          >
            결과 확인하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full max-w-md mx-auto perspective-1000">
      <AnimatePresence mode="wait">
        {properties.slice(currentIndex, currentIndex + visibleCards)
          .filter(property => removingCard !== property.id)
          .map((property, index) => {
          const actualIndex = currentIndex + index;
          const story = getStoryForProperty(property.id);
          
          // ✨ 중요: key 값을 ID + Index 조합으로 변경하여 중복 에러 방지
          const uniqueKey = `${property.id}-${actualIndex}-${stackRenderKey}`;

          // 잠금 해제 여부 확인
          const isUnlocked = unlockedProperties.has(property.id);
          const displayProperty = {
            ...property,
            isLocked: property.isLocked && !isUnlocked
          };

          return (
            <motion.div
              key={uniqueKey}
              className="absolute inset-0"
              initial={{
                scale: 1 - index * 0.05,
                y: index * 12,
                zIndex: visibleCards - index
              }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 12,
                zIndex: visibleCards - index
              }}
              style={{
                zIndex: visibleCards - index,
                transformStyle: 'preserve-3d'
              }}
            >
              {index === 0 ? (
                <SwipeCard
                  ref={currentCardRef}
                  property={displayProperty}
                  story={story}
                  purchaseType={purchaseType}
                  onSwipe={handleSwipe}
                  onRemove={handleRemove}
                  currentUserId={currentUserId}
                  onUnlock={handleUnlock}
                  coinBalance={coinBalance}
                  onCoinBalanceUpdate={onCoinBalanceUpdate}
                />
              ) : (
                <div className="bg-white border border-stone-200 rounded-3xl shadow-xl h-full overflow-hidden relative">
                  <div className="h-[35%] bg-stone-200 animate-pulse" />
                  <div className="p-6 space-y-3 opacity-40 filter blur-[1px]">
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-100 rounded w-1/2" />
                    <div className="pt-4 space-y-2">
                        <div className="h-3 bg-stone-100 rounded w-full" />
                        <div className="h-3 bg-stone-100 rounded w-5/6" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/40" />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-stone-900/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white/10 shadow-lg">
          {currentIndex + 1} <span className="text-stone-400 font-normal">/</span> {properties.length}
        </div>
      </div>
    </div>
  );
});

SwipeStack.displayName = 'SwipeStack';
export default SwipeStack;