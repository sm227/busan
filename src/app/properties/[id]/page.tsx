"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Home as HomeIcon, ChevronDown, Sparkles, Coins, Calendar, CheckCircle2 } from "lucide-react";
import { RuralProperty } from "@/types";
import { SupportProgram, SupportData } from "@/types/support";
import helpDataRaw from "../../../../help.json";
import { BlurredImage } from "@/components/BlurredImage";
import { useApp } from "@/contexts/AppContext";

const helpData = helpDataRaw as SupportData;

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useApp();
  const [property, setProperty] = useState<RuralProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
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
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-stone-100">
          <p className="text-stone-600 mb-4 font-medium">매물을 찾을 수 없습니다</p>
          <button
            onClick={() => router.push("/results")}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleContact = () => {
    if (property) {
      router.push(`/properties/${property.id}/contact`);
    }
  };

  const getRegionCode = (district: string): string | null => {
    const mapping: { [key: string]: string } = {
      '충청북도': 'CHUNGBUK', '충청남도': 'CHUNGNAM',
      '전라북도': 'JEONBUK', '전라남도': 'JEONNAM',
      '경상북도': 'GYEONGBUK', '경상남도': 'GYEONGNAM',
    };
    return mapping[district] || null;
  };

  const getRegionPrograms = (): SupportProgram[] => {
    if (!property) return [];
    const regionCode = getRegionCode(property.location.district);
    if (!regionCode) return [];
    const region = helpData.regions.find(r => r.region_code === regionCode);
    if (!region) return [];
    if (regionCode === 'GYEONGBUK') {
      return region.programs.filter((p: SupportProgram) =>
        p.district === property.location.city || p.district === '경상북도'
      );
    }
    return region.programs;
  };

  const regionPrograms = getRegionPrograms();

  const getProgramTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'SETTLEMENT_SUPPORT': '정착지원', 'HOUSING_SUPPORT': '주거지원',
      'LOAN_SUPPORT': '융자지원', 'EDUCATION': '교육지원',
      'EXPERIENCE_PROGRAM': '체험', 'STARTUP_SUPPORT': '창업지원',
      'CONSULTING': '컨설팅', 'MOVING_SUPPORT': '이사지원',
      'VILLAGE_SUPPORT': '마을활동', 'PROMOTION_SUPPORT': '홍보지원',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 overflow-x-hidden" style={{ fontFamily: 'Pretendard Variable, sans-serif' }}>
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col">
        
        {/* 헤더 */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-stone-800 truncate max-w-[200px]">
            {property.title}
          </span>
          <div className="w-10" />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 pb-28">

          {/* 1. 이미지 영역 */}
          <div className="relative h-64 bg-stone-200">
             <BlurredImage
               src={property.images?.[0] || "/placeholder.jpg"}
               alt={property.title}
               className="w-full h-full object-cover"
               blurWhenLoggedOut={true}
             />
          </div>

          <div className="space-y-6">

            {/* 1.5. 제목 & 가격 정보 */}
            <div className="px-6 pt-6 pb-5 border-b border-stone-100 bg-white">
              <h1 className="text-2xl font-bold text-stone-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{property.location.district} {property.location.city}</span>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-orange-600">
                  월세 {Math.floor((property.price.rent || 0) / 10000).toLocaleString()}만원
                </div>
                {property.price.deposit && (
                  <div className="text-sm text-stone-400">
                    보증금 {Math.floor(property.price.deposit / 10000).toLocaleString()}만원
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 space-y-6">

            {/* 2. 기본 스펙 요약 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 grid grid-cols-3 gap-4 text-center">
               <div>
                 <span className="block text-xs text-stone-400 mb-1">방 개수</span>
                 <span className="block font-bold text-lg text-stone-800">{property.details.rooms}개</span>
               </div>
               <div className="border-x border-stone-100">
                 <span className="block text-xs text-stone-400 mb-1">면적</span>
                 <span className="block font-bold text-lg text-stone-800">{Math.round(property.details.size * 0.3025)}평</span>
               </div>
               <div>
                 <span className="block text-xs text-stone-400 mb-1">유형</span>
                 <span className="block font-bold text-lg text-stone-800">
                    {property.details.type === 'hanok' ? '한옥' :
                     property.details.type === 'modern' ? '현대식' :
                     property.details.type === 'farm' ? '농가' : '기타'}
                 </span>
               </div>
            </div>

            {/* 3. AI 추천 이유 */}
            {property.aiReason && (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <h3 className="font-bold text-stone-800 text-sm">AI 추천 포인트</h3>
                  </div>
                  <p className={`text-stone-600 text-sm leading-relaxed ${!currentUser ? 'filter blur-sm select-none' : ''}`}>
                    {property.aiReason}
                  </p>
                  {!currentUser && (
                    <div
                      onClick={() => router.push('/login')}
                      className="absolute inset-0 flex items-center justify-center bg-stone-50/60 cursor-pointer hover:bg-stone-50/70 transition-colors rounded-2xl"
                    >
                      <div className="text-stone-800 text-xs font-bold bg-white px-3 py-2 rounded-full shadow-lg pointer-events-none">
                        로그인하고 전체 보기 →
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. 상세 정보 (아코디언 스타일 대신 섹션 구분) */}
            <div className="space-y-6">
               {/* 특징 태그 */}
               <div>
                  <h3 className="font-bold text-stone-800 mb-3 text-lg">매력 포인트</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span key={index} className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-stone-600 text-sm font-medium">
                        #{feature}
                      </span>
                    ))}
                  </div>
               </div>

               {/* 주변 환경 */}
               {property.surroundings && (
                 <div>
                   <h3 className="font-bold text-stone-800 mb-3 text-lg">주변 환경</h3>
                   <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                      {property.surroundings.naturalFeatures?.length > 0 && (
                        <div className="flex gap-3">
                           <span className="text-stone-400 text-xs font-bold min-w-[40px] pt-1">자연</span>
                           <div className="flex flex-wrap gap-1.5">
                              {property.surroundings.naturalFeatures.map((f, i) => (
                                <span key={i} className="text-stone-600 text-sm bg-stone-50 px-2 py-0.5 rounded">{f}</span>
                              ))}
                           </div>
                        </div>
                      )}
                      {property.surroundings.nearbyFacilities?.length > 0 && (
                        <div className="flex gap-3">
                           <span className="text-stone-400 text-xs font-bold min-w-[40px] pt-1">편의</span>
                           <div className="flex flex-wrap gap-1.5">
                              {property.surroundings.nearbyFacilities.map((f, i) => (
                                <span key={i} className="text-stone-600 text-sm bg-stone-50 px-2 py-0.5 rounded">{f}</span>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                 </div>
               )}

               {/* 지원 사업 */}
               {regionPrograms.length > 0 && (
                <div>
                  <h3 className="font-bold text-stone-800 mb-3 text-lg flex items-center gap-2">
                    <Coins className="w-5 h-5 text-orange-500" />
                    지원 혜택 <span className="text-stone-400 text-sm font-sans font-normal">({regionPrograms.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {regionPrograms.map((program) => (
                      <div
                        key={program.program_id}
                        className="bg-white border border-stone-200 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedProgram(expandedProgram === program.program_id ? null : program.program_id)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-stone-50"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded">
                                {getProgramTypeLabel(program.program_type)}
                              </span>
                              <span className="text-xs text-stone-400">{program.district}</span>
                            </div>
                            <p className="font-bold text-stone-800 text-sm">{program.program_name}</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedProgram === program.program_id ? "rotate-180" : ""}`} />
                        </button>
                        
                        {expandedProgram === program.program_id && (
                          <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 text-sm space-y-3">
                             {program.support_amount && (
                               <div className="flex gap-3">
                                 <span className="text-stone-400 min-w-[50px] font-medium">지원금</span>
                                 <span className="font-bold text-orange-600">{program.support_amount.toLocaleString()}원</span>
                               </div>
                             )}
                             {program.support_content && (
                               <div className="flex gap-3">
                                 <span className="text-stone-400 min-w-[50px] font-medium">내용</span>
                                 <span className="text-stone-600 leading-relaxed">{program.support_content}</span>
                               </div>
                             )}
                             {program.contact && (
                               <div className="flex gap-3">
                                 <span className="text-stone-400 min-w-[50px] font-medium">문의</span>
                                 <span className="text-stone-600">{program.contact}</span>
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
               )}
            </div>
            </div>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-stone-100 p-4 pb-6 z-30 flex gap-3">
           <button
             onClick={() => router.push("/")}
             className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
           >
             <HomeIcon className="w-5 h-5" />
             홈으로
           </button>
           <button
             onClick={handleContact}
             className="flex-[2] py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-lg shadow-stone-200 flex items-center justify-center gap-2"
           >
             <Phone className="w-5 h-5" />
             문의하기
           </button>
        </div>

      </div>
    </div>
  );
}