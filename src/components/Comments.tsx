'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Reply, Edit3, Trash2, Send, MessageCircle, 
  ChevronDown, ChevronUp, User, MoreHorizontal, X
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

  // ... (API 로직들은 기존과 동일하게 유지 - 생략 없이 사용하시면 됩니다) ...
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/comments?guestbookId=${guestbookId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data || []);
        if (currentUser && data.data) loadLikedComments(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedComments = async (commentsData: Comment[]) => {
    if (!currentUser) return;
    try {
      const likedSet = new Set<number>();
      for (const comment of commentsData) {
        const response = await fetch(`/api/community/comments/likes?userId=${currentUser.id}&commentId=${comment.id}`);
        const data = await response.json();
        if (data.success && data.isLiked) likedSet.add(comment.id);
      }
      setLikedComments(likedSet);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadComments(); }, [guestbookId]);

  const handleAddComment = async (content: string, parentId?: number) => {
    if (!currentUser || !content.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestbookId, userId: currentUser.id, content: content.trim(), parentId })
      });
      const data = await response.json();
      if (data.success) {
        if (parentId) { setReplyingTo(null); setReplyContent(''); } 
        else { setNewComment(''); }
        await loadComments();
      }
    } catch (error) { alert('오류가 발생했습니다.'); } 
    finally { setSubmitting(false); }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!currentUser || !content.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/community/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: currentUser.id, content: content.trim() })
      });
      const data = await response.json();
      if (data.success) { setEditingComment(null); setEditContent(''); await loadComments(); }
    } catch (error) { alert('오류가 발생했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser || !confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/community/comments?commentId=${commentId}&userId=${currentUser.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) await loadComments();
    } catch (error) { alert('오류가 발생했습니다.'); }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!currentUser) { alert('로그인이 필요합니다.'); return; }
    try {
      const response = await fetch('/api/community/comments/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, commentId })
      });
      const data = await response.json();
      if (data.success) {
        const newLikedComments = new Set(likedComments);
        if (data.action === 'added') newLikedComments.add(commentId);
        else newLikedComments.delete(commentId);
        setLikedComments(newLikedComments);
        await loadComments();
      }
    } catch (error) { console.error(error); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return diffInHours < 1 ? `${Math.floor(diffInHours * 60)}분 전` : `${Math.floor(diffInHours)}시간 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

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
    <div className="pt-8 border-t border-stone-100">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg text-stone-800">댓글</span>
          <span className="text-sm font-bold text-stone-400">{comments.length}</span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-stone-400 hover:text-stone-600 transition-colors p-1"
        >
          {showComments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 2. Write Input */}
          {currentUser ? (
            <div className="mb-8 bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 text-stone-400">
                   <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="따뜻한 댓글을 남겨주세요..."
                    className="w-full bg-transparent border-none focus:ring-0 text-stone-800 placeholder:text-stone-400 text-sm resize-none p-0 min-h-[60px]"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50">
                    <span className="text-[10px] text-stone-400">{newComment.length}/500</span>
                    <button
                      onClick={() => handleAddComment(newComment)}
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      <span>등록</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-stone-50 rounded-xl text-center text-sm text-stone-500">
               댓글을 작성하려면 로그인이 필요합니다.
            </div>
          )}

          {/* 3. Comment List */}
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"/></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              첫 번째 댓글의 주인공이 되어주세요! 📝
            </div>
          ) : (
            <div className="space-y-6">
              {organizedComments.map((comment) => (
                <div key={comment.id}>
                  {/* Parent Comment */}
                  <CommentItem
                    comment={comment}
                    currentUser={currentUser}
                    isLiked={likedComments.has(comment.id)}
                    onLike={() => handleLikeComment(comment.id)}
                    onReply={() => setReplyingTo(comment.id)}
                    onEdit={() => { setEditingComment(comment.id); setEditContent(comment.content); }}
                    onDelete={() => handleDeleteComment(comment.id)}
                    isEditing={editingComment === comment.id}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    onSaveEdit={(content) => handleEditComment(comment.id, content)}
                    onCancelEdit={() => { setEditingComment(null); setEditContent(''); }}
                    formatDate={formatDate}
                    submitting={submitting}
                  />

                  {/* Child Comments (Replies) */}
                  <div className="pl-6 ml-4 border-l-2 border-stone-100 mt-4 space-y-4">
                    {comment.children?.map((child) => (
                      <CommentItem
                        key={child.id}
                        comment={child}
                        currentUser={currentUser}
                        isLiked={likedComments.has(child.id)}
                        onLike={() => handleLikeComment(child.id)}
                        onEdit={() => { setEditingComment(child.id); setEditContent(child.content); }}
                        onDelete={() => handleDeleteComment(child.id)}
                        isEditing={editingComment === child.id}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        onSaveEdit={(content) => handleEditComment(child.id, content)}
                        onCancelEdit={() => { setEditingComment(null); setEditContent(''); }}
                        formatDate={formatDate}
                        submitting={submitting}
                        isReply={true}
                      />
                    ))}

                    {/* Reply Input Form */}
                    <AnimatePresence>
                      {replyingTo === comment.id && currentUser && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-stone-50 rounded-xl p-3 border border-stone-200 mt-2"
                        >
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`@${comment.author_nickname}님에게 답글 작성...`}
                            className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-400 resize-none outline-none p-1 min-h-[50px]"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                              className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
                            >취소</button>
                            <button 
                              onClick={() => handleAddComment(replyContent, comment.id)}
                              disabled={!replyContent.trim() || submitting}
                              className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-stone-700 disabled:opacity-50"
                            >답글 등록</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Comment Item Component (분리)
// ----------------------------------------------------------------------
function CommentItem({
  comment, currentUser, isLiked, onLike, onReply, onEdit, onDelete,
  isEditing, editContent, setEditContent, onSaveEdit, onCancelEdit,
  formatDate, submitting, isReply = false
}: any) {
  const isAuthor = currentUser && currentUser.id === comment.user_id;

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className={`shrink-0 rounded-full flex items-center justify-center bg-stone-100 text-stone-400 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
         <User className={isReply ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Meta Info */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-stone-800">{comment.author_nickname}</span>
          <span className="text-xs text-stone-400">{formatDate(comment.created_at)}</span>
          {comment.updated_at !== comment.created_at && <span className="text-[10px] text-stone-300">(수정됨)</span>}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <div className="bg-white border border-orange-200 rounded-xl p-3 shadow-sm">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-sm text-stone-700 resize-none outline-none p-0 bg-transparent min-h-[60px]"
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-orange-100">
              <button onClick={onCancelEdit} className="text-xs text-stone-400 hover:text-stone-600">취소</button>
              <button onClick={() => onSaveEdit(editContent)} className="text-xs text-orange-600 font-bold hover:text-orange-700">완료</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2">
          {/* Like */}
          <button 
            onClick={onLike}
            className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-orange-500 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likes_count > 0 ? comment.likes_count : '좋아요'}</span>
          </button>

          {/* Reply */}
          {onReply && !isReply && currentUser && (
            <button 
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>답글달기</span>
            </button>
          )}

          {/* Edit/Delete (More options) */}
          {isAuthor && !isEditing && (
             <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="text-stone-400 hover:text-stone-600 p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={onDelete} className="text-stone-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}