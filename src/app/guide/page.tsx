"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import supportData from "@/../help.json";
import type { SupportData, ProgramType } from "@/types/support";

const data = supportData as SupportData;

export default function GuidePage() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ProgramType | "all">("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // 지역 정렬 순서 정의 (충청도 → 전라도 → 경상도)
  const regionOrder = useMemo(() => {
    const order: Record<string, number> = {
      CHUNGBUK: 1,
      CHUNGNAM: 2,
      JEONBUK: 3,
      JEONNAM: 4,
      GYEONGBUK: 5,
      GYEONGNAM: 6,
    };
    return order;
  }, []);

  // 정렬된 지역 목록
  const sortedRegions = useMemo(() => {
    return [...data.regions].sort((a, b) => {
      const orderA = regionOrder[a.region_code] || 999;
      const orderB = regionOrder[b.region_code] || 999;
      return orderA - orderB;
    });
  }, [regionOrder]);

  // 전체 프로그램 목록 생성 (정렬된 순서로)
  const allPrograms = useMemo(() => {
    return sortedRegions.flatMap((region) =>
      region.programs.map((program) => ({
        ...program,
        region_name: region.region_name,
        region_code: region.region_code,
      }))
    );
  }, [sortedRegions]);

  // 필터링된 프로그램 목록
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter((program) => {
      const matchRegion =
        selectedRegion === "all" || program.region_code === selectedRegion;
      const matchType =
        selectedType === "all" || program.program_type === selectedType;
      return matchRegion && matchType;
    });
  }, [allPrograms, selectedRegion, selectedType]);

  // 지원금 포맷팅
  const formatAmount = (amount: number | null | undefined) => {
    if (!amount) return null;
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(0)}천만원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={() => router.push("/")}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              시골 이주 가이드
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">
                  📋 이주 단계별 체크리스트
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        지역 정보 수집
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        기후, 교통, 의료시설, 교육환경 등을 확인하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        현지 방문
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        최소 2-3번은 직접 방문해서 생활환경을 체험해보세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        주거지 확정
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        임시거주부터 시작해서 점진적으로 정착하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        지역사회 적응
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        마을 행사 참여, 이웃과의 관계 형성이 중요해요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  💰 예산 계획
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">이사비용</span>
                    <span className="text-sm text-gray-900">100-300만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      보증금/전세금
                    </span>
                    <span className="text-sm text-gray-900">
                      500-3000만원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">생활비 (월)</span>
                    <span className="text-sm text-gray-900">150-250만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">비상자금</span>
                    <span className="text-sm text-gray-900">
                      500-1000만원
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">
                  🏛️ 정부 지원 정책
                </h3>

                {/* 필터 섹션 */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      지역 선택
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">전체 지역</option>
                      {sortedRegions.map((region) => (
                        <option
                          key={region.region_code}
                          value={region.region_code}
                        >
                          {region.region_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      지원 유형
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(e.target.value as ProgramType | "all")
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">전체 유형</option>
                      {Object.entries(data.program_types).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* 검색 결과 개수 */}
                <div className="mb-3 text-xs text-gray-600">
                  총 <span className="font-semibold text-blue-600">{filteredPrograms.length}</span>개 지원사업
                </div>

                {/* 프로그램 목록 */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {filteredPrograms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      해당 조건의 지원사업이 없습니다.
                    </div>
                  ) : (
                    filteredPrograms.map((program) => (
                      <div
                        key={program.program_id}
                        className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedProgram(
                              expandedProgram === program.program_id
                                ? null
                                : program.program_id
                            )
                          }
                          className="w-full p-3 text-left hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                  {program.region_name}
                                </span>
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                  {data.program_types[program.program_type]}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm">
                                {program.program_name}
                              </h4>
                              {program.support_amount && (
                                <p className="text-blue-600 font-semibold text-xs mt-1">
                                  최대 {formatAmount(program.support_amount)}
                                </p>
                              )}
                              {program.support_amount_detail && (
                                <div className="text-blue-600 font-semibold text-xs mt-1">
                                  {program.support_amount_detail.startup_fund && (
                                    <span>
                                      창업자금{" "}
                                      {formatAmount(
                                        program.support_amount_detail
                                          .startup_fund
                                      )}
                                    </span>
                                  )}
                                  {program.support_amount_detail.housing_fund && (
                                    <span className="ml-2">
                                      / 주택자금{" "}
                                      {formatAmount(
                                        program.support_amount_detail
                                          .housing_fund
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {expandedProgram === program.program_id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        </button>

                        {expandedProgram === program.program_id && (
                          <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-2.5 bg-white">
                            {program.target_audience && (
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  대상:
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {program.target_audience}
                                </p>
                              </div>
                            )}
                            {program.support_content && (
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  지원내용:
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {program.support_content}
                                </p>
                              </div>
                            )}
                            {(program.subsidy_rate !== undefined ||
                              program.self_pay_rate !== undefined) && (
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  지원비율:
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  보조 {program.subsidy_rate}% / 자부담{" "}
                                  {program.self_pay_rate}%
                                </p>
                              </div>
                            )}
                            {program.loan_type && (
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  융자조건:
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  금리 {program.loan_interest_rate}%
                                  {program.loan_term && ` / ${program.loan_term}`}
                                </p>
                              </div>
                            )}
                            {program.support_condition && (
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  신청조건:
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {program.support_condition}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
