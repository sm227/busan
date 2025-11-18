"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Bot, MessageCircle } from "lucide-react";
import AIChat from "@/components/AIChat";

export default function AIConsultationPage() {
  const router = useRouter();
  const { userPreferences } = useApp();

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

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                AI 이주 상담사
              </h2>
              <p className="text-gray-600 text-sm">
                시골 이주에 대한 모든 궁금증을 물어보세요
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 text-sm mb-1">
                    이런 것들을 물어보세요!
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 시골 이주 준비 과정과 체크리스트</li>
                    <li>• 지역별 생활비와 주거비 정보</li>
                    <li>• 귀농귀촌 정부 지원 정책 안내</li>
                    <li>• 농촌 생활 적응 방법과 팁</li>
                    <li>• 지역 커뮤니티 참여 방법</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="h-[500px]">
              <AIChat
                userPreferences={userPreferences}
                currentLocation="서울"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
