"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="mb-12">
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <Image
                  src="/logo.png"
                  alt="빈집다방 로고"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                빈집다방
              </h1>
              <p className="text-slate-700 text-lg mb-12 leading-relaxed font-semibold">
                당신에게 맞는
                <br />
                시골 생활을 찾아보세요
              </p>
            </div>

            <div className="space-y-4">
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

              <p className="text-slate-600 font-semibold text-center">
                몇 가지 간단한 질문에 답해주세요
              </p>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                <div className="text-2xl mb-2">🌱</div>
                <p className="text-sm text-slate-700 font-semibold">맞춤 추천</p>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                <div className="text-2xl mb-2">🍃</div>
                <p className="text-sm text-slate-700 font-semibold">쉬운 매칭</p>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                <div className="text-2xl mb-2">🌿</div>
                <p className="text-sm text-slate-700 font-semibold">바로 연결</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
