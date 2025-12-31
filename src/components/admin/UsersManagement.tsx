'use client';

import { useEffect, useState } from 'react';

interface UsersManagementProps {
  userId: number;
  initialSelectedUserId?: number | null;
  onClearSelection?: () => void;
  onNavigateToInstructorClasses?: (instructorId: number) => void;
  onNavigateToUserProperties?: (ownerId: number) => void;
}

interface UserItem {
  id: number;
  nickname: string;
  role: string;
  coinBalance: number;
  createdAt: string;
  _count: {
    instructorClasses: number;
    classEnrollments: number;
    guestbooks: number;
    comments: number;
    userBadges: number;
    userProperties: number;
  };
}

interface UserDetail {
  id: number;
  nickname: string;
  role: string;
  coinBalance: number;
  createdAt: string;
  surveyResults: any[];
  userBadges: any[];
  instructorClasses: any[];
  classEnrollments: any[];
  guestbooks: any[];
  coinTransactions: any[];
  _count: {
    instructorClasses: number;
    classEnrollments: number;
    guestbooks: number;
    comments: number;
    userBadges: number;
    coinTransactions: number;
    userProperties: number;
  };
}

export function UsersManagement({ userId, initialSelectedUserId, onClearSelection, onNavigateToInstructorClasses, onNavigateToUserProperties }: UsersManagementProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery, sortBy, sortOrder, offset]);

  // 다른 모듈에서 특정 사용자를 선택하여 왔을 때
  useEffect(() => {
    if (initialSelectedUserId) {
      fetchUserDetail(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '회원 목록을 불러오는데 실패했습니다.');
      }

      setUsers(data.data);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // 같은 컬럼 클릭 시 정렬 순서 토글
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // 다른 컬럼 클릭 시 해당 컬럼으로 내림차순 정렬
      setSortBy(column);
      setSortOrder('DESC');
    }
    setOffset(0); // 정렬 변경 시 첫 페이지로
  };

  const getSortIndicator = (column: string) => {
    if (sortBy !== column) return '';
    return sortOrder === 'ASC' ? ' ▲' : ' ▼';
  };

  const fetchUserDetail = async (targetUserId: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/users/${targetUserId}?userId=${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '회원 정보를 불러오는데 실패했습니다.');
      }

      setSelectedUser(data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleChangeRole = async (targetUserId: number, newRole: string) => {
    if (!confirm(`이 회원의 역할을 ${getRoleLabel(newRole)}(으)로 변경하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${targetUserId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '역할 변경에 실패했습니다.');
      }

      alert('역할이 변경되었습니다.');
      fetchUsers();
      if (selectedUser && selectedUser.id === targetUserId) {
        fetchUserDetail(targetUserId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '역할 변경 중 오류가 발생했습니다.');
    }
  };

  const handleGiveCoin = async (targetUserId: number) => {
    const amountStr = prompt('지급할 코인 금액을 입력하세요 (음수 입력 시 차감):');
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount === 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    const reason = prompt('지급/차감 사유를 입력하세요:') || '관리자 지급/차감';

    try {
      const response = await fetch(`/api/admin/users/${targetUserId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinAmount: amount, coinReason: reason }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '코인 지급/차감에 실패했습니다.');
      }

      alert(`코인이 ${amount > 0 ? '지급' : '차감'}되었습니다.`);
      fetchUsers();
      if (selectedUser && selectedUser.id === targetUserId) {
        fetchUserDetail(targetUserId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '코인 처리 중 오류가 발생했습니다.');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-900 text-red-400 border-red-700',
      instructor: 'bg-purple-900 text-purple-400 border-purple-700',
      user: 'bg-blue-900 text-blue-400 border-blue-700',
    };

    const labels: Record<string, string> = {
      admin: '관리자',
      instructor: '강사',
      user: '일반회원',
    };

    return (
      <span className={`px-2 py-1 text-xs border ${styles[role] || ''}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: '관리자',
      instructor: '강사',
      user: '일반회원',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-100">회원 관리</h1>
        <p className="text-gray-400 mt-1">전체 회원 조회 및 관리</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">전체 회원</p>
          <p className="text-2xl font-bold text-gray-100">{total}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">강사</p>
          <p className="text-2xl font-bold text-gray-100">
            {users.filter((u) => u.role === 'instructor').length}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">관리자</p>
          <p className="text-2xl font-bold text-gray-100">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="닉네임 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="">전체 등급</option>
              <option value="admin">관리자</option>
              <option value="instructor">강사</option>
              <option value="user">일반회원</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          총 {total}명의 회원
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-gray-800 border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">회원이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('id')}
                  >
                    ID{getSortIndicator('id')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('nickname')}
                  >
                    닉네임{getSortIndicator('nickname')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('role')}
                  >
                    등급{getSortIndicator('role')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('coinBalance')}
                  >
                    코인{getSortIndicator('coinBalance')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">클래스</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">수강</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">매물</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">게시글</th>
                  <th
                    className="px-4 py-3 text-left text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('createdAt')}
                  >
                    가입일{getSortIndicator('createdAt')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-300">{user.id}</td>
                    <td className="px-4 py-3 text-gray-100">{user.nickname}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {user.coinBalance.toLocaleString()}개
                    </td>
                    <td className="px-4 py-3">
                      {user._count.instructorClasses > 0 && onNavigateToInstructorClasses ? (
                        <button
                          onClick={() => onNavigateToInstructorClasses(user.id)}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {user._count.instructorClasses}
                        </button>
                      ) : (
                        <span className="text-gray-300">{user._count.instructorClasses}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {user._count.classEnrollments}
                    </td>
                    <td className="px-4 py-3">
                      {user._count.userProperties > 0 && onNavigateToUserProperties ? (
                        <button
                          onClick={() => onNavigateToUserProperties(user.id)}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {user._count.userProperties}
                        </button>
                      ) : (
                        <span className="text-gray-300">{user._count.userProperties || 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {user._count.guestbooks}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => fetchUserDetail(user.id)}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="border-t border-gray-700 px-4 py-3 flex items-center justify-between text-sm">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1 text-gray-300 hover:bg-gray-700 border border-gray-600 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-gray-400">
              {offset + 1} - {Math.min(offset + limit, total)} / {total}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1 text-gray-300 hover:bg-gray-700 border border-gray-600 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-100">회원 상세 정보</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h3 className="text-lg font-bold text-gray-100 mb-3">기본 정보</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">닉네임</p>
                    <p className="text-gray-100">{selectedUser.nickname}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">등급</p>
                    <p>{getRoleBadge(selectedUser.role)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">코인 잔액</p>
                    <p className="text-gray-100">{selectedUser.coinBalance.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-gray-400">가입일</p>
                    <p className="text-gray-100">
                      {new Date(selectedUser.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h3 className="text-lg font-bold text-gray-100 mb-3">관리 작업</h3>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChangeRole(selectedUser.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm"
                  >
                    <option value="">역할 변경</option>
                    <option value="user">일반회원</option>
                    <option value="instructor">강사</option>
                    <option value="admin">관리자</option>
                  </select>

                  <button
                    onClick={() => handleGiveCoin(selectedUser.id)}
                    className="px-3 py-2 bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 text-sm"
                  >
                    코인 지급/차감
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h3 className="text-lg font-bold text-gray-100 mb-3">활동 통계</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">등록 클래스</p>
                    {selectedUser._count.instructorClasses > 0 && onNavigateToInstructorClasses ? (
                      <button
                        onClick={() => onNavigateToInstructorClasses(selectedUser.id)}
                        className="text-blue-400 hover:text-blue-300 hover:underline text-lg font-bold"
                      >
                        {selectedUser._count.instructorClasses}
                      </button>
                    ) : (
                      <p className="text-gray-100">{selectedUser._count.instructorClasses}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">수강 클래스</p>
                    <p className="text-gray-100">{selectedUser._count.classEnrollments}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">등록 매물</p>
                    {selectedUser._count.userProperties > 0 && onNavigateToUserProperties ? (
                      <button
                        onClick={() => onNavigateToUserProperties(selectedUser.id)}
                        className="text-blue-400 hover:text-blue-300 hover:underline text-lg font-bold"
                      >
                        {selectedUser._count.userProperties}
                      </button>
                    ) : (
                      <p className="text-gray-100">{selectedUser._count.userProperties}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">게시글</p>
                    <p className="text-gray-100">{selectedUser._count.guestbooks}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">댓글</p>
                    <p className="text-gray-100">{selectedUser._count.comments}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">뱃지</p>
                    <p className="text-gray-100">{selectedUser._count.userBadges}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Classes */}
                {selectedUser.instructorClasses.length > 0 && (
                  <div className="bg-gray-750 border border-gray-700 p-4">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">최근 등록 클래스</h3>
                    <div className="space-y-1 text-xs">
                      {selectedUser.instructorClasses.map((cls: any) => (
                        <div key={cls.id} className="text-gray-300">
                          • {cls.title} ({cls.status})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Enrollments */}
                {selectedUser.classEnrollments.length > 0 && (
                  <div className="bg-gray-750 border border-gray-700 p-4">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">최근 수강 클래스</h3>
                    <div className="space-y-1 text-xs">
                      {selectedUser.classEnrollments.map((enrollment: any) => (
                        <div key={enrollment.id} className="text-gray-300">
                          • {enrollment.class.title} ({enrollment.status})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Posts */}
                {selectedUser.guestbooks.length > 0 && (
                  <div className="bg-gray-750 border border-gray-700 p-4">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">최근 게시글</h3>
                    <div className="space-y-1 text-xs">
                      {selectedUser.guestbooks.map((post: any) => (
                        <div key={post.id} className="text-gray-300">
                          • {post.title} (좋아요 {post.likesCount})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {selectedUser.coinTransactions.length > 0 && (
                  <div className="bg-gray-750 border border-gray-700 p-4">
                    <h3 className="text-sm font-bold text-gray-100 mb-2">최근 코인 거래</h3>
                    <div className="space-y-1 text-xs">
                      {selectedUser.coinTransactions.slice(0, 5).map((tx: any) => (
                        <div key={tx.id} className="text-gray-300">
                          • {tx.description} ({tx.amount > 0 ? '+' : ''}{tx.amount}원)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
