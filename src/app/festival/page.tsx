"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Calendar, MapPin, Filter, ChevronDown, Phone, Building2 } from "lucide-react";
import festivalsData from "@/data/festivals.json";

interface Festival {
  id: number;
  name: string;
  province: string;
  city: string;
  location: string;
  period: string;
  startYear: number | null;
  startMonth: number | null;
  startDay: number | null;
  endYear: number | null;
  endMonth: number | null;
  endDay: number | null;
  duration: number | null;
  venueName: string | null;
  organization: string | null;
  department: string | null;
  contact: string | null;
}

export default function FestivalPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("전체");
  const [selectedMonth, setSelectedMonth] = useState("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const festivals = festivalsData as Festival[];

  // 광역시도 목록 추출
  const provinces = useMemo(() => {
    const uniqueProvinces = Array.from(new Set(festivals.map(f => f.province)));
    return ["전체", ...uniqueProvinces.sort()];
  }, [festivals]);

  // 월 목록
  const months = ["전체", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  // 축제가 종료되었는지 확인하는 함수
  const isFestivalEnded = (festival: Festival): boolean => {
    if (!festival.endYear || !festival.endMonth) return false;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-based이므로 +1
    const currentDay = today.getDate();

    const endYear = festival.endYear;
    const endMonth = festival.endMonth;
    const endDay = festival.endDay || 31; // 일이 없으면 월 말로 간주

    // 종료 연도가 현재보다 이전
    if (endYear < currentYear) return true;

    // 같은 연도인 경우
    if (endYear === currentYear) {
      // 종료 월이 현재보다 이전
      if (endMonth < currentMonth) return true;

      // 같은 월인 경우, 종료 일이 현재보다 이전
      if (endMonth === currentMonth && endDay < currentDay) return true;
    }

    return false;
  };

  // 필터링된 축제 목록
  const filteredFestivals = useMemo(() => {
    return festivals.filter(festival => {
      // 서울 지역 축제 제외
      if (festival.province === "서울") return false;
      if (festival.province === "인천") return false;

      // 종료된 축제 제외
      if (isFestivalEnded(festival)) return false;

      // 검색어 필터
      const matchesSearch = !searchTerm ||
        festival.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        festival.location.toLowerCase().includes(searchTerm.toLowerCase());

      // 지역 필터
      const matchesProvince = selectedProvince === "전체" || festival.province === selectedProvince;

      // 월 필터
      const matchesMonth = selectedMonth === "전체" ||
        (festival.startMonth && `${festival.startMonth}월` === selectedMonth);

      return matchesSearch && matchesProvince && matchesMonth;
    });
  }, [festivals, searchTerm, selectedProvince, selectedMonth]);

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
            <span className="font-serif font-bold text-lg text-stone-800">2025 지역축제</span>
            <div className="w-10" />
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="px-6 py-4 space-y-3 bg-white border-b border-stone-100">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="축제명 또는 지역 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
            />
          </div>

          {/* 필터 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {/* 지역 필터 */}
            <div className="flex-shrink-0">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {/* 월 필터 */}
            <div className="flex-shrink-0">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 결과 요약 */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
          <p className="text-sm text-stone-600">
            총 <span className="font-bold text-orange-600">{filteredFestivals.length}</span>개의 축제
          </p>
        </div>

        {/* 축제 목록 */}
        <div className="px-6 py-4 pb-24 space-y-3">
          {filteredFestivals.length > 0 ? (
            filteredFestivals.map((festival) => {
              const isExpanded = expandedId === festival.id;
              const hasDetails = festival.venueName || festival.organization || festival.department || festival.contact;

              return (
                <div
                  key={festival.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all"
                >
                  {/* 메인 정보 (클릭 가능) */}
                  <div
                    onClick={() => hasDetails && setExpandedId(isExpanded ? null : festival.id)}
                    className={`p-4 ${hasDetails ? 'cursor-pointer hover:bg-stone-50' : ''} transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-800 text-base mb-2 leading-snug">
                          {festival.name}
                        </h3>

                        <div className="space-y-1.5">
                          <div className="flex items-center text-stone-500 text-sm">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{festival.location}</span>
                          </div>

                          <div className="flex items-center text-stone-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span>{festival.period}</span>
                          </div>
                        </div>
                      </div>

                      {hasDetails && (
                        <ChevronDown
                          className={`w-5 h-5 text-stone-400 flex-shrink-0 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </div>

                  {/* 상세 정보 (확장 시 표시) */}
                  {isExpanded && hasDetails && (
                    <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50 space-y-3">
                      {festival.venueName && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-stone-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-400 mb-0.5">장소명</p>
                            <p className="text-sm text-stone-700 font-medium">{festival.venueName}</p>
                          </div>
                        </div>
                      )}

                      {festival.organization && (
                        <div className="flex items-start">
                          <Building2 className="w-4 h-4 mr-2 mt-0.5 text-stone-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-400 mb-0.5">담당 기관</p>
                            <p className="text-sm text-stone-700 font-medium">
                              {festival.organization}
                              {festival.department && ` · ${festival.department}`}
                            </p>
                          </div>
                        </div>
                      )}

                      {festival.contact && (
                        <div className="flex items-start">
                          <Phone className="w-4 h-4 mr-2 mt-0.5 text-stone-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-400 mb-0.5">연락처</p>
                            <a
                              href={`tel:${festival.contact}`}
                              className="text-sm text-orange-600 font-medium hover:underline"
                            >
                              {festival.contact}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Filter className="w-12 h-12 text-stone-300 mb-4" />
              <p className="text-stone-500 text-sm">
                검색 결과가 없습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
