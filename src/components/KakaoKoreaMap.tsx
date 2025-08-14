"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Trophy, Shield, Target, Loader2 } from "lucide-react";
import { dummyUser } from "@/data/userData";
import { VisitedRegion } from "@/types";
import { useKakaoMap } from "@/hooks/useKakaoMap";
import { regionBoundaries } from "@/data/regionBoundaries";

interface KakaoKoreaMapProps {
  onBack: () => void;
}

export default function KakaoKoreaMap({ onBack }: KakaoKoreaMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<VisitedRegion | null>(
    null
  );
  const [polygons, setPolygons] = useState<any[]>([]);
  const user = dummyUser;

  const { mapRef, map, isLoaded } = useKakaoMap({
    center: { lat: 36.5, lng: 127.5 }, // 한국 중앙
    level: 13, // 전국이 보이는 레벨
  });

  // 위험도에 따른 지역 색상
  const getRiskColor = (risk: "high" | "medium" | "low") => {
    switch (risk) {
      case "high":
        return "#dc2626"; // red-600
      case "medium":
        return "#d97706"; // amber-600
      case "low":
        return "#059669"; // emerald-600
    }
  };

  // 위험도에 따른 투명도
  const getRiskOpacity = (risk: "high" | "medium" | "low") => {
    switch (risk) {
      case "high":
        return 0.4;
      case "medium":
        return 0.3;
      case "low":
        return 0.2;
    }
  };

  // 지도에 폴리곤 추가
  useEffect(() => {
    if (!map || !isLoaded) return;

    // 기존 폴리곤 제거
    polygons.forEach((polygon) => polygon.setMap(null));

    const newPolygons: any[] = [];

    user.visitedRegions.forEach((region) => {
      // 해당 지역의 경계 데이터 찾기
      const boundary = regionBoundaries.find(
        (b) => b.name === region.name || b.name.includes(region.name)
      );

      if (!boundary) return;

      // 좌표를 카카오맵 LatLng 객체로 변환
      const coordinates = boundary.coordinates.map(
        ([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)
      );

      // 폴리곤 생성
      const polygon = new window.kakao.maps.Polygon({
        path: coordinates,
        strokeWeight: 2,
        strokeColor: getRiskColor(region.populationRisk),
        strokeOpacity: 0.8,
        fillColor: getRiskColor(region.populationRisk),
        fillOpacity: getRiskOpacity(region.populationRisk),
      });

      polygon.setMap(map);

      // 클릭 이벤트 추가
      window.kakao.maps.event.addListener(polygon, "click", () => {
        setSelectedRegion(region);
        // 클릭한 지역으로 지도 중심 이동
        const centerLat =
          boundary.coordinates.reduce((sum, [lat]) => sum + lat, 0) /
          boundary.coordinates.length;
        const centerLng =
          boundary.coordinates.reduce((sum, [, lng]) => sum + lng, 0) /
          boundary.coordinates.length;
        const center = new window.kakao.maps.LatLng(centerLat, centerLng);
        map.setCenter(center);
        map.setLevel(10); // 줌인
      });

      // 호버 이벤트 추가
      window.kakao.maps.event.addListener(polygon, "mouseover", () => {
        polygon.setOptions({
          fillOpacity: getRiskOpacity(region.populationRisk) + 0.2,
          strokeWeight: 3,
        });
      });

      window.kakao.maps.event.addListener(polygon, "mouseout", () => {
        polygon.setOptions({
          fillOpacity: getRiskOpacity(region.populationRisk),
          strokeWeight: 2,
        });
      });

      // 지역명 라벨 오버레이 추가
      const centerLat =
        boundary.coordinates.reduce((sum, [lat]) => sum + lat, 0) /
        boundary.coordinates.length;
      const centerLng =
        boundary.coordinates.reduce((sum, [, lng]) => sum + lng, 0) /
        boundary.coordinates.length;
      const labelPosition = new window.kakao.maps.LatLng(centerLat, centerLng);

      const labelContent = `
        <div style="
          background: ${getRiskColor(region.populationRisk)};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 1px solid white;
        ">
          ${region.name}
        </div>
      `;

      const labelOverlay = new window.kakao.maps.CustomOverlay({
        content: labelContent,
        position: labelPosition,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 10,
      });

      labelOverlay.setMap(map);

      newPolygons.push(polygon);
      newPolygons.push(labelOverlay);
    });

    setPolygons(newPolygons);

    // 클린업
    return () => {
      newPolygons.forEach((item) => {
        if (item.setMap) item.setMap(null);
      });
    };
  }, [map, isLoaded, user.visitedRegions]);

  const getProgressStats = () => {
    const totalProvinces = 17; // 17개 시도
    const visitedProvinces = new Set(user.visitedRegions.map((r) => r.province))
      .size;
    const highRiskVisited = user.visitedRegions.filter(
      (r) => r.populationRisk === "high"
    ).length;

    return {
      visitedProvinces,
      totalProvinces,
      highRiskVisited,
      progress: (visitedProvinces / totalProvinces) * 100,
    };
  };

  const stats = getProgressStats();

  const resetMapView = () => {
    if (map) {
      map.setCenter(new window.kakao.maps.LatLng(36.5, 127.5));
      map.setLevel(13);
      setSelectedRegion(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span className="text-sm">뒤로</span>
          </button>
          <h1 className="text-lg font-medium text-gray-900">
            실시간 탐험 지도
          </h1>
          <button
            onClick={resetMapView}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            전체보기
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-8 bg-gray-900 rounded-full"></div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.visitedProvinces}</div>
              <div className="text-xs text-gray-500">방문한 지역</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">총 17개 시도 중</div>
            <div className="text-xs text-gray-400">{stats.highRiskVisited}곳 위험지역 포함</div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-800 font-medium">전국 탐험 현황</span>
            <span className="text-emerald-600 font-bold text-lg">{Math.round(stats.progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-lg h-2 mb-3">
            <div 
              className="bg-emerald-500 h-2 rounded-lg transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              방문완료: <span className="font-medium text-gray-800">{stats.visitedProvinces}곳</span>
            </span>
            <span className="text-gray-600">
              남은지역: <span className="font-medium text-gray-800">{17 - stats.visitedProvinces}곳</span>
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">
            색칠된 지역 안내
          </h4>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-3 bg-red-600 opacity-40 rounded"></div>
              <span className="text-gray-700">위험지역</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-3 bg-amber-600 opacity-30 rounded"></div>
              <span className="text-gray-700">보통지역</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-3 bg-emerald-600 opacity-20 rounded"></div>
              <span className="text-gray-700">안전지역</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            방문한 지역만 지도에 색칠되어 표시됩니다
          </p>
        </div>

        {/* Kakao Map */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <div className="relative h-80">
            <div ref={mapRef} className="w-full h-full" />

            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">지도를 불러오는 중...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Region Info */}
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                {selectedRegion.name}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedRegion.populationRisk === "high"
                    ? "bg-red-100 text-red-600"
                    : selectedRegion.populationRisk === "medium"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {selectedRegion.populationRisk === "high"
                  ? "🚨 위험"
                  : selectedRegion.populationRisk === "medium"
                  ? "⚠️ 보통"
                  : "✅ 안전"}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              📍 {selectedRegion.province} {selectedRegion.city}
            </p>
            <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
              <span>🏠 {selectedRegion.duration}일 체류</span>
              <span>
                📅{" "}
                {new Date(selectedRegion.visitDate).toLocaleDateString("ko-KR")}
              </span>
              <div className="flex items-center">
                <span>⭐ {selectedRegion.rating}/5</span>
              </div>
            </div>
            {selectedRegion.memo && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  💭 {selectedRegion.memo}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Useful Info Section */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-amber-500" />
              나의 탐험 현황
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {user.profile.totalVisitDays}일
                </div>
                <div className="text-gray-600">총 체류 일수</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600">
                  {(
                    user.visitedRegions.reduce((sum, r) => sum + r.rating, 0) /
                      user.visitedRegions.length || 0
                  ).toFixed(1)}
                  ⭐
                </div>
                <div className="text-gray-600">평균 만족도</div>
              </div>
            </div>
          </div>

          {/* Government Support Info */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              귀농귀촌 지원 혜택
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">💰</span>
                <span>청년 농업인 정착지원금 월 100만원 (최대 3년)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">🏠</span>
                <span>농촌 빈집 수리비 최대 2,000만원 지원</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">📚</span>
                <span>귀농귀촌 교육 프로그램 무료 제공</span>
              </div>
            </div>
            <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              지원 정책 자세히 보기
            </button>
          </div>

          {/* Next Recommendation */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              추천 다음 목적지
            </h3>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">경북 영덕군</h4>
                    <p className="text-xs text-gray-600">인구 감소 위험 지역</p>
                    <p className="text-xs text-gray-500 mt-1">
                      대게 축제, 해안 드라이브
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                    🚨 위험
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">충남 부여군</h4>
                    <p className="text-xs text-gray-600">백제 문화 유적지</p>
                    <p className="text-xs text-gray-500 mt-1">
                      역사 체험, 전통 문화
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                    ⚠️ 보통
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
