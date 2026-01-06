'use client';

import { motion } from 'framer-motion';
import { Question, QuestionOption } from '@/types';
import OccupationInput from './OccupationInput';

interface QuestionCardProps {
  question: Question;
  onAnswer: (option: QuestionOption) => void;
  currentQuestion: number;
  totalQuestions: number;
  onSkip?: () => void;
}

export default function QuestionCard({
  question,
  onAnswer,
  currentQuestion,
  totalQuestions,
  onSkip
}: QuestionCardProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // 직업 질문인 경우 OccupationInput 렌더링
  if (question.category === 'occupation') {
    return (
      <OccupationInput
        onSelect={(occupation) => {
          onAnswer({
            id: 'occupation-selected',
            text: occupation,
            category: 'occupation',
            value: occupation,
            description: ''
          });
        }}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8">

      {/* 1. 진행률 표시 */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3 px-1">
          <span className="text-stone-400 text-xs font-bold tracking-widest uppercase">
            Question {currentQuestion + 1}
          </span>
          <span className="text-orange-500 font-bold text-sm">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 2. 질문 텍스트 */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-8 leading-snug break-keep">
          {question.text}
        </h2>

        {/* 3. 선택지 목록 (심플 버전) */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option)}
              className="w-full p-5 text-left bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 flex items-start gap-4"
            >
              {/* 번호 (A, B, C...) */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-sm font-bold">
                {String.fromCharCode(65 + index)}
              </div>

              {/* 텍스트 */}
              <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-stone-800 text-base mb-1">
                  {option.text}
                </h3>
                {option.description && (
                  <p className="text-stone-500 text-xs leading-relaxed font-medium">
                    {option.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}