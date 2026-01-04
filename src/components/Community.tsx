'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Heart, Star, MapPin, Calendar, User,
  MessageCircle, BookOpen, HelpCircle, Award, Filter, Search,
  Edit3, Trash2, X, SortAsc, SortDesc, PenTool, Bookmark, BookmarkCheck, Share, Send, Briefcase
} from 'lucide-react';
import Comments from './Comments';
import { occupations } from '@/data/occupations';
import OccupationSelector from './OccupationSelector';
import HobbySelector from './HobbySelector';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';

// 태그 처리 헬퍼 함수
const getTagArray = (tags: string | string[] | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').filter(tag => tag.trim());
  return [];
};

interface CommunityEntry {
  id: number;
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question' | 'occupation-post' | 'hobby-post';
  property_id?: string;
  tags?: string | string[];
  occupation_tag?: string;
  hobby_style_tag?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_nickname: string;
  user_id: number;
  activity_type?: 'written' | 'liked' | 'commented';
  author_occupation?: string;
  author_hobby_style?: string;
}

interface CommunityProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
}

export default function Community({ onBack, currentUser }: CommunityProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'community' | 'chat'>('community');
  const [activeTab, setActiveTab] = useState<'list' | 'write' | 'group' | 'bookmarks' | 'myActivity'>('list');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CommunityEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<CommunityEntry | null>(null);
  const [likedEntries, setLikedEntries] = useState<Set<number>>(new Set());
  const [bookmarkedEntries, setBookmarkedEntries] = useState<Set<number>>(new Set());

  // 채팅 관련 state
  const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);

  // 검색 & 필터 상태
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'comments_count' | 'latest_comment' | 'rating'>('likes_count');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // 공유 상태
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  // 그룹 필터 상태
  const [occupationFilter, setOccupationFilter] = useState<string>(''); // 실제 적용된 필터
  const [occupationInput, setOccupationInput] = useState<string>(''); // 입력창 값
  const [hobbyStyleFilter, setHobbyStyleFilter] = useState<string>('');
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [filteredOccupations, setFilteredOccupations] = useState<string[]>(occupations);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (locationFilter) params.append('location', locationFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (minRatingFilter > 0) params.append('minRating', minRatingFilter.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      params.append('limit', '50');

      const url = `/api/community?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
        if (currentUser && data.data && data.data.length > 0) {
          await loadUserInteractions(data.data);
        } else if (!currentUser) {
          setLikedEntries(new Set());
          setBookmarkedEntries(new Set());
        }
      }
    } catch (error) {
      console.error('커뮤니티 글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async (entries: CommunityEntry[]) => {
    if (!currentUser) return;

    try {
      const likedSet = new Set<number>();
      const bookmarkedSet = new Set<number>();

      for (const entry of entries) {
        // 좋아요 확인
        const likeResponse = await fetch(`/api/community/likes?userId=${currentUser.id}&entryId=${entry.id}`);
        const likeData = await likeResponse.json();
        if (likeData.success && likeData.isLiked) {
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

  const loadBookmarks = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/bookmarks?userId=${currentUser.id}&action=list`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
        // 북마크 목록 로드 후 사용자 인터랙션도 로드
        if (data.data && data.data.length > 0) {
          await loadUserInteractions(data.data);
        }
      }
    } catch (error) {
      console.error('북마크 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyActivity = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/community/my-activity?userId=${currentUser.id}`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
        // 내 활동 로드 후 사용자 인터랙션도 로드
        if (data.data && data.data.length > 0) {
          await loadUserInteractions(data.data);
        }
      }
    } catch (error) {
      console.error('내 활동 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // 그룹 전용 필터: 직업, 취미만
      if (occupationFilter) params.append('occupation', occupationFilter);
      if (hobbyStyleFilter) params.append('hobbyStyle', hobbyStyleFilter);

      // 정렬
      params.append('sortBy', 'likes_count');
      params.append('sortOrder', 'DESC');
      params.append('limit', '50');

      const url = `/api/community/groups?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
        if (currentUser && data.data && data.data.length > 0) {
          await loadUserInteractions(data.data);
        }
      }
    } catch (error) {
      console.error('그룹 필터링 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (entryId: number) => {
    if (!currentUser) return;

    try {
      // 즉시 UI 업데이트 (Optimistic Update)
      const newLikedEntries = new Set(likedEntries);
      const wasLiked = likedEntries.has(entryId);

      if (wasLiked) {
        newLikedEntries.delete(entryId);
      } else {
        newLikedEntries.add(entryId);
      }
      setLikedEntries(newLikedEntries);

      // entries 배열에서 해당 항목의 likes_count 즉시 업데이트
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === entryId
            ? { ...entry, likes_count: entry.likes_count + (wasLiked ? -1 : 1) }
            : entry
        )
      );

      // selectedEntry도 업데이트 (상세 보기에서 좋아요 누를 때)
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry({
          ...selectedEntry,
          likes_count: selectedEntry.likes_count + (wasLiked ? -1 : 1)
        });
      }

      // 서버에 요청
      const response = await fetch('/api/community/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, entryId })
      });

      const data = await response.json();
      if (!data.success) {
        // 실패 시 롤백
        setLikedEntries(likedEntries);
        setEntries(prevEntries =>
          prevEntries.map(entry =>
            entry.id === entryId
              ? { ...entry, likes_count: entry.likes_count + (wasLiked ? 1 : -1) }
              : entry
          )
        );
        if (selectedEntry && selectedEntry.id === entryId) {
          setSelectedEntry({
            ...selectedEntry,
            likes_count: selectedEntry.likes_count + (wasLiked ? 1 : -1)
          });
        }
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      // 에러 시 롤백
      const wasLiked = !likedEntries.has(entryId);
      setLikedEntries(likedEntries);
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === entryId
            ? { ...entry, likes_count: entry.likes_count + (wasLiked ? 1 : -1) }
            : entry
        )
      );
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry({
          ...selectedEntry,
          likes_count: selectedEntry.likes_count + (wasLiked ? 1 : -1)
        });
      }
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

        // 북마크 탭에서는 목록 새로고침
        if (activeTab === 'bookmarks') {
          await loadBookmarks();
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
    }
  };

  const handleShare = async (entry: CommunityEntry) => {
    const url = `${window.location.origin}/community?entryId=${entry.id}`;
    setShareData({
      title: entry.title,
      url: url
    });
    setShowShareModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleEdit = (entry: CommunityEntry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setShowWriteForm(true);
  };

  const handleDelete = async (entryId: number) => {
    if (!currentUser) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/community?entryId=${entryId}&userId=${currentUser.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setSelectedEntry(null);
        if (activeTab === 'list') {
          await loadEntries();
        } else if (activeTab === 'myActivity') {
          await loadMyActivity();
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // URL 쿼리 파라미터에서 초기 탭 설정
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['list', 'write', 'bookmarks', 'myActivity'].includes(tabParam)) {
        setActiveTab(tabParam as 'list' | 'write' | 'bookmarks' | 'myActivity');
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    // 채팅 탭일 때는 데이터 로딩 불필요
    if (mainTab === 'chat') return;

    if (activeTab === 'list') {
      loadEntries();
    } else if (activeTab === 'group') {
      loadGroupEntries();
    } else if (activeTab === 'bookmarks') {
      loadBookmarks();
    } else if (activeTab === 'myActivity') {
      loadMyActivity();
    }
  }, [mainTab, activeTab, searchTerm, selectedCategory, locationFilter, tagFilter, minRatingFilter, sortBy, sortOrder, occupationFilter, hobbyStyleFilter, currentUser, isInitialized]);

  // UI 헬퍼 함수
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return <BookOpen className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'tip': return <Award className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      case 'occupation-post': return <Briefcase className="w-4 h-4" />;
      case 'hobby-post': return <Heart className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getHobbyLabel = (value: string | undefined) => {
    const hobbyMap: Record<string, string> = {
      'nature-lover': '자연 활동',
      'culture-enthusiast': '문화 체험',
      'sports-fan': '스포츠',
      'crafts-person': '공예/텃밭'
    };
    return value ? hobbyMap[value] || value : '';
  };

  const getCategoryName = (category: string, entry?: CommunityEntry) => {
    switch (category) {
      case 'experience': return '이주 경험';
      case 'review': return '솔직 후기';
      case 'tip': return '꿀팁 공유';
      case 'question': return '질문있어요';
      case 'occupation-post':
        return entry?.occupation_tag ? `직업별: ${entry.occupation_tag}` : '직업별';
      case 'hobby-post':
        return entry?.hobby_style_tag ? `취미별: ${getHobbyLabel(entry.hobby_style_tag)}` : '취미별';
      default: return '전체보기';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'} />
    ));
  };

  const getActivityBadge = (type?: string) => {
    switch (type) {
      case 'written':
        return <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">작성</span>;
      case 'liked':
        return <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">좋아요</span>;
      case 'commented':
        return <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">댓글</span>;
      default:
        return null;
    }
  };

  // 조건부 렌더링 (채팅방, 글쓰기, 상세보기)
  if (selectedChatRoom && currentUser) {
    return (
      <ChatRoom
        room={selectedChatRoom}
        currentUser={currentUser}
        onBack={() => setSelectedChatRoom(null)}
      />
    );
  }

  if (showWriteForm) {
    return (
      <CommunityWriteForm
        onBack={() => { setShowWriteForm(false); setEditingEntry(null); }}
        onSubmit={() => {
          setShowWriteForm(false);
          setEditingEntry(null);
          if (activeTab === 'list') {
            loadEntries();
          } else if (activeTab === 'myActivity') {
            loadMyActivity();
          }
        }}
        editingEntry={editingEntry}
        currentUser={currentUser}
      />
    );
  }

  if (selectedEntry) {
    return (
      <CommunityDetail
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
        onLike={handleLike}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBookmark={handleBookmark}
        onShare={handleShare}
        currentUser={currentUser}
        isLiked={likedEntries.has(selectedEntry.id)}
        isBookmarked={bookmarkedEntries.has(selectedEntry.id)}
      />
    );
  }

  // 메인 UI 렌더링
  return (
    <div className="min-h-screen bg-white font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col">

        {/* 1. Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-stone-600" />
            </button>
            <h1 className="font-serif font-bold text-xl text-stone-800">마을회관</h1>

            {/* 작성 버튼 */}
            {currentUser && (
              <button
                onClick={() => setShowWriteForm(true)}
                className="p-2 -mr-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
                aria-label="글 작성"
              >
                <PenTool className="w-5 h-5" />
              </button>
            )}
            {!currentUser && <div className="w-10" />}
          </div>

          {/* Main Tab Navigation */}
          <div className="flex space-x-1 bg-stone-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setMainTab('community')}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                mainTab === 'community'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              시골생활
            </button>
            <button
              onClick={() => setMainTab('chat')}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                mainTab === 'chat'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              채팅
            </button>
          </div>

          {/* Sub Tab Navigation - 시골생활 탭일 때만 표시 */}
          {mainTab === 'community' && (
            <div className="flex space-x-1 bg-stone-50 rounded-lg p-1 mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'list'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                목록
              </button>
              <button
                onClick={() => setActiveTab('group')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'group'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                그룹
              </button>
              {currentUser && (
                <>
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'bookmarks'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    북마크
                  </button>
                  <button
                    onClick={() => setActiveTab('myActivity')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'myActivity'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    내활동
                  </button>
                </>
              )}
            </div>
          )}

          {/* Search & Filter - only in list tab and community main tab */}
          {mainTab === 'community' && activeTab === 'list' && (
            <>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                   <input
                     type="text"
                     placeholder="검색어를 입력하세요"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-stone-400 transition-colors"
                   />
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    showAdvancedFilters ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                   <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Advanced Filters (Accordion) */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2 space-y-3">
                       <div className="grid grid-cols-2 gap-2">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs"
                          >
                            <option value="">모든 카테고리</option>
                            <option value="experience">이주 경험</option>
                            <option value="review">후기</option>
                            <option value="tip">팁</option>
                            <option value="question">질문</option>
                            <option value="occupation-post">직업별 이야기</option>
                            <option value="hobby-post">취미별 이야기</option>
                          </select>
                          <input
                            type="text"
                            placeholder="지역 (예: 강원)"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs"
                          >
                             <option value="created_at">최신순</option>
                             <option value="likes_count">인기순</option>
                             <option value="comments_count">댓글순</option>
                          </select>
                          <input
                            type="text"
                            placeholder="태그 검색"
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs"
                          />
                       </div>
                       <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setLocationFilter('');
                              setTagFilter('');
                              setSortBy('created_at');
                              setSearchTerm('');
                              setSelectedCategory('');
                            }}
                            className="text-xs text-stone-400 underline hover:text-stone-600"
                          >
                            필터 초기화
                          </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Filter - only in group tab and community main tab */}
          {mainTab === 'community' && activeTab === 'group' && (
            <div className="space-y-3">
              {/* 직업 검색 - 커스텀 autocomplete */}
              <div className="relative">
                <label className="block text-xs font-medium text-stone-600 mb-1.5">직업으로 검색</label>
                <input
                  type="text"
                  placeholder="직업을 입력하거나 선택하세요"
                  value={occupationInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOccupationInput(value);

                    // 검색어에 맞게 직업 목록 필터링
                    if (value.trim() === '') {
                      setFilteredOccupations(occupations);
                    } else {
                      const filtered = occupations.filter(occupation =>
                        occupation.toLowerCase().includes(value.toLowerCase())
                      );
                      setFilteredOccupations(filtered);
                    }
                    setShowOccupationDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && occupationInput.trim()) {
                      setOccupationFilter(occupationInput.trim());
                      setShowOccupationDropdown(false);
                    }
                  }}
                  onFocus={() => setShowOccupationDropdown(true)}
                  onBlur={() => {
                    // 드롭다운 항목 클릭을 위해 약간의 지연
                    setTimeout(() => setShowOccupationDropdown(false), 200);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition-colors"
                />

                {/* 드롭다운 목록 */}
                {showOccupationDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setOccupationInput('');
                        setOccupationFilter('');
                        setFilteredOccupations(occupations);
                        setShowOccupationDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 transition-colors border-b border-stone-100"
                    >
                      <span className="text-stone-400">전체</span>
                    </button>
                    {filteredOccupations.length > 0 ? (
                      filteredOccupations.map((occupation) => (
                        <button
                          key={occupation}
                          onClick={() => {
                            setOccupationInput(occupation);
                            setOccupationFilter(occupation);
                            setShowOccupationDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 transition-colors"
                        >
                          {occupation}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-stone-400">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 취미 필터 */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">취미로 검색</label>
                <select
                  value={hobbyStyleFilter}
                  onChange={(e) => setHobbyStyleFilter(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition-colors"
                >
                  <option value="">전체</option>
                  <option value="nature-lover">등산, 낚시, 산책 등 자연 활동</option>
                  <option value="culture-enthusiast">전통문화 체험, 박물관, 축제</option>
                  <option value="sports-fan">운동, 자전거, 수영 등</option>
                  <option value="crafts-person">도자기, 목공예, 텃밭 가꾸기</option>
                </select>
              </div>

              {/* 초기화 버튼 */}
              {(occupationFilter || hobbyStyleFilter) && (
                <button
                  onClick={() => {
                    setOccupationInput('');
                    setOccupationFilter('');
                    setHobbyStyleFilter('');
                  }}
                  className="w-full px-4 py-2 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
          )}

          {/* Tab Headers - only in community main tab */}
          {mainTab === 'community' && activeTab === 'bookmarks' && (
            <div className="mb-2">
              <h2 className="text-lg font-bold text-stone-800">북마크</h2>
              <p className="text-xs text-stone-400">저장한 글 목록</p>
            </div>
          )}
          {mainTab === 'community' && activeTab === 'myActivity' && (
            <div className="mb-2">
              <h2 className="text-lg font-bold text-stone-800">내 활동</h2>
              <p className="text-xs text-stone-400">내가 작성하거나 상호작용한 글들</p>
            </div>
          )}
        </div>

        {/* 3. Content List */}
        <div className="flex-1 overflow-y-auto bg-[#FDFBF7]">
           {mainTab === 'chat' ? (
             <ChatRoomList
               onSelectRoom={(room) => setSelectedChatRoom(room)}
               currentUser={currentUser}
             />
           ) : activeTab === 'write' && currentUser ? (
             <div className="px-6 py-6">
               <CommunityWriteContent
                 currentUser={currentUser}
                 onSuccess={() => {
                   setActiveTab('list');
                   loadEntries();
                 }}
               />
             </div>
           ) : loading ? (
              <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"/></div>
           ) : entries.length === 0 ? (
              <div className="text-center py-20 text-stone-400 text-sm">
                 {activeTab === 'myActivity' && '아직 활동 내역이 없습니다.'}
                 {activeTab === 'bookmarks' && '북마크한 글이 없습니다.'}
                 {activeTab === 'list' && '작성된 글이 없습니다.'}
                 {activeTab === 'group' && '해당하는 글이 없습니다.'}
              </div>
           ) : (
              <div className="px-6 py-6 relative">
                <div className={`space-y-4 ${!currentUser ? 'filter blur-sm select-none' : ''}`}>
                   {entries.map((entry, idx) => {
                      const isLiked = likedEntries.has(entry.id);
                      const isBookmarked = bookmarkedEntries.has(entry.id);

                    return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedEntry(entry)}
                      className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                    >
                       <div>
                         {/* Card Header */}
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2 items-center">
                               <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  entry.category === 'question' ? 'bg-red-50 text-red-600 border-red-100' :
                                  entry.category === 'tip' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  'bg-stone-50 text-stone-600 border-stone-100'
                               }`}>
                                  {getCategoryName(entry.category, entry)}
                               </span>
                               {entry.location && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-stone-400">
                                     <MapPin className="w-3 h-3" /> {entry.location}
                                  </span>
                               )}
                               {entry.activity_type && getActivityBadge(entry.activity_type)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-400">{formatDate(entry.created_at)}</span>
                              {currentUser && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBookmark(entry.id);
                                    }}
                                    className={`p-1 rounded transition-colors ${
                                      isBookmarked ? 'text-yellow-600' : 'text-stone-300 hover:text-yellow-600'
                                    }`}
                                  >
                                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                  </button>
                                </div>
                              )}
                            </div>
                         </div>

                         {/* Title & Content */}
                         <h3 className="font-bold text-stone-800 text-base mb-1 line-clamp-1">{entry.title}</h3>
                         <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">{entry.content}</p>

                         {/* Footer Info */}
                         <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                               <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center">
                                  <User className="w-3 h-3 text-stone-400" />
                               </div>
                               <span>{entry.author_nickname}</span>
                            </div>
                            <div className="flex gap-3 text-xs text-stone-400">
                               {currentUser ? (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleLike(entry.id);
                                   }}
                                   className={`flex items-center gap-1 transition-colors ${
                                     isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'
                                   }`}
                                 >
                                   <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} /> {entry.likes_count}
                                 </button>
                               ) : (
                                 <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {entry.likes_count}</span>
                               )}
                               <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {entry.comments_count || 0}</span>
                            </div>
                         </div>
                       </div>
                    </motion.div>
                 )})}
                </div>

                {/* 비로그인 사용자 오버레이 - 전체 리스트에 하나만 */}
                {!currentUser && (
                  <div
                    onClick={() => router.push('/login')}
                    className="absolute inset-0 flex items-start justify-center pt-16 bg-white/30 cursor-pointer hover:bg-white/40 transition-colors z-10"
                  >
                    <div className="text-stone-800 text-sm font-bold bg-white px-4 py-2 rounded-full shadow-lg pointer-events-none">
                      로그인하고 전체 보기 →
                    </div>
                  </div>
                )}
              </div>
           )}
        </div>
      </div>

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
                      className="px-4 py-2 bg-stone-800 text-white rounded-r-lg hover:bg-stone-700"
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

