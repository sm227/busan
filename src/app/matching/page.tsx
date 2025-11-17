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
      setLikedProperties(
        likedProperties.some((p) => p.id === property.id) ? likedProperties : [...likedProperties, property]
      );

      if (currentUser) {
        try {
          await fetch('/api/likes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              property: {
                id: property.id,
                title: property.title,
                location: `${property.location.district}, ${property.location.city}`,
                price: property.price.rent || 0,
                matchScore: property.matchScore || 0
              }
            }),
          });
        } catch (error) {
          console.error('관심목록 저장 실패:', error);
        }
      }
    } else {
      setRejectedProperties([...rejectedProperties, property]);

      if (currentUser && likedProperties.some(p => p.id === property.id)) {
        try {
          await fetch('/api/likes', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              propertyId: property.id
            }),
          });
        } catch (error) {
          console.error('관심목록 삭제 실패:', error);
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
