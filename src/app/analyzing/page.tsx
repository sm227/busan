"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Sparkles } from "lucide-react";
import { MatchingAlgorithm } from "@/lib/matching";
import { sampleProperties } from "@/data/properties";
import { UserPreferences } from "@/types";

export default function AnalyzingPage() {
  const router = useRouter();
  const { currentUser, userPreferences, setRecommendations } = useApp();

  useEffect(() => {
    const analyze = async () => {
      // DB에 설문 결과 저장
      if (currentUser) {
        try {
          const response = await fetch('/api/survey', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              preferences: userPreferences,
            }),
          });

          if (!response.ok) {
            console.error('설문 결과 저장 실패');
          }
        } catch (error) {
          console.error('설문 결과 저장 오류:', error);
        }
      }

      // 매칭 알고리즘 실행
      const matchedProperties = MatchingAlgorithm.getRecommendations(
        userPreferences as UserPreferences,
        sampleProperties,
        5
      );

      setRecommendations(matchedProperties);

      // 2초 후 매칭 페이지로 이동
      setTimeout(() => {
        router.push("/matching");
      }, 2000);
    };

    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="mb-12">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-emerald-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                AI가 취향을 분석하고 있어요!
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-slate-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '1.4s'}}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s', animationDuration: '1.4s'}}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s', animationDuration: '1.4s'}}></div>
                </div>
                <p className="text-slate-600 font-medium">당신에게 맞는 집을 찾고 있어요</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50">
                <div className="text-sm text-slate-600 space-y-2">
                  <p>🏡 거주 스타일 분석 완료</p>
                  <p>👥 사회적 성향 분석 완료</p>
                  <p>💼 업무 환경 분석 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
