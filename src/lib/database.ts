import { prisma } from '@/lib/prisma';
import { badgesData } from '@/data/badgesData';
import { popularPostsData, PopularPostData } from '@/data/popularPostsData';
import { sampleUsersData } from '@/data/sampleUsersData';

// 인메모리 저장소
const postViewsStore = new Map<number, number>(); // postId -> views

// 샘플 사용자 자동 생성 (앱 시작 시)
let sampleUsersInitialized = false;

async function initializeSampleUsers() {
  if (sampleUsersInitialized) return;

  try {
    for (const userData of sampleUsersData) {
      const existing = await prisma.user.findUnique({
        where: { nickname: userData.nickname }
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            nickname: userData.nickname,
            password: userData.password
          }
        });
      }
    }
    sampleUsersInitialized = true;
  } catch (error) {
    console.error('샘플 사용자 초기화 실패:', error);
  }
}

// 모듈 로드 시 자동 실행
initializeSampleUsers();

// ==================== 사용자 인증 ====================

export async function createUser(nickname: string, password: string) {
  try {
    const user = await prisma.user.create({
      data: {
        nickname,
        password
      }
    });

    // 첫 방문 뱃지 자동 지급
    setTimeout(() => {
      checkAndAwardBadges(user.id);
    }, 100);

    return { success: true, userId: user.id };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }
    return { success: false, error: '사용자 생성에 실패했습니다.' };
  }
}

export async function authenticateUser(nickname: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { nickname }
  });

  if (!user || user.password !== password) {
    return null;
  }

  return { id: user.id, nickname: user.nickname };
}

// ==================== 설문 결과 ====================

export async function saveSurveyResult(userId: number, preferences: {
  livingStyle: string;
  socialStyle: string;
  workStyle: string;
  hobbyStyle: string;
  pace: string;
  budget: string;
}) {
  try {
    await prisma.surveyResult.create({
      data: {
        userId,
        livingStyle: preferences.livingStyle,
        socialStyle: preferences.socialStyle,
        workStyle: preferences.workStyle,
        hobbyStyle: preferences.hobbyStyle,
        pace: preferences.pace,
        budget: preferences.budget
      }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: '설문 결과 저장에 실패했습니다.' };
  }
}

export async function getUserSurveyResult(userId: number) {
  const result = await prisma.surveyResult.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return result;
}

// ==================== 관심목록 ====================

export async function saveUserLike(userId: number, property: {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: number;
  matchScore?: number;
}) {
  try {
    await prisma.userLike.create({
      data: {
        userId,
        propertyId: property.propertyId,
        propertyTitle: property.propertyTitle,
        propertyLocation: property.propertyLocation,
        propertyPrice: property.propertyPrice,
        matchScore: property.matchScore
      }
    });

    // 뱃지 조건 확인
    setTimeout(() => {
      checkAndAwardBadges(userId);
    }, 100);

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: '이미 관심목록에 추가된 집입니다.' };
    }
    return { success: false, error: '관심목록 저장에 실패했습니다.' };
  }
}

