'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { RuralProperty, VillageStory } from '@/types';

interface SwipeStackProps {
  properties: RuralProperty[];
  stories: VillageStory[];
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onComplete: () => void;
}

export default function SwipeStack({ properties, stories, onSwipe, onComplete }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards] = useState(3); // 동시에 보여줄 카드 수
  const [removingCard, setRemovingCard] = useState<string | null>(null);

  useEffect(() => {
    if (currentIndex >= properties.length) {
      onComplete();
    }
  }, [currentIndex, properties.length, onComplete]);

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
      }, 100);
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
      <div className="h-[600px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-amber-100 border border-amber-200 rounded-xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-amber-900 mb-4">
            모든 추천을 확인했습니다!
          </h3>
          <p className="text-amber-700">
            마음에 드는 곳이 있으셨나요?
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {properties.slice(currentIndex, currentIndex + visibleCards)
          .filter(property => removingCard !== property.id)
          .map((property, index) => {
          const actualIndex = currentIndex + index;
          const story = getStoryForProperty(property.id);
          
          return (
            <motion.div
              key={`${property.id}-${actualIndex}-${currentIndex}`}
              className="absolute inset-0"
              initial={{ 
                scale: 1 - index * 0.05,
                y: index * 8,
                zIndex: visibleCards - index
              }}
              animate={{ 
                scale: 1 - index * 0.05,
                y: index * 8,
                zIndex: visibleCards - index
              }}
              style={{
                zIndex: visibleCards - index
              }}
            >
              {index === 0 ? (
                <SwipeCard
                  property={property}
                  story={story}
                  onSwipe={handleSwipe}
                  onRemove={handleRemove}
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl shadow-xl h-full opacity-80">
                  <div className="h-64 bg-amber-300 rounded-t-3xl" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      {property.title}
                    </h3>
                    <p className="text-amber-700 text-sm">
                      {property.location.district}, {property.location.city}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Cards Counter */}
      <div className="absolute top-4 left-4 bg-amber-800 bg-opacity-90 text-amber-50 px-3 py-1 rounded-full text-sm z-50 border border-amber-600">
        {currentIndex + 1} / {properties.length}
      </div>
    </div>
  );
}