"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Sparkles } from "lucide-react";
import { MatchingAlgorithm } from "@/lib/matching";
import { UserPreferences } from "@/types";
import { transformApiResponse, RuralVillageApiResponse } from "@/lib/apiTransformer";

export default function AnalyzingPage() {
  const router = useRouter();
  const { currentUser, userPreferences, setRecommendations } = useApp();
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    const analyze = async () => {
      setAnalysisStep(1); // 거주 스타일 분석 중

      // DB에 설문 결과 저장
      if (currentUser) {
        try {
          console.log('📤 클라이언트: 설문 저장 요청 전송:', {
            userId: currentUser.id,
            preferences: userPreferences,
          });

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
            const errorData = await response.json();
            console.error('❌ 설문 결과 저장 실패:', response.status, errorData);
          } else {
            console.log('✅ 설문 결과 저장 성공');
          }
        } catch (error) {
          console.error('설문 결과 저장 오류:', error);
        }
      }

      setAnalysisStep(2); // 사회적 성향 분석 중

      // AI 추천 API 호출
      try {
        console.log('🚀 AI 추천 시작:', userPreferences);

        const aiResponse = await fetch('/api/ai-recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userPreferences }),
        });

        setAnalysisStep(3); // 업무 환경 분석 중

        if (!aiResponse.ok) {
          throw new Error('AI 추천 API 호출 실패');
        }

        const aiData = await aiResponse.json();

        if (!aiData.success || !aiData.recommendations || aiData.recommendations.length === 0) {
          throw new Error(aiData.error || '추천 결과가 없습니다');
        }

        console.log('✅ AI 추천 성공:', {
          추천지역: aiData.aiRegions,
          마을수: aiData.recommendations.length
        });

        // AI 추천 결과에 랜덤 가격 적용
        const recsWithRandomPrice = MatchingAlgorithm.getRecommendations(
          userPreferences as UserPreferences,
          aiData.recommendations,
          aiData.recommendations.length
        );

        setRecommendations(recsWithRandomPrice);

        // 2초 후 매칭 페이지로 이동
        setTimeout(() => {
          router.push("/matching");
        }, 2000);
      } catch (error) {
        console.error('❌ AI 추천 실패:', error);

        // 에러 발생시 기존 알고리즘으로 fallback
        try {
          const fallbackResponse = await fetch('/api/rural-villages?numOfRows=100');
          if (fallbackResponse.ok) {
            const fallbackData: RuralVillageApiResponse = await fallbackResponse.json();
            const fallbackProperties = transformApiResponse(fallbackData);

            if (fallbackProperties.length > 0) {
              const recs = MatchingAlgorithm.getRecommendations(
                userPreferences as UserPreferences,
                fallbackProperties,
                20
              );

              const shuffledRecs = [...recs].sort(() => Math.random() - 0.5);
              setRecommendations(shuffledRecs.slice(0, 10));
            }
          }
        } catch {
          console.error('Fallback도 실패');
        }

        // 2초 후 매칭 페이지로 이동
        setTimeout(() => {
          router.push("/matching");
        }, 2000);
      }
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
                  <p className={analysisStep >= 1 ? 'text-emerald-600 font-semibold' : ''}>
                    {analysisStep >= 1 ? '✅' : '🏡'} 거주 스타일 분석 {analysisStep >= 1 ? '완료' : '중...'}
                  </p>
                  <p className={analysisStep >= 2 ? 'text-emerald-600 font-semibold' : ''}>
                    {analysisStep >= 2 ? '✅' : '👥'} 사회적 성향 분석 {analysisStep >= 2 ? '완료' : '중...'}
                  </p>
                  <p className={analysisStep >= 3 ? 'text-emerald-600 font-semibold' : ''}>
                    {analysisStep >= 3 ? '✅' : '💼'} AI 지역 추천 {analysisStep >= 3 ? '완료' : '중...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
