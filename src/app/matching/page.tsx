"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import SwipeStack from "@/components/SwipeStack";
import { villageStories } from "@/data/stories";
import { RuralProperty } from "@/types";

export default function MatchingPage() {
  const router = useRouter();
  const { currentUser, recommendations, likedProperties, rejectedProperties, setLikedProperties, setRejectedProperties } = useApp();

  const handleSwipe = async (
    direction: "left" | "right",
    property: RuralProperty
  ) => {
    if (direction === "right") {
      // 로컬 상태 업데이트
      setLikedProperties(
        likedProperties.some((p) => p.id === property.id) ? likedProperties : [...likedProperties, property]
      );

      // DB에 저장 (recommendation 테이블에만)
      if (currentUser) {
        try {
          await fetch('/api/recommendations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              property: property
            }),
          });
          console.log('💾 하트 클릭 - recommendation 저장:', property.title);
        } catch (error) {
          console.error('저장 실패:', error);
        }
      }
    } else {
      // 왼쪽 스와이프: 거절
      setRejectedProperties([...rejectedProperties, property]);

      // 이미 좋아요 했던 매물이면 DB에서도 삭제
      if (currentUser && likedProperties.some(p => p.id === property.id)) {
        try {
          await fetch('/api/recommendations', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              villageId: String(property.id)
            }),
          });
          console.log('🗑️ 왼쪽 스와이프 - recommendation 삭제:', property.title);
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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 flex flex-col px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              추천 장소
            </h2>
            <p className="text-slate-600 font-medium">
              마음에 드시면 ♥️, 아니면 ✕ 해주세요
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <SwipeStack
              properties={recommendations}
              stories={villageStories}
              onSwipe={handleSwipe}
              onComplete={handleMatchingComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
