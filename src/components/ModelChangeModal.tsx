'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ModelChangeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModelChangeModal({ isOpen, onConfirm, onCancel }: ModelChangeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
          />

          {/* 모달 */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto"
            >
              {/* 아이콘 */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
              </div>

              {/* 제목 */}
              <h3 className="text-lg font-bold text-stone-800 text-center mb-2">
                모델을 변경하시겠어요?
              </h3>

              {/* 설명 */}
              <p className="text-sm text-stone-500 text-center mb-6 leading-relaxed">
                현재 대화가 초기화되고<br />
                새로운 모델로 다시 시작됩니다
              </p>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors"
                >
                  변경하기
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
