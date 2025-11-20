'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

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
      setError('닉네임은 2글자 이상이어야 합니다.');
      return false;
    }
    if (nickname.length > 10) {
      setError('닉네임은 10글자 이하로 설정해주세요.');
      return false;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    if (password.length !== 4) {
      setError('비밀번호는 4자리 숫자여야 합니다.');
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
      onSubmit(nickname.trim(), password);
    } catch (error) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); 
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
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-[#F5F5F0] min-h-screen relative shadow-xl flex flex-col">
        
        {/* 1. 헤더 (로그인 페이지와 동일한 위치) */}
        <div className="px-6 py-6 sticky top-0 z-10">
           <button
             onClick={onBack}
             className="p-2 -ml-2 text-stone-500 hover:bg-stone-200 rounded-full transition-colors"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>
        </div>

        {/* 2. 메인 콘텐츠 (애니메이션 적용) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col px-8"
        >
           
           {/* 타이틀 영역 (로그인 페이지와 동일한 레이아웃) */}
           <div className="mt-4 mb-12">
              <span className="inline-block mb-4 text-2xl">
                ✨
              </span>
              <h1 className="font-serif font-bold text-4xl text-stone-800 mb-3 leading-tight">
                처음 오셨군요,<br/>
                환영해요!
              </h1>
              <p className="text-stone-500 text-sm font-medium">
                나만의 시골집을 찾기 위한 첫 걸음이에요
              </p>
           </div>

           {/* 입력 폼 */}
           <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                {/* 닉네임 입력 */}
                <div>
                   <div className="flex justify-between items-end mb-2 ml-1">
                      <label className="text-xs font-bold text-stone-500">닉네임</label>
                      <span className="text-[10px] text-stone-400">{nickname.length}/10</span>
                   </div>
                   <input 
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all shadow-sm"
                      placeholder="사용할 닉네임을 입력하세요"
                   />
                </div>

                {/* 비밀번호 입력 */}
                <div>
                   <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">비밀번호 (숫자 4자리)</label>
                   <input 
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all shadow-sm font-mono tracking-widest"
                      placeholder="••••"
                      maxLength={4}
                      inputMode="numeric"
                   />
                   <p className="text-[10px] text-stone-400 mt-2 ml-1">
                     * 나중에 관심 목록을 다시 볼 때 사용돼요
                   </p>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {/* 시작하기 버튼 */}
              <div className="pt-4">
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-stone-300 hover:bg-stone-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>설문 시작하기</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                 </button>
              </div>

           </form>

           {/* 하단 영역 (로그인으로 돌아가기) */}
           <div className="mt-auto pb-10 text-center">
              <button 
                 onClick={onBack}
                 className="py-3 px-6 text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors"
              >
                 이미 계정이 있으신가요?
              </button>
           </div>

        </motion.div>
      </div>
    </div>
  );
}