'use client';

import { motion } from 'framer-motion';

interface HobbySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const HOBBY_OPTIONS = [
  {
    value: 'nature-lover',
    label: '자연 활동',
    description: '등산, 낚시, 산책 등 자연 활동',
    icon: '🌲'
  },
  {
    value: 'culture-enthusiast',
    label: '문화 체험',
    description: '전통문화 체험, 박물관, 축제',
    icon: '🎭'
  },
  {
    value: 'sports-fan',
    label: '스포츠',
    description: '운동, 자전거, 수영 등',
    icon: '⚽'
  },
  {
    value: 'crafts-person',
    label: '공예/텃밭',
    description: '도자기, 목공예, 텃밭 가꾸기',
    icon: '🛠️'
  }
];

export default function HobbySelector({ value, onChange }: HobbySelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3">
        {HOBBY_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              value === option.value
                ? 'border-orange-500 bg-orange-50 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm mb-1 ${
                  value === option.value ? 'text-orange-700' : 'text-stone-800'
                }`}>
                  {option.label}
                </div>
                <div className="text-xs text-stone-500 leading-tight break-keep">
                  {option.description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">
        관심있는 취미 스타일을 선택하세요.
      </p>
    </div>
  );
}
