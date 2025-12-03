"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import QuestionCard from "@/components/QuestionCard";
import { personalityQuestions } from "@/data/questions";
import { QuestionOption, UserPreferences } from "@/types";

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentUser, userPreferences, setUserPreferences, setRecommendations } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 현재 사용자 응답에 따라 표시할 질문 필터링
  const filteredQuestions = useMemo(() => {
    return personalityQuestions.filter((question) => {
      // 조건이 없는 질문은 항상 표시
      if (!question.conditionalOn) return true;

      // 조건이 있는 경우, 해당 조건이 충족되는지 확인
      const { category, value } = question.conditionalOn;
      return userPreferences[category] === value;
    });
  }, [userPreferences]);

  // 필터링된 질문이 변경되면 인덱스 조정
  useEffect(() => {
    if (currentQuestionIndex >= filteredQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, filteredQuestions.length - 1));
    }
  }, [filteredQuestions.length, currentQuestionIndex]);

  const handleQuestionAnswer = (option: QuestionOption) => {
    const newPreferences = {
      ...userPreferences,
      [option.category]: option.value,
    };
    setUserPreferences(newPreferences);

    console.log('📝 답변 저장:', option.category, '=', option.value);
    console.log('📊 현재 preferences:', newPreferences);
    console.log('📋 현재 질문 인덱스:', currentQuestionIndex, '/', filteredQuestions.length - 1);

    // 다음 질문으로 이동하기 전에 필터링된 질문 다시 계산
    setTimeout(() => {
      const nextFilteredQuestions = personalityQuestions.filter((question) => {
        if (!question.conditionalOn) return true;
        const { category, value } = question.conditionalOn;
        return newPreferences[category] === value;
      });

      console.log('🔄 다음 필터링된 질문 수:', nextFilteredQuestions.length);

      if (currentQuestionIndex < nextFilteredQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        console.log('✅ 모든 질문 완료, analyzing 페이지로 이동');
        router.push("/analyzing");
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
          <QuestionCard
            question={filteredQuestions[currentQuestionIndex]}
            onAnswer={handleQuestionAnswer}
            currentQuestion={currentQuestionIndex}
            totalQuestions={filteredQuestions.length}
          />
        </div>
      </div>
    </div>
  );
}
