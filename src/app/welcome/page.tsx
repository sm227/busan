"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [showGuestOption, setShowGuestOption] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col justify-between px-6 py-8">

        {/* 상단 타이틀 영역 */}
        <div className="pt-12 text-center flex-shrink-0">
          <h1 className="title-font text-5xl min-[400px]:text-6xl text-stone-800 mb-2.5">
            빈집다방
          </h1>
          <p className="text-stone-500 text-sm font-medium tracking-wide">
            나만의 시골 집 찾기
          </p>
        </div>

        {/* 중앙 로고 & 메시지 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 py-4">
          {/* 메시지 */}
          <p className="text-stone-600 text-center leading-relaxed font-medium">
            당신에게 딱 맞는<br />
            <span className="text-stone-800 font-bold">시골 라이프</span>를 찾아보세요
          </p>

          {/* 로고 이미지 (배경 원 없음) */}
          <div className="w-40 h-40 min-[400px]:w-48 min-[400px]:h-48 flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="빈집다방 로고"
              width={192}
              height={192}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full space-y-3 pb-8 flex-shrink-0">
          <p className="text-stone-400 text-xs text-center mb-4 font-medium">
            간단한 질문으로 시작해보세요
          </p>

          <button
            onClick={() => setShowGuestOption(true)}
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

        {/* 비회원/회원가입 선택 모달 */}
        {showGuestOption && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
              <h3 className="text-xl font-bold text-stone-800 text-center">
                어떻게 시작할까요?
              </h3>
              <p className="text-sm text-stone-500 text-center">
                회원가입하면 모든 기능을 사용할 수 있어요
              </p>

              <button
                onClick={() => router.push("/signup")}
                className="w-full py-3 bg-stone-800 text-white rounded-xl font-semibold hover:bg-stone-700 transition-colors"
              >
                회원가입하기
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
              >
                비회원으로 둘러보기
              </button>

              <button
                onClick={() => setShowGuestOption(false)}
                className="w-full py-2 text-stone-400 text-sm hover:text-stone-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}