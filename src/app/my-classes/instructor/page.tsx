"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertCircle, CheckCircle, XCircle, Clock, Edit } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function InstructorClassesPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    if (currentUser) {
      loadMyClasses();
    }
  }, [currentUser, selectedTab]);

  const loadMyClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/instructor?userId=${currentUser?.id}`);
      const data = await response.json();

      if (data.success) {
        let filtered = data.data || [];

        // 탭별 필터링
        if (selectedTab !== "all") {
          filtered = filtered.filter((c: any) => c.status === selectedTab);
        }

        setClasses(filtered);
      }
    } catch (error) {
      console.error("내 클래스 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "승인 대기",
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: Clock,
          iconColor: "text-orange-500"
        };
      case "approved":
        return {
          label: "승인됨",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle,
          iconColor: "text-green-500"
        };
      case "active":
        return {
          label: "운영 중",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle,
          iconColor: "text-blue-500"
        };
      case "rejected":
        return {
          label: "거부됨",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          iconColor: "text-red-500"
        };
      case "inactive":
        return {
          label: "비활성화",
          color: "bg-stone-100 text-stone-600 border-stone-200",
          icon: AlertCircle,
          iconColor: "text-stone-500"
        };
      default:
        return {
          label: status,
          color: "bg-stone-100 text-stone-600 border-stone-200",
          icon: AlertCircle,
          iconColor: "text-stone-500"
        };
    }
  };

  const handleResubmit = async (classId: string) => {
    if (!confirm("이 클래스를 다시 승인 요청하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/classes/${classId}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id })
      });

      const data = await response.json();

      if (data.success) {
        alert("재신청이 완료되었습니다.");
        loadMyClasses();
      } else {
        alert(data.error || "재신청에 실패했습니다.");
      }
    } catch (error) {
      console.error("재신청 실패:", error);
      alert("재신청 중 오류가 발생했습니다.");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">로그인이 필요합니다</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold"
          >
            메인으로
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
            <span className="font-bold text-lg">내 클래스 관리</span>
            <button
              onClick={() => router.push("/classes/create")}
              className="p-2 -mr-2 text-stone-500 hover:bg-stone-100 rounded-full"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-stone-100">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "all", label: "전체" },
              { key: "pending", label: "승인 대기" },
              { key: "approved", label: "승인됨" },
              { key: "rejected", label: "거부됨" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTab === tab.key
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classes List */}
        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : classes.length > 0 ? (
            classes.map((classItem) => {
              const statusInfo = getStatusInfo(classItem.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={classItem.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Status Badge */}
                  <div className={`px-4 py-2 border-b flex items-center gap-2 ${statusInfo.color}`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.iconColor}`} />
                    <span className="text-sm font-bold">{statusInfo.label}</span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-stone-800 mb-2">{classItem.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                      <span>{classItem.category}</span>
                      <span>{classItem.price.toLocaleString()}코인</span>
                      <span>{classItem.duration}분</span>
                    </div>

                    {/* 거부 사유 */}
                    {classItem.status === "rejected" && classItem.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-700 mb-1">거부 사유</p>
                            <p className="text-xs text-red-600">{classItem.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-stone-400 mb-3">
                      <span>세션 {classItem._count?.sessions || 0}개</span>
                      <span>수강 {classItem.enrollmentsCount || 0}명</span>
                      <span>리뷰 {classItem.reviewsCount || 0}개</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {classItem.status === "rejected" && (
                        <button
                          onClick={() => handleResubmit(classItem.id)}
                          className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors"
                        >
                          재신청하기
                        </button>
                      )}

                      {(classItem.status === "pending" || classItem.status === "rejected") && (
                        <button
                          onClick={() => router.push(`/classes/create?edit=${classItem.id}`)}
                          className="flex-1 py-2 px-4 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          수정하기
                        </button>
                      )}

                      {(classItem.status === "approved" || classItem.status === "active") && (
                        <>
                          <button
                            onClick={() => router.push(`/classes/${classItem.id}`)}
                            className="flex-1 py-2 px-4 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors"
                          >
                            상세보기
                          </button>
                          <button
                            onClick={() => router.push(`/classes/${classItem.id}/sessions`)}
                            className="flex-1 py-2 px-4 bg-stone-800 text-white rounded-xl text-sm font-bold hover:bg-stone-700 transition-colors"
                          >
                            세션 관리
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-sm mb-4">
                {selectedTab === "all"
                  ? "등록한 클래스가 없습니다"
                  : `${
                      selectedTab === "pending"
                        ? "승인 대기 중인"
                        : selectedTab === "approved"
                        ? "승인된"
                        : "거부된"
                    } 클래스가 없습니다`}
              </p>
              <button
                onClick={() => router.push("/classes/create")}
                className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                첫 클래스 등록하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
