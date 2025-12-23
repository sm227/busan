'use client';

import { useAIModel } from '@/hooks/useAIModel';
import { AIModelType } from '@/lib/ai/types';
import { ChevronDown } from 'lucide-react';
import { ModelChangeModal } from './ModelChangeModal';

interface ModelOption {
  id: AIModelType;
  name: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: '빠른 응답 속도',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Amazon Nova Lite',
    description: 'AWS Bedrock 모델',
  },
];

/**
 * Model selector dropdown component
 * Displays in the top-right corner of AI-related pages
 * Allows users to switch between different AI models
 */
export function ModelSelector() {
  const { selectedModel, updateModel, isLoading, pendingModel, showModal, confirmModelChange, cancelModelChange } = useAIModel();

  if (isLoading) {
    return <div className="w-40 h-9 bg-stone-100 rounded-lg animate-pulse" />;
  }

  // pendingModel이 있으면 그걸 보여주고, 없으면 selectedModel 보여주기
  const displayModel = pendingModel || selectedModel;

  return (
    <>
      <div className="relative">
        <select
          value={displayModel}
          onChange={(e) => updateModel(e.target.value as AIModelType)}
          className="appearance-none bg-white border border-stone-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-stone-700 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 transition-all cursor-pointer"
          aria-label="AI 모델 선택"
        >
          {MODEL_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      </div>

      {/* 모델 변경 확인 모달 */}
      <ModelChangeModal
        isOpen={showModal}
        onConfirm={confirmModelChange}
        onCancel={cancelModelChange}
      />
    </>
  );
}
