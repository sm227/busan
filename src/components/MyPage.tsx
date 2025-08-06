'use client';

import { useState } from 'react';
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
  Users
} from 'lucide-react';
import { dummyUser } from '@/data/userData';
import { VisitedRegion } from '@/types';

interface MyPageProps {
  onBack: () => void;
}

export default function MyPage({ onBack }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'regions' | 'badges'>('profile');
  const user = dummyUser;

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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MapIcon className="w-4 h-4" />
            <span className="text-sm">뒤로</span>
          </button>
          <h1 className="text-lg font-medium text-gray-900">마이페이지</h1>
          <div className="w-16" /> {/* 스페이서 */}
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
              <div className="text-2xl font-bold">{user.visitedRegions.length}</div>
              <div className="text-xs text-emerald-100">방문 지역</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.profile.riskyRegionsHelped}</div>
              <div className="text-xs text-emerald-100">위험지역 도움</div>
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
                      <span className="text-gray-700 text-sm">총 방문 일수</span>
                    </div>
                    <span className="font-medium text-gray-900">{user.profile.totalVisitDays}일</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700 text-sm">위험 지역 방문</span>
                    </div>
                    <span className="font-medium text-red-600">
                      {user.visitedRegions.filter(r => r.populationRisk === 'high').length}곳
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-700 text-sm">관심 지역</span>
                    </div>
                    <span className="font-medium text-emerald-600">{user.favorites.length}곳</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">미션 현황</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">위험 지역 5곳 방문</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (user.visitedRegions.filter(r => r.populationRisk === 'high').length / 5) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {user.visitedRegions.filter(r => r.populationRisk === 'high').length}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm">탐험가 레벨 5 달성</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (user.profile.explorerLevel / 5) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{user.profile.explorerLevel}/5</span>
                    </div>
                  </div>
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
            <div className="grid grid-cols-2 gap-4">
              {user.badges.map((badge) => (
                <div key={badge.id} className="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
              
              {/* 잠긴 배지 예시 */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2 opacity-50">🏆</div>
                <h3 className="font-medium text-gray-500 text-sm mb-1">전국 정복자</h3>
                <p className="text-xs text-gray-400 mb-2">모든 도(道)를 방문하세요</p>
                <p className="text-xs text-gray-400">미달성</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}