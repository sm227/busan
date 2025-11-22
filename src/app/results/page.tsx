"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Eye, Phone, X, Sparkles, Home, Search } from "lucide-react";
import { MatchingAlgorithm } from "@/lib/matching";
import { sampleProperties } from "@/data/properties";
import { UserPreferences, RuralProperty } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const { currentUser, likedProperties, userPreferences, setSelectedProperty, setRecommendations, setLikedProperties } = useApp();

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

  const handleRemoveProperty = async (property: RuralProperty) => {
    console.log('🗑️ 삭제 시작:', {
      propertyId: property.id,
      userId: currentUser?.id,
      title: property.title
    });

    if (currentUser) {
      try {
        const response = await fetch('/api/recommendations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            villageId: String(property.id)
          }),
        });

        const result = await response.json();
        if (result.success) {
          setLikedProperties(likedProperties.filter(p => p.id !== property.id));
        }
      } catch (error) {
        console.error('❌ 삭제 요청 실패:', error);
      }
    } else {
      setLikedProperties(likedProperties.filter(p => p.id !== property.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden text-stone-800" style={{ fontFamily: 'Pretendard Variable, sans-serif' }}>
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col">
        
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-stone-100">
          <button
            onClick={() => router.push("/")}
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-stone-800">내가 찜한 집</span>
          <div className="w-10" /> {/* 레이아웃 밸런스용 */}
        </div>

        <div className="flex-1 px-6 py-6 pb-24">
          
          {/* 상단 요약 */}
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-stone-800 mb-2">
               마음에 드는 곳을<br/>
               모아봤어요 🏡
             </h2>
             <p className="text-stone-500 text-sm">
               총 <span className="font-bold text-orange-600">{likedProperties.length}개</span>의 보금자리가 기다려요
             </p>
          </div>

          {likedProperties.length > 0 ? (
            <div className="space-y-4">
              {likedProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  {/* 삭제 버튼 (우측 상단) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProperty(property);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 매칭 점수 뱃지 */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 rounded-full text-[10px] text-white font-bold mb-3">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    {property.matchScore}% 일치
                  </div>

                  {/* 정보 영역 */}
                  <div className="pr-10 mb-4">
                    <h4 className="font-bold text-stone-800 text-lg mb-1 truncate">
                      {property.title}
                    </h4>
                    <div className="flex items-center text-stone-500 text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {property.location.district}, {property.location.city}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-orange-600">
                        월 {property.price.rent?.toLocaleString()}원
                      </div>
                      {property.price.deposit && (
                        <div className="text-xs font-medium text-stone-400">
                          보증금 {(property.price.deposit / 10000).toFixed(0)}만원
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 버튼 그룹 */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => handlePropertyDetail(property)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium text-sm hover:bg-stone-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                    <button
                      onClick={() => handleContact(property)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 text-white font-medium text-sm hover:bg-stone-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      연락하기
                    </button>
                  </div>
                </div>
              ))}
              
              {/* 하단 여백 및 추가 버튼 */}
              <div className="pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-4 bg-stone-100 text-stone-500 rounded-xl font-medium hover:bg-stone-200 transition-colors text-sm"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          ) : (
            /* 빈 상태 화면 */
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-bold text-stone-800">
                   아직 찜한 집이 없어요
                 </h3>
                 <p className="text-stone-500 text-sm">
                   당신의 취향에 딱 맞는 집을<br/>다시 찾아볼까요?
                 </p>
              </div>
              <button
                onClick={startMatching}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-stone-200"
              >
                매칭 다시 시작하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}