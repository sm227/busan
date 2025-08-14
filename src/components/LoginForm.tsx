'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface LoginFormProps {
  onLogin: (nickname: string, password: string) => void;
  onBack: () => void;
  onGoToSignup: () => void;
}

export default function LoginForm({ onLogin, onBack, onGoToSignup }: LoginFormProps) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return false;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    
    if (password.length !== 4) {
      setError('비밀번호는 4자리입니다.');
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
      // 서버에 로그인 요청
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nickname: nickname.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user.nickname, password);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
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
    setNickname(value);
    setError('');
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
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Image 
              src="/logo.png" 
              alt="빈집다방 로고" 
              width={64} 
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            로그인
          </h1>
          <p className="text-slate-600">
            기존 계정으로 로그인하여 관심목록을 확인해보세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="loginNickname" className="block text-sm font-medium text-slate-700 mb-2">
              닉네임
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                id="loginNickname"
                value={nickname}
                onChange={handleNicknameChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="닉네임을 입력하세요"
              />
            </div>
          </div>

          <div>
            <label htmlFor="loginPassword" className="block text-sm font-medium text-slate-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                id="loginPassword"
                value={password}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-center text-lg font-mono"
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
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
                  <LogIn className="w-5 h-5" />
                  <span>로그인</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onGoToSignup}
              className="btn-secondary w-full py-4 text-lg font-medium"
            >
              처음 사용하기 (회원가입)
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 text-slate-600 hover:text-slate-800 font-medium"
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
              <p className="font-medium mb-1">계정을 잊으셨나요?</p>
              <p className="text-xs leading-relaxed">
                닉네임과 4자리 비밀번호로 로그인하시면 
                이전에 좋아요를 누른 관심목록을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}