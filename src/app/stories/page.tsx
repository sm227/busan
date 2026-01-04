"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function StoriesPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={() => router.push("/")}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              이주 스토리
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative">
                <div className={!currentUser ? 'filter blur-sm select-none' : ''}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">정</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">
                        정민호님의 강원도 이야기
                      </h3>
                      <p className="text-xs text-gray-600">
                        서울 → 강원도 홍천 / 2년차
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    "서울에서 15년간 직장생활을 하다가 번아웃이 와서 시골로
                    내려왔어요. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일
                    아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐네요."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>47명이 공감했어요</span>
                  </div>
                </div>
                {!currentUser && (
                  <div
                    onClick={() => router.push('/login')}
                    className="absolute inset-0 flex items-center justify-center bg-white/30 cursor-pointer hover:bg-white/40 transition-colors rounded-lg"
                  >
                    <div className="text-stone-800 text-xs font-bold bg-white px-3 py-2 rounded-full shadow-lg pointer-events-none">
                      로그인하고 전체 보기 →
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative">
                <div className={!currentUser ? 'filter blur-sm select-none' : ''}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">김</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">
                        김수연님의 제주도 이야기
                      </h3>
                      <p className="text-xs text-gray-600">
                        부산 → 제주도 서귀포 / 1년차
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    "제주도는 정말 특별한 곳이에요. 바다가 주는 에너지가 있어요.
                    카페를 열었는데 관광객들과 현지분들이 모두 따뜻하게
                    맞아주셔서 매일이 감사해요."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>32명이 공감했어요</span>
                  </div>
                </div>
                {!currentUser && (
                  <div
                    onClick={() => router.push('/login')}
                    className="absolute inset-0 flex items-center justify-center bg-white/30 cursor-pointer hover:bg-white/40 transition-colors rounded-lg"
                  >
                    <div className="text-stone-800 text-xs font-bold bg-white px-3 py-2 rounded-full shadow-lg pointer-events-none">
                      로그인하고 전체 보기 →
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative">
                <div className={!currentUser ? 'filter blur-sm select-none' : ''}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">박</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">
                        박철수님의 전북 이야기
                      </h3>
                      <p className="text-xs text-gray-600">
                        대전 → 전북 임실 / 3년차
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    "농사를 지어보고 싶어서 내려왔는데, 이웃분들이 정말 많이
                    도와주셨어요. 첫 해 수확한 배추로 김치를 담가서 나눠드렸을
                    때의 기쁨을 잊을 수 없어요."
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>58명이 공감했어요</span>
                  </div>
                </div>
                {!currentUser && (
                  <div
                    onClick={() => router.push('/login')}
                    className="absolute inset-0 flex items-center justify-center bg-white/30 cursor-pointer hover:bg-white/40 transition-colors rounded-lg"
                  >
                    <div className="text-stone-800 text-xs font-bold bg-white px-3 py-2 rounded-full shadow-lg pointer-events-none">
                      로그인하고 전체 보기 →
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
