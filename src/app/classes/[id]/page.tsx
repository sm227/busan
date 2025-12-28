"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Star,
  Bookmark,
  Calendar,
  Share,
  Check,
  User,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useApp();
  const [classData, setClassData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "schedule" | "reviews">("overview");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadClassData();
    loadReviews();
  }, [params.id]);

  const loadClassData = async () => {
    try {
      const url = `/api/classes?classId=${params.id}${
        currentUser ? `&userId=${currentUser.id}` : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        setClassData(data.data);
        setIsBookmarked(data.data.isBookmarked || false);
      }
    } catch (error) {
      console.error("클래스 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/classes/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, classId: params.id }),
      });

      const data = await response.json();
      if (data.success) {
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error("북마크 처리 실패:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/classes/reviews?classId=${params.id}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error("리뷰 로딩 실패:", error);
    }
  };

  const handleEnroll = async (session: any) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (session.status !== "open") {
      alert("신청할 수 없는 세션입니다.");
      return;
    }

    setSelectedSession(session);
    setShowEnrollModal(true);
  };

  const confirmEnrollment = async () => {
    if (!selectedSession || !currentUser) return;

    try {
      const response = await fetch("/api/classes/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          sessionId: selectedSession.id,
          participants: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("수강 신청이 완료되었습니다!");
        setShowEnrollModal(false);
        setSelectedTab("overview");
        loadClassData();
      } else {
        alert(data.error || "수강 신청에 실패했습니다.");
      }
    } catch (error) {
      alert("수강 신청 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-stone-600 mb-4">클래스를 찾을 수 없습니다</p>
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
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-stone-500" />
            </button>
            <span className="font-bold text-lg text-stone-800 truncate max-w-[200px]">
              {classData.title}
            </span>
            <button className="p-2">
              <Share className="w-5 h-5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-64 bg-stone-200">
          {classData.thumbnailUrl ? (
            <img
              src={classData.thumbnailUrl}
              alt={classData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-16 h-16 text-stone-300" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="pb-28">
          {/* Title & Stats */}
          <div className="px-6 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl font-bold text-stone-900 flex-1">{classData.title}</h1>
              <button onClick={handleBookmark} className="p-2 hover:bg-stone-100 rounded-full">
                <Bookmark
                  className={`w-6 h-6 ${
                    isBookmarked
                      ? "fill-orange-500 text-orange-500"
                      : "text-stone-400"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
              <User className="w-4 h-4" />
              <span>{classData.instructor?.nickname}</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {classData.averageRating > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <Star className="w-6 h-6 fill-orange-500 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    {classData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-stone-500">
                    ({classData.reviewsCount}개 리뷰)
                  </span>
                </div>
              )}
              <div className="flex items-center text-stone-500">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">{classData.enrollmentsCount}명 수강</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-stone-900">
              {classData.price.toLocaleString()}
              <span className="text-base text-stone-400 ml-2">코인</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            {[
              { key: "overview", label: "클래스 소개" },
              { key: "schedule", label: "일정" },
              { key: "reviews", label: `리뷰 (${classData.reviewsCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.key
                    ? "border-stone-800 text-stone-800"
                    : "border-transparent text-stone-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 space-y-6">
            {selectedTab === "overview" && (
              <>
                {/* Description */}
                <div>
                  <h3 className="font-bold text-lg mb-3">클래스 설명</h3>
                  <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {classData.description}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-sm">소요 시간</span>
                    <span className="font-medium">{classData.duration}분</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-sm">난이도</span>
                    <span className="font-medium">{classData.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-sm">지역</span>
                    <span className="font-medium">
                      {classData.province} {classData.city}
                    </span>
                  </div>
                </div>

                {/* Includes */}
                {classData.includes && classData.includes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">포함 사항</h3>
                    <ul className="space-y-2">
                      {classData.includes.map((item: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-stone-600">
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Materials */}
                {classData.materials && classData.materials.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">준비물</h3>
                    <div className="flex flex-wrap gap-2">
                      {classData.materials.map((material: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedTab === "schedule" && (
              <div className="space-y-3">
                {classData.sessions && classData.sessions.length > 0 ? (
                  classData.sessions.map((session: any) => (
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
                          <div className="text-sm text-stone-500">
                            {session.startTime} - {session.endTime}
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

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-stone-500">
                          {session.currentEnrolled}/{session.maxCapacity}명
                        </div>
                        {session.status === "open" && (
                          <button
                            onClick={() => handleEnroll(session)}
                            className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-bold hover:bg-stone-700 transition-colors"
                          >
                            신청하기
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-500">예정된 일정이 없습니다</div>
                )}
              </div>
            )}

            {selectedTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-stone-200 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-stone-800">
                            {review.user?.nickname}
                          </div>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-orange-500 text-orange-500"
                                    : "text-stone-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-stone-400">
                          {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-stone-800 mb-1">{review.title}</h4>
                      )}
                      <p className="text-sm text-stone-600 leading-relaxed">{review.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-500">아직 리뷰가 없습니다</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-stone-100 p-4 pb-6">
          {currentUser && classData.instructor?.id === currentUser.id ? (
            <button
              onClick={() => router.push(`/classes/${params.id}/sessions`)}
              className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg"
            >
              세션 관리하기
            </button>
          ) : (
            <button
              onClick={() =>
                classData.sessions &&
                classData.sessions.length > 0 &&
                handleEnroll(classData.sessions[0])
              }
              className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-lg"
            >
              수강 신청하기
            </button>
          )}
        </div>

        {/* Enrollment Modal */}
        {showEnrollModal && selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8">
              <h3 className="font-bold text-xl mb-4">수강 신청 확인</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-500">클래스</span>
                  <span className="font-medium">{classData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">일시</span>
                  <span className="font-medium">
                    {new Date(selectedSession.sessionDate).toLocaleDateString("ko-KR")}{" "}
                    {selectedSession.startTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">결제 금액</span>
                  <span className="font-bold text-lg">
                    {classData.price.toLocaleString()} 코인
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold"
                >
                  취소
                </button>
                <button
                  onClick={confirmEnrollment}
                  className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-bold"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
