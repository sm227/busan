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
import Comments from './Comments';

// 태그 처리 헬퍼 함수 (전역)
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
  category: 'experience' | 'review' | 'tip' | 'question';
  property_id?: string;
  tags?: string | string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_nickname: string;
  user_id: number;
}

interface CommunityProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
}

export default function Community({ onBack, currentUser }: CommunityProps) {
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'experience' | 'review' | 'tip' | 'question'>('all');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CommunityEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<CommunityEntry | null>(null);
  const [likedEntries, setLikedEntries] = useState<Set<number>>(new Set());
  
  // 고급 필터 상태
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'comments_count' | 'latest_comment' | 'rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // 커뮤니티 글 목록 불러오기
  const loadEntries = async () => {
    try {
      setLoading(true);
      
      // URL 파라미터 구성
      const params = new URLSearchParams();
      
      if (activeTab !== 'all') params.append('category', activeTab);
      if (searchTerm) params.append('search', searchTerm);
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
        
        // 현재 사용자가 좋아요한 글들 확인
        if (currentUser && data.data) {
          loadLikedEntries(data.data);
        }
      }
    } catch (error) {
      console.error('커뮤니티 글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자가 좋아요한 글들 확인
  const loadLikedEntries = async (entriesData: CommunityEntry[]) => {
    if (!currentUser) return;
    
    try {
      const likedSet = new Set<number>();
      
      for (const entry of entriesData) {
        const response = await fetch(`/api/community/likes?userId=${currentUser.id}&entryId=${entry.id}`);
        const data = await response.json();
        
        if (data.success && data.isLiked) {
          likedSet.add(entry.id);
        }
      }
      
      setLikedEntries(likedSet);
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [activeTab, searchTerm, locationFilter, tagFilter, minRatingFilter, sortBy, sortOrder]);

  // 좋아요 처리
  const handleLike = async (entryId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch('/api/community/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: currentUser.id,
          entryId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 좋아요 상태 업데이트
        const newLikedEntries = new Set(likedEntries);
        if (data.action === 'added') {
          newLikedEntries.add(entryId);
          // 좋아요 수 증가
          setEntries(prev => prev.map(entry => 
            entry.id === entryId 
              ? { ...entry, likes_count: entry.likes_count + 1 }
              : entry
          ));
        } else {
          newLikedEntries.delete(entryId);
          // 좋아요 수 감소
          setEntries(prev => prev.map(entry => 
            entry.id === entryId 
              ? { ...entry, likes_count: Math.max(0, entry.likes_count - 1) }
              : entry
          ));
        }
        setLikedEntries(newLikedEntries);
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 수정 처리
  const handleEdit = (entry: CommunityEntry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setShowWriteForm(true);
  };

  // 삭제 처리
  const handleDelete = async (entryId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/community?entryId=${entryId}&userId=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 목록 새로고침
        loadEntries();
        // 상세보기에서 메인으로 돌아가기
        setSelectedEntry(null);
        alert('글이 성공적으로 삭제되었습니다.');
      } else {
        const data = await response.json();
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return <BookOpen className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'tip': return <Award className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  // 카테고리 이름
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'experience': return '이주 경험';
      case 'review': return '후기';
      case 'tip': return '팁';
      case 'question': return '질문';
      default: return '전체';
    }
  };

  // 검색 필터링 (제목, 내용, 작성자, 태그 포함)
  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    
    // 기본 검색 (제목, 내용, 작성자)
    const basicMatch = 
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.author_nickname.toLowerCase().includes(searchLower);
    
    // 태그 검색 (헬퍼 함수 사용)
    const tagArray = getTagArray(entry.tags);
    const tagMatch = tagArray.some(tag => 
      tag.toLowerCase().includes(searchLower)
    );
    
    return basicMatch || tagMatch;
  });

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
      />
    ));
  };

  if (showWriteForm) {
    return (
      <CommunityWriteForm
        onBack={() => {
          setShowWriteForm(false);
          setEditingEntry(null);
        }}
        onSubmit={() => {
          setShowWriteForm(false);
          setEditingEntry(null);
          loadEntries();
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
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
                 <div className="flex items-center justify-between mb-4">
           <button
             onClick={onBack}
             className="back-button"
           >
             <ArrowLeft className="w-4 h-4" />
             <span>홈으로</span>
           </button>
          
          <h1 className="text-xl font-bold text-gray-900">빈집다방 커뮤니티</h1>
          
          {currentUser && (
                          <button
                onClick={() => setShowWriteForm(true)}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium smooth-hover"
              >
              <Plus className="w-4 h-4" />
              <span>글쓰기</span>
            </button>
          )}
        </div>

        {/* 검색바 및 고급 필터 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="제목, 내용, 작성자, 태그로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg border transition-colors ${
                showAdvancedFilters || locationFilter || tagFilter || minRatingFilter || sortBy !== 'created_at'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">필터</span>
            </button>
          </div>

          {/* 고급 필터 */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-lg p-4 space-y-4"
              >
                {/* 첫 번째 줄: 지역, 태그 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                    <input
                      type="text"
                      placeholder="예: 강원도, 제주도..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                    <input
                      type="text"
                      placeholder="예: 농사, 창업, 이주..."
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* 두 번째 줄: 평점, 정렬 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">최소 평점</label>
                    <select
                      value={minRatingFilter}
                      onChange={(e) => setMinRatingFilter(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value={0}>모든 평점</option>
                      <option value={1}>⭐ 1점 이상</option>
                      <option value={2}>⭐ 2점 이상</option>
                      <option value={3}>⭐ 3점 이상</option>
                      <option value={4}>⭐ 4점 이상</option>
                      <option value={5}>⭐ 5점만</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">정렬 기준</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="created_at">최신순</option>
                      <option value="likes_count">좋아요순</option>
                      <option value="comments_count">댓글순</option>
                      <option value="latest_comment">최신 댓글순</option>
                      <option value="rating">평점순</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">정렬 방향</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                        className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        {sortOrder === 'DESC' ? (
                          <SortDesc className="w-4 h-4" />
                        ) : (
                          <SortAsc className="w-4 h-4" />
                        )}
                        <span>{sortOrder === 'DESC' ? '내림차순' : '오름차순'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 필터 초기화 버튼 */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setLocationFilter('');
                      setTagFilter('');
                      setMinRatingFilter(0);
                      setSortBy('created_at');
                      setSortOrder('DESC');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    필터 초기화
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['all', 'experience', 'review', 'tip', 'question'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === category
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getCategoryIcon(category)}
              <span>{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 커뮤니티 글 목록 */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {searchTerm ? '검색 결과가 없습니다' : '아직 작성된 글이 없습니다'}
            </p>
            {!searchTerm && currentUser && (
              <button
                onClick={() => setShowWriteForm(true)}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                첫 번째 글을 작성해보세요!
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: Math.min(index * 0.05, 0.3),
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer card-hover"
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        entry.category === 'experience' ? 'bg-blue-100 text-blue-600' :
                        entry.category === 'review' ? 'bg-amber-100 text-amber-600' :
                        entry.category === 'tip' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {getCategoryIcon(entry.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                          {entry.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{entry.author_nickname}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {entry.rating && (
                      <div className="flex items-center space-x-1">
                        {renderStars(entry.rating)}
                      </div>
                    )}
                  </div>

                  {/* 위치 */}
                  {entry.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.location}</span>
                    </div>
                  )}

                  {/* 내용 미리보기 */}
                  <p className="text-gray-700 line-clamp-2 mb-4">
                    {entry.content}
                  </p>

                  {/* 태그 */}
                  {(() => {
                    const tagArray = getTagArray(entry.tags);
                    return tagArray.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tagArray.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                        {tagArray.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{tagArray.length - 3}개 더
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {/* 좋아요 및 댓글 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(entry.id);
                        }}
                        className={`flex items-center space-x-1 transition-colors ${
                          likedEntries.has(entry.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            likedEntries.has(entry.id) ? 'fill-current' : ''
                          }`} 
                        />
                        <span className="text-sm">{entry.likes_count}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{entry.comments_count || 0}</span>
                      </div>
                    </div>
                    
                    <span className="text-xs text-emerald-600 font-medium">
                      {getCategoryName(entry.category)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// 커뮤니티 글 작성 폼 컴포넌트
interface CommunityWriteFormProps {
  onBack: () => void;
  onSubmit: () => void;
  editingEntry?: CommunityEntry | null;
  currentUser?: { id: number; nickname: string } | null;
}

function CommunityWriteForm({ onBack, onSubmit, editingEntry, currentUser }: CommunityWriteFormProps) {
  const [formData, setFormData] = useState({
    title: editingEntry?.title || '',
    content: editingEntry?.content || '',
    location: editingEntry?.location || '',
    rating: editingEntry?.rating || 0,
    category: (editingEntry?.category || 'experience') as 'experience' | 'review' | 'tip' | 'question',
    tags: editingEntry?.tags ? getTagArray(editingEntry.tags) : [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 수정 모드인지 확인
  const isEditing = !!editingEntry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const url = '/api/community';
      const method = isEditing ? 'PUT' : 'POST';
      const bodyData = isEditing ? {
        entryId: editingEntry!.id,
        userId: currentUser.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        location: formData.location.trim() || undefined,
        rating: formData.rating || undefined,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      } : {
        userId: currentUser.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        location: formData.location.trim() || undefined,
        rating: formData.rating || undefined,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditing ? '커뮤니티 글이 성공적으로 수정되었습니다!' : '커뮤니티 글이 성공적으로 작성되었습니다!');
        onSubmit();
      } else {
        alert(data.error || (isEditing ? '수정에 실패했습니다.' : '작성에 실패했습니다.'));
      }
    } catch (error) {
      console.error(isEditing ? '커뮤니티 글 수정 실패:' : '커뮤니티 글 작성 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">글 작성</h1>
          <div className="w-16" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            카테고리
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'experience', label: '이주 경험', icon: <BookOpen className="w-4 h-4" /> },
              { value: 'review', label: '후기', icon: <Star className="w-4 h-4" /> },
              { value: 'tip', label: '팁', icon: <Award className="w-4 h-4" /> },
              { value: 'question', label: '질문', icon: <HelpCircle className="w-4 h-4" /> }
            ].map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                className={`flex items-center space-x-2 p-3 border-2 rounded-lg transition-colors ${
                  formData.category === category.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="제목을 입력해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100자
          </p>
        </div>

        {/* 위치 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            위치 (선택)
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="예: 강원도 홍천군"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* 평점 (후기일 때만) */}
        {formData.category === 'review' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점
            </label>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={i < formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating > 0 ? `${formData.rating}점` : '평점을 선택해주세요'}
              </span>
            </div>
          </div>
        )}

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="이주 경험이나 후기를 자세히 작성해주세요"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            maxLength={2000}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.content.length}/2000자
          </p>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그 (선택)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="태그를 입력하고 엔터를 눌러주세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              추가
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
                      <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 font-medium smooth-hover"
            >
            {submitting ? '작성 중...' : '작성 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}

// 커뮤니티 글 상세보기 컴포넌트
interface CommunityDetailProps {
  entry: CommunityEntry;
  onBack: () => void;
  onLike: (entryId: number) => void;
  onEdit?: (entry: CommunityEntry) => void;
  onDelete?: (entryId: number) => void;
  currentUser?: { id: number; nickname: string } | null;
}

function CommunityDetail({ entry, onBack, onLike, onEdit, onDelete, currentUser }: CommunityDetailProps) {
  // 작성자인지 확인
  const isAuthor = currentUser && currentUser.id === entry.user_id;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(entry.likes_count);

  // 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch(`/api/community/likes?userId=${currentUser.id}&entryId=${entry.id}`);
        const data = await response.json();
        
        if (data.success) {
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      }
    };
    
    checkLikeStatus();
  }, [currentUser, entry.id]);
  

  const handleEdit = () => {
    onEdit?.(entry);
  };

  const handleDelete = () => {
    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
      onDelete?.(entry.id);
    }
  };

  // 좋아요 처리
  const handleDetailLike = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch('/api/community/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: currentUser.id,
          entryId: entry.id 
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.action === 'added') {
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        } else {
          setIsLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
        // 부모 컴포넌트의 onLike도 호출하여 목록 업데이트
        onLike(entry.id);
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
      />
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return <BookOpen className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'tip': return <Award className="w-5 h-5" />;
      case 'question': return <HelpCircle className="w-5 h-5" />;
      default: return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'experience': return '이주 경험';
      case 'review': return '후기';
      case 'tip': return '팁';
      case 'question': return '질문';
      default: return '글';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 text-center flex-1 px-4 line-clamp-1">
            {entry.title}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 내용 */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 글 정보 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                entry.category === 'experience' ? 'bg-blue-100 text-blue-600' :
                entry.category === 'review' ? 'bg-amber-100 text-amber-600' :
                entry.category === 'tip' ? 'bg-emerald-100 text-emerald-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {getCategoryIcon(entry.category)}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900">{entry.author_nickname}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {getCategoryName(entry.category)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{formatDate(entry.created_at)}</p>
              </div>
            </div>
            
            {entry.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(entry.rating)}
                <span className="text-sm text-gray-600 ml-1">{entry.rating}점</span>
              </div>
            )}
          </div>

          {/* 위치 */}
          {entry.location && (
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{entry.location}</span>
            </div>
          )}

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
            {entry.title}
          </h1>

          {/* 내용 */}
          <div className="prose prose-gray max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>

          {/* 태그 */}
          {(() => {
            const tagArray = getTagArray(entry.tags);
            return tagArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tagArray.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            );
          })()}

          {/* 좋아요 버튼 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleDetailLike}
              className={`flex items-center space-x-2 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likesCount}</span>
              <span className="text-sm">좋아요</span>
            </button>

            {/* 작성자 옵션 (본인 글일 때) */}
            {currentUser && currentUser.id === entry.user_id && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleEdit}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">수정</span>
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">삭제</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 댓글 섹션 */}
        <div className="mt-6">
          <Comments 
            guestbookId={entry.id}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}
