'use client';

import { motion } from 'framer-motion';
import { Question, QuestionOption } from '@/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (option: QuestionOption) => void;
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuestionCard({ 
  question, 
  onAnswer, 
  currentQuestion, 
  totalQuestions 
}: QuestionCardProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-emerald-700 font-bold">{currentQuestion + 1}/{totalQuestions}</span>
          <span className="text-emerald-700 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-bold text-slate-800 mb-6 text-center leading-relaxed">
        {question.text}
      </h2>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option)}
            className="w-full p-4 text-left card hover:bg-emerald-50/50 hover:border-emerald-200 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1">
                  {option.text}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}