"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, Calendar, MessageSquare, Check, X, Clock } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ManageStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useApp();

  const [classData, setClassData] = useState<any | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>("all");

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, params.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load class data
      const classResponse = await fetch(
        `/api/classes?classId=${params.id}&userId=${currentUser?.id}`
      );
      const classResult = await classResponse.json();

      if (!classResult.success) {
        alert("클래스 정보를 불러올 수 없습니다.");
        router.back();
        return;
      }

      setClassData(classResult.data);

      // Check instructor permission
      if (classResult.data.instructor?.id !== currentUser?.id) {
        alert("권한이 없습니다.");
        router.back();
        return;
      }

      // Load enrollments
      const enrollResponse = await fetch(
        `/api/classes/${params.id}/enrollments?instructorId=${currentUser?.id}`
      );
      const enrollResult = await enrollResponse.json();

      if (enrollResult.success) {
        setEnrollments(enrollResult.data || []);
      }
    } catch (error) {
      console.error("Data loading failed:", error);
      alert("데이터 로딩에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique sessions for filter
  const sessions = classData?.sessions || [];

  // Filter enrollments by session
  const filteredEnrollments = selectedSession === "all"
    ? enrollments
    : enrollments.filter(e => e.sessionId === selectedSession);

  // Group by session
  const groupedBySession = filteredEnrollments.reduce((acc, enrollment) => {
    const sessionId = enrollment.session?.id || 'unknown';
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(enrollment);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-stone-500" />
            </button>
            <span className="font-bold text-lg">수강생 관리</span>
            <div className="w-10" />
          </div>
        </div>

        {/* Class Info */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100">
          <h3 className="font-bold text-stone-800 mb-1">{classData.title}</h3>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Users className="w-4 h-4" />
            <span>총 {enrollments.length}명 등록</span>
          </div>
        </div>

        {/* Session Filter */}
        {sessions.length > 1 && (
          <div className="px-6 py-3 bg-white border-b border-stone-100">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="all">전체 세션</option>
              {sessions.map((session: any) => (
                <option key={session.id} value={session.id}>
                  {new Date(session.sessionDate).toLocaleDateString("ko-KR")} {session.startTime}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Enrollments List */}
        <div className="px-6 py-4 space-y-6">
          {filteredEnrollments.length > 0 ? (
            selectedSession === "all" ? (
              // Grouped by session
              Object.entries(groupedBySession).map(([sessionId, sessionEnrollments]) => {
                const session = sessions.find((s: any) => s.id === sessionId);
                return (
                  <div key={sessionId} className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-bold">
                        {session
                          ? `${new Date(session.sessionDate).toLocaleDateString("ko-KR")} ${session.startTime}-${session.endTime}`
                          : '세션 정보 없음'
                        }
                      </span>
                      <span className="text-sm text-stone-500">
                        ({sessionEnrollments.length}명)
                      </span>
                    </div>

                    {sessionEnrollments.map((enrollment) => (
                      <EnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        onAttendanceUpdate={loadData}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              // Single session view
              filteredEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onAttendanceUpdate={loadData}
                  currentUser={currentUser}
                />
              ))
            )
          ) : (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-sm">
                {selectedSession === "all"
                  ? "아직 등록한 수강생이 없습니다"
                  : "이 세션에 등록한 수강생이 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enrollment Card Component
function EnrollmentCard({
  enrollment,
  onAttendanceUpdate,
  currentUser
}: {
  enrollment: any;
  onAttendanceUpdate: () => void;
  currentUser: any;
}) {
  const [updating, setUpdating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">
            수강 예정
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
            수강 완료
          </span>
        );
      default:
        return null;
    }
  };

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'attended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">
            <Check className="w-3 h-3" />
            출석
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg">
            <X className="w-3 h-3" />
            결석
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg">
            <Clock className="w-3 h-3" />
            지각
          </span>
        );
      default:
        return null;
    }
  };

  const handleAttendance = async (status: 'attended' | 'absent' | 'late') => {
    if (updating) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/classes/enrollments/${enrollment.id}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId: currentUser?.id,
          attendanceStatus: status
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('출석 체크가 완료되었습니다.');
        onAttendanceUpdate();
      } else {
        alert(data.error || '출석 체크에 실패했습니다.');
      }
    } catch (error) {
      console.error('Attendance update failed:', error);
      alert('출석 체크 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 세션 날짜가 지났는지 확인
  const sessionDate = new Date(enrollment.session?.sessionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  sessionDate.setHours(0, 0, 0, 0);
  const isPastSession = sessionDate <= today;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-stone-800 mb-1">
            {enrollment.user?.nickname}
          </h4>
          <p className="text-xs text-stone-500">
            신청일: {new Date(enrollment.enrolledAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
        {getStatusBadge(enrollment.status)}
      </div>

      <div className="space-y-2 text-sm text-stone-600">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>참가 인원: {enrollment.participants}명</span>
        </div>

        {enrollment.specialRequests && (
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-stone-700 mb-1">특별 요청사항</p>
              <p className="text-xs text-stone-600">{enrollment.specialRequests}</p>
            </div>
          </div>
        )}

        {/* 출석 상태 표시 또는 출석 체크 버튼 */}
        {enrollment.attendanceStatus ? (
          <div className="pt-3 border-t border-stone-100">
            {getAttendanceBadge(enrollment.attendanceStatus)}
          </div>
        ) : enrollment.status === 'confirmed' && isPastSession ? (
          <div className="pt-3 border-t border-stone-100">
            <p className="text-xs font-bold text-stone-700 mb-2">출석 체크</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAttendance('attended')}
                disabled={updating}
                className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                출석
              </button>
              <button
                onClick={() => handleAttendance('late')}
                disabled={updating}
                className="flex-1 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Clock className="w-3 h-3" />
                지각
              </button>
              <button
                onClick={() => handleAttendance('absent')}
                disabled={updating}
                className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                결석
              </button>
            </div>
          </div>
        ) : enrollment.status === 'confirmed' && !isPastSession ? (
          <div className="pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              세션 날짜 이후에 출석 체크가 가능합니다
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
