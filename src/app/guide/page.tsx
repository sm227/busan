"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GuidePage() {
  const router = useRouter();

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
              시골 이주 가이드
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">
                  📋 이주 단계별 체크리스트
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        지역 정보 수집
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        기후, 교통, 의료시설, 교육환경 등을 확인하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        현지 방문
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        최소 2-3번은 직접 방문해서 생활환경을 체험해보세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        주거지 확정
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        임시거주부터 시작해서 점진적으로 정착하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        지역사회 적응
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        마을 행사 참여, 이웃과의 관계 형성이 중요해요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  💰 예산 계획
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">이사비용</span>
                    <span className="text-sm text-gray-900">100-300만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      보증금/전세금
                    </span>
                    <span className="text-sm text-gray-900">
                      500-3000만원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">생활비 (월)</span>
                    <span className="text-sm text-gray-900">150-250만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">비상자금</span>
                    <span className="text-sm text-gray-900">
                      500-1000만원
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  🏛️ 정부 지원 정책
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm">
                      귀농귀촌 종합지원센터
                    </h4>
                    <p className="text-blue-700 text-xs mt-1">
                      상담, 교육, 정착지원 서비스를 제공합니다.
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 text-sm">
                      청년 농업인 정착지원
                    </h4>
                    <p className="text-green-700 text-xs mt-1">
                      40세 미만 청년에게 최대 3년간 월 100만원 지원
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <h4 className="font-medium text-amber-900 text-sm">
                      농촌 빈집 정비 지원
                    </h4>
                    <p className="text-amber-700 text-xs mt-1">
                      빈집 수리비용 최대 2000만원까지 지원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
