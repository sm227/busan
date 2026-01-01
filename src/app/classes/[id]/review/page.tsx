"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function WriteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { currentUser } = useApp();

  const enrollmentId = searchParams?.get('enrollmentId');
  const classId = params.id as string;

  // States
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [instructorRating, setInstructorRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [facilityRating, setFacilityRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);

  // Load enrollment data
  useEffect(() => {
    if (currentUser && enrollmentId) {
      loadEnrollmentData();
    }
  }, [currentUser, enrollmentId]);

  const loadEnrollmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/classes/enrollments?userId=${currentUser?.id}`
      );
      const data = await response.json();

      if (data.success) {
        const found = data.data.find((e: any) => e.id === enrollmentId);

        if (!found) {
          alert("수강 신청 정보를 찾을 수 없습니다.");
          router.back();
          return;
        }

        if (found.status !== 'completed') {
          alert("완료된 수업만 리뷰를 작성할 수 있습니다.");
          router.back();
          return;
        }

        if (found.review) {
          alert("이미 리뷰를 작성했습니다.");
          router.back();
          return;
        }

        setEnrollment(found);
      }
    } catch (error) {
      console.error("Enrollment loading failed:", error);
      alert("데이터 로딩에 실패했습니다.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !enrollmentId) return;

    // Validation
    if (content.length < 10) {
      alert("리뷰는 최소 10자 이상 작성해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/classes/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          userId: currentUser.id,
          rating,
          title: title.trim() || null,
          content: content.trim(),
          instructorRating,
          contentRating,
          facilityRating,
          valueRating,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("리뷰가 등록되었습니다!");
        router.push(`/classes/${classId}`);
      } else {
        alert(data.error || "리뷰 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Review submission failed:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!enrollment) {
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
            <span className="font-bold text-lg">리뷰 작성</span>
            <div className="w-10" />
          </div>
        </div>

        {/* Class Info */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100">
          <h3 className="font-bold text-stone-800 mb-1">
            {enrollment.class?.title}
          </h3>
          <p className="text-sm text-stone-500">
            {new Date(enrollment.session?.sessionDate).toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-6">
          {/* 전체 평점 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              전체 평점 *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-stone-500 text-sm mt-2">
              {rating}점
            </p>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              리뷰 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력해주세요"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              리뷰 내용 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="클래스에 대한 솔직한 후기를 남겨주세요 (최소 10자)"
              rows={6}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
            />
            <p className="text-xs text-stone-500 mt-1">
              {content.length} / 10자 이상
            </p>
          </div>

          {/* 세부 평가 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">세부 평가</h3>

            {/* 강사 평가 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-stone-700">
                  강사
                </label>
                <span className="text-sm text-stone-500">{instructorRating}점</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setInstructorRating(star)}
                    className="flex-1 p-1"
                  >
                    <Star
                      className={`w-6 h-6 mx-auto ${
                        star <= instructorRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 콘텐츠 평가 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-stone-700">
                  콘텐츠
                </label>
                <span className="text-sm text-stone-500">{contentRating}점</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setContentRating(star)}
                    className="flex-1 p-1"
                  >
                    <Star
                      className={`w-6 h-6 mx-auto ${
                        star <= contentRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 시설 평가 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-stone-700">
                  시설
                </label>
                <span className="text-sm text-stone-500">{facilityRating}점</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFacilityRating(star)}
                    className="flex-1 p-1"
                  >
                    <Star
                      className={`w-6 h-6 mx-auto ${
                        star <= facilityRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 가치 평가 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-stone-700">
                  가격 대비 가치
                </label>
                <span className="text-sm text-stone-500">{valueRating}점</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setValueRating(star)}
                    className="flex-1 p-1"
                  >
                    <Star
                      className={`w-6 h-6 mx-auto ${
                        star <= valueRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || content.length < 10}
            className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "등록 중..." : "리뷰 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
