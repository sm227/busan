"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Star, AlertCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function MyClassesPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadEnrollments();
    } else {
      router.push("/login");
    }
  }, [currentUser, activeTab]);

  const loadEnrollments = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const status = activeTab === "upcoming" ? "confirmed" : "completed";
      const response = await fetch(
        `/api/classes/enrollments?userId=${currentUser.id}&status=${status}`
      );
      const data = await response.json();

      if (data.success) {
        setEnrollments(data.data || []);
      }
    } catch (error) {
      console.error("수강 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (enrollmentId: string) => {
    if (!confirm("정말 취소하시겠습니까? 수업료의 90%가 환불됩니다.")) return;

    try {
      const response = await fetch(
        `/api/classes/enrollments?enrollmentId=${enrollmentId}&userId=${currentUser?.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`취소가 완료되었습니다. ${data.refundAmount}코인이 환불되었습니다.`);
        loadEnrollments();
      } else {
        alert(data.error || "취소에 실패했습니다.");
      }
    } catch (error) {
      alert("취소 중 오류가 발생했습니다.");
    }
  };

  const handleReview = (enrollment: any) => {
    router.push(`/classes/${enrollment.classId}/review?enrollmentId=${enrollment.id}`);
  };

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
            <span className="font-bold text-lg">내 클래스</span>
            <div className="w-10" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === "upcoming"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-400"
            }`}
          >
            수강 예정
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === "completed"
                ? "border-stone-800 text-stone-800"
                : "border-transparent text-stone-400"
            }`}
          >
            수강 완료
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-bold text-stone-800 mb-2">{enrollment.class?.title}</h3>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-stone-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(enrollment.session?.sessionDate || "").toLocaleDateString(
                        "ko-KR"
                      )}
                    </div>
                    <div className="flex items-center text-sm text-stone-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {enrollment.session?.startTime} - {enrollment.session?.endTime}
                    </div>
                    <div className="flex items-center text-sm text-stone-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {enrollment.class?.province} {enrollment.class?.city}
                    </div>
                  </div>

                  {activeTab === "upcoming" ? (
                    <div className="flex gap-2 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => router.push(`/classes/${enrollment.classId}`)}
                        className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm font-medium"
                      >
                        클래스 보기
                      </button>
                      <button
                        onClick={() => handleCancel(enrollment.id)}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium"
                      >
                        취소하기
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-stone-100">
                      {enrollment.review ? (
                        <div className="flex items-center text-sm text-stone-500">
                          <Star className="w-4 h-4 mr-1 fill-orange-500 text-orange-500" />
                          리뷰 작성 완료
                        </div>
                      ) : (
                        <button
                          onClick={() => handleReview(enrollment)}
                          className="w-full py-2 bg-stone-800 text-white rounded-lg text-sm font-bold"
                        >
                          리뷰 작성하기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-12 h-12 text-stone-300 mb-4" />
              <p className="text-stone-500 text-sm">
                {activeTab === "upcoming"
                  ? "수강 예정인 클래스가 없습니다"
                  : "수강 완료한 클래스가 없습니다"}
              </p>
              <button
                onClick={() => router.push("/classes")}
                className="mt-4 px-6 py-2 bg-stone-800 text-white rounded-lg text-sm font-bold"
              >
                클래스 둘러보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
