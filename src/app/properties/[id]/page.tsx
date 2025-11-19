"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Home as HomeIcon, ChevronDown } from "lucide-react";
import { RuralProperty } from "@/types";
import { SupportProgram } from "@/types/support";
import helpData from "/help.json";

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState<RuralProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      // DB에서만 조회
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
  }, [params.id]);

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
    if (property) {
      router.push(`/properties/${property.id}/contact`);
    }
  };

  // 지역명을 region_code로 매핑
  const getRegionCode = (district: string): string | null => {
    const mapping: { [key: string]: string } = {
      '충청북도': 'CHUNGBUK',
      '충청남도': 'CHUNGNAM',
      '전라북도': 'JEONBUK',
      '전라남도': 'JEONNAM',
      '경상북도': 'GYEONGBUK',
      '경상남도': 'GYEONGNAM',
    };
    return mapping[district] || null;
  };

  // 해당 지역의 지원 프로그램 가져오기
  const getRegionPrograms = (): SupportProgram[] => {
    if (!property) return [];

    const regionCode = getRegionCode(property.location.district);
    if (!regionCode) return [];

    const region = helpData.regions.find(r => r.region_code === regionCode);
    if (!region) return [];

    // 경북은 군 단위 + 경상북도 전체 프로그램 모두 표시
    if (regionCode === 'GYEONGBUK') {
      // property.location.city와 일치하는 군 프로그램 + "경상북도" 전체 프로그램
      return region.programs.filter((p: SupportProgram) =>
        p.district === property.location.city || p.district === '경상북도'
      );
    }

    return region.programs;
  };

  const regionPrograms = getRegionPrograms();

  const getProgramTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'SETTLEMENT_SUPPORT': '정착지원',
      'HOUSING_SUPPORT': '주거지원',
      'LOAN_SUPPORT': '융자지원',
      'EDUCATION': '교육지원',
      'EXPERIENCE_PROGRAM': '체험프로그램',
      'STARTUP_SUPPORT': '창업지원',
      'CONSULTING': '컨설팅',
      'MOVING_SUPPORT': '이사지원',
      'VILLAGE_SUPPORT': '마을활동지원',
      'PROMOTION_SUPPORT': '홍보지원',
    };
    return labels[type] || type;
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

              {regionPrograms.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">
                    이 지역의 귀농귀촌 지원사업
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {property.location.district}에서 제공하는 지원 프로그램입니다
                  </p>
                  <div className="space-y-3">
                    {regionPrograms.map((program) => (
                      <div
                        key={program.program_id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedProgram(
                              expandedProgram === program.program_id
                                ? null
                                : program.program_id
                            )
                          }
                          className="w-full px-4 py-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 flex-1 text-left">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                              {getProgramTypeLabel(program.program_type)}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm">
                                {program.program_name}
                              </p>
                              <p className="text-slate-600 text-xs mt-1">
                                {program.district}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              expandedProgram === program.program_id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                        {expandedProgram === program.program_id && (
                          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                            <div className="space-y-3 text-sm">
                              {program.support_amount && (
                                <div>
                                  <p className="text-slate-600 font-medium mb-1">
                                    지원금액
                                  </p>
                                  <p className="text-slate-900">
                                    {program.support_amount.toLocaleString()}원
                                  </p>
                                </div>
                              )}
                              {program.target_audience && (
                                <div>
                                  <p className="text-slate-600 font-medium mb-1">
                                    지원대상
                                  </p>
                                  <p className="text-slate-900">
                                    {program.target_audience}
                                  </p>
                                </div>
                              )}
                              {program.support_content && (
                                <div>
                                  <p className="text-slate-600 font-medium mb-1">
                                    지원내용
                                  </p>
                                  <p className="text-slate-900">
                                    {program.support_content}
                                  </p>
                                </div>
                              )}
                              {program.application_period && (
                                <div>
                                  <p className="text-slate-600 font-medium mb-1">
                                    신청기간
                                  </p>
                                  <p className="text-slate-900">
                                    {program.application_period}
                                  </p>
                                </div>
                              )}
                              {program.contact && (
                                <div>
                                  <p className="text-slate-600 font-medium mb-1">
                                    문의처
                                  </p>
                                  <p className="text-slate-900">
                                    {program.contact}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
