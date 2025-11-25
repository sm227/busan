"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import SwipeStack, { SwipeStackRef } from "@/components/SwipeStack"; // 타입 임포트
import { villageStories } from "@/data/stories";
import { RuralProperty } from "@/types";
import { ArrowLeft, X, Heart } from "lucide-react";
import { useRef } from "react"; // useRef 추가

export default function MatchingPage() {
  const router = useRouter();
  const { currentUser, recommendations, likedProperties, rejectedProperties, setLikedProperties, setRejectedProperties } = useApp();
  
  // 1. 스택을 제어할 Ref 생성
  const stackRef = useRef<SwipeStackRef>(null);

  const handleSwipe = async (
    direction: "left" | "right",
    property: RuralProperty
  ) => {
    if (direction === "right") {
      // 중복 방지: 이미 존재하는 경우 추가하지 않음
      if (!likedProperties.some((p) => p.id === property.id)) {
        setLikedProperties([...likedProperties, property]);
      }

      if (currentUser) {
        try {
          await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, property: property }),
          });
        } catch (error) {
          console.error('저장 실패:', error);
        }
      }
    } else {
      setRejectedProperties([...rejectedProperties, property]);

      if (currentUser && likedProperties.some(p => p.id === property.id)) {
        try {
          await fetch('/api/recommendations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, villageId: String(property.id) }),
          });
        } catch (error) {
          console.error('삭제 실패:', error);
        }
      }
    }
  };

  const handleMatchingComplete = () => {
    router.push("/results");
  };

  return (
    <div className="h-screen bg-[#F5F5F0] overflow-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white h-screen relative shadow-xl flex flex-col">
        
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-serif font-bold text-lg text-stone-800">추천 매칭</span>
          <div className="w-10" />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
          <div className="text-center mb-8 mt-2 space-y-2">
            <h2 className="text-2xl font-serif font-bold text-stone-800">
              당신의 취향인가요?
            </h2>
            <p className="text-stone-500 text-sm font-medium">
              카드를 넘겨서 확인해보세요
            </p>
          </div>

          {/* 스와이프 영역 */}
          <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
            <div className="absolute w-64 h-64 bg-stone-100 rounded-full blur-3xl opacity-60" />
            
            <SwipeStack
              ref={stackRef} // 2. Ref 연결
              properties={recommendations}
              stories={villageStories}
              onSwipe={handleSwipe}
              onComplete={handleMatchingComplete}
            />
          </div>

          {/* 하단 컨트롤 가이드 (버튼 기능 활성화) */}
          <div className="mt-auto pt-4 pb-8 flex justify-center items-center gap-12">
            {/* NOPE 버튼 */}
            <button 
              onClick={() => stackRef.current?.triggerSwipe('left')} // 3. 클릭 시 왼쪽 스와이프 트리거
              className="flex flex-col items-center gap-2 group opacity-60 hover:opacity-100 transition-all active:scale-95"
            >
              <div className="w-14 h-14 rounded-full border-2 border-stone-200 bg-white flex items-center justify-center text-stone-400 shadow-sm group-hover:border-stone-300 group-hover:shadow-md transition-all">
                <X className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-stone-400">NOPE</span>
            </button>

            {/* LIKE 버튼 */}
            <button 
              onClick={() => stackRef.current?.triggerSwipe('right')} // 4. 클릭 시 오른쪽 스와이프 트리거
              className="flex flex-col items-center gap-2 group opacity-90 hover:opacity-100 transition-all active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-stone-800 flex items-center justify-center text-white shadow-lg shadow-stone-300 group-hover:bg-stone-700 group-hover:shadow-xl transition-all">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <span className="text-xs font-bold text-stone-800">LIKE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}