// --- 하위 컴포넌트 (WriteForm & Detail) ---

function CommunityWriteContent({ currentUser, onSuccess }: any) {
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    location: string;
    rating: number;
    category: 'experience' | 'review' | 'tip' | 'question' | 'occupation-post' | 'hobby-post';
    tags: string;
    occupationTag: string;
    hobbyStyleTag: string;
  }>({
    title: '',
    content: '',
    location: '',
    rating: 0,
    category: 'experience',
    tags: '',
    occupationTag: '',
    hobbyStyleTag: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // 검증
    if (formData.category === 'occupation-post' && !formData.occupationTag) {
      alert('직업을 선택해주세요.');
      return;
    }
    if (formData.category === 'hobby-post' && !formData.hobbyStyleTag) {
      alert('취미 스타일을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          occupationTag: formData.category === 'occupation-post' ? formData.occupationTag : null,
          hobbyStyleTag: formData.category === 'hobby-post' ? formData.hobbyStyleTag : null
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
          tags: '',
          occupationTag: '',
          hobbyStyleTag: ''
        });
        onSuccess();
      } else {
        alert(data.error || '글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('글 작성 실패:', error);
      alert('글 작성에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">카테고리</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'experience', icon: '📖', name: '이주 경험' },
              { value: 'review', icon: '⭐', name: '후기' },
              { value: 'tip', icon: '💡', name: '팁' },
              { value: 'question', icon: '❓', name: '질문' },
              { value: 'occupation-post', icon: '💼', name: '직업별 이야기' },
              { value: 'hobby-post', icon: '❤️', name: '취미별 이야기' }
            ].map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  category: category.value as any,
                  occupationTag: category.value === 'occupation-post' ? formData.occupationTag : '',
                  hobbyStyleTag: category.value === 'hobby-post' ? formData.hobbyStyleTag : ''
                })}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.category === category.value
                    ? 'border-stone-800 bg-stone-50 text-stone-800'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-lg mb-1">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 직업 선택 (occupation-post일 때만 표시) */}
        {formData.category === 'occupation-post' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">직업 선택 *</label>
            <OccupationSelector
              value={formData.occupationTag}
              onChange={(val) => setFormData({...formData, occupationTag: val})}
              placeholder="직업을 검색하세요"
            />
          </div>
        )}

        {/* 취미 선택 (hobby-post일 때만 표시) */}
        {formData.category === 'hobby-post' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">취미 스타일 선택 *</label>
            <HobbySelector
              value={formData.hobbyStyleTag}
              onChange={(val) => setFormData({...formData, hobbyStyleTag: val})}
            />
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">제목</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">내용</label>
          <textarea
            required
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 지역 및 평점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">지역 (선택)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="예: 부산광역시 해운대구"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">평점 (선택)</label>
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
            </div>
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">태그 (선택)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            placeholder="쉼표로 구분하여 입력 (예: 이주, 부산, 신혼집)"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            작성하기
          </button>
        </div>
      </form>
    </div>
  );
}

