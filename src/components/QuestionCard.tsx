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
    <div className="w-full max-w-md mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-emerald-700">{currentQuestion + 1}/{totalQuestions}</span>
          <span className="text-sm text-emerald-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-medium text-gray-800 mb-6 text-center">
        {question.text}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option)}
            className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium mt-0.5">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1">
                  {option.text}
                </h3>
                <p className="text-sm text-gray-600">
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