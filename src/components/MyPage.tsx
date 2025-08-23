'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Star, 
  Calendar, 
  Trophy, 
  Target, 
  Heart,
  Shield,
  Map as MapIcon,
  Award,
  Clock,
  Users,
  Loader
} from 'lucide-react';
import { dummyUser } from '@/data/userData';
import { VisitedRegion } from '@/types';

interface MyPageProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
  onLogout?: () => void;
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

export default function MyPage({ onBack, currentUser, onLogout }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'regions' | 'badges'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // 실제 사용자 데이터 로드
  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.id);
    } else {
      // 로그인하지 않은 경우 더미 데이터 사용
      setUserProfile({
        id: 0,
        nickname: '게스트',
        name: '게스트 사용자',
        occupation: '시골 생활 탐험가',
        currentLocation: '서울특별시',
        explorerLevel: 1,
        joinDate: new Date().toISOString(),
        daysSinceJoin: 0,
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
      
      // 사용자 통계 및 뱃지 정보 병렬 로드
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
        
        // 사용자 프로필 생성
        const joinDate = new Date();
        joinDate.setDate(joinDate.getDate() - (statsData.data.guestbookCount * 7)); // 임시 로직
        
        setUserProfile({
          id: userId,
          nickname: currentUser?.nickname || '',
          name: currentUser?.nickname || '사용자',
          occupation: '시골 생활 탐험가',
          currentLocation: '대한민국',
          explorerLevel: Math.floor(statsData.data.propertyLiked / 10) + 1,
          joinDate: joinDate.toISOString(),
          daysSinceJoin: Math.max(1, statsData.data.guestbookCount * 7),
          totalLikes: statsData.data.propertyLiked,
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
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => currentUser && fetchUserData(currentUser.id)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">프로필 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 더미 데이터를 실제 데이터와 호환되도록 처리
  const user = {
    profile: {
      name: userProfile.name,
      occupation: userProfile.occupation,
      currentLocation: userProfile.currentLocation,
      explorerLevel: userProfile.explorerLevel,
      riskyRegionsHelped: userProfile.riskyRegionsHelped,
      joinDate: userProfile.joinDate,
      totalLikes: userProfile.totalLikes,
      totalPosts: userProfile.totalPosts
    },
    visitedRegions: dummyUser.visitedRegions, // 임시로 더미 데이터 사용
    badges: userProfile.badges.length > 0 ? userProfile.badges : dummyUser.badges
  };

  const getRiskColor = (risk: 'high' | 'medium' | 'low') => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
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
    // 로컬 스토리지에서 사용자 정보 삭제
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPreferences');
    
    // 로그아웃 콜백 실행
    if (onLogout) {
      onLogout();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            onClick={onBack}
            className="back-button"
          >
            <MapIcon className="w-4 h-4" />
            <span>홈으로</span>
          </button>
          <h1 className="text-lg font-medium text-gray-900">마이페이지</h1>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="back-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>로그아웃</span>
            </button>
          )}
        </div>

        {/* Profile Summary Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.profile.name}</h2>
              <p className="text-emerald-100 text-sm">{user.profile.occupation}</p>
              <p className="text-emerald-100 text-sm">{user.profile.currentLocation}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">LV.{user.profile.explorerLevel}</div>
              <div className="text-xs text-emerald-100">탐험가 레벨</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.profile.totalLikes}</div>
              <div className="text-xs text-emerald-100">관심 표시</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.profile.totalPosts}</div>
              <div className="text-xs text-emerald-100">작성한 글</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { key: 'profile', label: '프로필', icon: User },
            { key: 'regions', label: '방문지역', icon: MapPin },
            { key: 'badges', label: '배지', icon: Trophy }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm transition-colors ${
                activeTab === key
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">활동 통계</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">가입한 지</span>
                    </div>
                    <span className="font-medium text-gray-900">{userProfile?.daysSinceJoin || 0}일</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-700 text-sm">관심 표시한 집</span>
                    </div>
                    <span className="font-medium text-emerald-600">{user.profile.totalLikes}채</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 text-sm">방명록 작성</span>
                    </div>
                    <span className="font-medium text-blue-600">{user.profile.totalPosts}개</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">미션 현황</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">관심목록 10개 수집</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (user.profile.totalLikes / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {user.profile.totalLikes}/10
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">방명록 5개 작성</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (user.profile.totalPosts / 5) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {user.profile.totalPosts}/5
                      </span>
                    </div>
                  </div>
                  {userStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm">좋아요 10개 받기</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (userStats.likesReceived / 10) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {userStats.likesReceived}/10
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm">좋아요 20개 누르기</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (userStats.likesGiven / 20) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {userStats.likesGiven}/20
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Regions Tab */}
          {activeTab === 'regions' && (
            <div className="space-y-4">
              {user.visitedRegions
                .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                .map((region) => (
                <div key={region.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getPurposeIcon(region.purpose)}</span>
                        <h3 className="font-medium text-gray-900">{region.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(region.populationRisk)}`}>
                          {region.populationRisk === 'high' ? '위험' : 
                           region.populationRisk === 'medium' ? '보통' : '안전'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{region.province} {region.city}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{new Date(region.visitDate).toLocaleDateString('ko-KR')}</span>
                        <span>{region.duration}일 체류</span>
                        <div className="flex items-center space-x-0.5">
                          {renderStars(region.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {region.memo && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 mt-2">
                      {region.memo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              {/* 획득한 뱃지 */}
              {userBadges.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>획득한 뱃지 ({userBadges.length}개)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {userBadges.map((badge) => (
                      <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm text-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{badge.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                        <p className="text-xs text-yellow-600 font-medium">
                          {new Date(badge.earned_at).toLocaleDateString('ko-KR')} 획득
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 미획득 뱃지 */}
              {allBadges.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-gray-500" />
                    <span>도전 가능한 뱃지</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {allBadges
                      .filter(badge => !badge.earned)
                      .map((badge) => (
                        <div key={badge.id} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <div className="text-3xl mb-2 opacity-50">{badge.icon}</div>
                          <h4 className="font-medium text-gray-500 text-sm mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>
                              {badge.condition_type === 'guestbook_count' && `방명록 ${badge.condition_value}개 작성`}
                              {badge.condition_type === 'likes_received' && `좋아요 ${badge.condition_value}개 받기`}
                              {badge.condition_type === 'likes_given' && `좋아요 ${badge.condition_value}개 누르기`}
                              {badge.condition_type === 'property_liked' && `관심목록 ${badge.condition_value}개 추가`}
                              {badge.condition_type === 'visit_count' && '첫 방문 완료'}
                            </p>
                            {userStats && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                <div 
                                  className="bg-emerald-500 h-1 rounded-full"
                                  style={{ 
                                    width: `${Math.min(100, 
                                      badge.condition_type === 'guestbook_count' ? (userStats.guestbookCount / badge.condition_value) * 100 :
                                      badge.condition_type === 'likes_received' ? (userStats.likesReceived / badge.condition_value) * 100 :
                                      badge.condition_type === 'likes_given' ? (userStats.likesGiven / badge.condition_value) * 100 :
                                      badge.condition_type === 'property_liked' ? (userStats.propertyLiked / badge.condition_value) * 100 :
                                      100
                                    )}%` 
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 뱃지가 없는 경우 */}
              {userBadges.length === 0 && allBadges.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">아직 뱃지가 없습니다</p>
                  <p className="text-gray-500 text-sm mt-2">활동을 통해 뱃지를 획득해보세요!</p>
                </div>
              )}
            </div>
          )}
        </motion.div>


      </div>
    </div>
  );
}