export async function removeUserLike(userId: number, propertyId: string) {
  try {
    await prisma.userLike.deleteMany({
      where: {
        userId,
        propertyId
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: '관심목록 삭제에 실패했습니다.' };
  }
}

export async function getUserLikes(userId: number) {
  const likes = await prisma.userLike.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return likes;
}

export async function checkUserLike(userId: number, propertyId: string) {
  const like = await prisma.userLike.findFirst({
    where: {
      userId,
      propertyId
    }
  });

  return !!like;
}

// ==================== 방명록 ====================

export async function createGuestbookEntry(userId: number, entry: {
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question';
  propertyId?: string;
  tags?: string[];
}) {
  try {
    const guestbook = await prisma.guestbook.create({
      data: {
        userId,
        title: entry.title,
        content: entry.content,
        location: entry.location,
        rating: entry.rating,
        category: entry.category,
        propertyId: entry.propertyId,
        tags: entry.tags ? JSON.stringify(entry.tags) : null
      }
    });

    // 뱃지 조건 확인
    setTimeout(() => {
      checkAndAwardBadges(userId);
    }, 100);

    return { success: true, entryId: guestbook.id };
  } catch (error) {
    return { success: false, error: '방명록 작성에 실패했습니다.' };
  }
}

interface GuestbookFilters {
  search?: string;
  category?: string;
  location?: string;
  tag?: string;
  minRating?: number;
  sortBy?: 'created_at' | 'likes_count' | 'rating' | 'comments_count' | 'latest_comment';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export async function getGuestbookEntries(filters: GuestbookFilters = {}) {
  const where: any = {};

  // 검색 필터
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { content: { contains: filters.search } },
      { user: { nickname: { contains: filters.search } } }
    ];
  }

  // 카테고리 필터
  if (filters.category) {
    where.category = filters.category;
  }

  // 지역 필터
  if (filters.location) {
    where.location = { contains: filters.location };
  }

  // 태그 필터
  if (filters.tag) {
    where.tags = { contains: `"${filters.tag}"` };
  }

  // 평점 필터
  if (filters.minRating) {
    where.rating = { gte: filters.minRating };
  }

  // 정렬 옵션
  let orderBy: any = {};
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder?.toLowerCase() || 'desc';

  if (sortBy === 'comments_count' || sortBy === 'latest_comment') {
    // comments_count와 latest_comment는 별도 처리 필요
    orderBy = { createdAt: sortOrder };
  } else {
    orderBy = { [sortBy === 'created_at' ? 'createdAt' : sortBy === 'likes_count' ? 'likesCount' : sortBy]: sortOrder };
  }

  const entries = await prisma.guestbook.findMany({
    where,
    include: {
      user: {
        select: {
          nickname: true
        }
      },
      comments: true
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset
  });

  // 결과 포맷팅
  return entries.map(entry => ({
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    content: entry.content,
    location: entry.location,
    rating: entry.rating,
    category: entry.category,
    property_id: entry.propertyId,
    tags: entry.tags,
    likes_count: entry.likesCount,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    author_nickname: entry.user.nickname,
    comments_count: entry.comments.length
  }));
}

export async function getGuestbookEntry(entryId: number) {
  const entry = await prisma.guestbook.findUnique({
    where: { id: entryId },
    include: {
      user: {
        select: {
          id: true,
          nickname: true
        }
      }
    }
  });

  if (!entry) return null;

  return {
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    content: entry.content,
    location: entry.location,
    rating: entry.rating,
    category: entry.category,
    property_id: entry.propertyId,
    tags: entry.tags,
    likes_count: entry.likesCount,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    author_nickname: entry.user.nickname,
    author_id: entry.user.id,
    comments_count: 0 // 이 함수는 comments를 include하지 않음
  };
}

export async function getUserGuestbookEntries(userId: number) {
  const entries = await prisma.guestbook.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          nickname: true
        }
      },
      comments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return entries.map(entry => ({
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    content: entry.content,
    location: entry.location,
    rating: entry.rating,
    category: entry.category,
    property_id: entry.propertyId,
    tags: entry.tags,
    likes_count: entry.likesCount,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    author_nickname: entry.user.nickname,
    comments_count: entry.comments.length
  }));
}

