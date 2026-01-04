"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MapPin, Clock, Users, Star, Bookmark, Plus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { BlurredImage } from "@/components/BlurredImage";

export default function ClassesPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());

  const categoryLabels: Record<string, string> = {
    all: "전체",
    farming: "농사 체험",
    crafts: "공예",
    cooking: "요리",
    culture: "문화",
    nature: "자연"
  };

  useEffect(() => {
    loadClasses();
  }, [selectedCategory, currentUser]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (currentUser) {
        params.append("userId", currentUser.id.toString());
      }
      params.append("sortBy", "averageRating");
      params.append("sortOrder", "DESC");

      const response = await fetch(`/api/classes?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setClasses(data.data || []);

        // 사용자의 북마크 상태 초기화
        if (currentUser) {
          const bookmarked = new Set<string>();

          data.data.forEach((classItem: any) => {
            if (classItem.isBookmarked) bookmarked.add(classItem.id);
          });

          setBookmarkedClasses(bookmarked);
        }
      }
    } catch (error) {
      console.error("클래스 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (c) =>
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  const handleBookmark = async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/classes/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, classId }),
      });

      const data = await response.json();
      if (data.success) {
        setBookmarkedClasses((prev) => {
          const newSet = new Set(prev);
          data.bookmarked ? newSet.add(classId) : newSet.delete(classId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("북마크 처리 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-serif font-bold text-lg text-stone-800">원데이 클래스</span>
            <button
              onClick={() => router.push("/classes/create")}
              className="p-2 -mr-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 space-y-3 bg-white border-b border-stone-100">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="클래스 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
          <p className="text-sm text-stone-600">
            총 <span className="font-bold text-orange-600">{filteredClasses.length}</span>개의 클래스
          </p>
        </div>

        {/* Class List */}
        <div className="px-6 py-4 pb-24 space-y-4 relative">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredClasses.length > 0 ? (
            <>
            <div className={!currentUser ? 'filter blur-sm select-none space-y-4' : 'space-y-4'}>
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => router.push(`/classes/${classItem.id}`)}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden cursor-pointer hover:border-stone-300 transition-all"
              >
                {/* Image */}
                <div className="relative h-48 bg-stone-200">
                  {classItem.thumbnailUrl ? (
                    <BlurredImage
                      src={classItem.thumbnailUrl}
                      alt={classItem.title}
                      className="w-full h-full object-cover"
                      blurWhenLoggedOut={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-stone-300" />
                    </div>
                  )}

                  {/* Rating Badge */}
                  {classItem.averageRating > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                      <span className="text-sm font-bold text-stone-800">
                        {classItem.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-stone-500">
                        ({classItem.reviewsCount})
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className={`absolute ${classItem.averageRating > 0 ? 'top-14' : 'top-3'} left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-stone-700`}>
                    {categoryLabels[classItem.category] || classItem.category}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleBookmark(classItem.id, e)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        bookmarkedClasses.has(classItem.id)
                          ? "fill-orange-500 text-orange-500"
                          : "text-stone-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-stone-800 text-base mb-2 leading-snug">
                    {classItem.title}
                  </h3>

                  <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-stone-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">
                        {classItem.province} {classItem.city}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center text-stone-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {classItem.duration}분
                        </div>
                        <div className="flex items-center text-stone-500">
                          <Users className="w-4 h-4 mr-1" />
                          {classItem.enrollmentsCount}명
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-stone-800">
                          {classItem.price.toLocaleString()}
                          <span className="text-xs text-stone-400 ml-1">코인</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Session */}
                  {classItem.sessions && classItem.sessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center text-xs text-stone-400">
                        <span className="font-medium text-stone-600 mr-2">다음 수업:</span>
                        {new Date(classItem.sessions[0].sessionDate).toLocaleDateString("ko-KR")}{" "}
                        {classItem.sessions[0].startTime}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>

            {/* 비로그인 사용자 오버레이 - 전체 리스트에 하나만 */}
            {!currentUser && (
              <div
                onClick={() => router.push('/login')}
                className="absolute top-0 left-0 right-0 bottom-0 flex items-start justify-center pt-16 bg-white/30 cursor-pointer hover:bg-white/40 transition-colors z-10"
              >
                <div className="text-stone-800 text-sm font-bold bg-white px-4 py-2 rounded-full shadow-lg pointer-events-none">
                  로그인하고 전체 보기 →
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-stone-300 mb-4" />
              <p className="text-stone-500 text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
