"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col justify-between px-6 py-10">
        
        {/* 상단 타이틀 영역 */}
        <div className="pt-16 text-center">
          <h1 className="title-font text-6xl text-stone-800 mb-3">
            빈집다방
          </h1>
          <p className="text-stone-500 text-sm font-medium tracking-wide">
            나만의 시골 집 찾기
          </p>
        </div>

        {/* 중앙 로고 & 메시지 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8 gap-10">
          {/* 메시지 */}
          <p className="text-stone-600 text-center leading-relaxed font-medium">
            당신에게 딱 맞는<br />
            <span className="text-stone-800 font-bold">시골 라이프</span>를 찾아보세요
          </p>

          {/* 로고 이미지 (배경 원 없음) */}
          <div className="w-48 h-48 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="빈집다방 로고"
              width={192}
              height={192}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full space-y-3 pb-8">
          <p className="text-stone-400 text-xs text-center mb-4 font-medium">
            간단한 질문으로 시작해보세요
          </p>

          <button
            onClick={() => router.push("/signup")}
            className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-lg font-semibold transition-colors"
          >
            시작하기
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-xl text-lg font-medium transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}