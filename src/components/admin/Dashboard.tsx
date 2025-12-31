'use client';

import { useEffect, useState } from 'react';
import { AdminModule } from '@/app/admin/page';

interface DashboardProps {
  userId: number;
  onNavigate: (module: AdminModule) => void;
}

interface Stats {
  classes: {
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    total: number;
  };
  instructors: number;
  enrollments: number;
  revenue: number;
  users: {
    total: number;
    user: number;
    instructor: number;
  };
  properties: {
    active: number;
    inactive: number;
    sold: number;
    total: number;
  };
  community: {
    guestbooks: number;
    comments: number;
  };
}

export function Dashboard({ userId, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?userId=${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '통계를 불러오는데 실패했습니다.');
      }

      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '통계 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 p-4 text-red-200">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-100">관리자 대시보드</h1>
        <p className="text-sm text-gray-400 mt-1">빈집다방 플랫폼 종합 현황</p>
      </div>

      {/* 회원 통계 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">회원 현황</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('users')}
              className="border border-gray-600 p-4 cursor-pointer hover:bg-gray-750"
            >
              <p className="text-xs text-gray-400 mb-1">전체 회원</p>
              <p className="text-2xl font-bold text-gray-100">{stats.users.total}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">일반 회원</p>
              <p className="text-2xl font-bold text-gray-100">{stats.users.user}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">강사 회원</p>
              <p className="text-2xl font-bold text-gray-100">{stats.users.instructor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 클래스 통계 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">원데이 클래스 현황</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              onClick={() => onNavigate('classes')}
              className="border border-gray-600 p-4 cursor-pointer hover:bg-gray-750"
            >
              <p className="text-xs text-gray-400 mb-1">전체</p>
              <p className="text-2xl font-bold text-gray-100">{stats.classes.total}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">승인 대기</p>
              <p className="text-2xl font-bold text-gray-100">{stats.classes.pending}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">승인됨</p>
              <p className="text-2xl font-bold text-gray-100">{stats.classes.approved}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">활성</p>
              <p className="text-2xl font-bold text-gray-100">{stats.classes.active}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">거부됨</p>
              <p className="text-2xl font-bold text-gray-100">{stats.classes.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빈집 매물 통계 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">빈집 매물 현황</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('properties')}
              className="border border-gray-600 p-4 cursor-pointer hover:bg-gray-750"
            >
              <p className="text-xs text-gray-400 mb-1">전체</p>
              <p className="text-2xl font-bold text-gray-100">{stats.properties.total}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">활성</p>
              <p className="text-2xl font-bold text-gray-100">{stats.properties.active}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">비활성</p>
              <p className="text-2xl font-bold text-gray-100">{stats.properties.inactive}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">거래완료</p>
              <p className="text-2xl font-bold text-gray-100">{stats.properties.sold}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 수강 및 수익 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">수강 및 수익</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">총 수강생</p>
              <p className="text-2xl font-bold text-gray-100">{stats.enrollments.toLocaleString()}명</p>
            </div>
            <div
              onClick={() => onNavigate('coins')}
              className="border border-gray-600 p-4 cursor-pointer hover:bg-gray-750"
            >
              <p className="text-xs text-gray-400 mb-1">총 수익</p>
              <p className="text-2xl font-bold text-gray-100">
                {stats.revenue >= 10000
                  ? `${(stats.revenue / 10000).toFixed(1)}억원`
                  : `${stats.revenue.toLocaleString()}만원`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 커뮤니티 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">커뮤니티</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate('community')}
              className="border border-gray-600 p-4 cursor-pointer hover:bg-gray-750"
            >
              <p className="text-xs text-gray-400 mb-1">전체 게시글</p>
              <p className="text-2xl font-bold text-gray-100">{stats.community.guestbooks}</p>
            </div>
            <div className="border border-gray-600 p-4">
              <p className="text-xs text-gray-400 mb-1">전체 댓글</p>
              <p className="text-2xl font-bold text-gray-100">{stats.community.comments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-gray-800 border border-gray-700">
        <div className="border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-100">빠른 작업</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('users')}
              className="px-4 py-3 border border-gray-600 hover:bg-gray-750 text-left"
            >
              <p className="font-semibold text-gray-100">회원 관리</p>
              <p className="text-xs text-gray-400 mt-1">{stats.users.total}명</p>
            </button>
            <button
              onClick={() => onNavigate('classes')}
              className="px-4 py-3 border border-gray-600 hover:bg-gray-750 text-left"
            >
              <p className="font-semibold text-gray-100">클래스 승인</p>
              <p className="text-xs text-gray-400 mt-1">{stats.classes.pending}개 대기</p>
            </button>
            <button
              onClick={() => onNavigate('properties')}
              className="px-4 py-3 border border-gray-600 hover:bg-gray-750 text-left"
            >
              <p className="font-semibold text-gray-100">매물 관리</p>
              <p className="text-xs text-gray-400 mt-1">{stats.properties.total}개</p>
            </button>
            <button
              onClick={() => onNavigate('community')}
              className="px-4 py-3 border border-gray-600 hover:bg-gray-750 text-left"
            >
              <p className="font-semibold text-gray-100">커뮤니티 관리</p>
              <p className="text-xs text-gray-400 mt-1">{stats.community.guestbooks}개 게시글</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
