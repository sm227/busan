import { useState, useEffect } from 'react';
import { AIModelType } from '@/lib/ai/types';

const STORAGE_KEY = 'busan-ai-model-preference';
const DEFAULT_MODEL: AIModelType = 'gemini-2.5-flash';

/**
 * Custom hook for managing AI model selection
 * Persists user's model choice in localStorage
 */
export function useAIModel() {
  const [selectedModel, setSelectedModel] = useState<AIModelType>(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingModel, setPendingModel] = useState<AIModelType | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load saved model preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'gemini-2.5-flash' || saved === 'claude-3.5-sonnet')) {
        setSelectedModel(saved as AIModelType);
      }
    } catch (error) {
      console.error('Failed to load AI model preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update model selection and save to localStorage
  const updateModel = (model: AIModelType) => {
    if (model === selectedModel) return;
    setPendingModel(model);
    setShowModal(true);
  };

  const confirmModelChange = () => {
    if (!pendingModel) return;

    try {
      localStorage.setItem(STORAGE_KEY, pendingModel);
      window.location.reload();
    } catch (error) {
      console.error('Failed to save AI model preference:', error);
      setShowModal(false);
      setPendingModel(null);
    }
  };

  const cancelModelChange = () => {
    setShowModal(false);
    setPendingModel(null);
  };

  return {
    selectedModel,
    updateModel,
    isLoading,
    showModal,
    confirmModelChange,
    cancelModelChange,
    pendingModel
  };
}
