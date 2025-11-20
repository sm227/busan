'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Home, Coins, Tractor, Shield, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import texHelpData from '../../../texHelp.json';
import supportData from '../../../help.json';
import type { SupportData, ProgramType } from '@/types/support';

const TABS = [
  { id: 'housing', label: '주택구입' },
  { id: 'tax', label: '세제혜택' },
  { id: 'machinery', label: '농기계' },
  { id: 'insurance', label: '보험료' },
  { id: 'government', label: '지자체' },
];

export default function TexHelpPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('housing');

  // Government policy filters
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ProgramType | "all">("all");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const regionOrder = useMemo(() => ({
    CHUNGBUK: 1, CHUNGNAM: 2, JEONBUK: 3, JEONNAM: 4, GYEONGBUK: 5, GYEONGNAM: 6,
  }), []);

  const formatAmount = (amount: number | null | undefined) => {
    if (!amount) return null;
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(0)}천만`;
    return `${amount.toLocaleString()}`;
  };

  const filteredPrograms = useMemo(() => {
    const typedSupportData = supportData as SupportData;
    let programs = typedSupportData.regions.flatMap((region) =>
      region.programs.map((program) => ({
        ...program,
        region_code: region.region_code,
        region_name: region.region_name,
      }))
    );

    if (selectedRegion !== "all") programs = programs.filter((p) => p.region_code === selectedRegion);
    if (selectedType !== "all") programs = programs.filter((p) => p.program_type === selectedType);

    programs.sort((a, b) => {
      const orderA = regionOrder[a.region_code] || 999;
      const orderB = regionOrder[b.region_code] || 999;
      return orderA - orderB;
    });

    return programs;
  }, [selectedRegion, selectedType, regionOrder]);

  // 공통 정책 카드 컴포넌트 (심플 버전)
  const PolicyCard = ({
    badge,
    title,
    agency,
    children,
    detailContent
  }: {
    badge?: string, title: string, agency: string, children?: React.ReactNode, detailContent?: React.ReactNode
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm mb-4 overflow-hidden transition-all hover:shadow-md">
        <div className="p-4">
          {/* 헤더: 타이틀 & 뱃지 */}
          <div className="flex flex-col gap-2 mb-3">
             <div className="flex items-start justify-between gap-2">
               <h3 className="font-bold text-stone-800 text-base leading-tight flex-1">{title}</h3>
               {badge && (
                 <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shrink-0">
                   {badge}
                 </span>
               )}
             </div>
             {/* 주관 기관 */}
             <p className="text-[11px] text-stone-400">{agency}</p>
          </div>

          {/* 주요 내용 (항상 보임) */}
          <div>{children}</div>
        </div>

        {/* 상세 내용 (토글) */}
        {detailContent && (
          <>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-stone-50"
                >
                  <div className="px-4 pb-4 pt-3 text-sm text-stone-600 space-y-3">
                    {detailContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 하단 토글 버튼 (화살표만) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full py-1 bg-white hover:bg-stone-50 flex justify-center items-center transition-colors"
            >
              <ChevronDown className={`w-5 h-5 text-stone-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-[#F9F8F6] min-h-screen relative shadow-xl flex flex-col">
        
        {/* 1. Header (복원된 Dark Banner Style) */}
        <div className="bg-stone-800 px-6 pt-6 pb-8 text-white sticky top-0 z-20">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">지원금 안내</h1>
            <div className="w-10"></div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold leading-tight">
             놓치면 안 되는<br/>
             <span className="text-orange-400">국가 지원 혜택</span>을 확인하세요
          </h2>
        </div>

        {/* 2. Tabs (복원된 Pill Shape) */}
        <div className="px-6 py-4 bg-white border-b border-stone-100 sticky top-[116px] z-10">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  activeTab === tab.id
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Content Area */}
        <div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* --- Housing Tab --- */}
              {activeTab === 'housing' && (
                <PolicyCard 
                  badge="융자지원" 
                  title="주택구입 지원사업" 
                  agency="농림축산식품부"
                  detailContent={
                    <>
                      <div>
                        <strong className="block text-stone-800 mb-1 text-xs">지원 대상</strong>
                        <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                           <li>만 65세 이하 세대주</li>
                           <li>농촌 전입 후 5년 이내</li>
                           <li>최소 {texHelpData.housingPurchaseSupport.eligibility.educationRequirement.minHours}시간 귀농교육 이수</li>
                        </ul>
                     </div>
                     <div>
                        <strong className="block text-stone-800 mb-1 text-xs">지원 용도</strong>
                        <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                           {texHelpData.housingPurchaseSupport.supportDetails.supportedPurposes.map((purpose, idx) => (
                             <li key={idx}>{purpose.type} (연면적 {purpose.maxArea}{purpose.areaUnit} 이하)</li>
                           ))}
                        </ul>
                     </div>
                     <div>
                        <strong className="block text-stone-800 mb-1 text-xs">신청 방법</strong>
                        <p className="text-xs">{texHelpData.housingPurchaseSupport.applicationProcess.submissionLocation}에 신청</p>
                     </div>
                     <p className="text-xs text-stone-400 pt-2 border-t border-stone-200">
                       📞 문의: {texHelpData.programInfo.inquiryPlatform.name} ({texHelpData.programInfo.inquiryPlatform.phone})
                     </p>
                    </>
                  }
                >
                   <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl mb-2 border border-stone-100">
                      <span className="text-xs font-medium text-stone-500">최대 한도</span>
                      <span className="text-lg font-bold text-stone-800 font-serif">7,500만원</span>
                   </div>
                   <div className="flex flex-col gap-1.5 text-[11px] text-stone-500">
                      <p className="flex items-center gap-1.5"><span className="w-1 h-1 bg-stone-400 rounded-full shrink-0" /> 연 1.5% (고정금리)</p>
                      <p className="flex items-center gap-1.5"><span className="w-1 h-1 bg-stone-400 rounded-full shrink-0" /> 5년 거치 10년 상환</p>
                   </div>
                </PolicyCard>
              )}

              {/* --- Tax Tab --- */}
              {activeTab === 'tax' && (
                <div className="space-y-4">
                   {/* 농촌주택 개량 취득세 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="농촌주택 개량 취득세 감면"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">조건</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>연면적 150㎡ 이하 주택</li>
                                 <li>상시 거주 목적</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">유효기간: {texHelpData.taxBenefits.acquisitionTaxReduction.validUntil}까지</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">연면적 150㎡ 이하 주택 개량 시</p>
                         <span className="text-base font-bold text-orange-600 font-serif">최대 280만원 면제</span>
                      </div>
                   </PolicyCard>

                   {/* 일반주택 양도소득세 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="일반주택 양도소득세 면제"
                     agency="국세청"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">조건</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>귀농주택 + 일반주택 각 1개 소유 시</li>
                                 <li>일반주택 양도 시 1세대1주택으로 간주</li>
                                 <li>영농 목적 취득, 3년 이상 영농 종사</li>
                                 <li>귀농주택 가격 12억원 이하</li>
                              </ul>
                           </div>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">3년 이상 영농 종사 후 양도 시</p>
                         <span className="text-base font-bold text-orange-600 font-serif">비과세 (1세대 1주택)</span>
                      </div>
                   </PolicyCard>

                   {/* 농지보전부담금 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="농지보전부담금 감면"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">조건</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농업인 주택 건축 시 면제</li>
                                 <li>대지면적 660㎡ 이하</li>
                                 <li>농지 소재지 또는 연접한 지역</li>
                              </ul>
                           </div>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">농업인 주택 건축 시</p>
                         <span className="text-base font-bold text-orange-600 font-serif">전액 면제</span>
                      </div>
                   </PolicyCard>

                   {/* 농지 취득세 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="농지취득 취득세 50% 감면"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">조건</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>귀농일부터 3년 이내 취득</li>
                                 <li>직접 경작 목적</li>
                                 <li>농지, 임야, 농업용시설</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">유효기간: {texHelpData.taxBenefits.farmlandAcquisitionTaxReduction.validUntil}까지</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">귀농 3년 이내 농지 취득 시</p>
                         <span className="text-base font-bold text-orange-600 font-serif">50% 감면</span>
                      </div>
                   </PolicyCard>
                </div>
              )}

              {/* --- Machinery Tab --- */}
              {activeTab === 'machinery' && (
                <div className="space-y-4">
                   {/* 농기계 구입자금 */}
                   <PolicyCard
                     badge="융자지원"
                     title="농기계 구입자금 지원"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">내용</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농업기계 구입 자금 지원</li>
                                 <li>전부 또는 일부 지원</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 관할 지방자치단체</p>
                        </div>
                     }
                   >
                      <p className="text-xs text-stone-600 leading-relaxed">농업기계 구입 자금의 전부 또는 일부를 지원합니다.</p>
                   </PolicyCard>

                   {/* 농기계 임대사업 */}
                   <PolicyCard
                     badge="임대지원"
                     title="농기계 임대사업"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">내용</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농기계 구입 부담 경감</li>
                                 <li>지방자치단체별 임대사업소 운영</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 관할 농기계 임대사업소</p>
                        </div>
                     }
                   >
                      <p className="text-xs text-stone-600 leading-relaxed">지자체 임대사업소를 통한 저렴한 임대 가능합니다.</p>
                   </PolicyCard>

                   {/* 농기계 취득세 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="농기계 취득세 전액 면제"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">대상</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농업용 농업기계</li>
                                 <li>자동경운기 포함</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">유효기간: {texHelpData.farmMachinerySupport.taxExemption.farmMachineryAcquisitionTax.validUntil}까지</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">농업용 기계류 구입 시 취득세가 100% 면제됩니다.</p>
                         <span className="text-base font-bold text-orange-600 font-serif">100% 면제</span>
                      </div>
                   </PolicyCard>

                   {/* 관정시설 세금 */}
                   <PolicyCard
                     badge="세제혜택"
                     title="관정시설 세금 면제"
                     agency="지자체"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">대상</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농업용수 공급 목적</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">유효기간: {texHelpData.farmMachinerySupport.taxExemption.irrigationFacilityTax.validUntil}까지</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-2">
                         <p className="text-xs text-stone-600 leading-relaxed">농업용수 관정시설 취득세 및 재산세가 면제됩니다.</p>
                         <span className="text-base font-bold text-orange-600 font-serif">취득세·재산세 100% 면제</span>
                      </div>
                   </PolicyCard>
                </div>
              )}

              {/* --- Insurance Tab --- */}
              {activeTab === 'insurance' && (
                <div className="space-y-4">
                   {/* 국민연금보험료 */}
                   <PolicyCard
                     badge="보험지원"
                     title="국민연금보험료 지원"
                     agency="국민연금공단"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">지원 대상</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>본인 부담액의 50% 지원</li>
                                 <li>1,000㎡ 이상 농지 경영자</li>
                                 <li>연 120만원 이상 농산물 판매자</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 국민연금공단 {texHelpData.insurancePremiumSupport.nationalPensionSupport.inquiryContact.phone}</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-1.5">
                         <span className="text-xs font-medium text-stone-600">본인부담금의 50% 지원</span>
                         <p className="text-[11px] text-orange-600 font-medium">최대 월 {texHelpData.insurancePremiumSupport.nationalPensionSupport.supportDetails.maxMonthlySupport.toLocaleString()}원 지원</p>
                      </div>
                   </PolicyCard>

                   {/* 국민건강보험료 */}
                   <PolicyCard
                     badge="보험지원"
                     title="국민건강보험료 지원"
                     agency="국민건강보험공단"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">지원 대상</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>지역가입자 대상</li>
                                 <li>농촌지역 거주</li>
                                 <li>농업 종사자</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 국민건강보험공단 {texHelpData.insurancePremiumSupport.nationalHealthInsuranceSupport.inquiryContact.phone}</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-1.5">
                         <span className="text-xs font-medium text-stone-600">보험료 {texHelpData.insurancePremiumSupport.nationalHealthInsuranceSupport.supportDetails.reductionRate}% 경감</span>
                         <p className="text-[11px] text-orange-600 font-medium">농어촌 거주자 및 농업인 대상</p>
                      </div>
                   </PolicyCard>

                   {/* 농업인 안전재해보험 */}
                   <PolicyCard
                     badge="보험지원"
                     title="농업인 안전재해보험"
                     agency="지역농협"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">지원 내용</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>농업인안전보험 50% 지원</li>
                                 <li>영세농업인 70% 지원</li>
                                 <li>농작업 재해 보장</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 가까운 지역농협</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-1.5">
                         <span className="text-xs font-medium text-stone-600">보험료 50~70% 지원</span>
                         <p className="text-[11px] text-orange-600 font-medium">산재보험 수준의 재해 보장</p>
                      </div>
                   </PolicyCard>

                   {/* 농기계 종합보험 */}
                   <PolicyCard
                     badge="보험지원"
                     title="농기계종합보험"
                     agency="지역농협"
                     detailContent={
                        <div className="space-y-2 text-xs">
                           <div>
                              <strong className="text-stone-800 block mb-1">지원 내용</strong>
                              <ul className="list-disc list-inside space-y-0.5 pl-1">
                                 <li>대인/대물 배상 지원</li>
                                 <li>자기신체사고 지원</li>
                                 <li>농기계손해 지원 (1억원 이하)</li>
                              </ul>
                           </div>
                           <p className="text-stone-400 pt-1">문의: 가까운 지역농협</p>
                        </div>
                     }
                   >
                      <div className="flex flex-col gap-1.5">
                         <span className="text-xs font-medium text-stone-600">보험료 50~70% 지원</span>
                         <p className="text-[11px] text-orange-600 font-medium">농기계 손해 및 대인/대물 배상</p>
                      </div>
                   </PolicyCard>
                </div>
              )}

              {/* --- Government Tab --- */}
              {activeTab === 'government' && (
                <div>
                   {/* Filter UI */}
                   <div className="flex gap-2 mb-4 bg-white p-2 rounded-xl border border-stone-100 shadow-sm">
                      <div className="relative flex-1 border-r border-stone-100">
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="w-full appearance-none bg-transparent text-xs font-bold text-stone-700 py-2 px-3 focus:outline-none"
                        >
                          <option value="all">전체 지역</option>
                          {(supportData as SupportData).regions.map((r) => (
                             <option key={r.region_code} value={r.region_code}>{r.region_name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value as ProgramType | "all")}
                          className="w-full appearance-none bg-transparent text-xs font-bold text-stone-700 py-2 px-3 focus:outline-none"
                        >
                          <option value="all">전체 유형</option>
                          {Object.entries((supportData as SupportData).program_types).map(([k, v]) => (
                             <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
                      </div>
                   </div>
                   
                   {/* Results Info */}
                   <div className="mb-3 px-1 flex justify-between items-center">
                      <span className="text-xs text-stone-400">검색 결과 {filteredPrograms.length}건</span>
                   </div>

                   <div className="space-y-4">
                      {filteredPrograms.map((program) => {
                         const typedSupportData = supportData as SupportData;
                         return (
                            <PolicyCard
                              key={program.program_id}
                              badge={typedSupportData.program_types[program.program_type]}
                              title={program.program_name}
                              agency={program.region_name + (program.district ? " " + program.district : "")}
                              detailContent={
                                 <div className="space-y-3 text-xs">
                                    {program.support_content && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">지원 내용</strong>
                                          <p className="text-stone-600">{program.support_content}</p>
                                       </div>
                                    )}
                                    {program.target_audience && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">지원 대상</strong>
                                          <p className="text-stone-600">{program.target_audience}</p>
                                       </div>
                                    )}
                                    {program.support_condition && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">지원 조건</strong>
                                          <p className="text-stone-600">{program.support_condition}</p>
                                       </div>
                                    )}
                                    {(program.subsidy_rate || program.self_pay_rate) && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">지원 비율</strong>
                                          <div className="text-stone-600 space-y-0.5">
                                             {program.subsidy_rate && <p>• 보조금: {program.subsidy_rate}%</p>}
                                             {program.self_pay_rate && <p>• 자부담: {program.self_pay_rate}%</p>}
                                          </div>
                                       </div>
                                    )}
                                    {(program.loan_type || program.loan_interest_rate || program.loan_term) && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">융자 정보</strong>
                                          <div className="text-stone-600 space-y-0.5">
                                             {program.loan_type && <p>• 유형: {program.loan_type}</p>}
                                             {program.loan_interest_rate && <p>• 금리: {program.loan_interest_rate}%</p>}
                                             {program.loan_interest_type && <p>• 금리 유형: {program.loan_interest_type}</p>}
                                             {program.loan_term && <p>• 상환 기간: {program.loan_term}</p>}
                                          </div>
                                       </div>
                                    )}
                                    {program.purpose && (
                                       <div>
                                          <strong className="text-stone-800 block mb-1">목적</strong>
                                          <p className="text-stone-600">{program.purpose}</p>
                                       </div>
                                    )}
                                    {program.contact && (
                                       <div className="pt-2 border-t border-stone-200 text-stone-400">
                                          문의: {program.contact}
                                       </div>
                                    )}
                                 </div>
                              }
                            >
                               {program.support_amount && (
                                 <div className="inline-block bg-stone-50 text-orange-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-100">
                                    {formatAmount(program.support_amount)} 지원
                                 </div>
                               )}
                               {program.support_amount_detail && (
                                 <div className="text-xs text-orange-600 font-medium mt-2 space-y-0.5">
                                    {program.support_amount_detail.subsidy && (
                                       <p>• 보조금: {formatAmount(program.support_amount_detail.subsidy)}</p>
                                    )}
                                    {program.support_amount_detail.self_pay && (
                                       <p>• 자부담: {formatAmount(program.support_amount_detail.self_pay)}</p>
                                    )}
                                    {program.support_amount_detail.startup_fund && (
                                       <p>• 창업자금: {formatAmount(program.support_amount_detail.startup_fund)}</p>
                                    )}
                                    {program.support_amount_detail.housing_fund && (
                                       <p>• 주택자금: {formatAmount(program.support_amount_detail.housing_fund)}</p>
                                    )}
                                    {program.support_amount_detail.mentee_monthly && (
                                       <p>• 멘티 월: {formatAmount(program.support_amount_detail.mentee_monthly)}</p>
                                    )}
                                    {program.support_amount_detail.mentor_monthly && (
                                       <p>• 멘토 월: {formatAmount(program.support_amount_detail.mentor_monthly)}</p>
                                    )}
                                 </div>
                               )}
                            </PolicyCard>
                         );
                      })}
                      {filteredPrograms.length === 0 && (
                        <div className="text-center py-12 text-stone-400 text-sm bg-white rounded-2xl border border-dashed border-stone-200">
                           조건에 맞는 정책이 없습니다.
                        </div>
                      )}
                   </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}