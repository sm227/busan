"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { sampleProperties } from "@/data/properties";
import { RuralProperty } from "@/types";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, setUserPreferences, setLikedProperties } = useApp();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !password) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userId = data.user.id;
        const user = { id: userId, nickname: data.user.nickname };
        setCurrentUser(user);
        localStorage.setItem('busan-app-user', JSON.stringify(user));

        try {
          const surveyResponse = await fetch(`/api/survey?userId=${userId}`);
          const surveyData = await surveyResponse.json();

          if (surveyData.success && surveyData.data) {
            const preferences = {
              livingStyle: surveyData.data.living_style,
              socialStyle: surveyData.data.social_style,
              workStyle: surveyData.data.work_style,
              hobbyStyle: surveyData.data.hobby_style,
              pace: surveyData.data.pace,
              budget: surveyData.data.budget
            };
            setUserPreferences(preferences);
          }
        } catch (error) {
          console.error('설문 결과 불러오기 실패:', error);
        }

        try {
          const likesResponse = await fetch(`/api/likes?userId=${userId}`);
          const likesData = await likesResponse.json();

          if (likesData.success && likesData.data) {
            const savedLikes = likesData.data.map((like: any) => {
              const property = sampleProperties.find(p => p.id === like.property_id);
              if (property) {
                return { ...property, matchScore: like.match_score };
              }
              return {
                id: like.property_id,
                title: like.property_title,
                location: { district: like.property_location.split(',')[0] || '', city: like.property_location.split(',')[1] || '' },
                price: { rent: like.property_price },
                matchScore: like.match_score,
                details: { rooms: 0, size: 0, type: '', condition: '' },
                features: [],
                surroundings: { nature: [], cultural: [], convenience: [] },
                community: { population: 0, demographics: '', activities: [] }
              };
            });
            const uniqueById = new globalThis.Map<string, RuralProperty>();
            savedLikes.forEach((p: RuralProperty) => uniqueById.set(p.id, p));
            setLikedProperties(Array.from(uniqueById.values()));
          }
        } catch (error) {
          console.error('관심목록 불러오기 실패:', error);
        }

        router.push("/");
      } else {
        alert('로그인 정보를 확인해주세요.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-[#F5F5F0] min-h-screen relative shadow-xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-6 sticky top-0 z-10">
          <button
            onClick={() => router.push("/welcome")}
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col px-8"
        >

          {/* Title Section */}
          <div className="mt-4 mb-12">
            <span className="inline-block mb-4 text-2xl">
              👋
            </span>
            <h1 className="font-serif font-bold text-4xl text-stone-800 mb-3 leading-tight">
              다시 오셨네요,<br/>
              반가워요!
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              저장해둔 시골집을 다시 확인해보세요
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            <div className="space-y-4">
              {/* Nickname Input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">닉네임</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all shadow-sm"
                  placeholder="닉네임을 입력하세요"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">비밀번호 (4자리)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all shadow-sm font-mono tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-stone-300 hover:bg-stone-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "로그인하기"
                )}
              </button>
            </div>

          </form>

          {/* Bottom Link */}
          <div className="mt-auto pb-10 text-center">
            <p className="text-sm text-stone-400 mb-6">
              아직 계정이 없으신가요?
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="w-full py-4 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors"
            >
              새로 회원가입 하기
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