function CommunityWriteForm({ onBack, onSubmit, editingEntry, currentUser }: any) {
   const [formData, setFormData] = useState({
      title: editingEntry?.title || '',
      content: editingEntry?.content || '',
      category: editingEntry?.category || 'experience',
      occupationTag: editingEntry?.occupation_tag || '',
      hobbyStyleTag: editingEntry?.hobby_style_tag || ''
   });

   const handleSubmit = async () => {
     if (!currentUser) return;

     // 검증
     if (formData.category === 'occupation-post' && !formData.occupationTag) {
       alert('직업을 선택해주세요.');
       return;
     }
     if (formData.category === 'hobby-post' && !formData.hobbyStyleTag) {
       alert('취미 스타일을 선택해주세요.');
       return;
     }

     try {
       const response = await fetch('/api/community', {
         method: editingEntry ? 'PUT' : 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           ...(editingEntry ? { entryId: editingEntry.id } : {}),
           userId: currentUser.id,
           ...formData,
           occupationTag: formData.category === 'occupation-post' ? formData.occupationTag : null,
           hobbyStyleTag: formData.category === 'hobby-post' ? formData.hobbyStyleTag : null
         })
       });

       const data = await response.json();
       if (data.success) {
         onSubmit();
       } else {
         alert(data.error || '글 작성/수정에 실패했습니다.');
       }
     } catch (error) {
       console.error('글 작성/수정 실패:', error);
       alert('글 작성/수정에 실패했습니다.');
     }
   };

   return (
      <div className="min-h-screen bg-white font-sans text-stone-800">
         <div className="max-w-md mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
               <button onClick={onBack} className="text-stone-500 hover:text-stone-800">취소</button>
               <h1 className="font-bold text-lg">{editingEntry ? '글 수정' : '글 쓰기'}</h1>
               <button onClick={handleSubmit} className="text-orange-600 font-bold hover:text-orange-700">등록</button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
               <input
                 type="text"
                 placeholder="제목을 입력하세요"
                 className="w-full text-lg font-bold placeholder:text-stone-300 outline-none"
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
               />
               <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                  {['experience', 'review', 'tip', 'question', 'occupation-post', 'hobby-post'].map(cat => (
                     <button
                       key={cat}
                       onClick={() => setFormData({
                         ...formData,
                         category: cat,
                         occupationTag: cat === 'occupation-post' ? formData.occupationTag : '',
                         hobbyStyleTag: cat === 'hobby-post' ? formData.hobbyStyleTag : ''
                       })}
                       className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                          formData.category === cat ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200'
                       }`}
                     >
                        {cat === 'experience' ? '경험담' :
                         cat === 'review' ? '후기' :
                         cat === 'tip' ? '꿀팁' :
                         cat === 'question' ? '질문' :
                         cat === 'occupation-post' ? '직업별' :
                         '취미별'}
                     </button>
                  ))}
               </div>
               {/* 직업 선택 (occupation-post일 때만 표시) */}
               {formData.category === 'occupation-post' && (
                 <div>
                   <OccupationSelector
                     value={formData.occupationTag}
                     onChange={(val) => setFormData({...formData, occupationTag: val})}
                     placeholder="직업을 검색하세요"
                   />
                 </div>
               )}
               {/* 취미 선택 (hobby-post일 때만 표시) */}
               {formData.category === 'hobby-post' && (
                 <div>
                   <HobbySelector
                     value={formData.hobbyStyleTag}
                     onChange={(val) => setFormData({...formData, hobbyStyleTag: val})}
                   />
                 </div>
               )}
               <textarea
                 placeholder="내용을 입력하세요..."
                 className="w-full h-64 resize-none outline-none text-sm leading-relaxed placeholder:text-stone-300"
                 value={formData.content}
                 onChange={e => setFormData({...formData, content: e.target.value})}
               />
            </div>
         </div>
      </div>
   );
}

function CommunityDetail({ entry, onBack, onLike, onEdit, onDelete, onBookmark, onShare, currentUser, isLiked, isBookmarked }: any) {
   return (
      <div className="min-h-screen bg-white font-sans text-stone-800">
         <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-4 border-b border-stone-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
               <button onClick={onBack}><ArrowLeft className="w-6 h-6 text-stone-600" /></button>
               <span className="font-bold text-lg truncate">{entry.title}</span>
            </div>

            <div className="p-6 pb-20">
               {/* Meta Info */}
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                     <User className="w-5 h-5 text-stone-400" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-stone-800">{entry.author_nickname}</p>
                     <p className="text-xs text-stone-400">
                        {new Date(entry.created_at).toLocaleDateString()} · {entry.category}
                     </p>
                  </div>
               </div>

               {/* Content */}
               <div className="prose prose-stone max-w-none mb-8">
                  <p className="text-stone-700 leading-7 whitespace-pre-wrap">{entry.content}</p>
               </div>

               {/* Action buttons */}
               {currentUser && (
                 <div className="flex gap-2 mb-6">
                   <button
                     onClick={() => onBookmark(entry.id)}
                     className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                       isBookmarked ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-white text-stone-600 border-stone-200'
                     }`}
                   >
                     {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                     <span className="text-sm">북마크</span>
                   </button>
                   <button
                     onClick={() => onShare(entry)}
                     className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                   >
                     <Share className="w-4 h-4" />
                     <span className="text-sm">공유</span>
                   </button>
                   {currentUser.id === entry.user_id && (
                     <>
                       <button
                         onClick={() => onEdit(entry)}
                         className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => onDelete(entry.id)}
                         className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white text-red-600 border-red-200 hover:bg-red-50"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </>
                   )}
                 </div>
               )}

               {/* Stats */}
               <div className="flex gap-4 py-4 border-t border-stone-100 text-stone-500 text-sm">
                  {currentUser ? (
                    <button
                      onClick={() => onLike(entry.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-red-500' : 'text-stone-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {entry.likes_count}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {entry.likes_count}</span>
                  )}
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {entry.comments_count || 0}</span>
               </div>

               {/* Comments Section */}
               <div className="mt-6">
                  <Comments guestbookId={entry.id} currentUser={currentUser} />
               </div>
            </div>

            {/* Like FAB
            {currentUser && (
              <button
                 onClick={() => onLike(entry.id)}
                 className={`fixed bottom-6 right-1/2 translate-x-[160px] w-12 h-12 border shadow-lg rounded-full flex items-center justify-center transition-colors z-20 ${
                   isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-stone-400 border-stone-200 hover:text-red-500'
                 }`}
              >
                 <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            )} */}
         </div>
      </div>
   );
}
