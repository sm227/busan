"use client";

import { useState } from "react";
import {
  Heart,
  MapPin,
  Sparkles,
  Home as HomeIcon,
  Phone,
  Eye,
  ArrowLeft,
  Search,
  User,
  Settings,
  Users,
  BookOpen,
  Map,
  Bot,
  MessageCircle,
} from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import SwipeStack from "@/components/SwipeStack";
import AIChat from "@/components/AIChat";
import MyPage from "@/components/MyPage";
import KakaoKoreaMap from "@/components/KakaoKoreaMap";
import { personalityQuestions } from "@/data/questions";
import { sampleProperties } from "@/data/properties";
import { villageStories } from "@/data/stories";
import { MatchingAlgorithm } from "@/lib/matching";
import { UserPreferences, QuestionOption, RuralProperty } from "@/types";

type AppState =
  | "welcome"
  | "questionnaire"
  | "matching"
  | "results"
  | "propertyDetail"
  | "contact"
  | "main"
  | "community"
  | "stories"
  | "guide"
  | "aiConsultation"
  | "myPage"
  | "koreaMap";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userPreferences, setUserPreferences] = useState<
    Partial<UserPreferences>
  >({});
  const [recommendations, setRecommendations] = useState<RuralProperty[]>([]);
  const [likedProperties, setLikedProperties] = useState<RuralProperty[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<RuralProperty[]>(
    []
  );
  const [selectedProperty, setSelectedProperty] =
    useState<RuralProperty | null>(null);

  const handleQuestionAnswer = (option: QuestionOption) => {
    setUserPreferences((prev) => ({
      ...prev,
      [option.category]: option.value,
    }));

    if (currentQuestionIndex < personalityQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalPreferences = {
        ...userPreferences,
        [option.category]: option.value,
      } as UserPreferences;

      const matchedProperties = MatchingAlgorithm.getRecommendations(
        finalPreferences,
        sampleProperties,
        5
      );

      setRecommendations(matchedProperties);
      setAppState("main");
    }
  };

  const handleSwipe = (
    direction: "left" | "right",
    property: RuralProperty
  ) => {
    if (direction === "right") {
      setLikedProperties((prev) => [...prev, property]);
    } else {
      setRejectedProperties((prev) => [...prev, property]);
    }
  };

  const handleMatchingComplete = () => {
    setAppState("results");
  };

  const resetApp = () => {
    setAppState("welcome");
    setCurrentQuestionIndex(0);
    setUserPreferences({});
    setRecommendations([]);
    setLikedProperties([]);
    setRejectedProperties([]);
    setSelectedProperty(null);
  };

  const handlePropertyDetail = (property: RuralProperty) => {
    setSelectedProperty(property);
    setAppState("propertyDetail");
  };

  const handleContact = (property: RuralProperty) => {
    setSelectedProperty(property);
    setAppState("contact");
  };

  const goHome = () => {
    // 취향 분석이 완료된 경우에만 메인으로, 아니면 웰컴으로
    if (Object.keys(userPreferences).length > 0) {
      setAppState("main");
    } else {
      setAppState("welcome");
    }
  };

  const startMatching = () => {
    setAppState("matching");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen">
      {/* 홈 화면 */}
      {appState === "welcome" && (
        <div className="min-h-screen bg-white flex flex-col justify-center px-4 py-8">
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="mb-8">
              <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                <div className="text-2xl">🏡</div>
              </div>
              <h1 className="text-2xl font-medium text-gray-800 mb-6">
                아이디어톤
              </h1>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                당신에게 맞는
                <br />
                시골 생활을 찾아보세요
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setAppState("questionnaire")}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                시작하기
              </button>

              <p className="text-sm text-gray-500">
                몇 가지 간단한 질문에 답해주세요
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <div className="p-2">
                <div className="text-lg mb-1">🌱</div>
                <p className="text-xs text-gray-500">맞춤 추천</p>
              </div>
              <div className="p-2">
                <div className="text-lg mb-1">🍃</div>
                <p className="text-xs text-gray-500">쉬운 매칭</p>
              </div>
              <div className="p-2">
                <div className="text-lg mb-1">🌿</div>
                <p className="text-xs text-gray-500">바로 연결</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 홈화면 */}
      {appState === "main" && (
        <div className="min-h-screen bg-gray-50">
          {/* 헤더 */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-xs">시</span>
                </div>
                <h1 className="text-lg font-medium text-gray-800">
                  아이디어톤
                </h1>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setAppState("koreaMap")}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title="탐험 지도"
                >
                  <Map className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState("myPage")}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title="마이페이지"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="px-4 py-6 space-y-6">
            {/* 추천 시작 카드 */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="text-lg">🏡</div>
                </div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  시골 생활 찾기
                </h2>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  당신의 취향에 맞는 시골 집을 추천해드려요
                </p>
                <button
                  onClick={startMatching}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  추천받기
                </button>
              </div>
            </div>

            {/* 최근 관심 목록 */}
            {likedProperties.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-medium text-gray-800">관심 목록</h3>
                  </div>
                  <button
                    onClick={() => setAppState("results")}
                    className="text-emerald-600 text-sm hover:text-emerald-700"
                  >
                    전체보기
                  </button>
                </div>
                <div className="space-y-2">
                  {likedProperties.slice(0, 2).map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyDetail(property)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <HomeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {property.title}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          {property.location.district}, {property.location.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs">
                          {property.matchScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 인기 지역 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-800">인기 지역</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🏔️</div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      강원도
                    </h4>
                    <p className="text-gray-600 text-xs">자연 속 휴양</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🌊</div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      제주도
                    </h4>
                    <p className="text-gray-600 text-xs">바다 옆 생활</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🌾</div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      전라도
                    </h4>
                    <p className="text-gray-600 text-xs">농촌 체험</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🏕️</div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      경상도
                    </h4>
                    <p className="text-gray-600 text-xs">전통 마을</p>
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
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-800">더 많은 기능</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setAppState("aiConsultation")}
                  className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-emerald-100 transition-colors"
                >
                  <Bot className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs text-gray-700 font-medium">AI 상담</span>
                </button>
                <button
                  onClick={() => setAppState("community")}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs text-gray-700">커뮤니티</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAppState("stories")}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs text-gray-700">이주 스토리</span>
                </button>
                <button
                  onClick={() => setAppState("guide")}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Map className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs text-gray-700">이주 가이드</span>
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
        </div>
      )}

      {/* 질문 화면 */}
      {appState === "questionnaire" && (
        <div className="min-h-screen flex flex-col justify-center px-4 py-8">
          <QuestionCard
            question={personalityQuestions[currentQuestionIndex]}
            onAnswer={handleQuestionAnswer}
            currentQuestion={currentQuestionIndex}
            totalQuestions={personalityQuestions.length}
          />
        </div>
      )}

      {/* 매칭 화면 */}
      {appState === "matching" && (
        <div className="min-h-screen flex flex-col px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              추천 장소
            </h2>
            <p className="text-gray-600 text-sm">
              마음에 드시면 ♥️, 아니면 ✕ 해주세요
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <SwipeStack
              properties={recommendations}
              stories={villageStories}
              userPreferences={userPreferences as UserPreferences}
              useAI={Object.keys(userPreferences).length > 0}
              onSwipe={handleSwipe}
              onComplete={handleMatchingComplete}
            />
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {appState === "results" && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-6">
            {/* 헤더 */}
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              매칭 결과
            </h2>

            {likedProperties.length > 0 ? (
              <div className="space-y-4 mb-8">
                <p className="text-gray-600 text-sm text-center mb-4">
                  관심 표시한 곳 {likedProperties.length}개
                </p>

                {likedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">
                      {property.title}
                    </h4>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-sm">
                        {property.location.district}, {property.location.city}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-medium mb-3 text-sm">
                      {property.matchScore}% 매칭 · 월{" "}
                      {property.price.rent?.toLocaleString()}원
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePropertyDetail(property)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>상세보기</span>
                      </button>
                      <button
                        onClick={() => handleContact(property)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>연락하기</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 mb-8 py-8">
                <p className="mb-2">아직 마음에 드는 곳을 찾지 못하셨네요</p>
                <p className="text-sm">다시 한번 시도해보시겠어요?</p>
              </div>
            )}

            <div className="space-y-3 pb-8">
              <button
                onClick={() => setAppState("matching")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                새로운 추천받기
              </button>

              <button
                onClick={resetApp}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                처음부터 다시하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세보기 페이지 */}
      {appState === "propertyDetail" && selectedProperty && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={() => setAppState("results")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">돌아가기</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h1 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedProperty.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="text-sm">
                    {selectedProperty.location.district},{" "}
                    {selectedProperty.location.city}
                  </span>
                </div>

                <div className="text-xl font-bold text-emerald-600 mb-2">
                  월 {selectedProperty.price.rent?.toLocaleString()}원
                </div>
                {selectedProperty.price.deposit && (
                  <div className="text-sm text-gray-600">
                    보증금 {(selectedProperty.price.deposit / 10000).toFixed(0)}
                    만원
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">기본 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">방/평수:</span>
                    <span className="text-gray-900">
                      {selectedProperty.details.rooms}룸 ·{" "}
                      {selectedProperty.details.size}평
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">유형:</span>
                    <span className="text-gray-900">
                      {selectedProperty.details.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태:</span>
                    <span className="text-gray-900">
                      {selectedProperty.details.condition}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">특징</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-emerald-100 rounded text-xs text-emerald-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-8">
              <button
                onClick={() => handleContact(selectedProperty)}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>연락하기</span>
              </button>
              <button
                onClick={goHome}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 연락하기 페이지 */}
      {appState === "contact" && selectedProperty && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={() => setAppState("propertyDetail")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">돌아가기</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  연락하기
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedProperty.title}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    집주인 연락처
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">전화번호:</span>
                      <span className="text-gray-900 font-medium">
                        010-1234-5678
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락 가능:</span>
                      <span className="text-gray-900">오전 9시 - 오후 6시</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">상담센터</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상담 전화:</span>
                      <span className="text-gray-900 font-medium">
                        1588-0000
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">운영 시간:</span>
                      <span className="text-gray-900">24시간</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm text-center">
                    💡 방문 전에 미리 연락하여 약속을 잡으시는 것을 추천해요!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-8">
              <a
                href="tel:010-1234-5678"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>전화걸기</span>
              </a>
              <button
                onClick={goHome}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span>홈으로</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커뮤니티 페이지 */}
      {appState === "community" && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            {/* 헤더 */}
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              시골마음 커뮤니티
            </h2>

            <div className="space-y-4">
              {/* 최근 게시글 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  💬 최근 게시글
                </h3>
                <div className="space-y-3">
                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          김
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          강원도 정착 후기
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          도시에서 강원도로 이주한 지 1년이 되었습니다. 처음엔
                          걱정이 많았는데...
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>김정민</span>
                          <span className="mx-1">·</span>
                          <span>2시간 전</span>
                          <span className="mx-1">·</span>
                          <span>댓글 12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">
                          이
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          제주도 집 구하기 팁
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          제주도에서 집 구할 때 주의할 점들을 정리해봤어요. 특히
                          바람이...
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>이수정</span>
                          <span className="mx-1">·</span>
                          <span>5시간 전</span>
                          <span className="mx-1">·</span>
                          <span>댓글 8</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-sm font-medium">
                          박
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          농사 초보 질문있어요
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          텃밭을 시작하려고 하는데 어떤 작물부터 키우는 게
                          좋을까요?
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>박민수</span>
                          <span className="mx-1">·</span>
                          <span>1일 전</span>
                          <span className="mx-1">·</span>
                          <span>댓글 15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 인기 토픽 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">🔥 인기 토픽</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    #정착후기
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    #농사팁
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                    #집구하기
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    #이웃소식
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                    #생활정보
                  </span>
                </div>
              </div>

              {/* 지역별 모임 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  🌍 지역별 모임
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">
                      강원도 이주민 모임
                    </span>
                    <span className="text-xs text-gray-600">124명</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">제주 귀농귀촌</span>
                    <span className="text-xs text-gray-600">89명</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">
                      전라도 농사모임
                    </span>
                    <span className="text-xs text-gray-600">67명</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이주 스토리 페이지 */}
      {appState === "stories" && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              이주 스토리
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">정</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      정민호님의 강원도 이야기
                    </h3>
                    <p className="text-xs text-gray-600">
                      서울 → 강원도 홍천 / 2년차
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  "서울에서 15년간 직장생활을 하다가 번아웃이 와서 시골로
                  내려왔어요. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일 아침
                  산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐네요."
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="w-3 h-3 mr-1" />
                  <span>47명이 공감했어요</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">김</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      김수연님의 제주도 이야기
                    </h3>
                    <p className="text-xs text-gray-600">
                      부산 → 제주도 서귀포 / 1년차
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  "제주도는 정말 특별한 곳이에요. 바다가 주는 에너지가 있어요.
                  카페를 열었는데 관광객들과 현지분들이 모두 따뜻하게 맞아주셔서
                  매일이 감사해요."
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="w-3 h-3 mr-1" />
                  <span>32명이 공감했어요</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">박</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      박철수님의 전북 이야기
                    </h3>
                    <p className="text-xs text-gray-600">
                      대전 → 전북 임실 / 3년차
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  "농사를 지어보고 싶어서 내려왔는데, 이웃분들이 정말 많이
                  도와주셨어요. 첫 해 수확한 배추로 김치를 담가서 나눠드렸을
                  때의 기쁨을 잊을 수 없어요."
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="w-3 h-3 mr-1" />
                  <span>58명이 공감했어요</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이주 가이드 페이지 */}
      {appState === "guide" && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">홈으로</span>
              </button>
            </div>

            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
              시골 이주 가이드
            </h2>

            <div className="space-y-4">
              {/* 단계별 가이드 */}
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

              {/* 준비사항 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">💰 예산 계획</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">이사비용</span>
                    <span className="text-sm text-gray-900">100-300만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">보증금/전세금</span>
                    <span className="text-sm text-gray-900">500-3000만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">생활비 (월)</span>
                    <span className="text-sm text-gray-900">150-250만원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">비상자금</span>
                    <span className="text-sm text-gray-900">500-1000만원</span>
                  </div>
                </div>
              </div>

              {/* 지원 정책 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  🏛️ 정부 지원 정책
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm">
                      귀농귀촌 종합지원센터
                    </h4>
                    <p className="text-blue-700 text-xs mt-1">
                      상담, 교육, 정착지원 서비스를 제공합니다.
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 text-sm">
                      청년 농업인 정착지원
                    </h4>
                    <p className="text-green-700 text-xs mt-1">
                      40세 미만 청년에게 최대 3년간 월 100만원 지원
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <h4 className="font-medium text-amber-900 text-sm">
                      농촌 빈집 정비 지원
                    </h4>
                    <p className="text-amber-700 text-xs mt-1">
                      빈집 수리비용 최대 2000만원까지 지원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI 상담 페이지 */}
      {appState === "aiConsultation" && (
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 pb-8">
            <div className="flex items-center py-4 mb-4">
              <button
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">홈으로</span>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                AI 이주 상담사
              </h2>
              <p className="text-gray-600 text-sm">
                시골 이주에 대한 모든 궁금증을 물어보세요
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 text-sm mb-1">
                    이런 것들을 물어보세요!
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 시골 이주 준비 과정과 체크리스트</li>
                    <li>• 지역별 생활비와 주거비 정보</li>
                    <li>• 귀농귀촌 정부 지원 정책 안내</li>
                    <li>• 농촌 생활 적응 방법과 팁</li>
                    <li>• 지역 커뮤니티 참여 방법</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="h-[500px]">
              <AIChat 
                userPreferences={userPreferences}
                currentLocation="서울"
              />
            </div>
          </div>
        </div>
      )}

      {/* 마이페이지 */}
      {appState === "myPage" && (
        <MyPage onBack={goHome} />
      )}

      {/* 한국 지도 */}
      {appState === "koreaMap" && (
        <KakaoKoreaMap onBack={goHome} />
      )}
      </div>
    </div>
  );
}
