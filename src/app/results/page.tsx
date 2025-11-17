"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Eye, Phone } from "lucide-react";
import { MatchingAlgorithm } from "@/lib/matching";
import { sampleProperties } from "@/data/properties";
import { UserPreferences, RuralProperty } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const { likedProperties, userPreferences, setSelectedProperty, setRecommendations } = useApp();

  const handlePropertyDetail = (property: RuralProperty) => {
    setSelectedProperty(property);
    router.push(`/properties/${property.id}`);
  };

  const handleContact = (property: RuralProperty) => {
    setSelectedProperty(property);
    router.push(`/properties/${property.id}/contact`);
  };

  const startMatching = () => {
    if (Object.keys(userPreferences).length < 6) {
      router.push("/questionnaire");
      return;
    }

    const recs = MatchingAlgorithm.getRecommendations(
      userPreferences as UserPreferences,
      sampleProperties,
      5
    );
    setRecommendations(recs);
    router.push("/matching");
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-emerald-50/30">
          <div className="px-6 pb-6">
            <div className="flex items-center py-6 mb-6">
              <button
                onClick={() => router.push("/")}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
              매칭 결과
            </h2>

            {likedProperties.length > 0 ? (
              <div className="space-y-6 mb-8">
                <div className="text-center bg-emerald-100/50 rounded-2xl p-4">
                  <p className="text-slate-700 font-semibold">
                    관심 표시한 곳 {likedProperties.length}개
                  </p>
                </div>

                {likedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="card p-6"
                  >
                    <h4 className="font-bold text-slate-900 mb-2 text-lg">
                      {property.title}
                    </h4>
                    <div className="flex items-center text-slate-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {property.location.district}, {property.location.city}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-bold mb-4 text-lg">
                      {property.matchScore}% 매칭 · 월{" "}
                      {property.price.rent?.toLocaleString()}원
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handlePropertyDetail(property)}
                        className="btn-secondary flex-1 flex items-center justify-center space-x-2 py-3"
                      >
                        <Eye className="w-4 h-4" />
                        <span>상세보기</span>
                      </button>
                      <button
                        onClick={() => handleContact(property)}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2 py-3"
                      >
                        <Phone className="w-4 h-4" />
                        <span>연락하기</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white rounded-3xl p-8 mx-4">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-slate-700 font-medium mb-2">아직 마음에 드는 곳을 찾지 못하셨네요</p>
                <p className="text-sm mb-4">다시 한번 시도해보시겠어요?</p>
                <button
                  onClick={startMatching}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  다시 매칭하기
                </button>
              </div>
            )}

            <div className="space-y-3 pb-8">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
