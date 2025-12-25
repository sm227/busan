'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { searchOccupations } from '@/data/occupations';

interface OccupationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function OccupationSelector({
  value,
  onChange,
  placeholder = '직업을 검색하세요'
}: OccupationSelectorProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local query when value prop changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

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
    onChange(occupation);
    setQuery(occupation);
    setIsOpen(false);
  };

  const handleDirectInput = () => {
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(results.length > 0 || query.trim().length > 0)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 text-sm text-stone-800 placeholder:text-stone-400 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          autoComplete="off"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
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
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-50"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {results.length > 0 ? (
              <div>
                {results.map((occupation, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(occupation)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                      selectedIndex === index
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span className="text-stone-400 text-xs">✓</span>
                    <span className="font-medium">{occupation}</span>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <button
                onClick={handleDirectInput}
                className="w-full px-4 py-2.5 text-left hover:bg-stone-50 transition-colors text-sm"
              >
                <span className="text-stone-600 font-medium">
                  "{query}" 직접 입력하기
                </span>
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 안내 텍스트 */}
      <p className="mt-1.5 text-xs text-stone-500">
        직업명을 입력하거나 목록에서 선택하세요. 초성 검색도 가능합니다. (예: "ㄱㅂㅈ")
      </p>
    </div>
  );
}
