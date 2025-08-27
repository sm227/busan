'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Reply, 
  Edit3, 
  Trash2, 
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  author_nickname: string;
  user_id: number;
  parent_id?: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

interface CommentsProps {
  guestbookId: number;
  currentUser?: { id: number; nickname: string } | null;
}

export default function Comments({ guestbookId, currentUser }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // 댓글 목록 불러오기
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/comments?guestbookId=${guestbookId}`);
      const data = await response.json();
      
      console.log('댓글 API 응답:', data);
      
      if (data.success) {
        console.log('로드된 댓글들:', data.data);
        setComments(data.data || []);
        
        // 현재 사용자가 좋아요한 댓글들 확인
        if (currentUser && data.data) {
          loadLikedComments(data.data);
        }
      }
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자가 좋아요한 댓글들 확인
  const loadLikedComments = async (commentsData: Comment[]) => {
    if (!currentUser) return;
    
    try {
      const likedSet = new Set<number>();
      
      for (const comment of commentsData) {
        const response = await fetch(`/api/community/comments/likes?userId=${currentUser.id}&commentId=${comment.id}`);
        const data = await response.json();
        
        if (data.success && data.isLiked) {
          likedSet.add(comment.id);
        }
      }
      
      setLikedComments(likedSet);
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [guestbookId]);

  // 댓글 작성
  const handleAddComment = async (content: string, parentId?: number) => {
    if (!currentUser || !content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestbookId,
          userId: currentUser.id,
          content: content.trim(),
          parentId
        })
      });

      const data = await response.json();
      if (data.success) {
        if (parentId) {
          setReplyingTo(null);
          setReplyContent('');
        } else {
          setNewComment('');
        }
        await loadComments();
      } else {
        alert(data.error || '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 수정
  const handleEditComment = async (commentId: number, content: string) => {
    if (!currentUser || !content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/community/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          userId: currentUser.id,
          content: content.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditingComment(null);
        setEditContent('');
        await loadComments();
      } else {
        alert(data.error || '댓글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser) return;

    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/community/comments?commentId=${commentId}&userId=${currentUser.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadComments();
      } else {
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      console.log('댓글 좋아요 요청:', { userId: currentUser.id, commentId });
      
      const response = await fetch('/api/community/comments/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          commentId
        })
      });

      console.log('댓글 좋아요 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('댓글 좋아요 실패 응답:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('댓글 좋아요 응답 데이터:', data);
      
      if (data.success) {
        const newLikedComments = new Set(likedComments);
        if (data.action === 'added') {
          newLikedComments.add(commentId);
        } else {
          newLikedComments.delete(commentId);
        }
        setLikedComments(newLikedComments);
        
        // 댓글 목록 새로고침
        await loadComments();
      } else {
        console.error('댓글 좋아요 실패:', data.error);
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 댓글을 계층 구조로 정리
  const organizeComments = (comments: Comment[]) => {
    const parentComments = comments.filter(comment => !comment.parent_id);
    const childComments = comments.filter(comment => comment.parent_id);

    return parentComments.map(parent => ({
      ...parent,
      children: childComments.filter(child => child.parent_id === parent.id)
    }));
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">
            댓글 ({comments.length})
          </h3>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>{showComments ? '숨기기' : '보기'}</span>
          {showComments ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {showComments && (
        <>
          {/* 댓글 작성 */}
          {currentUser && (
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500자
                    </span>
                    <button
                      onClick={() => handleAddComment(newComment)}
                      disabled={!newComment.trim() || submitting}
                      className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>작성</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 댓글 목록 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>아직 댓글이 없습니다.</p>
              {currentUser && (
                <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {organizedComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {/* 부모 댓글 */}
                    <CommentItem
                      comment={comment}
                      currentUser={currentUser}
                      isLiked={likedComments.has(comment.id)}
                      onLike={() => handleLikeComment(comment.id)}
                      onReply={() => setReplyingTo(comment.id)}
                      onEdit={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      onDelete={() => handleDeleteComment(comment.id)}
                      isEditing={editingComment === comment.id}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      onSaveEdit={(content) => handleEditComment(comment.id, content)}
                      onCancelEdit={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      formatDate={formatDate}
                      submitting={submitting}
                    />

                    {/* 대댓글들 */}
                    {comment.children && comment.children.length > 0 && (
                      <div className="ml-8 space-y-3 border-l-2 border-gray-100 pl-4">
                        {comment.children.map((childComment) => (
                          <CommentItem
                            key={childComment.id}
                            comment={childComment}
                            currentUser={currentUser}
                            isLiked={likedComments.has(childComment.id)}
                            onLike={() => handleLikeComment(childComment.id)}
                            onEdit={() => {
                              setEditingComment(childComment.id);
                              setEditContent(childComment.content);
                            }}
                            onDelete={() => handleDeleteComment(childComment.id)}
                            isEditing={editingComment === childComment.id}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            onSaveEdit={(content) => handleEditComment(childComment.id, content)}
                            onCancelEdit={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                            formatDate={formatDate}
                            submitting={submitting}
                            isReply={true}
                          />
                        ))}
                      </div>
                    )}

                    {/* 답글 작성 */}
                    {replyingTo === comment.id && currentUser && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-8 mt-3"
                      >
                        <div className="flex space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`@${comment.author_nickname}님에게 답글...`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {replyContent.length}/500자
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent('');
                                  }}
                                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => handleAddComment(replyContent, comment.id)}
                                  disabled={!replyContent.trim() || submitting}
                                  className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>답글</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 개별 댓글 컴포넌트
interface CommentItemProps {
  comment: Comment;
  currentUser?: { id: number; nickname: string } | null;
  isLiked: boolean;
  onLike: () => void;
  onReply?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editContent: string;
  setEditContent: (content: string) => void;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
  formatDate: (date: string) => string;
  submitting: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  currentUser,
  isLiked,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
  formatDate,
  submitting,
  isReply = false
}: CommentItemProps) {
  const isAuthor = currentUser && currentUser.id === comment.user_id;

  return (
    <div className="flex space-x-3">
      <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0`}>
        <User className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`font-medium text-gray-900 ${isReply ? 'text-sm' : ''}`}>
                {comment.author_nickname}
              </span>
              <span className={`text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}>
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(수정됨)</span>
              )}
            </div>
            
            {isAuthor && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={onEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={2}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {editContent.length}/500자
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={onCancelEdit}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => onSaveEdit(editContent)}
                    disabled={!editContent.trim() || submitting}
                    className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className={`text-gray-700 whitespace-pre-wrap ${isReply ? 'text-sm' : ''}`}>
              {comment.content}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-2">
          <button
            onClick={() => {
              console.log('좋아요 버튼 클릭 - 댓글 ID:', comment.id, '댓글 내용:', comment.content);
              onLike();
            }}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likes_count}</span>
          </button>
          
          {onReply && !isReply && currentUser && (
            <button
              onClick={onReply}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>답글</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
