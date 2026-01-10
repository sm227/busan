"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Home, Users, MapPin, CheckCircle2, Circle } from "lucide-react";
import { MatchingAlgorithm } from "@/lib/matching";
import { UserPreferences } from "@/types";
import { transformApiResponse, RuralVillageApiResponse } from "@/lib/apiTransformer";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AnalyzingPage() {
  const router = useRouter();
  const { currentUser, userPreferences, setRecommendations } = useApp();
  const [analysisStep, setAnalysisStep] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // 중복 실행 방지
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const analyze = async () => {
      setTimeout(() => setAnalysisStep(1), 500);

      if (currentUser) {
        try {
          await fetch('/api/survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, preferences: userPreferences }),
          });
        } catch (error) {
          console.error(error);
        }
      }

      setTimeout(() => setAnalysisStep(2), 1500);

      try {
        const aiResponse = await fetch('/api/ai-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userPreferences }),
        });

        setAnalysisStep(3);

        if (!aiResponse.ok) throw new Error('AI Error');
        const aiData = await aiResponse.json();

        if (!aiData.success || !aiData.recommendations?.length) throw new Error('No Data');

        const recs = MatchingAlgorithm.getRecommendations(
          userPreferences as UserPreferences,
          aiData.recommendations,
          aiData.recommendations.length
        );

        setRecommendations(recs);

        setTimeout(() => {
          router.push("/matching");
        }, 1000);

      } catch (error) {
        // Fallback 로직 (기존 유지)
        try {
          const res = await fetch('/api/rural-villages?numOfRows=100');
          if (res.ok) {
            const data = await res.json();
            const props = transformApiResponse(data);
            const recs = MatchingAlgorithm.getRecommendations(userPreferences as UserPreferences, props, 20);
            setRecommendations(recs.slice(0, 10));
          }
        } catch {}
        setTimeout(() => router.push("/matching"), 1000);
      }
    };

    analyze();
  }, []);

  // 심플한 상태 리스트 아이템
  const StatusItem = ({ step, currentStep, icon: Icon, text }: any) => {
    const isCompleted = currentStep > step;
    const isActive = currentStep === step;

    return (
      <div className={`flex items-center gap-3 py-3 transition-colors duration-500 ${
        isActive || isCompleted ? "opacity-100" : "opacity-30"
      }`}>
        <div className="shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-stone-800" />
          ) : (
            <Icon className={`w-5 h-5 ${isActive ? "text-stone-800" : "text-stone-400"}`} />
          )}
        </div>
        <span className={`text-sm ${isActive || isCompleted ? "font-bold text-stone-800" : "font-medium text-stone-400"}`}>
          {text}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-[#F5F5F0] min-h-screen relative flex flex-col justify-center px-10">
        
        {/* 1. 로고 (정지 상태, 깔끔하게) */}
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-stone-100">
             <Image 
               src="/logo.png" 
               alt="Logo" 
               width={60} 
               height={60} 
               className="object-contain opacity-90"
             />
          </div>
        </div>

        {/* 2. 타이틀 */}
        <div className="text-center mb-12">
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
            취향 분석 중...
          </h2>
          <p className="text-stone-500 text-xs tracking-wide">
            잠시만 기다려주세요
          </p>
        </div>

        {/* 3. 진행 바 (심플한 라인) */}
        <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden mb-12">
           <motion.div 
             className="h-full bg-stone-800"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 4, ease: "linear" }}
           />
        </div>

        {/* 4. 진행 상태 리스트 (텍스트 위주) */}
        <div className="space-y-1 pl-4 border-l border-stone-200">
          <StatusItem 
            step={1} 
            currentStep={analysisStep} 
            icon={Home} 
            text="거주 스타일 확인" 
          />
          <StatusItem 
            step={2} 
            currentStep={analysisStep} 
            icon={Users} 
            text="라이프스타일 매칭" 
          />
          <StatusItem 
            step={3} 
            currentStep={analysisStep} 
            icon={MapPin} 
            text="최적의 마을 탐색" 
          />
        </div>

      </div>
    </div>
  );
}