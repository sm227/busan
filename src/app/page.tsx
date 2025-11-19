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
} from "lucide-react";
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

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push("/welcome");
    }
  }, [isInitialized, currentUser, router]);

  const startMatching = async () => {
    if (Object.keys(userPreferences).length < 6) {
      router.push("/questionnaire");
      return;
    }

    setIsLoadingProperties(true);
    setApiError(null);

    try {
      console.log('🚀 AI 추천 시작:', userPreferences);

      // AI 추천 API 호출 (모든 로직이 서버에서 처리됨)
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

      console.log('✅ AI 추천 성공:', {
        추천지역: aiData.aiRegions,
        선택지역: aiData.selectedRegion,
        마을수: aiData.recommendations.length
      });

      setRecommendations(aiData.recommendations);
      router.push("/matching");
    } catch (error) {
      console.error('❌ AI 추천 실패:', error);
      setApiError('AI 추천에 실패했습니다. 기본 알고리즘으로 진행합니다.');

      // 에러 발생시 기존 알고리즘으로 fallback
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

      // 3초 후 매칭 페이지로 이동
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
      const response = await fetch(`/api/guestbook?entryId=${postId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPost(data.data);
        setShowPostModal(true);
      }
    } catch (error) {
      console.error('방명록 글 로드 실패:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-emerald-50/30">
          {/* 헤더 */}
          <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="빈집다방 로고"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  빈집다방
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push("/korea-map")}
                  className="p-3 text-slate-700 hover:text-emerald-600 transition-colors rounded-xl hover:bg-emerald-50"
                  title="탐험 지도"
                >
                  <Map className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push("/my-page")}
                  className="p-3 text-slate-700 hover:text-emerald-600 transition-colors rounded-xl hover:bg-emerald-50"
                  title="마이페이지"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="px-6 py-8 pb-24 space-y-8">
            {/* 인기 게시글 슬라이더 */}
            <PopularPostsSlider onPostClick={handlePostClick} />

            {/* 추천 시작 카드 */}
            <div className="card p-8">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-emerald-600 font-bold mb-2">✨ AI 맞춤 추천</h3>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <div className="text-lg mb-1">🏔️</div>
                      <span className="text-slate-600">자연환경</span>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <div className="text-lg mb-1">🏠</div>
                      <span className="text-slate-600">주거조건</span>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <div className="text-lg mb-1">👥</div>
                      <span className="text-slate-600">생활스타일</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  시골 생활 찾기
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed font-semibold">
                  당신의 취향을 분석해서 가장 적합한 시골 집을 추천해드려요
                </p>
                {apiError && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                    {apiError}
                  </div>
                )}
                <button
                  onClick={startMatching}
                  disabled={isLoadingProperties}
                  className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 smooth-hover relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoadingProperties ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        불러오는 중...
                      </>
                    ) : (
                      "추천받기"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => router.push("/questionnaire")}
                  disabled={isLoadingProperties}
                  className="mt-3 btn-secondary w-full py-4 text-lg font-medium smooth-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  설문 다시하기
                </button>
              </div>
            </div>

            {/* 최근 관심 목록 */}
            {likedProperties.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-800 text-lg">관심 목록</h3>
                  </div>
                  <button
                    onClick={() => router.push("/results")}
                    className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                  >
                    전체보기
                  </button>
                </div>
                <div className="space-y-3">
                  {likedProperties.slice(0, 2).map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyDetail(property.id)}
                      className="flex items-center space-x-4 p-4 bg-emerald-50/50 rounded-2xl cursor-pointer hover:bg-emerald-100/50 border border-emerald-100/50 card-hover"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                        <HomeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">
                          {property.title}
                        </h4>
                        <p className="text-slate-600 font-medium">
                          {property.location.district},{" "}
                          {property.location.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                          {property.matchScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 인기 지역 */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-5">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-lg">인기 지역</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-2xl p-4 cursor-pointer hover:bg-emerald-100/50 transition-colors border border-emerald-100/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏔️</div>
                    <h4 className="font-bold text-slate-800">
                      강원도
                    </h4>
                    <p className="text-slate-600 text-sm font-medium">자연 속 휴양</p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-4 cursor-pointer hover:bg-emerald-100/50 transition-colors border border-emerald-100/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌊</div>
                    <h4 className="font-bold text-slate-800">
                      제주도
                    </h4>
                    <p className="text-slate-600 text-sm font-medium">바다 옆 생활</p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-4 cursor-pointer hover:bg-emerald-100/50 transition-colors border border-emerald-100/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌾</div>
                    <h4 className="font-bold text-slate-800">
                      전라도
                    </h4>
                    <p className="text-slate-600 text-sm font-medium">농촌 체험</p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-4 cursor-pointer hover:bg-emerald-100/50 transition-colors border border-emerald-100/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏕️</div>
                    <h4 className="font-bold text-slate-800">
                      경상도
                    </h4>
                    <p className="text-slate-600 text-sm font-medium">전통 마을</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 이용 현황 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">이번 달 현황</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">새로운 매칭</span>
                  <span className="text-amber-600 font-medium">127건</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">성공적인 연결</span>
                  <span className="text-amber-600 font-medium">89건</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">신규 등록 집</span>
                  <span className="text-amber-600 font-medium">34채</span>
                </div>
              </div>
            </div>

            {/* 서비스 소개 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">서비스 소개</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      맞춤 추천
                    </h4>
                    <p className="text-gray-600 text-xs">
                      당신의 취향을 분석해서 딱 맞는 시골집을 찾아드려요
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      쉬운 매칭
                    </h4>
                    <p className="text-gray-600 text-xs">
                      스와이프만으로 간편하게 원하는 집을 선택하세요
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5">
                    <Phone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      바로 연락
                    </h4>
                    <p className="text-gray-600 text-xs">
                      마음에 드는 집을 찾으면 바로 연락할 수 있어요
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 커뮤니티 & 기능 메뉴 */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-lg">더 많은 기능</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => router.push("/ai-consultation")}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-2xl hover:from-blue-100 hover:to-emerald-100 gentle-scale"
                >
                  <Bot className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm text-slate-700 font-bold">
                    AI 상담
                  </span>
                </button>
                <button
                  onClick={() => router.push("/guestbook")}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:from-purple-100 hover:to-pink-100 gentle-scale"
                >
                  <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm text-slate-700 font-bold">방명록</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => router.push("/community")}
                  className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-100/50 gentle-scale border border-emerald-100/50"
                >
                  <Users className="w-6 h-6 text-emerald-600 mb-2" />
                  <span className="text-sm text-slate-700 font-bold">커뮤니티</span>
                </button>
                <button
                  onClick={() => router.push("/stories")}
                  className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-100/50 gentle-scale border border-emerald-100/50"
                >
                  <BookOpen className="w-6 h-6 text-emerald-600 mb-2" />
                  <span className="text-sm text-slate-700 font-bold">이주 스토리</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => router.push("/guide")}
                  className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-100/50 gentle-scale border border-emerald-100/50"
                >
                  <Map className="w-6 h-6 text-emerald-600 mb-2" />
                  <span className="text-sm text-slate-700 font-bold">이주 가이드</span>
                </button>
              </div>
            </div>

            {/* 추천 블로그 글 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">시골 생활 팁</h3>
              <div className="space-y-3">
                <div className="border-l-2 border-amber-200 pl-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    시골 이사 전 체크리스트
                  </h4>
                  <p className="text-gray-600 text-xs">
                    시골로 이사하기 전에 꼭 확인해야 할 것들을 정리했어요
                  </p>
                </div>
                <div className="border-l-2 border-amber-200 pl-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    농촌 생활 적응기
                  </h4>
                  <p className="text-gray-600 text-xs">
                    도시에서 농촌으로 이주한 분들의 실제 경험담입니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 바 */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-lg">
            <div className="grid grid-cols-5 py-2">
              <button
                onClick={() => router.push("/")}
                className="flex flex-col items-center py-3 px-2 text-emerald-600"
              >
                <HomeIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">홈</span>
              </button>
              <button
                onClick={startMatching}
                disabled={isLoadingProperties}
                className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">매칭</span>
              </button>
              <button
                onClick={() => router.push("/ai-consultation")}
                className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Bot className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">AI 상담</span>
              </button>
              <button
                onClick={() => router.push("/community")}
                className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">커뮤니티</span>
              </button>
              <button
                onClick={() => router.push("/my-page")}
                className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <User className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">마이</span>
              </button>
            </div>
          </div>
        </div>

        {/* 게시글 상세보기 모달 */}
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {selectedPost.category === 'experience' ? '📖' :
                     selectedPost.category === 'review' ? '⭐' :
                     selectedPost.category === 'tip' ? '💡' : '❓'}
                  </span>
                  <span className="text-sm text-emerald-600 font-medium">
                    {selectedPost.category === 'experience' ? '이주 경험' :
                     selectedPost.category === 'review' ? '후기' :
                     selectedPost.category === 'tip' ? '팁' : '질문'}
                  </span>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* 내용 */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-4">
                  {/* 제목 */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {selectedPost.title}
                  </h2>

                  {/* 메타 정보 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span>by {selectedPost.author_nickname}</span>
                    {selectedPost.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedPost.location}</span>
                      </div>
                    )}
                    {selectedPost.rating && (
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{selectedPost.rating}점</span>
                      </div>
                    )}
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedPost.likes_count?.toLocaleString() || 0} 좋아요</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedPost.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>

                  {/* 태그 */}
                  {selectedPost.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {JSON.parse(selectedPost.tags).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 본문 */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedPost.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
