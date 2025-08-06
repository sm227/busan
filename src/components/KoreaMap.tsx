"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Trophy, Shield, Target } from "lucide-react";
import { dummyUser } from "@/data/userData";
import { VisitedRegion } from "@/types";

interface KoreaMapProps {
  onBack: () => void;
}

// 정교한 한반도 지도 SVG
const KoreaSVG = ({
  visitedRegions,
  onRegionClick,
}: {
  visitedRegions: VisitedRegion[];
  onRegionClick: (region: VisitedRegion) => void;
}) => {
  const getVisitedRegion = (provinceName: string) => {
    return visitedRegions.find(
      (region) =>
        region.province.includes(provinceName) ||
        provinceName.includes(
          region.province
            .replace("특별자치도", "")
            .replace("특별시", "")
            .replace("광역시", "")
        )
    );
  };

  const getRegionColor = (provinceName: string) => {
    const region = getVisitedRegion(provinceName);
    if (!region) return "#e5e7eb"; // gray-200

    switch (region.populationRisk) {
      case "high":
        return "#dc2626"; // red-600
      case "medium":
        return "#d97706"; // amber-600
      case "low":
        return "#059669"; // emerald-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getRegionOpacity = (provinceName: string) => {
    const region = getVisitedRegion(provinceName);
    return region ? 0.8 : 0.3;
  };

  const handleRegionClick = (provinceName: string) => {
    const region = getVisitedRegion(provinceName);
    if (region) onRegionClick(region);
  };

  return (
    <svg viewBox="0 0 800 1000" className="w-full h-full">
      {/* 한국 지도 배경 */}
      <rect width="800" height="1000" fill="#f0f9ff" />

      {/* 강원도 */}
      <path
        d="M440 160 L600 140 L620 180 L640 220 L610 280 L580 320 L520 340 L460 320 L420 280 L400 240 L420 200 Z"
        fill={getRegionColor("강원")}
        opacity={getRegionOpacity("강원")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("강원")}
      />
      <text
        x="530"
        y="240"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        강원도
      </text>

      {/* 경기도 */}
      <path
        d="M360 220 L440 200 L420 240 L400 280 L380 320 L340 340 L300 320 L280 280 L300 240 L340 220 Z"
        fill={getRegionColor("경기")}
        opacity={getRegionOpacity("경기")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("경기")}
      />
      <text
        x="360"
        y="270"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        경기도
      </text>

      {/* 서울특별시 */}
      <circle
        cx="350"
        cy="250"
        r="12"
        fill={getRegionColor("서울")}
        opacity={getRegionOpacity("서울")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("서울")}
      />
      <text
        x="350"
        y="255"
        textAnchor="middle"
        className="text-xs font-bold pointer-events-none fill-white"
      >
        서울
      </text>

      {/* 인천광역시 */}
      <circle
        cx="300"
        cy="260"
        r="8"
        fill={getRegionColor("인천")}
        opacity={getRegionOpacity("인천")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("인천")}
      />

      {/* 충청북도 */}
      <path
        d="M340 340 L420 320 L460 360 L480 400 L450 440 L400 450 L360 440 L320 420 L300 380 Z"
        fill={getRegionColor("충청북")}
        opacity={getRegionOpacity("충청북")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("충청북")}
      />
      <text
        x="390"
        y="390"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        충청북도
      </text>

      {/* 충청남도 */}
      <path
        d="M240 340 L320 320 L340 360 L320 420 L280 460 L240 480 L200 460 L180 420 L200 380 Z"
        fill={getRegionColor("충청남")}
        opacity={getRegionOpacity("충청남")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("충청남")}
      />
      <text
        x="260"
        y="400"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        충청남도
      </text>

      {/* 대전광역시 */}
      <circle
        cx="320"
        cy="400"
        r="8"
        fill={getRegionColor("대전")}
        opacity={getRegionOpacity("대전")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("대전")}
      />

      {/* 전라북도 */}
      <path
        d="M200 480 L280 460 L320 500 L340 540 L320 580 L280 600 L240 580 L200 560 L160 540 L140 500 Z"
        fill={getRegionColor("전라북")}
        opacity={getRegionOpacity("전라북")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("전라북")}
      />
      <text
        x="240"
        y="530"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        전라북도
      </text>

      {/* 전라남도 */}
      <path
        d="M140 540 L240 580 L280 620 L300 680 L280 740 L240 780 L180 800 L120 780 L80 740 L60 680 L80 620 L120 580 Z"
        fill={getRegionColor("전라남")}
        opacity={getRegionOpacity("전라남")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("전라남")}
      />
      <text
        x="180"
        y="690"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        전라남도
      </text>

      {/* 광주광역시 */}
      <circle
        cx="200"
        cy="640"
        r="8"
        fill={getRegionColor("광주")}
        opacity={getRegionOpacity("광주")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("광주")}
      />

      {/* 경상북도 */}
      <path
        d="M480 360 L580 340 L620 380 L640 440 L620 500 L580 540 L520 560 L460 540 L440 500 L460 440 Z"
        fill={getRegionColor("경상북")}
        opacity={getRegionOpacity("경상북")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("경상북")}
      />
      <text
        x="550"
        y="450"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        경상북도
      </text>

      {/* 대구광역시 */}
      <circle
        cx="500"
        cy="480"
        r="8"
        fill={getRegionColor("대구")}
        opacity={getRegionOpacity("대구")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("대구")}
      />

      {/* 경상남도 */}
      <path
        d="M340 540 L460 540 L520 580 L540 620 L520 660 L480 700 L420 720 L360 700 L320 660 L300 620 Z"
        fill={getRegionColor("경상남")}
        opacity={getRegionOpacity("경상남")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("경상남")}
      />
      <text
        x="420"
        y="630"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        경상남도
      </text>

      {/* 부산광역시 */}
      <circle
        cx="480"
        cy="680"
        r="10"
        fill={getRegionColor("부산")}
        opacity={getRegionOpacity("부산")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("부산")}
      />
      <text
        x="480"
        y="685"
        textAnchor="middle"
        className="text-xs font-bold pointer-events-none fill-white"
      >
        부산
      </text>

      {/* 울산광역시 */}
      <circle
        cx="540"
        cy="600"
        r="8"
        fill={getRegionColor("울산")}
        opacity={getRegionOpacity("울산")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("울산")}
      />

      {/* 제주특별자치도 */}
      <ellipse
        cx="200"
        cy="900"
        rx="50"
        ry="25"
        fill={getRegionColor("제주")}
        opacity={getRegionOpacity("제주")}
        stroke="white"
        strokeWidth="2"
        className="cursor-pointer hover:opacity-100 hover:stroke-blue-500 hover:stroke-4 transition-all duration-200"
        onClick={() => handleRegionClick("제주")}
      />
      <text
        x="200"
        y="905"
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
      >
        제주도
      </text>

      {/* 방문한 지역에 마커 표시 */}
      {visitedRegions.map((region) => {
        // 각 지역의 정확한 위치
        let x = 400,
          y = 500;

        if (region.province.includes("경상북")) {
          x = 550;
          y = 450;
        } else if (region.province.includes("강원")) {
          x = 530;
          y = 240;
        } else if (region.province.includes("전라북")) {
          x = 240;
          y = 530;
        } else if (region.province.includes("제주")) {
          x = 200;
          y = 900;
        } else if (region.city.includes("안동")) {
          x = 580;
          y = 420;
        } else if (region.city.includes("평창")) {
          x = 480;
          y = 280;
        } else if (region.city.includes("임실")) {
          x = 220;
          y = 550;
        } else if (region.city.includes("서귀포")) {
          x = 180;
          y = 910;
        } else if (region.city.includes("영양")) {
          x = 600;
          y = 400;
        } else if (region.city.includes("의성")) {
          x = 560;
          y = 430;
        }

        return (
          <g key={region.id}>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill="white"
              stroke="#059669"
              strokeWidth="3"
              className="animate-pulse"
            />
            <circle cx={x} cy={y} r="3" fill="#059669" />
            {/* 지역명 라벨 */}
            <text
              x={x}
              y={y - 12}
              textAnchor="middle"
              className="text-xs font-bold fill-emerald-600 pointer-events-none"
            >
              {region.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default function KoreaMap({ onBack }: KoreaMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<VisitedRegion | null>(
    null
  );
  const user = dummyUser;

  const handleRegionClick = (region: VisitedRegion) => {
    setSelectedRegion(region);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span className="text-sm">뒤로</span>
          </button>
          <h1 className="text-lg font-medium text-gray-900">탐험 지도</h1>
          <div className="w-16" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-500 text-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.visitedProvinces}</div>
            <div className="text-sm text-emerald-100">방문한 지역</div>
          </div>
          <div className="bg-red-500 text-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.highRiskVisited}</div>
            <div className="text-sm text-red-100">위험지역 도움</div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 text-sm font-medium">
              전국 탐험 진행률
            </span>
            <span className="text-emerald-600 font-bold">
              {Math.round(stats.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {17 - stats.visitedProvinces}개 지역이 당신의 도움을 기다리고
            있어요!
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3 text-center">
            지역 현황
          </h3>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-gray-700">위험</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-600 rounded"></div>
              <span className="text-gray-700">보통</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-600 rounded"></div>
              <span className="text-gray-700">안전</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-gray-700">미방문</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg p-2 shadow-sm mb-4">
          <div className="aspect-[4/5] max-h-96">
            <KoreaSVG
              visitedRegions={user.visitedRegions}
              onRegionClick={handleRegionClick}
            />
          </div>
        </div>

        {/* Selected Region Info */}
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                {selectedRegion.name}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRegion.populationRisk === "high"
                    ? "bg-red-100 text-red-600"
                    : selectedRegion.populationRisk === "medium"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {selectedRegion.populationRisk === "high"
                  ? "위험"
                  : selectedRegion.populationRisk === "medium"
                  ? "보통"
                  : "안전"}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {selectedRegion.province} {selectedRegion.city}
            </p>
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <span>{selectedRegion.duration}일 체류</span>
              <span>
                {new Date(selectedRegion.visitDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {selectedRegion.memo && (
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 mt-2">
                {selectedRegion.memo}
              </p>
            )}
          </motion.div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg p-4 text-center mt-4">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-medium mb-1">
            인구 감소 위험 지역을 구해주세요!
          </h3>
          <p className="text-sm text-emerald-100">
            당신의 방문과 관심이 지역 활성화에 큰 도움이 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
