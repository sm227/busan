"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Plus, MapPin, Phone, Home as HomeIcon, Calendar, User } from "lucide-react";

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

export default function TradePage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine">("all");

  useEffect(() => {
    loadProperties();
  }, [filter, currentUser]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const url = filter === "mine" && currentUser
        ? `/api/user-properties?userId=${currentUser.id}`
        : '/api/user-properties';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('매물 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!currentUser) return;
    if (!confirm('정말 이 매물을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch('/api/user-properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, userId: currentUser.id }),
      });

      const data = await response.json();
      if (data.success) {
        alert('매물이 삭제되었습니다');
        loadProperties();
      }
    } catch (error) {
      console.error('매물 삭제 실패:', error);
      alert('매물 삭제에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">

        {/* 헤더 */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-serif font-bold text-lg text-stone-800">빈집 거래</span>
            <button
              onClick={() => router.push('/trade/new')}
              className="p-2 -mr-2 text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 필터 */}
        {currentUser && (
          <div className="px-6 py-3 bg-white border-b border-stone-100">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                전체 매물
              </button>
              <button
                onClick={() => setFilter("mine")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "mine"
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                내 매물
              </button>
            </div>
          </div>
        )}

        {/* 매물 목록 */}
        <div className="px-6 py-4 pb-24 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 이미지 */}
                <div className="w-full h-48 bg-stone-100 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="font-bold text-stone-800 text-lg mb-2">{property.title}</h3>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-stone-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{property.district} {property.city} {property.region || ''}</span>
                    </div>
                    <div className="flex items-center text-stone-500 text-sm">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{property.user.nickname}</span>
                    </div>
                    <div className="flex items-center text-stone-500 text-sm">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <a href={`tel:${property.contact}`} className="text-orange-600 hover:underline">
                        {property.contact}
                      </a>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="flex items-center gap-2 mb-3">
                    {property.sale && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-bold rounded-lg">
                        매매 {property.sale.toLocaleString()}만원
                      </span>
                    )}
                    {property.rent && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">
                        월세 {property.rent.toLocaleString()}만원
                      </span>
                    )}
                  </div>

                  {/* 상세 정보 */}
                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                    <span>{property.type}</span>
                    <span>•</span>
                    <span>{property.rooms}개 방</span>
                    <span>•</span>
                    <span>{property.size}평</span>
                    <span>•</span>
                    <span>{property.condition}</span>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/trade/${property.id}`)}
                      className="flex-1 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
                    >
                      자세히 보기
                    </button>
                    {currentUser && currentUser.id === property.userId && (
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HomeIcon className="w-16 h-16 text-stone-300 mb-4" />
              <p className="text-stone-500 text-sm mb-4">
                {filter === "mine" ? "등록한 매물이 없습니다" : "등록된 매물이 없습니다"}
              </p>
              <button
                onClick={() => router.push('/trade/new')}
                className="px-6 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                매물 등록하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
