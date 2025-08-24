"use client";

import { useState, useEffect } from "react";
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
  Calendar,
} from "lucide-react";
import Image from "next/image";
import QuestionCard from "@/components/QuestionCard";
import SwipeStack from "@/components/SwipeStack";
import AIChat from "@/components/AIChat";
import MyPage from "@/components/MyPage";
import KakaoKoreaMap from "@/components/KakaoKoreaMap";
import UserInfoForm from "@/components/UserInfoForm";
import LoginForm from "@/components/LoginForm";
import GuestbookEnhanced from "@/components/GuestbookEnhanced";
import Community from "@/components/Community";
import PopularPostsSlider from "@/components/PopularPostsSlider";
import { personalityQuestions } from "@/data/questions";
import { sampleProperties } from "@/data/properties";
import { villageStories } from "@/data/stories";
import { MatchingAlgorithm } from "@/lib/matching";
import { UserPreferences, QuestionOption, RuralProperty } from "@/types";

type AppState =
  | "welcome"
  | "login"
  | "userInfo"
  | "questionnaire"
  | "analyzing"
  | "matching"
  | "results"
  | "allProperties"
  | "propertyDetail"
  | "contact"
  | "main"
  | "community"
  | "stories"
  | "guide"
  | "aiConsultation"
  | "myPage"
  | "koreaMap"
  | "guestbook";

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
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    nickname: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // 로그인 상태 복원
  useEffect(() => {
    const restoreLoginState = async () => {
      try {
        const savedUser = localStorage.getItem('busan-app-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // 사용자의 설문 결과 불러오기
          try {
            const surveyResponse = await fetch(`/api/survey?userId=${user.id}`);
            const surveyData = await surveyResponse.json();
            
            if (surveyData.success && surveyData.data) {
              const preferences = {
                livingStyle: surveyData.data.living_style,
                socialStyle: surveyData.data.social_style,
                workStyle: surveyData.data.work_style,
                hobbyStyle: surveyData.data.hobby_style,
                pace: surveyData.data.pace,
                budget: surveyData.data.budget
              };
              setUserPreferences(preferences);
            }
          } catch (error) {
            console.error('설문 결과 불러오기 실패:', error);
          }

          // 사용자의 관심목록 불러오기
          try {
            const likesResponse = await fetch(`/api/likes?userId=${user.id}`);
            const likesData = await likesResponse.json();
            
            if (likesData.success && likesData.data) {
              // 관심목록 데이터를 RuralProperty 형태로 변환
              const savedLikes = likesData.data.map((like: any) => {
                // sampleProperties에서 해당 property를 찾아서 완전한 객체로 만들기
                const property = sampleProperties.find(p => p.id === like.property_id);
                if (property) {
                  return { ...property, matchScore: like.match_score };
                }
                // 찾을 수 없으면 기본 객체 생성
                return {
                  id: like.property_id,
                  title: like.property_title,
                  location: { district: like.property_location.split(',')[0] || '', city: like.property_location.split(',')[1] || '' },
                  price: { rent: like.property_price },
                  matchScore: like.match_score,
                  details: { rooms: 0, size: 0, type: '', condition: '' },
                  features: [],
                  surroundings: { nature: [], cultural: [], convenience: [] },
                  community: { population: 0, demographics: '', activities: [] }
                };
              });
              // id 기준 중복 제거
              const uniqueById = new globalThis.Map<string, RuralProperty>();
              savedLikes.forEach((p: RuralProperty) => uniqueById.set(p.id, p));
              setLikedProperties(Array.from(uniqueById.values()));
            }
          } catch (error) {
            console.error('관심목록 불러오기 실패:', error);
          }

          setAppState("main");
        }
      } catch (error) {
        console.error('로그인 상태 복원 실패:', error);
        localStorage.removeItem('busan-app-user');
      } finally {
        setIsInitialized(true);
      }
    };

    restoreLoginState();
  }, []);

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

      // 분석 중 상태로 전환
      setAppState("analyzing");

      // 2초 후 매칭 결과 처리 및 자동 매칭 시작
      setTimeout(async () => {
        // DB에 설문 결과 저장
        if (currentUser) {
          try {
            const response = await fetch('/api/survey', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: currentUser.id,
                preferences: finalPreferences,
              }),
            });

            if (!response.ok) {
              console.error('설문 결과 저장 실패');
            }
          } catch (error) {
            console.error('설문 결과 저장 오류:', error);
          }
        }

        const matchedProperties = MatchingAlgorithm.getRecommendations(
          finalPreferences,
          sampleProperties,
          5
        );

        setRecommendations(matchedProperties);
        setAppState("matching");
      }, 2000);
    }
  };

  const handleLogout = () => {
    // localStorage에서 사용자 정보 제거
    localStorage.removeItem('busan-app-user');
    
    // 사용자 상태 초기화
    setCurrentUser(null);
    setUserPreferences({});
    setLikedProperties([]);
    setRejectedProperties([]);
    setRecommendations([]);
    
    // 홈으로 이동
    setAppState("welcome");
  };

  const handleSwipe = async (
    direction: "left" | "right",
    property: RuralProperty
  ) => {
    if (direction === "right") {
      setLikedProperties((prev) =>
        prev.some((p) => p.id === property.id) ? prev : [...prev, property]
      );
      
      // DB에 관심목록 저장
      if (currentUser) {
        try {
          await fetch('/api/likes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              property: {
                id: property.id,
                title: property.title,
                location: `${property.location.district}, ${property.location.city}`,
                price: property.price.rent || 0,
                matchScore: property.matchScore || 0
              }
            }),
          });
        } catch (error) {
          console.error('관심목록 저장 실패:', error);
        }
      }
    } else {
      setRejectedProperties((prev) => [...prev, property]);
      
      // 만약 이전에 좋아요를 했다가 취소하는 경우, DB에서도 삭제
      if (currentUser && likedProperties.some(p => p.id === property.id)) {
        try {
          await fetch('/api/likes', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              propertyId: property.id
            }),
          });
        } catch (error) {
          console.error('관심목록 삭제 실패:', error);
        }
      }
    }
  };

  const handleMatchingComplete = () => {
    setAppState("results");
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
    // 저장된 선호도가 없으면 설문으로 이동
    if (Object.keys(userPreferences).length < 6) {
      setAppState("questionnaire");
      return;
    }

    // 선호도를 기반으로 추천 목록 생성 후 매칭 화면으로 이동
    const recs = MatchingAlgorithm.getRecommendations(
      userPreferences as UserPreferences,
      sampleProperties,
      5
    );
    setRecommendations(recs);
    setAppState("matching");
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

  const handleUserInfoSubmit = async (nickname: string, password: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = { id: data.userId, nickname };
        setCurrentUser(user);
        // localStorage에 사용자 정보 저장
        localStorage.setItem('busan-app-user', JSON.stringify(user));
        setAppState("questionnaire");
      } else {
        alert(data.error || '사용자 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleLogin = async (nickname: string, password: string) => {
    try {
      // 사용자 인증 (이미 LoginForm에서 완료됨)
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        const userId = data.user.id;
        const user = { id: userId, nickname: data.user.nickname };
        setCurrentUser(user);
        // localStorage에 사용자 정보 저장
        localStorage.setItem('busan-app-user', JSON.stringify(user));
        
        // 사용자의 설문 결과 불러오기
        try {
          const surveyResponse = await fetch(`/api/survey?userId=${userId}`);
          const surveyData = await surveyResponse.json();
          
          if (surveyData.success && surveyData.data) {
            const preferences = {
              livingStyle: surveyData.data.living_style,
              socialStyle: surveyData.data.social_style,
              workStyle: surveyData.data.work_style,
              hobbyStyle: surveyData.data.hobby_style,
              pace: surveyData.data.pace,
              budget: surveyData.data.budget
            };
            setUserPreferences(preferences);
          }
        } catch (error) {
          console.error('설문 결과 불러오기 실패:', error);
        }

        // 사용자의 관심목록 불러오기
        try {
          const likesResponse = await fetch(`/api/likes?userId=${userId}`);
          const likesData = await likesResponse.json();
          
          if (likesData.success && likesData.data) {
            // 관심목록 데이터를 RuralProperty 형태로 변환
            const savedLikes = likesData.data.map((like: any) => {
              // sampleProperties에서 해당 property를 찾아서 완전한 객체로 만들기
              const property = sampleProperties.find(p => p.id === like.property_id);
              if (property) {
                return { ...property, matchScore: like.match_score };
              }
              // 찾을 수 없으면 기본 객체 생성
              return {
                id: like.property_id,
                title: like.property_title,
                location: { district: like.property_location.split(',')[0] || '', city: like.property_location.split(',')[1] || '' },
                price: { rent: like.property_price },
                matchScore: like.match_score,
                details: { rooms: 0, size: 0, type: '', condition: '' },
                features: [],
                surroundings: { nature: [], cultural: [], convenience: [] },
                community: { population: 0, demographics: '', activities: [] }
              };
            });
            // id 기준 중복 제거
            const uniqueById = new globalThis.Map<string, RuralProperty>();
            savedLikes.forEach((p: RuralProperty) => uniqueById.set(p.id, p));
            setLikedProperties(Array.from(uniqueById.values()));
          }
        } catch (error) {
          console.error('관심목록 불러오기 실패:', error);
        }

        setAppState("main");
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  // 초기화가 완료되지 않았으면 로딩 화면 표시
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* 홈 화면 */}
        {appState === "welcome" && (
          <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
            <div className="w-full max-w-sm mx-auto text-center">
              <div className="mb-12">
                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
                  <Image 
                    src="/logo.png" 
                    alt="빈집다방 로고" 
                    width={96} 
                    height={96}
                    className="object-contain"
                  />
                </div>
                                 <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                   빈집다방
                 </h1>
                 <p className="text-slate-700 text-lg mb-12 leading-relaxed font-semibold">
                   당신에게 맞는
                   <br />
                   시골 생활을 찾아보세요
                 </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setAppState("userInfo")}
                  className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 smooth-hover"
                >
                  시작하기
                </button>
                
                <button
                  onClick={() => setAppState("login")}
                  className="btn-secondary w-full py-4 text-lg font-medium smooth-hover"
                >
                  로그인
                </button>

                                 <p className="text-slate-600 font-semibold text-center">
                   몇 가지 간단한 질문에 답해주세요
                 </p>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                  <div className="text-2xl mb-2">🌱</div>
                                     <p className="text-sm text-slate-700 font-semibold">맞춤 추천</p>
                 </div>
                 <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                   <div className="text-2xl mb-2">🍃</div>
                   <p className="text-sm text-slate-700 font-semibold">쉬운 매칭</p>
                 </div>
                 <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
                   <div className="text-2xl mb-2">🌿</div>
                   <p className="text-sm text-slate-700 font-semibold">바로 연결</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 모든 집 보기 화면 (개발용) */}
        {appState === "allProperties" && (
          <div className="min-h-screen bg-emerald-50/30">
            <div className="px-6 pb-6">
              <div className="flex items-center py-6 mb-4">
                <button onClick={goHome} className="back-button">
                  <ArrowLeft className="w-4 h-4" />
                  <span>홈으로</span>
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                모든 집 보기 (개발용)
              </h2>
              <p className="text-center text-slate-600 text-sm mb-6">`src/data/properties.ts`의 데이터가 올바르게 들어갔는지 확인하세요.</p>

              <div className="space-y-4 mb-8">
                {sampleProperties.map((property) => (
                  <div key={property.id} className="card p-0 overflow-hidden">
                    <div className="relative w-full h-48">
                      <Image
                        src={property.images?.[0] || "/house/house1.jpg"}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{property.title}</h4>
                          <p className="text-slate-600 text-sm font-medium truncate">
                            {property.location.district}, {property.location.city}
                          </p>
                          <div className="text-emerald-600 font-bold text-sm mt-1">
                            월 {property.price.rent?.toLocaleString()}원
                          </div>
                        </div>
                        <button
                          onClick={() => handlePropertyDetail(property)}
                          className="btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                        >
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pb-6">
                <button
                  onClick={goHome}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  홈으로 가기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메인 홈화면 */}
        {appState === "main" && (
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
                    onClick={() => setAppState("koreaMap")}
                    className="p-3 text-slate-700 hover:text-emerald-600 transition-colors rounded-xl hover:bg-emerald-50"
                    title="탐험 지도"
                  >
                    <Map className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setAppState("myPage")}
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
              <PopularPostsSlider 
                onPostClick={handlePostClick}
              />

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
                  <button
                    onClick={startMatching}
                    className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 smooth-hover relative overflow-hidden"
                  >
                    <span className="relative z-10">추천받기</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setUserPreferences({});
                      setAppState("questionnaire");
                    }}
                    className="mt-3 btn-secondary w-full py-4 text-lg font-medium smooth-hover"
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
                      onClick={() => setAppState("results")}
                      className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                      전체보기
                    </button>
                  </div>
                  <div className="space-y-3">
                    {likedProperties.slice(0, 2).map((property) => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertyDetail(property)}
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
                    onClick={() => setAppState("aiConsultation")}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-2xl hover:from-blue-100 hover:to-emerald-100 gentle-scale"
                  >
                    <Bot className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm text-slate-700 font-bold">
                      AI 상담
                    </span>
                  </button>
                  <button
                    onClick={() => setAppState("guestbook")}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:from-purple-100 hover:to-pink-100 gentle-scale"
                  >
                    <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="text-sm text-slate-700 font-bold">방명록</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => setAppState("community")}
                    className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-100/50 gentle-scale border border-emerald-100/50"
                  >
                    <Users className="w-6 h-6 text-emerald-600 mb-2" />
                    <span className="text-sm text-slate-700 font-bold">커뮤니티</span>
                  </button>
                  <button
                    onClick={() => setAppState("stories")}
                    className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-2xl hover:bg-emerald-100/50 gentle-scale border border-emerald-100/50"
                  >
                    <BookOpen className="w-6 h-6 text-emerald-600 mb-2" />
                    <span className="text-sm text-slate-700 font-bold">이주 스토리</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setAppState("guide")}
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
                  onClick={() => setAppState("main")}
                  className="flex flex-col items-center py-3 px-2 text-emerald-600"
                >
                  <HomeIcon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">홈</span>
                </button>
                <button 
                  onClick={startMatching}
                  className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <Heart className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">매칭</span>
                </button>
                <button 
                  onClick={() => setAppState("guestbook")}
                  className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-purple-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">방명록</span>
                </button>
                <button 
                  onClick={() => setAppState("community")}
                  className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">커뮤니티</span>
                </button>
                <button 
                  onClick={() => setAppState("myPage")}
                  className="flex flex-col items-center py-3 px-2 text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">마이</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 화면 */}
        {appState === "login" && (
          <LoginForm
            onLogin={handleLogin}
            onBack={() => setAppState("welcome")}
            onGoToSignup={() => setAppState("userInfo")}
          />
        )}

        {/* 사용자 정보 입력 화면 */}
        {appState === "userInfo" && (
          <UserInfoForm
            onSubmit={handleUserInfoSubmit}
            onBack={() => setAppState("welcome")}
          />
        )}

        {/* 질문 화면 */}
        {appState === "questionnaire" && (
          <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
            <QuestionCard
              question={personalityQuestions[currentQuestionIndex]}
              onAnswer={handleQuestionAnswer}
              currentQuestion={currentQuestionIndex}
              totalQuestions={personalityQuestions.length}
            />
          </div>
        )}

        {/* 분석 중 화면 */}
        {appState === "analyzing" && (
          <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 flex flex-col justify-center px-6 py-12">
            <div className="w-full max-w-sm mx-auto text-center">
              {/* 개선된 로딩 */}
              <div className="mb-12">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-emerald-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-2 border-emerald-100 rounded-full"></div>
                  <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  AI가 취향을 분석하고 있어요!
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-slate-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '1.4s'}}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s', animationDuration: '1.4s'}}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.4s', animationDuration: '1.4s'}}></div>
                  </div>
                  <p className="text-slate-600 font-medium">당신에게 맞는 집을 찾고 있어요</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50">
                  <div className="text-sm text-slate-600 space-y-2">
                    <p>🏡 거주 스타일 분석 완료</p>
                    <p>👥 사회적 성향 분석 완료</p>
                    <p>💼 업무 환경 분석 중...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 매칭 화면 */}
        {appState === "matching" && (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 flex flex-col px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                추천 장소
              </h2>
              <p className="text-slate-600 font-medium">
                마음에 드시면 ♥️, 아니면 ✕ 해주세요
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <SwipeStack
                properties={recommendations}
                stories={villageStories}
                onSwipe={handleSwipe}
                onComplete={handleMatchingComplete}
              />
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {appState === "results" && (
          <div className="min-h-screen bg-emerald-50/30">
            <div className="px-6 pb-6">
                             {/* 헤더 */}
               <div className="flex items-center py-6 mb-6">
                 <button
                   onClick={goHome}
                   className="back-button"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>홈으로</span>
                 </button>
               </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                매칭 결과
              </h2>

              {likedProperties.length > 0 ? (
                <div className="space-y-6 mb-8">
                  <div className="text-center bg-emerald-100/50 rounded-2xl p-4">
                    <p className="text-slate-700 font-semibold">
                      관심 표시한 곳 {likedProperties.length}개
                    </p>
                  </div>

                  {likedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="card p-6"
                    >
                      <h4 className="font-bold text-slate-900 mb-2 text-lg">
                        {property.title}
                      </h4>
                      <div className="flex items-center text-slate-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          {property.location.district}, {property.location.city}
                        </span>
                      </div>
                      <div className="text-emerald-600 font-bold mb-4 text-lg">
                        {property.matchScore}% 매칭 · 월{" "}
                        {property.price.rent?.toLocaleString()}원
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handlePropertyDetail(property)}
                          className="btn-secondary flex-1 flex items-center justify-center space-x-2 py-3"
                        >
                          <Eye className="w-4 h-4" />
                          <span>상세보기</span>
                        </button>
                        <button
                          onClick={() => handleContact(property)}
                          className="btn-primary flex-1 flex items-center justify-center space-x-2 py-3"
                        >
                          <Phone className="w-4 h-4" />
                          <span>연락하기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white rounded-3xl p-8 mx-4">
                  <div className="text-4xl mb-4">🤔</div>
                  <p className="text-slate-700 font-medium mb-2">아직 마음에 드는 곳을 찾지 못하셨네요</p>
                  <p className="text-sm mb-4">다시 한번 시도해보시겠어요?</p>
                  <button
                    onClick={startMatching}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    다시 매칭하기
                  </button>
                </div>
              )}

              <div className="space-y-3 pb-8">
                <button
                  onClick={goHome}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  홈으로 가기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 상세보기 페이지 */}
        {appState === "propertyDetail" && selectedProperty && (
          <div className="min-h-screen bg-emerald-50/30">
            <div className="px-6 pb-8">
                             <div className="flex items-center py-6 mb-6">
                 <button
                   onClick={() => setAppState("results")}
                   className="back-button"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>돌아가기</span>
                 </button>
               </div>

              <div className="space-y-6 mb-8">
                <div className="card p-6">
                  <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    {selectedProperty.title}
                  </h1>
                  <div className="flex items-center text-slate-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {selectedProperty.location.district},{" "}
                      {selectedProperty.location.city}
                    </span>
                  </div>

                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    월 {selectedProperty.price.rent?.toLocaleString()}원
                  </div>
                  {selectedProperty.price.deposit && (
                    <div className="text-slate-600 font-medium">
                      보증금{" "}
                      {(selectedProperty.price.deposit / 10000).toFixed(0)}
                      만원
                    </div>
                  )}
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">기본 정보</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">방/평수:</span>
                      <span className="text-slate-900 font-semibold">
                        {selectedProperty.details.rooms}룸 ·{" "}
                        {selectedProperty.details.size}평
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">유형:</span>
                      <span className="text-slate-900 font-semibold">
                        {selectedProperty.details.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">상태:</span>
                      <span className="text-slate-900 font-semibold">
                        {selectedProperty.details.condition}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">특징</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProperty.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-emerald-100 rounded-full text-sm text-emerald-700 font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-8">
                <button
                  onClick={() => handleContact(selectedProperty)}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
                >
                  <Phone className="w-5 h-5" />
                  <span>연락하기</span>
                </button>
                <button
                  onClick={goHome}
                  className="btn-secondary w-full flex items-center justify-center space-x-2 py-4"
                >
                  <HomeIcon className="w-5 h-5" />
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
                   className="back-button"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>돌아가기</span>
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
                        <span className="text-gray-900">
                          오전 9시 - 오후 6시
                        </span>
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
          <Community 
            onBack={goHome} 
            currentUser={currentUser}
          />
        )}

                 {/* 이주 스토리 페이지 */}
         {appState === "stories" && (
           <div className="min-h-screen bg-gray-50">
             <div className="px-4 pb-8">
               <div className="flex items-center py-4 mb-4">
                 <button
                   onClick={goHome}
                   className="back-button"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>홈으로</span>
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
                    내려왔어요. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일
                    아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐네요."
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
                    카페를 열었는데 관광객들과 현지분들이 모두 따뜻하게
                    맞아주셔서 매일이 감사해요."
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
                   className="back-button"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>홈으로</span>
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
         {appState === "myPage" && <MyPage onBack={goHome} currentUser={currentUser} onLogout={handleLogout} />}

        {/* 한국 지도 */}
        {appState === "koreaMap" && <KakaoKoreaMap onBack={goHome} />}
        
        {/* 방명록 */}
        {appState === "guestbook" && (
          <GuestbookEnhanced 
            onBack={goHome} 
            currentUser={currentUser}
          />
        )}

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
