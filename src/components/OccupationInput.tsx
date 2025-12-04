'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { searchOccupations } from '@/data/occupations';

interface OccupationInputProps {
  onSelect: (occupation: string) => void;
  currentQuestion: number;
  totalQuestions: number;
}

export default function OccupationInput({
  onSelect,
  currentQuestion,
  totalQuestions,
}: OccupationInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // 검색 실행 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchResults = searchOccupations(query);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0 || query.trim().length > 0);
      setSelectedIndex(-1);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // 바깥쪽 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        } else if (query.trim()) {
          handleSelect(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (occupation: string) => {
    onSelect(occupation);
    setQuery(occupation);
    setIsOpen(false);
  };

  const handleDirectInput = () => {
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8">
      {/* 진행률 표시 */}
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
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 질문 텍스트 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-8 leading-snug break-keep">
          귀하의 직업은 무엇인가요?
        </h2>

        {/* 검색 입력창 */}
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(results.length > 0 || query.trim().length > 0)}
              placeholder="직업을 검색하세요"
              className="w-full px-5 py-4 pl-12 text-base text-stone-800 placeholder:text-stone-400 bg-white border-2 border-stone-200 rounded-2xl focus:outline-none focus:border-orange-500 transition-colors"
              autoComplete="off"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          </div>

          {/* 드롭다운 결과 */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden z-10"
                style={{ maxHeight: '256px', overflowY: 'auto' }}
              >
                {results.length > 0 ? (
                  <div>
                    {results.map((occupation, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(occupation)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-5 py-4 text-left transition-colors flex items-center gap-3 ${
                          selectedIndex === index
                            ? 'bg-orange-50 text-orange-700'
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        <span className="text-stone-400">✓</span>
                        <span className="font-medium">{occupation}</span>
                      </button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <button
                    onClick={handleDirectInput}
                    className="w-full px-5 py-4 text-left hover:bg-stone-50 transition-colors"
                    style={{ minHeight: '48px' }}
                  >
                    <span className="text-stone-600 font-medium">
                      "{query}" 직접 입력하기
                    </span>
                  </button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 안내 텍스트 */}
        <p className="mt-4 text-sm text-stone-500 px-1">
          직업명을 입력하거나 목록에서 선택하세요. 초성 검색도 가능합니다. (예: "ㄱㅂㅈ")
        </p>
      </motion.div>
    </div>
  );
}
