'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Star, Trophy, Target, Heart,
  Map as MapIcon, LogOut, PenTool, CheckCircle,
  ChevronRight, Settings, Bell, ChevronDown, ArrowLeft, X, Coins
} from 'lucide-react';
import { dummyUser } from '@/data/userData';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import {
  preferenceCategoryLabels,
  preferenceCategoryIcons,
  getPreferenceLabel
} from '@/lib/preferenceLabels';

interface MyPageProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
  onLogout?: () => void;
  onNavigateToResults?: () => void;
}

interface UserProfile {
  id: number;
  nickname: string;
  name: string;
  occupation: string;
  currentLocation: string;
  explorerLevel: number;
  joinDate: string;
  daysSinceJoin: number;
  totalLikes: number;
  totalPosts: number;
  riskyRegionsHelped: number;
  preferences: any;
  badges: any[];
}

type TabType = 'missions' | 'regions' | 'badges' | null;

export default function MyPage({ onBack, currentUser, onLogout, onNavigateToResults }: MyPageProps) {
  // AppContext에서 실제 찜한 매물 가져오기
  const { likedProperties, userPreferences } = useApp();
  const router = useRouter();

  // 기본적으로 '미션' 탭을 열어둠
  const [activeTab, setActiveTab] = useState<TabType>('missions');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  // 데이터 로드 (기존 로직 유지)
  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.id);
    } else {
      setUserProfile({
        id: 0,
        nickname: '게스트',
        name: '게스트',
        occupation: '예비 시골 러버',
        currentLocation: '미설정',
        explorerLevel: 1,
        joinDate: new Date().toISOString(),
        daysSinceJoin: 1,
        totalLikes: 0,
        totalPosts: 0,
        riskyRegionsHelped: 0,
        preferences: null,
        badges: []
      });
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserData = async (userId: number) => {
    try {
      setLoading(true);
      const [badgesResponse, statsResponse] = await Promise.all([
        fetch(`/api/badges?userId=${userId}&action=all`),
        fetch(`/api/badges?userId=${userId}&action=stats`)
      ]);
      
      const badgesData = await badgesResponse.json();
      const statsData = await statsResponse.json();
      
      if (badgesData.success && statsData.success) {
        setUserBadges(badgesData.data.userBadges || []);
        setAllBadges(badgesData.data.badges || []);
        setUserStats(statsData.data);

        console.log('📊 Stats Data:', statsData.data);
        console.log('찜한 시골집 (API):', statsData.data.propertyLikedCount);
        console.log('찜한 시골집 (Context):', likedProperties.length);
        console.log('작성한 방명록:', statsData.data.guestbookCount);
        console.log('User ID:', userId);

        // API 데이터 우선 사용, 없으면 Context fallback
        const actualLikesCount = statsData.data.propertyLikedCount || likedProperties.length;

        // 실제 가입일 사용
        const joinDate = new Date(statsData.data.userCreatedAt);
        const today = new Date();
        const daysSinceJoin = Math.max(1, Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));

        setUserProfile({
          id: userId,
          nickname: currentUser?.nickname || '',
          name: currentUser?.nickname || '사용자',
          occupation: '시골 생활 탐험가',
          currentLocation: '대한민국',
          explorerLevel: Math.floor(actualLikesCount / 10) + 1,
          joinDate: joinDate.toISOString(),
          daysSinceJoin: daysSinceJoin,
          totalLikes: actualLikesCount,
          totalPosts: statsData.data.guestbookCount,
          riskyRegionsHelped: 0,
          preferences: null,
          badges: badgesData.data.userBadges || []
        });
        setError(null);
      } else {
        setError('데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab: TabType) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const getRiskColor = (risk: 'high' | 'medium' | 'low') => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'low': return 'text-green-600 bg-green-50 border-green-100';
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'living': return '🏡';
      case 'work': return '💼';
      case 'travel': return '✈️';
      case 'visit': return '👀';
      default: return '📍';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPreferences');
    if (onLogout) onLogout();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'} />
    ));
  };

  const getConditionDescription = (conditionType: string, conditionValue: number) => {
    switch (conditionType) {
      case 'visit_count':
        return `빈집다방에 ${conditionValue}번 방문하기`;
      case 'property_liked':
        return `${conditionValue}개 이상의 집을 관심목록에 추가하기`;
      case 'guestbook_count':
        return `${conditionValue}개 이상의 방명록 작성하기`;
      case 'likes_received':
        return `작성한 글에서 좋아요 ${conditionValue}개 이상 받기`;
      case 'likes_given':
        return `다른 사람의 글에 좋아요 ${conditionValue}개 이상 누르기`;
      default:
        return '조건을 달성하면 획득할 수 있습니다';
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-white flex items-center justify-center text-sm text-stone-500">{error}</div>;
  if (!userProfile) return null;

  const user = {
    profile: userProfile,
    visitedRegions: dummyUser.visitedRegions,
    badges: userProfile.badges.length > 0 ? userProfile.badges : dummyUser.badges
  };

  const nextLevelTarget = 100; 
  const currentExp = (user.profile.totalLikes * 5 + user.profile.totalPosts * 10) % nextLevelTarget;
  const progressPercent = (currentExp / nextLevelTarget) * 100;

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <button className="text-stone-400 hover:text-stone-800 transition-colors"><Bell className="w-6 h-6" /></button>
             <button className="text-stone-400 hover:text-stone-800 transition-colors"><Settings className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          
          {/* 1. Profile Section */}
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
                     <img src="/logo.png" alt="프로필" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {user.profile.name}님
                  </h2>
               </div>
               <button className="bg-stone-100 text-stone-500 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors">
                 LV.{user.profile.explorerLevel} 탐험가
               </button>
            </div>

            <div className="mt-6 mb-2">
               <p className="text-stone-500 text-sm mb-1">다음 레벨까지</p>
               <p className="text-xl font-bold text-orange-600">
                 {nextLevelTarget - currentExp}P <span className="text-stone-800 font-medium text-base">남음</span>
               </p>
            </div>

            <div className="relative w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-6">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
               />
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 flex items-center justify-around text-center border border-stone-100">
               <div className="flex-1">
                  <p className="text-xs text-stone-500 mb-1 font-medium">찜한 시골집</p>
                  <p className="text-lg font-bold text-stone-800">{user.profile.totalLikes}채</p>
               </div>
               <div className="w-px h-8 bg-stone-200"></div>
               <div className="flex-1">
                  <p className="text-xs text-stone-500 mb-1 font-medium">작성한 방명록</p>
                  <p className="text-lg font-bold text-stone-800">{user.profile.totalPosts}개</p>
               </div>
            </div>
          </div>

          {/* 2. Quick Menu */}
          <div className="px-6 mb-4">
             <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { label: '내정보', icon: User, isLogout: false, action: () => setShowUserInfoModal(true) },
                  { label: '찜목록', icon: Heart, isLogout: false, action: onNavigateToResults },
                  { label: '내활동', icon: PenTool, isLogout: false, action: () => router.push('/community?tab=myActivity') },
                  { label: '코인', icon: Coins, isLogout: false, action: () => router.push('/coin') },
                  { label: '로그아웃', icon: LogOut, action: handleLogout, isLogout: true }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action ? item.action : undefined}
                    className="flex flex-col items-center gap-2 p-2 hover:bg-stone-50 rounded-xl transition-colors group"
                  >
                     <item.icon className={`w-6 h-6 ${item.isLogout ? 'text-red-400 group-hover:text-red-500' : 'text-stone-400 group-hover:text-stone-800'} transition-colors stroke-[1.5]`} />
                     <span className="text-xs text-stone-500 font-medium group-hover:text-stone-800">{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Separator */}
          <div className="h-2 bg-stone-50 w-full mb-6 border-t border-stone-100"></div>

          {/* 3. Accordion Sections */}
          <div className="px-6 space-y-6">
            
            {/* A. 진행 중인 미션 (부활!) */}
            <div>
               <button 
                 className="w-full flex items-center justify-between mb-4 py-2" 
                 onClick={() => toggleTab('missions')}
               >
                  <h3 className="text-lg font-bold text-stone-900">진행 중인 미션</h3>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${activeTab === 'missions' ? 'rotate-180' : ''}`} />
               </button>
               
               <AnimatePresence>
               {activeTab === 'missions' && (
                 <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                 >
                   <div className="space-y-4 pb-4">
                      {[
                        { label: "관심목록 10개 수집", current: user.profile.totalLikes, max: 10, icon: Heart, color: "text-orange-500" },
                        { label: "방명록 5개 작성", current: user.profile.totalPosts, max: 5, icon: PenTool, color: "text-blue-500" },
                        ...(userStats ? [
                          { label: "좋아요 10개 받기", current: userStats.totalLikesReceived, max: 10, icon: Trophy, color: "text-yellow-500" },
                          { label: "좋아요 20개 누르기", current: userStats.likesGiven, max: 20, icon: Target, color: "text-stone-600" }
                        ] : [])
                      ].map((mission, idx) => (
                        <div key={idx} className="bg-white border border-stone-100 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                 <mission.icon className={`w-4 h-4 ${mission.color}`} />
                                 <span className="text-sm font-bold text-stone-700">{mission.label}</span>
                              </div>
                              <span className="text-xs text-stone-400 font-medium">{mission.current}/{mission.max}</span>
                           </div>
                           <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-stone-800 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (mission.current / mission.max) * 100)}%` }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                 </motion.div>
               )}
               </AnimatePresence>
            </div>

            {/* B. 방문 내역 - 임시로 숨김 (추후 구현 예정) */}
            {false && (
            <div className="border-t border-stone-100 pt-4">
               <button
                 className="w-full flex items-center justify-between mb-4 py-2"
                 onClick={() => toggleTab('regions')}
               >
                  <h3 className="text-lg font-bold text-stone-900">방문 내역</h3>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${activeTab === 'regions' ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
               {activeTab === 'regions' && (
                 <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                 >
                   <div className="space-y-3 pb-4">
                     {user.visitedRegions.length > 0 ? user.visitedRegions.map((region) => (
                        <div key={region.id} className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
                           <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                 <span className="text-base">{getPurposeIcon(region.purpose)}</span>
                                 <span className="font-bold text-stone-800 text-sm">{region.name}</span>
                              </div>
                              <p className="text-xs text-stone-400 ml-7">
                                {region.visitDate instanceof Date
                                  ? region.visitDate.toISOString().split('T')[0]
                                  : new Date(region.visitDate).toISOString().split('T')[0]}
                              </p>
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskColor(region.populationRisk)}`}>
                             {region.populationRisk === 'high' ? '위험' : '보통'}
                           </span>
                        </div>
                     )) : (
                        <p className="text-sm text-stone-400 py-4 text-center bg-stone-50 rounded-xl">아직 방문 기록이 없어요.</p>
                     )}
                   </div>
                 </motion.div>
               )}
               </AnimatePresence>
            </div>
            )}

            {/* C. 배지 컬렉션 (획득 & 미획득 부활!) */}
            <div className="border-t border-stone-100 pt-4">
               <button 
                 className="w-full flex items-center justify-between mb-4 py-2" 
                 onClick={() => toggleTab('badges')}
               >
                  <h3 className="text-lg font-bold text-stone-900">배지 컬렉션</h3>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${activeTab === 'badges' ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
               {activeTab === 'badges' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-6 pb-4">
                        {/* 1. 획득한 배지 */}
                        <div>
                           <span className="text-xs font-bold text-stone-400 mb-3 block px-1">MY BADGES</span>
                           {userBadges.length > 0 ? (
                             <div className="grid grid-cols-4 gap-3">
                                {userBadges.map((badge) => (
                                  <button
                                    key={badge.id}
                                    onClick={() => setSelectedBadge(badge)}
                                    className="aspect-square bg-white rounded-2xl border border-orange-100 flex flex-col items-center justify-center p-1 text-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                  >
                                     <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-bl-lg flex items-center justify-center">
                                        <CheckCircle className="w-2 h-2 text-white" />
                                     </div>
                                     <div className="text-2xl mb-1">{badge.icon}</div>
                                     <span className="text-[10px] font-bold text-stone-700 truncate w-full px-1">{badge.name}</span>
                                  </button>
                                ))}
                             </div>
                           ) : (
                             <div className="text-center py-4 text-stone-400 text-xs bg-stone-50 rounded-xl">아직 획득한 배지가 없습니다.</div>
                           )}
                        </div>

                        {/* 2. 도전 과제 (미획득 배지) */}
                        <div>
                           <span className="text-xs font-bold text-stone-400 mb-3 block px-1">CHALLENGES</span>
                           <div className="grid grid-cols-4 gap-3">
                              {allBadges.filter(b => !b.earned).map((badge) => (
                                <button
                                  key={badge.id}
                                  onClick={() => setSelectedBadge(badge)}
                                  className="aspect-square bg-stone-50 rounded-2xl border border-stone-100 flex flex-col items-center justify-center p-1 text-center opacity-70 hover:opacity-90 transition-opacity"
                                >
                                   <div className="text-2xl mb-1 grayscale opacity-50">{badge.icon}</div>
                                   <span className="text-[10px] font-medium text-stone-400 truncate w-full px-1">{badge.name}</span>
                                </button>
                              ))}
                           </div>
                        </div>
                    </div>
                  </motion.div>
               )}
               </AnimatePresence>
            </div>

          </div>

        </div>

        {/* 뱃지 상세 정보 모달 */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* 뱃지 아이콘 */}
                  <div className={`text-6xl mb-4 ${selectedBadge.earned ? '' : 'grayscale opacity-50'}`}>
                    {selectedBadge.icon}
                  </div>

                  {/* 뱃지 이름 */}
                  <h3 className="text-xl font-bold text-stone-900 mb-2">
                    {selectedBadge.name}
                  </h3>

                  {/* 획득 상태 */}
                  {selectedBadge.earned ? (
                    <div className="flex items-center gap-1 mb-4 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>획득 완료</span>
                    </div>
                  ) : (
                    <div className="mb-4 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-xs font-bold">
                      미획득
                    </div>
                  )}

                  {/* 뱃지 설명 */}
                  <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                    {selectedBadge.description}
                  </p>

                  {/* 획득 조건 */}
                  <div className="w-full bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <p className="text-xs text-stone-400 mb-1 font-bold">획득 조건</p>
                    <p className="text-sm text-stone-700 font-medium">
                      {getConditionDescription(selectedBadge.conditionType, selectedBadge.conditionValue)}
                    </p>
                  </div>

                  {/* 카테고리 */}
                  <div className="mt-4 text-xs text-stone-400">
                    카테고리: <span className="font-bold text-stone-600">
                      {selectedBadge.category === 'explorer' && '탐험가'}
                      {selectedBadge.category === 'social' && '소셜'}
                      {selectedBadge.category === 'contributor' && '기여자'}
                      {selectedBadge.category === 'achiever' && '달성자'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 사용자 정보 모달 */}
        <AnimatePresence>
          {showUserInfoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUserInfoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                {/* 닫기 버튼 */}
                <button
                  onClick={() => setShowUserInfoModal(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* 프로필 아이콘 */}
                  <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-stone-600" />
                  </div>

                  {/* 제목 */}
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">
                    내 프로필 정보
                  </h3>

                  {/* 기본 정보 카드 */}
                  <div className="w-full bg-stone-50 rounded-xl p-4 mb-4 border border-stone-100">
                    <p className="text-xs text-stone-400 mb-3 font-bold text-left">기본 정보</p>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">닉네임</span>
                        <span className="text-sm font-bold text-stone-800">{userProfile?.nickname}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">레벨</span>
                        <span className="text-sm font-bold text-stone-800">LV.{userProfile?.explorerLevel} 탐험가</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">가입일</span>
                        <span className="text-sm font-bold text-stone-800">
                          {userProfile && new Date(userProfile.joinDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">활동</span>
                        <span className="text-sm font-bold text-stone-800">{userProfile?.daysSinceJoin}일째</span>
                      </div>
                    </div>
                  </div>

                  {/* 라이프스타일 카드 */}
                  {userPreferences && Object.keys(userPreferences).length > 0 ? (
                    <div className="w-full bg-stone-50 rounded-xl p-4 border border-stone-100 mb-4">
                      <p className="text-xs text-stone-400 mb-3 font-bold text-left">라이프스타일</p>
                      <div className="space-y-3">
                        {Object.entries(preferenceCategoryLabels).map(([key, label]) => {
                          const Icon = preferenceCategoryIcons[key];
                          const value = userPreferences[key as keyof typeof userPreferences];

                          if (!value) return null;

                          return (
                            <div key={key} className="text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-4 h-4 text-stone-600" />
                                <span className="text-xs text-stone-500 font-medium">{label}</span>
                              </div>
                              <p className="text-sm text-stone-800 font-medium ml-6">
                                {getPreferenceLabel(key, value)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-stone-50 rounded-xl p-6 border border-stone-100 text-center mb-4">
                      <p className="text-sm text-stone-500 mb-2">아직 설문조사를 진행하지 않았습니다</p>
                      <p className="text-xs text-stone-400">설문조사를 통해 나에게 맞는 시골집을 찾아보세요</p>
                    </div>
                  )}

                  {/* 설문조사 다시하기 버튼 */}
                  <button
                    onClick={() => {
                      setShowUserInfoModal(false);
                      router.push('/questionnaire');
                    }}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    <span>설문조사 다시하기</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {userPreferences && Object.keys(userPreferences).length > 0 && (
                    <p className="text-xs text-stone-400 mt-2">
                      새로운 추천을 받으려면 설문을 다시 진행하세요
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}