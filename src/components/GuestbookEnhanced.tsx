'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Star, 
  MapPin, 
  Calendar, 
  User, 
  MessageCircle,
  BookOpen,
  HelpCircle,
  Award,
  Filter,
  Search,
  Edit3,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Share,
  Send,
  X,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface GuestbookEntry {
  id: number;
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question';
  property_id?: string;
  tags?: string | string[];
  likes_count: number;
  created_at: string;
  author_nickname: string;
  user_id: number;
}

interface Comment {
  id: number;
  content: string;
  author_nickname: string;
  created_at: string;
  user_id: number;
  parent_id?: number;
}

interface GuestbookProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
  initialTab?: 'list' | 'write' | 'bookmarks' | 'myActivity';
}

export default function GuestbookEnhanced({ onBack, currentUser, initialTab }: GuestbookProps) {
  // 메인 상태
  const [activeTab, setActiveTab] = useState<'list' | 'write' | 'bookmarks' | 'myActivity'>(initialTab || 'list');
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(null);
  
  // 인터랙션 상태
  const [likedEntries, setLikedEntries] = useState<Set<number>>(new Set());
  const [bookmarkedEntries, setBookmarkedEntries] = useState<Set<number>>(new Set());
  
  // 검색 & 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  
  // 댓글 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  
  // 공유 상태
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  
  // 작성 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    rating: 0,
    category: 'experience' as const,
    tags: ''
  });

  // 데이터 로딩 함수들
  const loadEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // 필터 적용
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      if (selectedTag) params.append('tag', selectedTag);
      if (minRating > 0) params.append('minRating', minRating.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/guestbook?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data || []);
        if (currentUser) {
          await loadUserInteractions();
        }
      }
    } catch (error) {
      console.error('방명록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!currentUser) return;
    
    try {
      // 좋아요 상태 로딩
      const likedSet = new Set<number>();
      const bookmarkedSet = new Set<number>();
      
      for (const entry of entries) {
        // 좋아요 확인
        const likeResponse = await fetch(`/api/guestbook/likes?userId=${currentUser.id}&entryId=${entry.id}`);
        const likeData = await likeResponse.json();
        if (likeData.success && likeData.liked) {
          likedSet.add(entry.id);
        }
        
        // 북마크 확인
        const bookmarkResponse = await fetch(`/api/bookmarks?userId=${currentUser.id}&guestbookId=${entry.id}`);
        const bookmarkData = await bookmarkResponse.json();
        if (bookmarkData.success && bookmarkData.bookmarked) {
          bookmarkedSet.add(entry.id);
        }
      }
      
      setLikedEntries(likedSet);
      setBookmarkedEntries(bookmarkedSet);
    } catch (error) {
      console.error('사용자 인터랙션 로딩 실패:', error);
    }
  };

  const loadComments = async (entryId: number) => {
    try {
      const response = await fetch(`/api/comments?guestbookId=${entryId}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const loadBookmarks = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/bookmarks?userId=${currentUser.id}&action=list`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('북마크 로딩 실패:', error);
    }
  };

  const loadMyActivity = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log('🔍 내 활동 로딩 시작:', currentUser.id);
      const response = await fetch(`/api/guestbook/my-activity?userId=${currentUser.id}`);
      const data = await response.json();

      console.log('📦 내 활동 API 응답:', data);

      if (data.success) {
        console.log('✅ 내 활동 데이터:', data.data.length, '개');
        setEntries(data.data || []);
      } else {
        console.error('❌ 내 활동 로딩 실패:', data.message);
      }
    } catch (error) {
      console.error('내 활동 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 인터랙션 함수들
  const handleLike = async (entryId: number) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/guestbook/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, entryId })
      });
      
      const data = await response.json();
      if (data.success) {
        const newLikedEntries = new Set(likedEntries);
        if (data.liked) {
          newLikedEntries.add(entryId);
        } else {
          newLikedEntries.delete(entryId);
        }
        setLikedEntries(newLikedEntries);
        
        // 목록 새로고침
        await loadEntries();
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  const handleBookmark = async (entryId: number) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, guestbookId: entryId })
      });
      
      const data = await response.json();
      if (data.success) {
        const newBookmarkedEntries = new Set(bookmarkedEntries);
        if (data.bookmarked) {
          newBookmarkedEntries.add(entryId);
        } else {
          newBookmarkedEntries.delete(entryId);
        }
        setBookmarkedEntries(newBookmarkedEntries);
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
    }
  };

  const handleShare = async (entry: GuestbookEntry) => {
    try {
      const response = await fetch(`/api/share?guestbookId=${entry.id}`);
      const data = await response.json();
      
      if (data.success) {
        setShareData(data.data);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('공유 데이터 로딩 실패:', error);
    }
  };

  const handleAddComment = async () => {
    if (!currentUser || !selectedEntry || !newComment.trim()) return;
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestbookId: selectedEntry.id,
          userId: currentUser.id,
          content: newComment.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewComment('');
        await loadComments(selectedEntry.id);
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  // 폼 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          title: '',
          content: '',
          location: '',
          rating: 0,
          category: 'experience',
          tags: ''
        });
        setActiveTab('list');
        await loadEntries();
      }
    } catch (error) {
      console.error('방명록 작성 실패:', error);
    }
  };

  // useEffect들
  useEffect(() => {
    if (activeTab === 'list') {
      loadEntries();
    } else if (activeTab === 'bookmarks') {
      loadBookmarks();
    } else if (activeTab === 'myActivity') {
      loadMyActivity();
    }
  }, [activeTab, searchTerm, selectedCategory, selectedLocation, selectedTag, minRating, sortBy, sortOrder]);

  useEffect(() => {
    if (selectedEntry && showComments) {
      loadComments(selectedEntry.id);
    }
  }, [selectedEntry, showComments]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showShareModal) {
          setShowShareModal(false);
        } else if (selectedEntry) {
          setSelectedEntry(null);
          setShowComments(false);
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [selectedEntry, showShareModal]);

  // 유틸리티 함수들
  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      experience: { icon: '📖', name: '이주 경험', color: 'bg-blue-100 text-blue-700' },
      review: { icon: '⭐', name: '후기', color: 'bg-yellow-100 text-yellow-700' },
      tip: { icon: '💡', name: '팁', color: 'bg-green-100 text-green-700' },
      question: { icon: '❓', name: '질문', color: 'bg-purple-100 text-purple-700' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.experience;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  // 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">방명록</h1>
          </div>
          
          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              목록
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => setActiveTab('write')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'write' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  작성
                </button>
                <button
                  onClick={() => setActiveTab('myActivity')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'myActivity'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  내 활동
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'bookmarks'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  북마크
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-4">
        {(activeTab === 'list' || activeTab === 'bookmarks' || activeTab === 'myActivity') && (
          <>
            {/* 검색 & 필터 - list 탭에서만 표시 */}
            {activeTab === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="제목이나 내용으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    showFilters 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t"
                >
                  {/* 첫 번째 줄: 카테고리와 지역 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">모든 카테고리</option>
                      <option value="experience">이주 경험</option>
                      <option value="review">후기</option>
                      <option value="tip">팁</option>
                      <option value="question">질문</option>
                    </select>

                    <input
                      type="text"
                      placeholder="지역으로 필터링..."
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* 두 번째 줄: 태그와 평점 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="태그로 검색..."
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />

                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(parseInt(e.target.value))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value={0}>모든 평점</option>
                      <option value={1}>⭐ 1점 이상</option>
                      <option value={2}>⭐ 2점 이상</option>
                      <option value={3}>⭐ 3점 이상</option>
                      <option value={4}>⭐ 4점 이상</option>
                      <option value={5}>⭐ 5점만</option>
                    </select>
                  </div>

                  {/* 세 번째 줄: 정렬 옵션 */}
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="created_at">최신순</option>
                      <option value="likes_count">좋아요순</option>
                      <option value="rating">평점순</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title={`${sortOrder === 'ASC' ? '내림차순' : '오름차순'}으로 변경`}
                    >
                      {sortOrder === 'ASC' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                    
                    {/* 필터 초기화 버튼 */}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSelectedLocation('');
                        setSelectedTag('');
                        setMinRating(0);
                        setSortBy('created_at');
                        setSortOrder('DESC');
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="필터 초기화"
                    >
                      초기화
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            )}

            {/* 탭별 제목 표시 */}
            {activeTab === 'myActivity' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">내 활동</h2>
                <p className="text-sm text-gray-500 mt-1">내가 작성하거나 상호작용한 글들</p>
              </div>
            )}
            {activeTab === 'bookmarks' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">북마크</h2>
                <p className="text-sm text-gray-500 mt-1">저장한 글 목록</p>
              </div>
            )}

            {/* 게시글 목록 */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {activeTab === 'myActivity' && '아직 활동 내역이 없습니다.'}
                  {activeTab === 'bookmarks' && '북마크한 글이 없습니다.'}
                  {activeTab === 'list' && '아직 작성된 글이 없습니다.'}
                </p>
                {activeTab === 'myActivity' && (
                  <p className="text-sm text-gray-400 mt-2">
                    방명록을 작성하거나 좋아요, 댓글을 남겨보세요!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {entries.map((entry) => {
                  const categoryInfo = getCategoryInfo(entry.category);
                  const isLiked = likedEntries.has(entry.id);
                  const isBookmarked = bookmarkedEntries.has(entry.id);
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                    >
                      {/* 상단 헤더 바 */}
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${categoryInfo.color} border border-current border-opacity-20`}>
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                            {entry.rating && (
                              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full shadow-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-gray-700">{entry.rating}점</span>
                              </div>
                            )}
                          </div>
                          
                          {currentUser && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleBookmark(entry.id)}
                                className={`p-2 rounded-full transition-all duration-200 ${
                                  isBookmarked 
                                    ? 'text-yellow-600 bg-yellow-100 shadow-md' 
                                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 hover:shadow-md'
                                }`}
                                title={isBookmarked ? '북마크 해제' : '북마크 추가'}
                              >
                                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleShare(entry)}
                                className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                                title="공유하기"
                              >
                                <Share className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* 제목 */}
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-emerald-600 transition-colors leading-tight"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          {entry.title}
                        </h3>

                        {/* 내용 미리보기 */}
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>

                        {/* 태그 */}
                        {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {entry.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200"
                                onClick={() => setSelectedTag(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                                +{entry.tags.length - 3}개
                              </span>
                            )}
                          </div>
                        )}

                        {/* 하단 메타 정보 및 액션 */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {/* 메타 정보 */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{entry.author_nickname}</span>
                            </div>
                            {entry.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{entry.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(entry.created_at)}</span>
                            </div>
                          </div>

                          {/* 액션 버튼들 */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowComments(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-gray-200 hover:border-blue-200"
                              title="댓글 보기"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">댓글</span>
                            </button>
                            {currentUser && (
                              <button
                                onClick={() => handleLike(entry.id)}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-200 border ${
                                  isLiked 
                                    ? 'text-red-600 bg-red-50 border-red-200 shadow-sm' 
                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
                                }`}
                                title={isLiked ? '좋아요 취소' : '좋아요'}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">{entry.likes_count}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'write' && currentUser && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">새 글 작성</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'experience', icon: '📖', name: '이주 경험' },
                    { value: 'review', icon: '⭐', name: '후기' },
                    { value: 'tip', icon: '💡', name: '팁' },
                    { value: 'question', icon: '❓', name: '질문' }
                  ].map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.value as any })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.category === category.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="제목을 입력하세요"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="내용을 입력하세요"
                />
              </div>

              {/* 지역 및 평점 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">지역 (선택)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 부산광역시 해운대구"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">평점 (선택)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`w-8 h-8 ${
                          formData.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="w-full h-full fill-current" />
                      </button>
                    ))}
                    {formData.rating > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: 0 })}
                        className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그 (선택)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="쉼표로 구분하여 입력 (예: 이주, 부산, 신혼집)"
                />
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  작성하기
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookmarks' && currentUser && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">북마크한 글</h2>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">북마크한 글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{entry.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{entry.content}</p>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>{entry.author_nickname}</span>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 게시글 상세 모달 */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedEntry(null);
              setShowComments(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{selectedEntry.title}</h2>
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setShowComments(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 콘텐츠 */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6">
                  {/* 메타 정보 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>{selectedEntry.author_nickname}</span>
                    {selectedEntry.location && <span>{selectedEntry.location}</span>}
                    <span>{formatDate(selectedEntry.created_at)}</span>
                  </div>

                  {/* 본문 */}
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>

                  {/* 액션 버튼들 */}
                  {currentUser && (
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <button
                        onClick={() => handleLike(selectedEntry.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                          likedEntries.has(selectedEntry.id)
                            ? 'bg-red-50 text-red-600 shadow-sm border border-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-sm border border-transparent'
                        }`}
                        title={likedEntries.has(selectedEntry.id) ? '좋아요 취소' : '좋아요'}
                      >
                        <Heart className={`w-4 h-4 ${likedEntries.has(selectedEntry.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm">{selectedEntry.likes_count}</span>
                      </button>

                      <button
                        onClick={() => handleBookmark(selectedEntry.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                          bookmarkedEntries.has(selectedEntry.id)
                            ? 'bg-yellow-50 text-yellow-600 shadow-sm border border-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 hover:shadow-sm border border-transparent'
                        }`}
                        title={bookmarkedEntries.has(selectedEntry.id) ? '북마크 해제' : '북마크 추가'}
                      >
                        {bookmarkedEntries.has(selectedEntry.id) ? 
                          <BookmarkCheck className="w-4 h-4" /> : 
                          <Bookmark className="w-4 h-4" />
                        }
                        <span className="text-sm">북마크</span>
                      </button>

                      <button
                        onClick={() => handleShare(selectedEntry)}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all duration-200 border border-transparent"
                        title="공유하기"
                      >
                        <Share className="w-4 h-4" />
                        <span className="text-sm">공유</span>
                      </button>
                    </div>
                  )}

                  {/* 댓글 섹션 */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>댓글 ({comments.length})</span>
                      </h3>
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      >
                        <span>{showComments ? '숨기기' : '댓글 보기'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showComments ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showComments && (
                      <div className="space-y-4">
                        {/* 댓글 작성 */}
                        {currentUser && (
                          <div className="flex space-x-3 mb-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                              />
                            </div>
                            <button
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                              title="댓글 작성"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* 댓글 목록 */}
                        <div className="space-y-3">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-900">{comment.author_nickname}</span>
                                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="text-gray-700 text-sm">{comment.content}</p>
                            </div>
                          ))}
                          {comments.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">아직 댓글이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 공유 모달 */}
      <AnimatePresence>
        {showShareModal && shareData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">게시글 공유</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">링크</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={shareData.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(shareData.url)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700"
                    >
                      복사
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`, '_blank')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <span>트위터</span>
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span>페이스북</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
