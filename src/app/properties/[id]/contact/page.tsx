"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Home as HomeIcon } from "lucide-react";
import { sampleProperties } from "@/data/properties";

export default function ContactPage() {
  const router = useRouter();
  const params = useParams();

  const property = sampleProperties.find(p => p.id === params.id);

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-md mx-auto bg-white min-h-screen relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">매물을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push("/results")}
              className="btn-primary"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={() => router.push(`/properties/${params.id}`)}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  연락하기
                </h2>
                <p className="text-gray-600 text-sm">
                  {property.title}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    집주인 연락처
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">전화번호:</span>
                      <span className="text-gray-900 font-medium">
                        010-1234-5678
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락 가능:</span>
                      <span className="text-gray-900">
                        오전 9시 - 오후 6시
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">상담센터</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상담 전화:</span>
                      <span className="text-gray-900 font-medium">
                        1588-0000
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">운영 시간:</span>
                      <span className="text-gray-900">24시간</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm text-center">
                    💡 방문 전에 미리 연락하여 약속을 잡으시는 것을 추천해요!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-8">
              <a
                href="tel:010-1234-5678"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>전화걸기</span>
              </a>
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
