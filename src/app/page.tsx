"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import {
  Heart,
  MapPin,
  Sparkles,
  Home as HomeIcon,
  Phone,
  Search,
  User,
  Users,
  BookOpen,
  Map,
  Bot,
  MessageCircle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Handshake,
  Coins,
  Menu,
  X,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PopularPostsSlider from "@/components/PopularPostsSlider";
import { MatchingAlgorithm } from "@/lib/matching";
import { UserPreferences, RuralProperty } from "@/types";
import { transformApiResponse, RuralVillageApiResponse } from "@/lib/apiTransformer";

export default function Home() {
  const router = useRouter();
  const {
    currentUser,
    userPreferences,
    likedProperties,
    setRecommendations,
    setSelectedPost,
    setShowPostModal,
    showPostModal,
    selectedPost,
    isInitialized,
  } = useApp();

  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- 배너 슬라이더 상태 관리 ---
  const [bannerIndex, setBannerIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000); // 5초마다 자동 전환

    return () => clearInterval(timer);
  }, []);
  // ---------------------------

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push("/welcome");
    }
  }, [isInitialized, currentUser, router]);

  // 코인 잔액 가져오기
  useEffect(() => {
    const fetchCoinBalance = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`/api/coins?userId=${currentUser.id}&action=balance`);
          const data = await response.json();
          if (data.success) {
            setCoinBalance(data.data.balance);
          }
        } catch (error) {
          console.error('코인 잔액 조회 실패:', error);
        }
      }
    };

    fetchCoinBalance();
  }, [currentUser]);

  const startMatching = async () => {
    if (Object.keys(userPreferences).length < 6) {
      router.push("/questionnaire");
      return;
    }

    setIsLoadingProperties(true);
    setApiError(null);

    try {
      console.log('🚀 AI 추천 시작:', userPreferences);

      const aiResponse = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences,
          userId: currentUser?.id
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI 추천 API 호출 실패');
      }

      const aiData = await aiResponse.json();

      if (!aiData.success || !aiData.recommendations || aiData.recommendations.length === 0) {
        throw new Error(aiData.error || '추천 결과가 없습니다');
      }

      setRecommendations(aiData.recommendations);
      router.push("/matching");
    } catch (error) {
      console.error('❌ AI 추천 실패:', error);
      setApiError('AI 추천에 실패했습니다. 기본 알고리즘으로 진행합니다.');

      try {
        const fallbackResponse = await fetch('/api/rural-villages?numOfRows=100');
        if (fallbackResponse.ok) {
          const fallbackData: RuralVillageApiResponse = await fallbackResponse.json();
          const fallbackProperties = transformApiResponse(fallbackData)
            .filter(p => p.communityInfo.population <= 300);

          if (fallbackProperties.length > 0) {
            const recs = MatchingAlgorithm.getRecommendations(
              userPreferences as UserPreferences,
              fallbackProperties,
              20
            );

            const shuffledRecs = [...recs].sort(() => Math.random() - 0.5);
            setRecommendations(shuffledRecs.slice(0, 10));
          } else {
            setApiError('추천할 농촌 마을이 없습니다. 다시 시도해주세요.');
            return;
          }
        } else {
          setApiError('데이터를 불러올 수 없습니다. 다시 시도해주세요.');
          return;
        }
      } catch {
        setApiError('데이터를 불러올 수 없습니다. 다시 시도해주세요.');
        return;
      }

      setTimeout(() => {
        setApiError(null);
        router.push("/matching");
      }, 3000);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handlePropertyDetail = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  const handlePostClick = async (postId: number) => {
    try {
      const response = await fetch(`/api/community?entryId=${postId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPost(data.data);
        setShowPostModal(true);
      }
    } catch (error) {
      console.error('커뮤니티 글 로드 실패:', error);
    }
  };

  // Menu helper components and functions
  const handleMenuNavigation = (route: string) => {
    setIsMenuOpen(false);
    router.push(route);
  };

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 px-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );

  const MenuItem = ({
    icon: Icon,
    label,
    route
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    route: string;
  }) => (
    <button
      onClick={() => handleMenuNavigation(route)}
      className="flex items-center space-x-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors group border border-stone-100"
    >
      <Icon className="w-5 h-5 text-stone-500 group-hover:text-stone-700 transition-colors flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className={`max-w-md mx-auto bg-white min-h-screen relative shadow-xl ${isMenuOpen ? 'overflow-hidden' : ''}`}>
        
        {/* 헤더 */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="빈집다방 로고"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="title-font text-2xl text-stone-800 leading-none -mb-1">
                빈집다방
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => router.push("/coin")}
                className="flex items-center space-x-1 px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
              >
                <Coins className="w-5 h-5" />
                <span className="text-sm font-bold">{coinBalance}</span>
              </button>
              <button
                onClick={() => router.push("/korea-map")}
                className="p-2 text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
                aria-label="메뉴 열기"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="px-6 py-6 pb-28 space-y-8">
          
          {/* 인기 게시글 슬라이더 */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <h3 className="font-bold text-stone-800 text-lg">요즘 뜨는 이야기</h3>
              <span className="text-xs text-stone-400 mb-1">실시간 인기글</span>
            </div>
            <PopularPostsSlider onPostClick={handlePostClick} />

            {/* 광고/혜택 배너 슬라이더 (수정됨) */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-lg shadow-stone-200/50 mt-6">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {/* 슬라이드 1: 귀농귀촌 혜택 */}
                <div className="w-full flex-shrink-0">
                  <button
                    onClick={() => router.push('/texHelp')}
                    className="relative w-full text-white py-3 px-6 h-full flex items-center justify-center hover:brightness-105 transition-all overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: 'url(/banner.png)' }}
                  >
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative text-center z-10">
                      <h4 className="font-bold text-lg mb-1">귀농귀촌 혜택 알아보기</h4>
                      <p className="text-white/90 text-xs">다양한 세제혜택과 지원사업을<br/>한번에 모아보세요</p>
                    </div>
                  </button>
                </div>

                {/* 슬라이드 2: 지역축제 */}
                <div className="w-full flex-shrink-0">
                  <button
                    onClick={() => router.push('/festival')}
                    className="relative w-full text-white py-3 px-6 h-full flex items-center justify-center hover:brightness-105 transition-all overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: 'url(/banner2.png)' }}
                  >
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative text-center z-10">
                      <h4 className="font-bold text-lg mb-1">2025 지역축제</h4>
                      <p className="text-white/90 text-xs">전국 지역축제 정보를<br/>한눈에 확인하세요</p>
                    </div>
                  </button>
                </div>

                {/* 슬라이드 3: Travelight */}
                <div className="w-full flex-shrink-0">
                  <button
                    onClick={() => window.open('https://travelight.co.kr', '_blank')}
                    className="w-full text-white py-3 px-6 h-full flex items-center justify-center hover:brightness-110 transition-all"
                    style={{ backgroundColor: '#2e7df1' }}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="font-bold text-xl">Travelight</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <p className="text-white/90 text-xs">소상공인과 상생하는 공간 공유 플랫폼</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 좌우 화살표 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBannerIndex((prev) => (prev === 0 ? 2 : prev - 1));
                }}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 active:scale-90 transition-transform"
              >
                <ChevronLeft className="w-5 h-5 text-white/70 drop-shadow-lg" strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBannerIndex((prev) => (prev === 2 ? 0 : prev + 1));
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 active:scale-90 transition-transform"
              >
                <ChevronRight className="w-5 h-5 text-white/70 drop-shadow-lg" strokeWidth={2.5} />
              </button>

              {/* 슬라이더 인디케이터 (점) */}
              <div className="absolute bottom-3 right-4 flex space-x-1.5 z-10">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      bannerIndex === idx ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* 슬라이더 끝 */}

          </div>

          {/* 메인 액션: AI 추천 */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <div className="mb-6 text-center">
              <span className="inline-block px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-500 mb-3">
                ✨ AI 맞춤 분석
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                나에게 꼭 맞는<br/>시골 집 찾기
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                취향을 분석해서 가장 편안한<br/>
                보금자리를 추천해드려요
              </p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-lg text-center">
                {apiError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={startMatching}
                disabled={isLoadingProperties}
                className="w-full py-4 bg-stone-800 text-white rounded-xl text-lg font-semibold shadow-md hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoadingProperties ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    분석중...
                  </>
                ) : (
                  "무료로 추천받기"
                )}
              </button>
              <button
                onClick={() => router.push("/questionnaire")}
                className="w-full py-3 bg-white text-stone-600 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                설문 다시하기
              </button>
            </div>
          </div>

          {/* 퀵 메뉴 그리드 (기능 모음) */}
          <div>
            <h3 className="font-bold text-stone-800 text-lg mb-4 px-1">더 알아보기</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/ai-consultation")}
                className="flex flex-col items-start p-4 bg-white border border-stone-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all group"
              >
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-stone-100 transition-colors">
                  <Bot className="w-5 h-5 text-stone-700" />
                </div>
                <span className="font-bold text-stone-800 text-sm">AI 상담소</span>
                <span className="text-[10px] text-stone-400 mt-1">무엇이든 물어보세요</span>
              </button>

              <button
                onClick={() => router.push("/community")}
                className="flex flex-col items-start p-4 bg-white border border-stone-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all group"
              >
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-stone-100 transition-colors">
                  <Users className="w-5 h-5 text-stone-700" />
                </div>
                <span className="font-bold text-stone-800 text-sm">마을회관</span>
                <span className="text-[10px] text-stone-400 mt-1">이웃과 소통하기</span>
              </button>

              <button
                onClick={() => router.push("/trade")}
                className="flex flex-col items-start p-4 bg-white border border-stone-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all group"
              >
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-stone-100 transition-colors">
                  <Handshake className="w-5 h-5 text-stone-700" />
                </div>
                <span className="font-bold text-stone-800 text-sm">빈집 거래</span>
                <span className="text-[10px] text-stone-400 mt-1">직접 사고팔기</span>
              </button>

              <button
                onClick={() => router.push("/festival")}
                className="flex flex-col items-start p-4 bg-white border border-stone-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all group"
              >
                <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-stone-100 transition-colors">
                  <Calendar className="w-5 h-5 text-stone-700" />
                </div>
                <span className="font-bold text-stone-800 text-sm">지역축제</span>
                <span className="text-[10px] text-stone-400 mt-1">2025 축제 정보</span>
              </button>
            </div>
          </div>

          {/* 최근 관심 목록 */}
          {likedProperties.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-stone-800 text-lg">내가 찜한 집</h3>
                <button
                  onClick={() => router.push("/results")}
                  className="text-stone-400 text-sm flex items-center hover:text-stone-600"
                >
                  전체보기 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {likedProperties.slice(0, 2).map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyDetail(property.id)}
                    className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-stone-100 cursor-pointer hover:border-stone-300 transition-colors"
                  >
                    <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HomeIcon className="w-6 h-6 text-stone-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-800 truncate">
                        {property.title}
                      </h4>
                      <p className="text-stone-500 text-xs truncate mt-1">
                        {property.location.district}, {property.location.city}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <span className="inline-block px-2 py-1 bg-stone-800 text-white text-xs font-bold rounded-lg">
                        {property.matchScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 지역 추천 (심플 버전) */}
          <div>
            <h3 className="font-bold text-stone-800 text-lg mb-4 px-1">어디로 떠날까요?</h3>
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { icon: "🏔️", name: "강원도", desc: "숲속 힐링" },
                { icon: "🌊", name: "제주도", desc: "바다 생활" },
                { icon: "🌾", name: "전라도", desc: "슬로 라이프" },
                { icon: "🏕️", name: "경상도", desc: "전통 체험" },
              ].map((region) => (
                <div key={region.name} className="flex-shrink-0 w-28 p-4 bg-white rounded-2xl border border-stone-100 text-center cursor-pointer hover:border-stone-300 transition-colors">
                  <div className="text-2xl mb-2">{region.icon}</div>
                  <h4 className="font-bold text-stone-800 text-sm">{region.name}</h4>
                  <p className="text-stone-400 text-[10px] mt-1">{region.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 하단 네비게이션 바 */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-stone-100 z-50">
          <div className="grid grid-cols-5 py-1">
            <button
              onClick={() => router.push("/")}
              className="flex flex-col items-center py-3 text-stone-800"
            >
              <HomeIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">홈</span>
            </button>
            <button
              onClick={() => router.push("/maps")}
              className="flex flex-col items-center py-3 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <Map className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">지도</span>
            </button>
            <button
              onClick={() => router.push("/ai-consultation")}
              className="flex flex-col items-center py-3 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <Bot className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">AI상담</span>
            </button>
            <button
              onClick={() => router.push("/community")}
              className="flex flex-col items-center py-3 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">마을회관</span>
            </button>
            <button
              onClick={() => router.push("/my-page")}
              className="flex flex-col items-center py-3 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">MY</span>
            </button>
          </div>
        </div>

        {/* Full-Screen Menu Page */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop to cover everything */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-[#F5F5F0] z-[60]"
              />

              {/* Menu Container */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 bottom-0 right-0 left-0 bg-white z-[61] flex flex-col max-w-md mx-auto shadow-2xl"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -ml-2 text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-stone-800 ml-2">전체 메뉴</h2>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* User Profile Section */}
                {currentUser && (
                  <div className="mb-8 p-4 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-stone-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-stone-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">{currentUser.nickname}</p>
                        <div className="flex items-center space-x-1 text-sm text-stone-500">
                          <Coins className="w-4 h-4" />
                          <span>{coinBalance} 코인</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 주요 메뉴 */}
                <MenuSection title="주요 메뉴">
                  <MenuItem icon={HomeIcon} label="홈" route="/" />
                  <MenuItem icon={Map} label="지도" route="/maps" />
                  <MenuItem icon={Bot} label="AI상담" route="/ai-consultation" />
                  <MenuItem icon={Users} label="마을회관" route="/community" />
                  <MenuItem icon={User} label="MY" route="/my-page" />
                </MenuSection>

                {/* 추가 서비스 */}
                <MenuSection title="추가 서비스">
                  <MenuItem icon={Handshake} label="빈집거래" route="/trade" />
                  <MenuItem icon={Calendar} label="지역축제" route="/festival" />
                  <MenuItem icon={Coins} label="코인" route="/coin" />
                  <MenuItem icon={Gift} label="귀농귀촌혜택" route="/texHelp" />
                </MenuSection>
              </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 게시글 상세보기 모달 */}
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <span className="text-sm font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                  {selectedPost.category === 'experience' ? '이주 경험' :
                   selectedPost.category === 'review' ? '솔직 후기' :
                   selectedPost.category === 'tip' ? '꿀팁 공유' : 'Q&A'}
                </span>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="overflow-y-auto max-h-[calc(85vh-130px)] p-6">
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-4 leading-snug">
                  {selectedPost.title}
                </h2>

                <div className="flex items-center space-x-3 text-xs text-stone-500 mb-6 border-b border-stone-50 pb-4">
                   <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{selectedPost.author}</span>
                   </div>
                   <div className="w-px h-3 bg-stone-200"></div>
                   <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(selectedPost.createdAt).toLocaleDateString('ko-KR')}</span>
                   </div>
                </div>

                {selectedPost.tags && (() => {
                   try {
                      const tags = JSON.parse(selectedPost.tags);
                      return (
                         <div className="flex flex-wrap gap-2 mb-5">
                            {tags.map((tag: string, index: number) => (
                            <span
                               key={index}
                               className="px-2 py-1 bg-stone-50 text-stone-600 border border-stone-100 rounded-md text-xs"
                            >
                               #{tag}
                            </span>
                            ))}
                         </div>
                      );
                   } catch (e) {
                      return null;
                   }
                })()}

                <div className="prose prose-sm max-w-none prose-stone">
                  <p className="text-stone-600 leading-7 whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="p-4 border-t border-stone-100 bg-stone-50/50">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
