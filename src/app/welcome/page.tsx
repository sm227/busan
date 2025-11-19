"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-between px-6 py-8">
          {/* 상단 타이틀 */}
          <div className="pt-12">
            <h1 className="title-font text-6xl text-center">
              빈집다방
            </h1>
            <p className="text-emerald-600 text-center mt-3 text-sm font-semibold tracking-wide">
              나만의 시골 집 찾기
            </p>
          </div>

          {/* 중앙 로고 & 말풍선 */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm text-center flex flex-col items-center gap-8">
              {/* 말풍선 */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-500 px-6 py-4 rounded-3xl shadow-xl">
                  <p className="text-white text-base leading-relaxed font-bold whitespace-nowrap">
                    당신에게 맞는<br />
                    시골 생활을 찾아보세요 🌱
                  </p>
                  {/* 귀여운 말풍선 꼬리 */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-5 h-5 bg-emerald-500 rotate-45"></div>
                </div>
              </div>

              {/* 로고 캐릭터 */}
              <div className="w-48 h-48 flex items-center justify-center mt-2">
                <Image
                  src="/logo.png"
                  alt="빈집다방 로고"
                  width={192}
                  height={192}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="w-full max-w-sm mx-auto space-y-4 pb-8">
            <p className="text-slate-600 font-semibold text-center mb-6">
              몇 가지 간단한 질문에 답해주세요
            </p>

            <button
              onClick={() => router.push("/signup")}
              className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 smooth-hover"
            >
              시작하기
            </button>

            <button
              onClick={() => router.push("/login")}
              className="btn-secondary w-full py-4 text-lg font-medium smooth-hover"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
