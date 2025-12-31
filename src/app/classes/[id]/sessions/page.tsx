"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Calendar, Clock, Users, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ManageSessionsPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useApp();
  const [classData, setClassData] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // 새 세션 정보
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadClassData();
  }, [params.id]);

  const loadClassData = async () => {
    try {
      const response = await fetch(
        `/api/classes?classId=${params.id}${currentUser ? `&userId=${currentUser.id}` : ""}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setClassData(data.data);
        setSessions(data.data.sessions || []);
      }
    } catch (error) {
      console.error("클래스 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!sessionDate || !startTime || !endTime || !maxCapacity) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/classes/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: params.id,
          instructorId: currentUser.id,
          sessionDate,
          startTime,
          endTime,
          maxCapacity: parseInt(maxCapacity),
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("세션이 추가되었습니다!");
        setShowAddModal(false);
        setSessionDate("");
        setStartTime("");
        setEndTime("");
        setMaxCapacity("");
        setNotes("");
        loadClassData();
      } else {
        alert(data.error || "세션 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("세션 추가 실패:", error);
      alert("세션 추가 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classData || classData.instructor?.id !== currentUser?.id) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-stone-600 mb-4">권한이 없습니다</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
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
            <span className="font-bold text-lg">세션 관리</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 -mr-2 text-stone-500 hover:bg-stone-100 rounded-full"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Class Info */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100">
          <h3 className="font-bold text-stone-800 mb-1">{classData.title}</h3>
          <p className="text-sm text-stone-500">
            {classData.province} {classData.city}
          </p>
        </div>

        {/* Sessions List */}
        <div className="px-6 py-4 space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session: any) => (
              <div
                key={session.id}
                className="bg-white border border-stone-200 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-stone-800 mb-1">
                      {new Date(session.sessionDate).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </div>
                    <div className="flex items-center text-sm text-stone-500 gap-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.startTime} - {session.endTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {session.currentEnrolled}/{session.maxCapacity}명
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      session.status === "open"
                        ? "bg-green-50 text-green-700"
                        : session.status === "full"
                        ? "bg-stone-100 text-stone-500"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {session.status === "open"
                      ? "신청 가능"
                      : session.status === "full"
                      ? "마감"
                      : "취소됨"}
                  </div>
                </div>

                {session.notes && (
                  <p className="text-sm text-stone-600 mt-2 pt-2 border-t border-stone-100">
                    {session.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-sm mb-4">아직 등록된 세션이 없습니다</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold"
              >
                첫 세션 추가하기
              </button>
            </div>
          )}
        </div>

        {/* Add Session Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">새 세션 추가</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    날짜 *
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      시작 시간 *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      종료 시간 *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    최대 인원 *
                  </label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    안내 사항
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="수강생에게 전달할 안내 사항이 있다면 작성해주세요"
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                  />
                </div>

                <button
                  onClick={handleAddSession}
                  className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
                >
                  세션 추가하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
