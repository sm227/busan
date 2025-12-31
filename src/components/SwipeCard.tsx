'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, forwardRef, useImperativeHandle } from 'react'; // forwardRef 추가
import { Home, MapPin, Users, Sparkles, Quote, Lock, Coins, Heart } from 'lucide-react';
import { RuralProperty, VillageStory } from '@/types';
import { useRouter } from 'next/navigation';

// 외부에서 호출할 수 있는 함수 타입 정의
export interface SwipeCardRef {
  triggerSwipe: (direction: 'left' | 'right') => void;
}

interface SwipeCardProps {
  property: RuralProperty;
  story: VillageStory;
  purchaseType?: 'sale' | 'rent';
  onSwipe: (direction: 'left' | 'right', property: RuralProperty) => void;
  onRemove: () => void;
  currentUserId?: number;
  onUnlock?: (propertyId: string) => void;
  coinBalance?: number;
  onCoinBalanceUpdate?: (newBalance: number) => void;
}

// forwardRef로 감싸기
const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({
  property,
  story,
  purchaseType,
  onSwipe,
  onRemove,
  currentUserId,
  onUnlock,
  coinBalance,
  onCoinBalanceUpdate
}, ref) => {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
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

  const handleUnlockClick = async () => {
    if (!onUnlock) return;

    setIsUnlocking(true);
    try {
      // SwipeStack의 handleUnlock 호출 (중복 API 호출 방지)
      await onUnlock(property.id);
      setShowUnlockModal(false);
    } catch (error) {
      console.error('잠금 해제 오류:', error);
      alert('잠금 해제 중 오류가 발생했습니다.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePurchaseCoin = async (amount: number, price: number) => {
    if (!currentUserId) return;

    setIsPurchasing(true);
    try {
      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          amount: amount,
          bonusAmount: 0,
          price: price,
          paymentMethod: 'card'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`코인 ${amount}개를 구매했습니다!`);
        // 코인 잔액 업데이트
        if (onCoinBalanceUpdate) {
          onCoinBalanceUpdate(data.data.newBalance);
        }
        setShowPurchaseModal(false);
        // 구매 후 잠금 해제 모달 표시하지 않고 그냥 닫기
      } else {
        alert(data.error || '구매에 실패했습니다.');
      }
    } catch (error) {
      console.error('구매 오류:', error);
      alert('구매 중 오류가 발생했습니다.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // 잠긴 카드인 경우 드래그 비활성화
  const isDraggable = !property.isLocked;

  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ x, rotate, opacity }}
        drag={isDraggable ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={isRemoving ? {
          x: x.get() > 0 ? 1000 : -1000,
          opacity: 0,
          transition: { duration: 0.3 }
        } : {}}
      >
        <div className={`card h-full relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 flex flex-col ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
          {/* 잠금 오버레이 */}
          {property.isLocked && (
            <div
              className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-4 border border-white/20">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">잠긴 추천 매물</h3>
              <p className="text-white/80 text-sm mb-4">코인으로 해제하고 확인하세요</p>

              <div className="flex flex-col gap-3 w-full max-w-xs px-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUnlockModal(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <Coins className="w-5 h-5" />
                  100 코인으로 해제
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/results');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-white/30"
                >
                  <Heart className="w-5 h-5" />
                  찜한 매물 보러가기
                </button>
              </div>
            </div>
          )}
        
        <div className="relative h-[32%] shrink-0 bg-stone-100">
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
                {property.matchScore ?? 0}% 일치
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

        <div className="flex-1 p-5 flex flex-col bg-white">
          <div className="mb-3">
            <h3 className="text-xl font-serif font-bold text-stone-800 leading-snug mb-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-stone-500 text-xs mb-2">
              <MapPin size={12} />
              <span>{property.location.district}, {property.location.city}</span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {purchaseType === 'sale' ? (
                <>
                  {property.price.sale
                    ? `${(property.price.sale / 10000).toLocaleString()}만원`
                    : '가격 문의'}
                </>
              ) : (
                <>
                  월세 {Math.floor((property.price.rent || 0) / 10000).toLocaleString()}만원
                  {property.price.deposit && (
                    <span className="text-sm text-stone-400 font-normal ml-2">
                      (보증금 {Math.floor(property.price.deposit / 10000).toLocaleString()}만)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-stone-600 font-medium">
              <div className="px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                {property.details.rooms}룸
              </div>
              <div className="px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                {property.details.size}평
              </div>
              <div className="px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-100 flex items-center gap-1">
                <Users size={11} /> {property.communityInfo.population}명
              </div>
          </div>

          <div className="relative bg-stone-50 rounded-xl p-3 border border-stone-100 mb-auto">
            <Quote className="absolute top-2.5 left-2.5 w-3 h-3 text-stone-300 fill-stone-300" />
            <p className="text-stone-600 text-xs leading-relaxed pl-3.5 italic line-clamp-2">
              {story.story}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.features.slice(0, 4).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-white border border-stone-200 rounded-full text-[10px] text-stone-600 font-medium"
              >
                #{feature}
              </span>
            ))}
            {property.features.length > 4 && (
               <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-full text-[10px] text-stone-400">
                 +{property.features.length - 4}
               </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>

    {/* 잠금 해제 확인 모달 */}
    {showUnlockModal && (
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="bg-orange-50 rounded-full p-4 mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">매물 잠금 해제</h3>
            <p className="text-stone-600 text-sm mb-6">
              이 추천 매물을 확인하려면<br/>
              <span className="font-bold text-orange-600">100 코인</span>이 필요합니다
            </p>

            <div className="w-full bg-stone-50 rounded-lg p-3 mb-6 flex items-center justify-between">
              <span className="text-stone-600 text-sm">현재 보유 코인</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-stone-800">{coinBalance || 0}</span>
              </div>
            </div>

            {(coinBalance || 0) >= 100 ? (
              // 코인이 충분한 경우
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  disabled={isUnlocking}
                  className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleUnlockClick}
                  disabled={isUnlocking}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUnlocking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      해제 중...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      해제하기
                    </>
                  )}
                </button>
              </div>
            ) : (
              // 코인이 부족한 경우
              <div className="w-full space-y-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">
                    코인이 {100 - (coinBalance || 0)}개 부족합니다
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnlockModal(false)}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setShowUnlockModal(false);
                      setShowPurchaseModal(true);
                    }}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    코인 충전
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* 코인 구매 모달 */}
    {showPurchaseModal && (
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-800">코인 충전</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={isPurchasing}
                className="text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-stone-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                <span className="text-stone-600 text-sm">현재 보유 코인</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-stone-800">{coinBalance || 0}</span>
                </div>
              </div>
              <p className="text-stone-500 text-sm text-center">
                매물 해제에 필요한 코인: <span className="font-bold text-orange-600">100개</span>
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <button
                onClick={() => handlePurchaseCoin(100, 12000)}
                disabled={isPurchasing}
                className="w-full bg-white border-2 border-orange-500 rounded-xl p-4 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪙</span>
                    <div className="text-left">
                      <p className="font-bold text-stone-800">코인 100개</p>
                      <p className="text-xs text-stone-500">매물 해제에 딱 필요한 양!</p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-600">₩12,000</span>
                </div>
              </button>

              <button
                onClick={() => handlePurchaseCoin(200, 24000)}
                disabled={isPurchasing}
                className="w-full bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-xl p-4 hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  추천
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪙</span>
                    <div className="text-left">
                      <p className="font-bold text-stone-800">코인 200개</p>
                      <p className="text-xs text-orange-600 font-medium">2개 매물 해제 가능!</p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-600">₩24,000</span>
                </div>
              </button>

              <button
                onClick={() => handlePurchaseCoin(300, 36000)}
                disabled={isPurchasing}
                className="w-full bg-white border-2 border-stone-300 rounded-xl p-4 hover:border-stone-400 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪙</span>
                    <div className="text-left">
                      <p className="font-bold text-stone-800">코인 300개</p>
                      <p className="text-xs text-stone-500">3개 이상 볼 때 유리</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-600">₩36,000</span>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setShowUnlockModal(true);
                }}
                disabled={isPurchasing}
                className="w-full py-3 text-stone-500 text-sm hover:text-stone-700 transition-colors disabled:opacity-50"
              >
                다음에 충전하기
              </button>
            </div>
          </div>
        </div>

        {/* 로딩 오버레이 */}
        {isPurchasing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;