export async function updateGuestbookEntry(entryId: number, userId: number, updates: {
  title?: string;
  content?: string;
  location?: string;
  rating?: number;
  category?: string;
  tags?: string[];
}) {
  try {
    // 권한 확인
    const entry = await prisma.guestbook.findUnique({
      where: { id: entryId }
    });

    if (!entry || entry.userId !== userId) {
      return { success: false, error: '수정 권한이 없습니다.' };
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags);

    await prisma.guestbook.update({
      where: { id: entryId },
      data: updateData
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: '방명록 수정에 실패했습니다.' };
  }
}

export async function deleteGuestbookEntry(entryId: number, userId: number) {
  try {
    // 권한 확인
    const entry = await prisma.guestbook.findUnique({
      where: { id: entryId }
    });

    if (!entry || entry.userId !== userId) {
      return { success: false, error: '삭제 권한이 없습니다.' };
    }

    // 관련 데이터 삭제 (cascade)
    await prisma.$transaction([
      prisma.commentLike.deleteMany({ where: { comment: { guestbookId: entryId } } }),
      prisma.comment.deleteMany({ where: { guestbookId: entryId } }),
      prisma.guestbookLike.deleteMany({ where: { guestbookId: entryId } }),
      prisma.bookmark.deleteMany({ where: { guestbookId: entryId } }),
      prisma.guestbook.delete({ where: { id: entryId } })
    ]);

    return { success: true };
  } catch (error) {
    return { success: false, error: '방명록 삭제에 실패했습니다.' };
  }
}

export async function toggleGuestbookLike(userId: number, entryId: number) {
  try {
    const existingLike = await prisma.guestbookLike.findFirst({
      where: {
        userId,
        guestbookId: entryId
      }
    });

    if (existingLike) {
      // 좋아요 취소
      await prisma.$transaction([
        prisma.guestbookLike.delete({
          where: {
            id: existingLike.id
          }
        }),
        prisma.guestbook.update({
          where: { id: entryId },
          data: {
            likesCount: { decrement: 1 }
          }
        })
      ]);

      return { success: true, action: 'removed', liked: false };
    } else {
      // 좋아요 추가
      await prisma.$transaction([
        prisma.guestbookLike.create({
          data: {
            userId,
            guestbookId: entryId
          }
        }),
        prisma.guestbook.update({
          where: { id: entryId },
          data: {
            likesCount: { increment: 1 }
          }
        })
      ]);

      // 뱃지 조건 확인
      setTimeout(() => {
        checkAndAwardBadges(userId);
      }, 100);

      return { success: true, action: 'added', liked: true };
    }
  } catch (error) {
    console.error('toggleGuestbookLike error:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

export async function checkGuestbookLike(userId: number, entryId: number) {
  const like = await prisma.guestbookLike.findFirst({
    where: {
      userId,
      guestbookId: entryId
    }
  });

  return !!like;
}

// ==================== 댓글 ====================

export async function getComments(guestbookId: number) {
  const comments = await prisma.comment.findMany({
    where: { guestbookId },
    include: {
      user: {
        select: {
          nickname: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return comments.map(comment => ({
    id: comment.id,
    guestbook_id: comment.guestbookId,
    user_id: comment.userId,
    content: comment.content,
    parent_id: comment.parentId,
    likes_count: comment.likesCount,
    created_at: comment.createdAt.toISOString(),
    updated_at: comment.updatedAt.toISOString(),
    author_nickname: comment.user.nickname
  }));
}

export async function createComment(guestbookId: number, userId: number, content: string, parentId?: number) {
  try {
    const comment = await prisma.comment.create({
      data: {
        guestbookId,
        userId,
        content,
        parentId
      }
    });

    return { success: true, commentId: comment.id };
  } catch (error) {
    return { success: false, error: '댓글 작성에 실패했습니다.' };
  }
}

export async function updateComment(commentId: number, userId: number, content: string) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.userId !== userId) {
      return { success: false, error: '수정 권한이 없습니다.' };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: '댓글 수정에 실패했습니다.' };
  }
}

export async function deleteComment(commentId: number, userId: number) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.userId !== userId) {
      return { success: false, error: '삭제 권한이 없습니다.' };
    }

    // 관련 데이터 삭제
    await prisma.$transaction([
      prisma.commentLike.deleteMany({ where: { commentId } }),
      prisma.comment.deleteMany({ where: { parentId: commentId } }),
      prisma.comment.delete({ where: { id: commentId } })
    ]);

    return { success: true };
  } catch (error) {
    return { success: false, error: '댓글 삭제에 실패했습니다.' };
  }
}

export async function toggleCommentLike(userId: number, commentId: number) {
  try {
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        userId,
        commentId
      }
    });

    if (existingLike) {
      // 좋아요 취소
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: {
            id: existingLike.id
          }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: { decrement: 1 }
          }
        })
      ]);

      return { success: true, action: 'removed', liked: false };
    } else {
      // 좋아요 추가
      await prisma.$transaction([
        prisma.commentLike.create({
          data: {
            userId,
            commentId
          }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: { increment: 1 }
          }
        })
      ]);

      return { success: true, action: 'added', liked: true };
    }
  } catch (error) {
    console.error('toggleCommentLike error:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

export async function checkCommentLike(userId: number, commentId: number) {
  const like = await prisma.commentLike.findFirst({
    where: {
      userId,
      commentId
    }
  });

  return !!like;
}

export async function getCommentCount(guestbookId: number) {
  const count = await prisma.comment.count({
    where: { guestbookId }
  });

  return count;
}

// ==================== 북마크 ====================

export async function toggleBookmark(userId: number, guestbookId: number) {
  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_guestbookId: {
          userId,
          guestbookId
        }
      }
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          userId_guestbookId: {
            userId,
            guestbookId
          }
        }
      });

      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          guestbookId
        }
      });

      return { success: true, bookmarked: true };
    }
  } catch (error) {
    return { success: false, error: '북마크 처리에 실패했습니다.' };
  }
}

