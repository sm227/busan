"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Phone, Home as HomeIcon } from "lucide-react";
import { sampleProperties } from "@/data/properties";
import { RuralProperty } from "@/types";

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setSelectedProperty, recommendations, likedProperties } = useApp();
  const [property, setProperty] = useState<RuralProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      // 1. Context에서 먼저 찾기
      const contextProperty =
        sampleProperties.find(p => p.id === params.id) ||
        recommendations.find(p => p.id === params.id || String(p.id) === params.id) ||
        likedProperties.find(p => p.id === params.id || String(p.id) === params.id);

      if (contextProperty) {
        setProperty(contextProperty);
        setLoading(false);
        return;
      }

      // 2. Context에 없으면 데이터베이스에서 조회
      try {
        const response = await fetch(`/api/recommendations/${params.id}`);
        const data = await response.json();

        if (data.success && data.property) {
          setProperty(data.property);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('매물 조회 실패:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, recommendations, likedProperties]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-md mx-auto bg-white min-h-screen relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

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

  const handleContact = () => {
    setSelectedProperty(property);
    router.push(`/properties/${property.id}/contact`);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-emerald-50/30">
          <div className="px-6 pb-8">
            <div className="flex items-center py-6 mb-6">
              <button
                onClick={() => router.push("/results")}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div className="card p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  {property.title}
                </h1>
                <div className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {property.location.district},{" "}
                    {property.location.city}
                  </span>
                </div>

                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  월 {property.price.rent?.toLocaleString()}원
                </div>
                {property.price.deposit && (
                  <div className="text-slate-600 font-medium">
                    보증금{" "}
                    {(property.price.deposit / 10000).toFixed(0)}
                    만원
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">방/면적:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.rooms}룸 ·{" "}
                      {property.details.size}㎡ ({Math.round(property.details.size * 0.3025)}평)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">유형:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.type === 'hanok' ? '한옥' :
                       property.details.type === 'modern' ? '현대식' :
                       property.details.type === 'farm' ? '농가주택' :
                       property.details.type === 'apartment' ? '아파트' :
                       property.details.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">상태:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.condition === 'excellent' ? '최상' :
                       property.details.condition === 'good' ? '양호' :
                       property.details.condition === 'needs-repair' ? '수리필요' :
                       property.details.condition}
                    </span>
                  </div>
                  {property.details.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">준공년도:</span>
                      <span className="text-slate-900 font-semibold">
                        {property.details.yearBuilt}년
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">특징</h3>
                <div className="flex flex-wrap gap-3">
                  {property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-emerald-100 rounded-full text-sm text-emerald-700 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {property.aiReason && (
                <div className="card p-6 bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2 text-lg">AI 추천 이유</h3>
                      <p className="text-slate-700 leading-relaxed">{property.aiReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {property.communityInfo && (
                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">마을 정보</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">인구:</span>
                      <span className="text-slate-900 font-semibold">
                        {property.communityInfo.population}명
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">평균 연령:</span>
                      <span className="text-slate-900 font-semibold">
                        {property.communityInfo.averageAge}세
                      </span>
                    </div>
                    {property.communityInfo.mainIndustries && property.communityInfo.mainIndustries.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">주산업:</span>
                        <span className="text-slate-900 font-semibold">
                          {property.communityInfo.mainIndustries.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {property.surroundings && (
                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">주변 환경</h3>
                  <div className="space-y-4">
                    {property.surroundings.naturalFeatures && property.surroundings.naturalFeatures.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium block mb-2">자연환경:</span>
                        <div className="flex flex-wrap gap-2">
                          {property.surroundings.naturalFeatures.map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-50 rounded-lg text-sm text-green-700"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.surroundings.nearbyFacilities && property.surroundings.nearbyFacilities.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium block mb-2">편의시설:</span>
                        <div className="flex flex-wrap gap-2">
                          {property.surroundings.nearbyFacilities.map((facility, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 rounded-lg text-sm text-blue-700"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.surroundings.transportation && property.surroundings.transportation.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium block mb-2">교통:</span>
                        <div className="flex flex-wrap gap-2">
                          {property.surroundings.transportation.map((transport, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-50 rounded-lg text-sm text-purple-700"
                            >
                              {transport}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pb-8">
              <button
                onClick={handleContact}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
              >
                <Phone className="w-5 h-5" />
                <span>연락하기</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-secondary w-full flex items-center justify-center space-x-2 py-4"
              >
                <HomeIcon className="w-5 h-5" />
                <span>홈으로</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
