'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import texHelpData from '../../../texHelp.json';
import supportData from '../../../help.json';
import type { SupportData, ProgramType } from '@/types/support';

export default function TexHelpPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Government support policy states
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ProgramType | "all">("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // Region sorting order
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

  // Format amount helper
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

  // Filter programs by region and type
  const filteredPrograms = useMemo(() => {
    const typedSupportData = supportData as SupportData;
    let programs = typedSupportData.regions.flatMap((region) =>
      region.programs.map((program) => ({
        ...program,
        region_code: region.region_code,
        region_name: region.region_name,
      }))
    );

    if (selectedRegion !== "all") {
      programs = programs.filter((p) => p.region_code === selectedRegion);
    }

    if (selectedType !== "all") {
      programs = programs.filter((p) => p.program_type === selectedType);
    }

    // Sort by region order
    programs.sort((a, b) => {
      const orderA = regionOrder[a.region_code] || 999;
      const orderB = regionOrder[b.region_code] || 999;
      return orderA - orderB;
    });

    return programs;
  }, [selectedRegion, selectedType, regionOrder]);

  return (
    <div className="min-h-screen bg-emerald-50/30">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* 헤더 */}
        <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => selectedCategory ? setSelectedCategory(null) : router.back()}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              세제혜택 안내
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* 내용 */}
        <div className="px-6 py-8 pb-24">
          {!selectedCategory ? (
            // 카테고리 선택 화면
            <div className="space-y-6">
              {/* 타이틀 */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">💰</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  귀농귀촌 지원사업
                </h2>
                <p className="text-slate-600">
                  다양한 혜택을 확인하세요
                </p>
              </div>

              {/* 주택구입 지원 */}
              <button
                onClick={() => setSelectedCategory('housing')}
                className="card w-full p-6 text-left hover:shadow-lg transition-all gentle-scale"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      주택구입 지원
                    </h3>
                    <p className="text-slate-600 text-sm">
                      최대 7,500만원 지원
                    </p>
                  </div>
                </div>
              </button>

              {/* 세제 혜택 */}
              <button
                onClick={() => setSelectedCategory('tax')}
                className="card w-full p-6 text-left hover:shadow-lg transition-all gentle-scale"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      세제 혜택
                    </h3>
                    <p className="text-slate-600 text-sm">
                      취득세 감면, 양도소득세 면제 등
                    </p>
                  </div>
                </div>
              </button>

              {/* 농기계 지원 */}
              <button
                onClick={() => setSelectedCategory('machinery')}
                className="card w-full p-6 text-left hover:shadow-lg transition-all gentle-scale"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">🚜</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      농기계 지원
                    </h3>
                    <p className="text-slate-600 text-sm">
                      구입자금 지원, 임대사업, 취득세 면제
                    </p>
                  </div>
                </div>
              </button>

              {/* 보험료 지원 */}
              <button
                onClick={() => setSelectedCategory('insurance')}
                className="card w-full p-6 text-left hover:shadow-lg transition-all gentle-scale"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      보험료 지원
                    </h3>
                    <p className="text-slate-600 text-sm">
                      국민연금, 건강보험, 안전재해보험
                    </p>
                  </div>
                </div>
              </button>

              {/* 정부 지원 정책 */}
              <button
                onClick={() => setSelectedCategory('government')}
                className="card w-full p-6 text-left hover:shadow-lg transition-all gentle-scale"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                      정부 지원 정책
                    </h3>
                    <p className="text-slate-600 text-sm">
                      지역별 정착, 주거, 교육 등 다양한 지원
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : selectedCategory === 'housing' ? (
            // 주택구입 지원 상세
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl">
                    주택구입 지원
                  </h3>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-4 mb-4 border border-emerald-100/50">
                  <p className="text-2xl font-bold text-emerald-900">
                    {texHelpData.housingPurchaseSupport.supportDetails.maxLoanAmount.toLocaleString()}원
                  </p>
                  <p className="text-emerald-700 text-sm mt-1">최대 지원금액</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      지원 대상
                    </h4>
                    <ul className="space-y-1.5 text-slate-600 ml-4">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>만 65세 이하 세대주</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>농촌 전입 후 5년 이내</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>최소 {texHelpData.housingPurchaseSupport.eligibility.educationRequirement.minHours}시간 귀농교육 이수</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      지원 용도
                    </h4>
                    <ul className="space-y-1.5 text-slate-600 ml-4">
                      {texHelpData.housingPurchaseSupport.supportDetails.supportedPurposes.map((purpose, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{purpose.type} (연면적 {purpose.maxArea}{purpose.areaUnit} 이하)</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      신청 방법
                    </h4>
                    <p className="text-slate-600 ml-4">
                      {texHelpData.housingPurchaseSupport.applicationProcess.submissionLocation}에 신청
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mt-4">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">📞 문의:</span> {texHelpData.programInfo.inquiryPlatform.name} ({texHelpData.programInfo.inquiryPlatform.phone})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedCategory === 'tax' ? (
            // 세제 혜택 상세
            <div className="space-y-4">
              <div className="card p-6 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl">
                    세제 혜택
                  </h3>
                </div>
              </div>

              {/* 취득세 감면 */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  농촌주택 개량 취득세 감면
                </h3>
                <div className="bg-blue-50/50 rounded-xl p-3 mb-3 border border-blue-100/50">
                  <p className="font-bold text-blue-900">최대 280만원 면제</p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>연면적 150㎡ 이하 주택</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>상시 거주 목적</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  유효기간: {texHelpData.taxBenefits.acquisitionTaxReduction.validUntil}까지
                </p>
              </div>

              {/* 양도소득세 면제 */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  일반주택 양도소득세 면제
                </h3>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>귀농주택 + 일반주택 각 1개 소유 시</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>일반주택 양도 시 1세대1주택으로 간주</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>영농 목적 취득, 3년 이상 영농 종사</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>귀농주택 가격 12억원 이하</span>
                  </li>
                </ul>
              </div>

              {/* 농지보전부담금 감면 */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  농지보전부담금 감면
                </h3>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업인 주택 건축 시 면제</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>대지면적 660㎡ 이하</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농지 소재지 또는 연접한 지역</span>
                  </li>
                </ul>
              </div>

              {/* 농지취득 취득세 감면 */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  농지취득 취득세 50% 감면
                </h3>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>귀농일부터 3년 이내 취득</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>직접 경작 목적</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농지, 임야, 농업용시설</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  유효기간: {texHelpData.taxBenefits.farmlandAcquisitionTaxReduction.validUntil}까지
                </p>
              </div>
            </div>
          ) : selectedCategory === 'machinery' ? (
            // 농기계 지원 상세
            <div className="space-y-4">
              <div className="card p-6 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🚜</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl">
                    농기계 지원
                  </h3>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                  농기계 구입자금 지원
                </h3>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업기계 구입 자금 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>전부 또는 일부 지원</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 관할 지방자치단체
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                  농기계 임대사업
                </h3>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농기계 구입 부담 경감</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>지방자치단체별 임대사업소 운영</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 관할 농기계 임대사업소
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                  농기계 취득세 전액 면제
                </h3>
                <div className="bg-amber-50/50 rounded-xl p-3 mb-3 border border-amber-100/50">
                  <p className="font-bold text-amber-900">100% 면제</p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업용 농업기계</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>자동경운기 포함</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  유효기간: {texHelpData.farmMachinerySupport.taxExemption.farmMachineryAcquisitionTax.validUntil}까지
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                  관정시설 세금 면제
                </h3>
                <div className="bg-amber-50/50 rounded-xl p-3 mb-3 border border-amber-100/50">
                  <p className="font-bold text-amber-900">취득세 및 재산세 100% 면제</p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업용수 공급 목적</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  유효기간: {texHelpData.farmMachinerySupport.taxExemption.irrigationFacilityTax.validUntil}까지
                </p>
              </div>
            </div>
          ) : selectedCategory === 'insurance' ? (
            // 보험료 지원 상세
            <div className="space-y-4">
              <div className="card p-6 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl">
                    보험료 지원
                  </h3>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  국민연금보험료 지원
                </h3>
                <div className="bg-purple-50/50 rounded-xl p-3 mb-3 border border-purple-100/50">
                  <p className="font-bold text-purple-900">
                    최대 월 {texHelpData.insurancePremiumSupport.nationalPensionSupport.supportDetails.maxMonthlySupport.toLocaleString()}원 지원
                  </p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>본인 부담액의 50% 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>1,000㎡ 이상 농지 경영자</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>연 120만원 이상 농산물 판매자</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 국민연금공단 {texHelpData.insurancePremiumSupport.nationalPensionSupport.inquiryContact.phone}
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  국민건강보험료 지원
                </h3>
                <div className="bg-purple-50/50 rounded-xl p-3 mb-3 border border-purple-100/50">
                  <p className="font-bold text-purple-900">
                    보험료 {texHelpData.insurancePremiumSupport.nationalHealthInsuranceSupport.supportDetails.reductionRate}% 경감
                  </p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>지역가입자 대상</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농촌지역 거주</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업 종사자</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 국민건강보험공단 {texHelpData.insurancePremiumSupport.nationalHealthInsuranceSupport.inquiryContact.phone}
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  농업인 안전재해보험
                </h3>
                <div className="bg-purple-50/50 rounded-xl p-3 mb-3 border border-purple-100/50">
                  <p className="font-bold text-purple-900">보험료 50~70% 지원</p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농업인안전보험 50% 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>영세농업인 70% 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농작업 재해 보장</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 가까운 지역농협
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  농기계종합보험
                </h3>
                <div className="bg-purple-50/50 rounded-xl p-3 mb-3 border border-purple-100/50">
                  <p className="font-bold text-purple-900">보험료 50~70% 지원</p>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>대인/대물 배상 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>자기신체사고 지원</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>농기계손해 지원 (1억원 이하)</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3 ml-4">
                  문의: 가까운 지역농협
                </p>
              </div>
            </div>
          ) : selectedCategory === 'government' ? (
            // 정부 지원 정책 상세
            <div className="space-y-4">
              <div className="card p-6 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl">
                    정부 지원 정책
                  </h3>
                </div>
              </div>

              {/* 필터 */}
              <div className="flex gap-3 mb-4">
                {/* 지역 필터 */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none cursor-pointer hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                    >
                      <option value="all">전체 지역</option>
                      {(supportData as SupportData).regions
                        .sort((a, b) => (regionOrder[a.region_code] || 999) - (regionOrder[b.region_code] || 999))
                        .map((region) => (
                          <option key={region.region_code} value={region.region_code}>
                            {region.region_name}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* 유형 필터 */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as ProgramType | "all")}
                      className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-slate-700 appearance-none cursor-pointer hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                    >
                      <option value="all">전체 유형</option>
                      {Object.entries((supportData as SupportData).program_types).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 프로그램 개수 표시 */}
              <div className="text-center py-2">
                <p className="text-slate-600 text-sm">
                  총 <span className="font-bold text-rose-600">{filteredPrograms.length}개</span>의 지원 프로그램
                </p>
              </div>

              {/* 프로그램 목록 */}
              <div className="space-y-3">
                {filteredPrograms.map((program) => {
                  const isExpanded = expandedProgram === program.program_id;
                  const typedSupportData = supportData as SupportData;

                  return (
                    <div key={program.program_id} className="card overflow-hidden">
                      <button
                        onClick={() => setExpandedProgram(isExpanded ? null : program.program_id)}
                        className="w-full p-5 text-left hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-lg">
                                {program.region_name}
                              </span>
                              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                                {typedSupportData.program_types[program.program_type]}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">{program.program_name}</h4>
                            {program.district && (
                              <p className="text-sm text-slate-600 mb-1">{program.district}</p>
                            )}
                            {program.support_amount && (
                              <p className="text-rose-600 font-semibold mt-2">
                                {formatAmount(program.support_amount)}
                              </p>
                            )}
                            {program.support_amount_detail && (
                              <div className="text-sm text-rose-600 font-semibold mt-2 space-y-1">
                                {program.support_amount_detail.subsidy && (
                                  <p>보조금: {formatAmount(program.support_amount_detail.subsidy)}</p>
                                )}
                                {program.support_amount_detail.self_pay && (
                                  <p>자부담: {formatAmount(program.support_amount_detail.self_pay)}</p>
                                )}
                                {program.support_amount_detail.startup_fund && (
                                  <p>창업자금: {formatAmount(program.support_amount_detail.startup_fund)}</p>
                                )}
                                {program.support_amount_detail.housing_fund && (
                                  <p>주택자금: {formatAmount(program.support_amount_detail.housing_fund)}</p>
                                )}
                                {program.support_amount_detail.mentee_monthly && (
                                  <p>멘티 월: {formatAmount(program.support_amount_detail.mentee_monthly)}</p>
                                )}
                                {program.support_amount_detail.mentor_monthly && (
                                  <p>멘토 월: {formatAmount(program.support_amount_detail.mentor_monthly)}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-5 bg-slate-50/30 space-y-4">
                          {program.support_content && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                지원 내용
                              </h5>
                              <p className="text-slate-600 text-sm ml-4">{program.support_content}</p>
                            </div>
                          )}

                          {program.target_audience && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                지원 대상
                              </h5>
                              <p className="text-slate-600 text-sm ml-4">{program.target_audience}</p>
                            </div>
                          )}

                          {program.support_condition && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                지원 조건
                              </h5>
                              <p className="text-slate-600 text-sm ml-4">{program.support_condition}</p>
                            </div>
                          )}

                          {(program.subsidy_rate || program.self_pay_rate) && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                지원 비율
                              </h5>
                              <div className="text-slate-600 text-sm ml-4 space-y-1">
                                {program.subsidy_rate && <p>보조금: {program.subsidy_rate}%</p>}
                                {program.self_pay_rate && <p>자부담: {program.self_pay_rate}%</p>}
                              </div>
                            </div>
                          )}

                          {(program.loan_type || program.loan_interest_rate || program.loan_term) && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                융자 정보
                              </h5>
                              <div className="text-slate-600 text-sm ml-4 space-y-1">
                                {program.loan_type && <p>유형: {program.loan_type}</p>}
                                {program.loan_interest_rate && <p>금리: {program.loan_interest_rate}%</p>}
                                {program.loan_interest_type && <p>금리 유형: {program.loan_interest_type}</p>}
                                {program.loan_term && <p>상환 기간: {program.loan_term}</p>}
                              </div>
                            </div>
                          )}

                          {program.purpose && (
                            <div>
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center text-sm">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                목적
                              </h5>
                              <p className="text-slate-600 text-sm ml-4">{program.purpose}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredPrograms.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">해당 조건의 지원 프로그램이 없습니다.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}