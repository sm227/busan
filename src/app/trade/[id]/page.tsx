"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Home as HomeIcon, User, Calendar, Sparkles } from "lucide-react";

interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface UserProperty {
  id: string;
  userId: number;
  title: string;
  description: string;
  district: string;
  city: string;
  region: string | null;
  address: string | null;
  rent: number | null;
  sale: number | null;
  deposit: number | null;
  rooms: number;
  size: number;
  type: string;
  yearBuilt: number | null;
  condition: string;
  images: PropertyImage[];
  features: string[];
  contact: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    nickname: string;
  };
}

export default function TradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState<UserProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/user-properties/${params.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          setProperty(data.data);
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
            onClick={() => router.push("/trade")}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleContact = () => {
    window.location.href = `tel:${property.contact}`;
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
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex].url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    {/* 이미지 인디케이터 */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                    {/* 좌우 버튼 */}
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HomeIcon className="w-16 h-16 text-stone-300" />
              </div>
            )}
          </div>

          <div className="space-y-6">

            {/* 1.5. 제목 & 가격 정보 */}
            <div className="px-6 pt-6 pb-5 border-b border-stone-100 bg-white">
              <h1 className="text-2xl font-bold text-stone-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>
                  {property.district} {property.city} {property.region || ''}
                  {property.address && <span className="text-stone-400"> · {property.address}</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{property.user.nickname}</span>
              </div>
              <div className="space-y-2">
                {property.sale && (
                  <div className="text-3xl font-bold text-orange-600">
                    매매 {property.sale.toLocaleString()}만원
                  </div>
                )}
                {property.rent && (
                  <div className={property.sale ? "text-xl font-bold text-stone-400" : "text-3xl font-bold text-blue-600"}>
                    월세 {property.rent.toLocaleString()}만원
                  </div>
                )}
                {property.deposit && (
                  <div className="text-sm text-stone-400">
                    보증금 {property.deposit.toLocaleString()}만원
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 space-y-6">

            {/* 2. 기본 스펙 요약 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 grid grid-cols-3 gap-4 text-center">
               <div>
                 <span className="block text-xs text-stone-400 mb-1">방 개수</span>
                 <span className="block font-bold text-lg text-stone-800">{property.rooms}개</span>
               </div>
               <div className="border-x border-stone-100">
                 <span className="block text-xs text-stone-400 mb-1">면적</span>
                 <span className="block font-bold text-lg text-stone-800">{property.size}평</span>
               </div>
               <div>
                 <span className="block text-xs text-stone-400 mb-1">유형</span>
                 <span className="block font-bold text-lg text-stone-800">{property.type}</span>
               </div>
            </div>

            {/* 3. 상세 설명 */}
            {property.description && (
              <div>
                <h3 className="font-bold text-stone-800 mb-3 text-lg">상세 설명</h3>
                <div className="bg-white border border-stone-200 rounded-2xl p-5">
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              </div>
            )}

            {/* 4. 상세 정보 */}
            <div className="space-y-6">
               {/* 특징 태그 */}
               {property.features && Array.isArray(property.features) && property.features.length > 0 && (
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
               )}

               {/* 추가 정보 */}
               <div>
                 <h3 className="font-bold text-stone-800 mb-3 text-lg">추가 정보</h3>
                 <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
                    {property.yearBuilt && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 text-sm">건축년도</span>
                        <span className="text-stone-800 font-medium">{property.yearBuilt}년</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400 text-sm">상태</span>
                      <span className="text-stone-800 font-medium">{property.condition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400 text-sm">등록일</span>
                      <span className="text-stone-800 font-medium">
                        {new Date(property.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                 </div>
               </div>
            </div>
            </div>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-stone-100 p-4 pb-6 z-30 flex gap-3">
           <button
             onClick={() => router.push("/trade")}
             className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
           >
             <HomeIcon className="w-5 h-5" />
             목록으로
           </button>
           <button
             onClick={handleContact}
             className="flex-[2] py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-lg shadow-stone-200 flex items-center justify-center gap-2"
           >
             <Phone className="w-5 h-5" />
             {property.contact}
           </button>
        </div>

      </div>
    </div>
  );
}