export async function checkBookmark(userId: number, guestbookId: number) {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_guestbookId: {
        userId,
        guestbookId
      }
    }
  });

  return !!bookmark;
}

export async function getUserBookmarks(userId: number) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      guestbook: {
        include: {
          user: {
            select: {
              nickname: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return bookmarks.map(bookmark => ({
    ...bookmark.guestbook,
    author_nickname: bookmark.guestbook.user.nickname,
    tags: bookmark.guestbook.tags ? JSON.parse(bookmark.guestbook.tags) : []
  }));
}

// ==================== 뱃지 ====================

export async function checkAndAwardBadges(userId: number) {
  const stats = await getUserStats(userId);
  const allBadges = await getAllBadges();

  for (const badge of allBadges) {
    const hasBeadge = await hasUserBadge(userId, badge.id);
    if (hasBeadge) continue;

    let shouldAward = false;

    switch (badge.conditionType) {
      case 'visit_count':
        shouldAward = true; // 첫 방문은 무조건
        break;
      case 'guestbook_count':
        shouldAward = stats.guestbookCount >= badge.conditionValue;
        break;
      case 'likes_received':
        shouldAward = stats.totalLikesReceived >= badge.conditionValue;
        break;
      case 'likes_given':
        shouldAward = stats.likesGiven >= badge.conditionValue;
        break;
      case 'property_liked':
        shouldAward = stats.propertyLikedCount >= badge.conditionValue;
        break;
    }

    if (shouldAward) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      }).catch(() => {
        // 이미 존재하면 무시
      });
    }
  }
}

export async function getUserStats(userId: number) {
  const [guestbookCount, propertyLikedCount, likesGiven, guestbookLikesReceived] = await Promise.all([
    prisma.guestbook.count({ where: { userId } }),
    prisma.recommendation.count({ where: { userId } }), // Recommendation 테이블 사용
    prisma.guestbookLike.count({ where: { userId } }),
    prisma.guestbookLike.count({
      where: {
        guestbook: {
          userId
        }
      }
    })
  ]);

  return {
    guestbookCount,
    propertyLikedCount,
    likesGiven,
    totalLikesReceived: guestbookLikesReceived
  };
}

export async function getUserBadges(userId: number) {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  });

  return userBadges.map(ub => ub.badge);
}

export async function getAllBadges() {
  // JSON 데이터에서 뱃지 목록 반환
  return badgesData.sort((a, b) => a.category.localeCompare(b.category));
}

export async function hasUserBadge(userId: number, badgeId: string) {
  const userBadge = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId
      }
    }
  });

  return !!userBadge;
}

// ==================== 인기 게시글 ====================

export async function getPopularPosts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: 'views' | 'likes' | 'created_at';
}) {
  let posts = [...popularPostsData];

  // 필터링
  if (options?.category) {
    posts = posts.filter(p => p.category === options.category);
  }

  if (options?.featured !== undefined) {
    posts = posts.filter(p => p.featured === options.featured);
  }

  // 정렬
  if (options?.sortBy === 'views') {
    posts.sort((a, b) => {
      const viewsA = postViewsStore.get(a.id) || a.views;
      const viewsB = postViewsStore.get(b.id) || b.views;
      return viewsB - viewsA;
    });
  } else if (options?.sortBy === 'likes') {
    posts.sort((a, b) => b.likes - a.likes);
  } else {
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return posts.slice(0, options?.limit || 10);
}

export async function incrementPostViews(postId: number) {
  try {
    const currentViews = postViewsStore.get(postId) || 0;
    postViewsStore.set(postId, currentViews + 1);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getPopularPost(postId: number) {
  const post = popularPostsData.find(p => p.id === postId);

  if (!post) return null;

  // 조회수가 인메모리에 있으면 그것을 사용
  const currentViews = postViewsStore.get(postId);
  if (currentViews !== undefined) {
    return { ...post, views: currentViews };
  }

  return post;
}

// ==================== 유틸리티 ====================

export function closeDatabase() {
  // Prisma는 자동으로 연결 관리하므로 필요 없음
  // 필요시 prisma.$disconnect() 호출 가능
}

// 하위 호환성을 위한 getDatabase 함수
export function getDatabase() {
  return prisma;
}
