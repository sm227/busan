'use client';

import { useEffect, useState } from 'react';

interface ClassesManagementProps {
  userId: number;
  onNavigateToUser?: (userId: number) => void;
  initialInstructorId?: number | null;
}

interface ClassItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  price: number;
  duration: number;
  province: string;
  city: string;
  createdAt: string;
  instructor: {
    id: number;
    nickname: string;
  };
  _count: {
    sessions: number;
    enrollments: number;
    reviews: number;
  };
}

interface ClassDetail extends ClassItem {
  maxParticipants: number;
  difficulty: string;
  requirements: string[];
  providedItems: string[];
  location: string;
  locationDetail: string;
  images: string[];
  sessions: Array<{
    id: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    availableSlots: number;
    _count: {
      enrollments: number;
    };
  }>;
  enrollments: Array<{
    id: string;
    user: {
      id: number;
      nickname: string;
    };
    status: string;
    attendanceStatus: string | null;
    paidAmount: number;
    enrolledAt: string;
    session: {
      sessionDate: string;
    };
  }>;
  reviews: Array<{
    id: string;
    user: {
      id: number;
      nickname: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export function ClassesManagement({ userId, onNavigateToUser, initialInstructorId }: ClassesManagementProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Detail modal
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 다른 모듈에서 특정 강사를 선택하여 왔을 때
  useEffect(() => {
    if (initialInstructorId) {
      setInstructorFilter(initialInstructorId.toString());
    }
  }, [initialInstructorId]);

  // 필터 변경 시 offset 리셋 및 데이터 fetch
  useEffect(() => {
    setOffset(0);
    fetchClasses();
  }, [statusFilter, searchQuery, categoryFilter, instructorFilter]);

  // offset 변경 시 데이터 fetch (페이지네이션용)
  useEffect(() => {
    // 필터가 변경되어 offset이 0으로 리셋된 경우는 위의 useEffect에서 이미 fetch했으므로 스킵
    if (offset === 0) return;
    fetchClasses();
  }, [offset]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (instructorFilter) params.append('instructorId', instructorFilter);

      const response = await fetch(`/api/admin/classes?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '클래스 목록을 불러오는데 실패했습니다.');
      }

      setClasses(data.data);
      setTotal(data.total);
      setError('');

      // 강사 필터가 있고 결과가 있으면 강사 이름 저장
      if (instructorFilter && data.data.length > 0) {
        setInstructorName(data.data[0].instructor.nickname);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassDetail = async (classId: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/classes/${classId}?userId=${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '클래스 정보를 불러오는데 실패했습니다.');
      }

      setSelectedClass(data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '클래스 상세 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleApprove = async (classId: string) => {
    if (!confirm('이 클래스를 승인하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/classes/${classId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '승인에 실패했습니다.');
      }

      alert('클래스가 승인되었습니다.');
      fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : '승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (classId: string) => {
    const reason = prompt('거부 사유를 입력해주세요:');
    if (!reason || reason.trim().length === 0) return;

    try {
      const response = await fetch(`/api/admin/classes/${classId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '거부에 실패했습니다.');
      }

      alert('클래스가 거부되었습니다.');
      fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : '거부 중 오류가 발생했습니다.');
    }
  };

  const handleAttendance = async (enrollmentId: string, attendanceStatus: 'attended' | 'late' | 'absent') => {
    if (!confirm(`출석 상태를 '${attendanceStatus === 'attended' ? '출석' : attendanceStatus === 'late' ? '지각' : '결석'}'으로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/enrollments/${enrollmentId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId: userId,
          attendanceStatus,
          isAdmin: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '출석 체크에 실패했습니다.');
      }

      alert('출석 체크가 완료되었습니다.');
      // 상세 정보 다시 로드
      if (selectedClass) {
        fetchClassDetail(selectedClass.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '출석 체크 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-900 text-yellow-400 border-yellow-700',
      approved: 'bg-green-900 text-green-400 border-green-700',
      rejected: 'bg-red-900 text-red-400 border-red-700',
      active: 'bg-blue-900 text-blue-400 border-blue-700',
      inactive: 'bg-gray-700 text-gray-400 border-gray-600',
      confirmed: 'bg-blue-900 text-blue-400 border-blue-700',
      completed: 'bg-green-900 text-green-400 border-green-700',
      cancelled: 'bg-red-900 text-red-400 border-red-700',
    };

    const labels: Record<string, string> = {
      pending: '승인대기',
      approved: '승인됨',
      rejected: '거부됨',
      active: '활성화',
      inactive: '비활성화',
      confirmed: '수강중',
      completed: '완료',
      cancelled: '취소',
    };

    return (
      <span className={`px-2 py-1 text-xs border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getAttendanceBadge = (attendanceStatus: string | null) => {
    if (!attendanceStatus) return null;

    const styles: Record<string, string> = {
      attended: 'bg-green-900 text-green-400 border-green-700',
      late: 'bg-orange-900 text-orange-400 border-orange-700',
      absent: 'bg-red-900 text-red-400 border-red-700',
    };

    const labels: Record<string, string> = {
      attended: '출석',
      late: '지각',
      absent: '결석',
    };

    return (
      <span className={`px-2 py-1 text-xs border ${styles[attendanceStatus] || ''}`}>
        {labels[attendanceStatus] || attendanceStatus}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      farming: '농업',
      crafts: '공예',
      cooking: '요리',
      culture: '문화',
      nature: '자연',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-100">원데이 클래스 관리</h1>
        <p className="text-gray-400 mt-1">클래스 승인 및 관리</p>
      </div>

      {/* Instructor Filter Badge */}
      {instructorFilter && (
        <div className="bg-blue-900 border border-blue-700 p-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 text-sm">
              특정 강사의 클래스만 표시 중: {instructorName || `ID ${instructorFilter}`}
            </span>
            <button
              onClick={() => {
                setInstructorFilter('');
                setInstructorName('');
              }}
              className="px-3 py-1 text-xs bg-blue-800 text-blue-200 border border-blue-600 hover:bg-blue-700"
            >
              필터 해제
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="클래스 제목, 설명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="">전체 상태</option>
              <option value="pending">승인 대기</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거부됨</option>
              <option value="active">활성화</option>
              <option value="inactive">비활성화</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="">전체 카테고리</option>
              <option value="farming">농업</option>
              <option value="crafts">공예</option>
              <option value="cooking">요리</option>
              <option value="culture">문화</option>
              <option value="nature">자연</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          총 {total}개의 클래스
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Classes Table */}
      <div className="bg-gray-800 border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">클래스가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">클래스명</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">강사</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">카테고리</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">가격</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">수강생</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-100">{cls.title}</p>
                        <p className="text-xs text-gray-500">
                          {cls.province} {cls.city}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {onNavigateToUser ? (
                        <button
                          onClick={() => onNavigateToUser(cls.instructor.id)}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {cls.instructor.nickname}
                        </button>
                      ) : (
                        <span className="text-gray-300">{cls.instructor.nickname}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {getCategoryLabel(cls.category)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(cls.status)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {cls.price.toLocaleString()}개
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {cls._count.enrollments}명
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {cls.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(cls.id)}
                              className="px-2 py-1 text-xs bg-green-900 text-green-400 border border-green-700 hover:bg-green-800"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(cls.id)}
                              className="px-2 py-1 text-xs bg-red-900 text-red-400 border border-red-700 hover:bg-red-800"
                            >
                              거부
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => fetchClassDetail(cls.id)}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                        >
                          상세
                        </button>
                      </div>
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
      {showDetailModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-100">클래스 상세 정보</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClass(null);
                }}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isLoadingDetail ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">로딩 중...</p>
                </div>
              ) : !selectedClass ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">데이터를 불러올 수 없습니다.</p>
                </div>
              ) : (
                <>
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-100 mb-3">기본 정보</h3>
                <div className="bg-gray-750 border border-gray-700 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">클래스명</p>
                      <p className="text-gray-100">{selectedClass.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">강사</p>
                      {onNavigateToUser ? (
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            onNavigateToUser(selectedClass.instructor.id);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {selectedClass.instructor.nickname}
                        </button>
                      ) : (
                        <p className="text-gray-100">{selectedClass.instructor.nickname}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">카테고리</p>
                      <p className="text-gray-100">{getCategoryLabel(selectedClass.category)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">상태</p>
                      <div>{getStatusBadge(selectedClass.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">가격</p>
                      <p className="text-gray-100">{selectedClass.price.toLocaleString()}원</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">소요시간</p>
                      <p className="text-gray-100">{selectedClass.duration}분</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">최대 인원</p>
                      <p className="text-gray-100">{selectedClass.maxParticipants}명</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">난이도</p>
                      <p className="text-gray-100">{selectedClass.difficulty}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">설명</p>
                    <p className="text-gray-100 whitespace-pre-wrap">{selectedClass.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">위치</p>
                    <p className="text-gray-100">{selectedClass.province} {selectedClass.city}</p>
                    <p className="text-sm text-gray-300">{selectedClass.location}</p>
                    {selectedClass.locationDetail && (
                      <p className="text-xs text-gray-400">{selectedClass.locationDetail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sessions */}
              {selectedClass?.sessions && selectedClass.sessions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3">세션 일정</h3>
                  <div className="bg-gray-750 border border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700 border-b border-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">날짜</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">시간</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">예약/정원</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {selectedClass.sessions.map((session) => (
                          <tr key={session.id}>
                            <td className="px-4 py-2 text-gray-300">
                              {new Date(session.sessionDate).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-4 py-2 text-gray-300">
                              {session.startTime} - {session.endTime}
                            </td>
                            <td className="px-4 py-2 text-gray-300">
                              {session._count?.enrollments || 0} / {session.availableSlots}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Enrollments */}
              {selectedClass?.enrollments && selectedClass.enrollments.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3">수강생 목록</h3>
                  <div className="bg-gray-750 border border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700 border-b border-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">수강생</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">수강날짜</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">상태</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">출석</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">결제금액</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-400">출석관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {selectedClass.enrollments.map((enrollment) => {
                          const sessionDate = new Date(enrollment.session.sessionDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          sessionDate.setHours(0, 0, 0, 0);
                          const isPastSession = sessionDate <= today;

                          return (
                            <tr key={enrollment.id}>
                              <td className="px-4 py-2 text-gray-300">
                                {enrollment.user.nickname}
                              </td>
                              <td className="px-4 py-2 text-gray-300">
                                {new Date(enrollment.session.sessionDate).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="px-4 py-2">{getStatusBadge(enrollment.status)}</td>
                              <td className="px-4 py-2">
                                {enrollment.attendanceStatus ? (
                                  getAttendanceBadge(enrollment.attendanceStatus)
                                ) : (
                                  <span className="text-gray-500 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-300">
                                {enrollment.paidAmount.toLocaleString()}원
                              </td>
                              <td className="px-4 py-2">
                                {enrollment.status === 'confirmed' && !enrollment.attendanceStatus && isPastSession ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAttendance(enrollment.id, 'attended')}
                                      className="px-2 py-1 text-xs bg-green-900 text-green-400 border border-green-700 hover:bg-green-800"
                                    >
                                      출석
                                    </button>
                                    <button
                                      onClick={() => handleAttendance(enrollment.id, 'late')}
                                      className="px-2 py-1 text-xs bg-orange-900 text-orange-400 border border-orange-700 hover:bg-orange-800"
                                    >
                                      지각
                                    </button>
                                    <button
                                      onClick={() => handleAttendance(enrollment.id, 'absent')}
                                      className="px-2 py-1 text-xs bg-red-900 text-red-400 border border-red-700 hover:bg-red-800"
                                    >
                                      결석
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {selectedClass?.reviews && selectedClass.reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-100 mb-3">리뷰</h3>
                  <div className="space-y-3">
                    {selectedClass.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-750 border border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-100">{review.user.nickname}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {selectedClass && (
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              {selectedClass.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedClass.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-900 text-green-400 border border-green-700 hover:bg-green-800"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedClass.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-900 text-red-400 border border-red-700 hover:bg-red-800"
                  >
                    거부
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClass(null);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
