"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import QuestionCard from "@/components/QuestionCard";
import { personalityQuestions } from "@/data/questions";
import { QuestionOption, UserPreferences } from "@/types";

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentUser, userPreferences, setUserPreferences, setRecommendations } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleQuestionAnswer = (option: QuestionOption) => {
    const newPreferences = {
      ...userPreferences,
      [option.category]: option.value,
    };
    setUserPreferences(newPreferences);

    if (currentQuestionIndex < personalityQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      router.push("/analyzing");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
          <QuestionCard
            question={personalityQuestions[currentQuestionIndex]}
            onAnswer={handleQuestionAnswer}
            currentQuestion={currentQuestionIndex}
            totalQuestions={personalityQuestions.length}
          />
        </div>
      </div>
    </div>
  );
}
