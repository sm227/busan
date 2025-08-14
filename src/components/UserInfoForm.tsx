'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface UserInfoFormProps {
  onSubmit: (nickname: string, password: string) => void;
  onBack: () => void;
}

export default function UserInfoForm({ onSubmit, onBack }: UserInfoFormProps) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return false;
    }
    
    if (nickname.length < 2) {
      setError('닉네임은 2글자 이상 입력해주세요.');
      return false;
    }
    
    if (nickname.length > 10) {
      setError('닉네임은 10글자 이하로 입력해주세요.');
      return false;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    
    if (password.length !== 4) {
      setError('비밀번호는 4자리 숫자로 입력해주세요.');
      return false;
    }
    
    if (!/^\d{4}$/.test(password)) {
      setError('비밀번호는 숫자만 입력 가능합니다.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // 서버에 사용자 정보 전송
      onSubmit(nickname.trim(), password);
    } catch (error) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    if (value.length <= 4) {
      setPassword(value);
      setError('');
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setNickname(value);
      setError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12"
    >
      <div className="w-full max-w-sm mx-auto">
        {/* 로고와 제목 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white border-4 border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 overflow-hidden">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            사용자 정보 입력
          </h1>
          <p className="text-slate-600">
            설문 결과를 저장하기 위한 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-2">
              닉네임
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={handleNicknameChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="2-10글자의 닉네임"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {nickname.length}/10글자
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              비밀번호 (4자리 숫자)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-center text-lg font-mono"
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              설문 결과 조회 시 사용됩니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* 버튼들 */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>설문 시작하기</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="btn-secondary w-full py-4 text-lg font-medium"
            >
              이전으로
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-emerald-700">
              <p className="font-medium mb-1">개인정보 보호</p>
              <p className="text-xs leading-relaxed">
                입력하신 정보는 설문 결과 저장 목적으로만 사용되며, 
                언제든지 삭제 요청이 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}