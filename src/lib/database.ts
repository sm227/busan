import { prisma } from '@/lib/prisma';
import { badgesData } from '@/data/badgesData';
import { sampleUsersData } from '@/data/sampleUsersData';
import { uploadSurveyToS3 } from '@/lib/survey-s3-uploader';

// 샘플 사용자 자동 생성 (앱 시작 시)
let sampleUsersInitialized = false;
let badgesInitialized = false;

async function initializeBadges() {
  if (badgesInitialized) return;

  try {
    for (const badgeData of badgesData) {
      const existing = await prisma.badge.findUnique({
        where: { id: badgeData.id }
      });

      if (!existing) {
        await prisma.badge.create({
          data: {
            id: badgeData.id,
            name: badgeData.name,
            description: badgeData.description,
            icon: badgeData.icon,
            category: badgeData.category,
            conditionType: badgeData.conditionType,
            conditionValue: badgeData.conditionValue
          }
        });
      }
    }
    badgesInitialized = true;
  } catch (error) {
    console.error('배지 초기화 실패:', error);
  }
}

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
initializeBadges();
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

  return { id: user.id, nickname: user.nickname, role: user.role };
}

// ==================== 설문 결과 ====================

export async function saveSurveyResult(userId: number, preferences: {
  occupation?: string;
  livingStyle: string;
  socialStyle: string;
  workStyle: string;
  hobbyStyle: string;
  pace: string;
  purchaseType: string;
  budget: string;
}) {
  try {
    // 1. PostgreSQL에 저장
    const surveyResult = await prisma.surveyResult.create({
      data: {
        userId,
        occupation: preferences.occupation,
        livingStyle: preferences.livingStyle,
        socialStyle: preferences.socialStyle,
        workStyle: preferences.workStyle,
        hobbyStyle: preferences.hobbyStyle,
        pace: preferences.pace,
        purchaseType: preferences.purchaseType,
        budget: preferences.budget
      }
    });

    console.log(`✅ Survey saved to DB: ID ${surveyResult.id}`);

    // 2. S3에 업로드 (비동기 - 실패해도 DB 저장은 성공으로 처리)
    uploadSurveyToS3({
      id: surveyResult.id,
      userId: surveyResult.userId,
      occupation: surveyResult.occupation,
      livingStyle: surveyResult.livingStyle,
      socialStyle: surveyResult.socialStyle,
      workStyle: surveyResult.workStyle,
      hobbyStyle: surveyResult.hobbyStyle,
      pace: surveyResult.pace,
      purchaseType: surveyResult.purchaseType,
      budget: surveyResult.budget,
      createdAt: surveyResult.createdAt,
    }).catch((err) => {
      console.error('⚠️ S3 upload failed (non-blocking):', err);
    });

    return { success: true, surveyId: surveyResult.id };
  } catch (error) {
    console.error('❌ Database error:', error);
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
  category: 'experience' | 'review' | 'tip' | 'question' | 'occupation-post' | 'hobby-post';
  propertyId?: string;
  tags?: string[];
  occupationTag?: string | null;
  hobbyStyleTag?: string | null;
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
        tags: entry.tags ? JSON.stringify(entry.tags) : null,
        occupationTag: entry.occupationTag || null,
        hobbyStyleTag: entry.hobbyStyleTag || null
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
  occupationTag?: string;
  hobbyStyleTag?: string;
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

  // 직업 태그 필터
  if (filters.occupationTag) {
    where.occupationTag = { contains: filters.occupationTag, mode: 'insensitive' };
  }

  // 취미 스타일 태그 필터
  if (filters.hobbyStyleTag) {
    where.hobbyStyleTag = filters.hobbyStyleTag;
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
    occupation_tag: entry.occupationTag,
    hobby_style_tag: entry.hobbyStyleTag,
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
    occupation_tag: entry.occupationTag,
    hobby_style_tag: entry.hobbyStyleTag,
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
    occupation_tag: entry.occupationTag,
    hobby_style_tag: entry.hobbyStyleTag,
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
  occupationTag?: string | null;
  hobbyStyleTag?: string | null;
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
    if (updates.occupationTag !== undefined) updateData.occupationTag = updates.occupationTag;
    if (updates.hobbyStyleTag !== undefined) updateData.hobbyStyleTag = updates.hobbyStyleTag;

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
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return bookmarks.map(bookmark => ({
    id: bookmark.guestbook.id,
    user_id: bookmark.guestbook.userId,
    title: bookmark.guestbook.title,
    content: bookmark.guestbook.content,
    location: bookmark.guestbook.location,
    rating: bookmark.guestbook.rating,
    category: bookmark.guestbook.category,
    property_id: bookmark.guestbook.propertyId,
    tags: bookmark.guestbook.tags,
    likes_count: bookmark.guestbook.likesCount,
    created_at: bookmark.guestbook.createdAt,
    updated_at: bookmark.guestbook.updatedAt,
    author_nickname: bookmark.guestbook.user.nickname,
    comments_count: bookmark.guestbook._count.comments,
    bookmarked_at: bookmark.createdAt
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
  const [guestbookCount, propertyLikedCount, likesGiven, guestbookLikesReceived, user] = await Promise.all([
    prisma.guestbook.count({ where: { userId } }),
    prisma.recommendation.count({ where: { userId } }), // Recommendation 테이블 사용
    prisma.guestbookLike.count({ where: { userId } }),
    prisma.guestbookLike.count({
      where: {
        guestbook: {
          userId
        }
      }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    })
  ]);

  return {
    guestbookCount,
    propertyLikedCount,
    likesGiven,
    totalLikesReceived: guestbookLikesReceived,
    userCreatedAt: user?.createdAt || new Date()
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
  // 데이터베이스에서 배지 목록 조회
  const badges = await prisma.badge.findMany({
    orderBy: { category: 'asc' }
  });
  return badges;
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

// ==================== 원데이 클래스 ====================

export async function getOneDayClasses(filters: {
  search?: string;
  category?: string;
  province?: string;
  city?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  userId?: number;
}) {
  const where: any = { status: { in: ['approved', 'active'] } };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.category && filters.category !== 'all') {
    where.category = filters.category;
  }

  if (filters.province) {
    where.province = filters.province;
  }

  if (filters.city) {
    where.city = filters.city;
  }

  if (filters.difficulty && filters.difficulty !== 'all') {
    where.difficulty = filters.difficulty;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.minRating) {
    where.averageRating = { gte: filters.minRating };
  }

  const orderBy: any = {};
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = (filters.sortOrder || 'DESC').toLowerCase();
  orderBy[sortBy] = sortOrder;

  const classes = await prisma.oneDayClass.findMany({
    where,
    include: {
      instructor: {
        select: { id: true, nickname: true }
      },
      sessions: {
        where: {
          sessionDate: { gte: new Date() },
          status: 'open'
        },
        orderBy: { sessionDate: 'asc' },
        take: 3
      }
    },
    orderBy,
    take: filters.limit || 20,
    skip: filters.offset || 0
  });

  // 사용자별 좋아요/북마크 상태 추가
  if (filters.userId) {
    const userId = filters.userId;
    const classIds = classes.map(c => c.id);

    const [likes, bookmarks] = await Promise.all([
      prisma.classLike.findMany({
        where: { userId, classId: { in: classIds } },
        select: { classId: true }
      }),
      prisma.classBookmark.findMany({
        where: { userId, classId: { in: classIds } },
        select: { classId: true }
      })
    ]);

    const likedSet = new Set(likes.map(l => l.classId));
    const bookmarkedSet = new Set(bookmarks.map(b => b.classId));

    return classes.map(classItem => ({
      ...classItem,
      isLiked: likedSet.has(classItem.id),
      isBookmarked: bookmarkedSet.has(classItem.id)
    }));
  }

  return classes;
}

export async function getOneDayClass(classId: string, userId?: number) {
  const classData = await prisma.oneDayClass.findUnique({
    where: { id: classId },
    include: {
      instructor: {
        select: { id: true, nickname: true }
      },
      sessions: {
        where: {
          sessionDate: { gte: new Date() }
        },
        orderBy: { sessionDate: 'asc' }
      }
    }
  });

  if (!classData) return null;

  let isLiked = false;
  let isBookmarked = false;
  let userEnrollment = null;

  if (userId) {
    isLiked = !!(await prisma.classLike.findUnique({
      where: { userId_classId: { userId, classId } }
    }));

    isBookmarked = !!(await prisma.classBookmark.findUnique({
      where: { userId_classId: { userId, classId } }
    }));

    userEnrollment = await prisma.classEnrollment.findFirst({
      where: { userId, classId, status: { in: ['confirmed', 'completed'] } },
      include: { session: true, review: true }
    });
  }

  return {
    ...classData,
    isLiked,
    isBookmarked,
    userEnrollment
  };
}

export async function createOneDayClass(instructorId: number, data: any) {
  try {
    const classData = await prisma.oneDayClass.create({
      data: {
        instructorId,
        title: data.title,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory,
        province: data.province,
        city: data.city,
        district: data.district,
        address: data.address,
        locationDetail: data.locationDetail,
        difficulty: data.difficulty,
        minAge: data.minAge,
        maxAge: data.maxAge,
        targetAudience: data.targetAudience,
        price: data.price,
        originalPrice: data.originalPrice,
        thumbnailUrl: data.thumbnailUrl,
        imageUrls: data.imageUrls || [],
        duration: data.duration,
        materials: data.materials || [],
        includes: data.includes || [],
        excludes: data.excludes || [],
        prerequisites: data.prerequisites
      }
    });

    return { success: true, classId: classData.id };
  } catch (error) {
    console.error('Class creation error:', error);
    return { success: false, error: '클래스 생성에 실패했습니다.' };
  }
}

export async function updateOneDayClass(classId: string, instructorId: number, data: any) {
  try {
    // 1. 클래스 조회 및 권한 확인
    const classData = await prisma.oneDayClass.findUnique({
      where: { id: classId },
      select: { instructorId: true, status: true }
    });

    if (!classData) {
      return { success: false, error: '클래스를 찾을 수 없습니다.' };
    }

    // 2. instructorId 일치 확인
    if (classData.instructorId !== instructorId) {
      return { success: false, error: '권한이 없습니다.' };
    }

    // 3. status가 pending 또는 rejected인지 확인
    if (classData.status !== 'pending' && classData.status !== 'rejected') {
      return { success: false, error: '승인 대기 중이거나 거부된 클래스만 수정할 수 있습니다.' };
    }

    // 4. 업데이트 실행 (status를 'pending'으로 초기화)
    const updated = await prisma.oneDayClass.update({
      where: { id: classId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory || null,
        province: data.province,
        city: data.city,
        district: data.district || null,
        address: data.address || null,
        locationDetail: data.locationDetail || null,
        difficulty: data.difficulty,
        minAge: data.minAge || null,
        maxAge: data.maxAge || null,
        targetAudience: data.targetAudience || null,
        price: data.price,
        originalPrice: data.originalPrice || null,
        thumbnailUrl: data.thumbnailUrl || null,
        imageUrls: data.imageUrls || [],
        duration: data.duration,
        materials: data.materials || [],
        includes: data.includes || [],
        excludes: data.excludes || [],
        prerequisites: data.prerequisites || null,
        // 재신청 시 상태 초기화
        status: 'pending',
        rejectionReason: null
      }
    });

    return { success: true, classId: updated.id };
  } catch (error) {
    console.error('Update class error:', error);
    return { success: false, error: '클래스 수정에 실패했습니다.' };
  }
}

export async function createClassSession(classId: string, data: any) {
  try {
    const session = await prisma.classSession.create({
      data: {
        classId,
        sessionDate: new Date(data.sessionDate),
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
        notes: data.notes
      }
    });

    return { success: true, sessionId: session.id };
  } catch (error) {
    return { success: false, error: '세션 생성에 실패했습니다.' };
  }
}

export async function updateClassSession(
  sessionId: string,
  instructorId: number,
  data: any
) {
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { class: true }
    });

    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다.' };
    }

    // 강사 권한 확인
    if (session.class.instructorId !== instructorId) {
      return { success: false, error: '권한이 없습니다.' };
    }

    // 수강생이 있으면 수정 불가
    if (session.currentEnrolled > 0) {
      return { success: false, error: '수강생이 있는 세션은 수정할 수 없습니다.' };
    }

    const updated = await prisma.classSession.update({
      where: { id: sessionId },
      data: {
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
        notes: data.notes
      }
    });

    return { success: true, sessionId: updated.id };
  } catch (error) {
    console.error('Update session error:', error);
    return { success: false, error: '세션 수정에 실패했습니다.' };
  }
}

export async function deleteClassSession(sessionId: string, instructorId: number) {
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { class: true }
    });

    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다.' };
    }

    if (session.class.instructorId !== instructorId) {
      return { success: false, error: '권한이 없습니다.' };
    }

    if (session.currentEnrolled > 0) {
      return { success: false, error: '수강생이 있는 세션은 삭제할 수 없습니다.' };
    }

    await prisma.classSession.delete({
      where: { id: sessionId }
    });

    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: '세션 삭제에 실패했습니다.' };
  }
}

export async function enrollInClass(userId: number, sessionId: string, data: any) {
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { class: true }
    });

    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다.' };
    }

    if (session.status !== 'open') {
      return { success: false, error: '신청할 수 없는 세션입니다.' };
    }

    if (session.currentEnrolled >= session.maxCapacity) {
      return { success: false, error: '정원이 마감되었습니다.' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coinBalance < session.class.price) {
      return { success: false, error: '코인이 부족합니다.' };
    }

    // Transaction: Deduct coins, create enrollment, update session
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create coin transaction
      const coinTx = await tx.coinTransaction.create({
        data: {
          userId,
          amount: -session.class.price,
          type: 'usage',
          description: `원데이 클래스 수강신청: ${session.class.title}`,
          relatedId: session.class.id,
          balanceBefore: user.coinBalance,
          balanceAfter: user.coinBalance - session.class.price
        }
      });

      // 2. Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { coinBalance: { decrement: session.class.price } }
      });

      // 3. Create enrollment
      const enrollment = await tx.classEnrollment.create({
        data: {
          userId,
          classId: session.class.id,
          sessionId: session.id,
          paidAmount: session.class.price,
          transactionId: coinTx.id,
          participants: data.participants || 1,
          specialRequests: data.specialRequests
        }
      });

      // 4. Update session count
      await tx.classSession.update({
        where: { id: sessionId },
        data: {
          currentEnrolled: { increment: 1 },
          status: session.currentEnrolled + 1 >= session.maxCapacity ? 'full' : 'open'
        }
      });

      // 5. Update class stats
      await tx.oneDayClass.update({
        where: { id: session.class.id },
        data: { enrollmentsCount: { increment: 1 } }
      });

      return enrollment;
    });

    return { success: true, enrollmentId: result.id };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: '이미 신청한 세션입니다.' };
    }
    console.error('Enrollment error:', error);
    return { success: false, error: '수강 신청에 실패했습니다.' };
  }
}

export async function cancelEnrollment(enrollmentId: string, userId: number) {
  try {
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { session: true, class: true }
    });

    if (!enrollment || enrollment.userId !== userId) {
      return { success: false, error: '권한이 없습니다.' };
    }

    if (enrollment.status === 'cancelled') {
      return { success: false, error: '이미 취소된 신청입니다.' };
    }

    if (enrollment.status === 'completed') {
      return { success: false, error: '완료된 수업은 취소할 수 없습니다.' };
    }

    // Check if session is within 24 hours
    const sessionDate = new Date(enrollment.session.sessionDate);
    const now = new Date();
    const hoursDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return { success: false, error: '수업 24시간 전까지만 취소 가능합니다.' };
    }

    const refundAmount = Math.floor(enrollment.paidAmount * 0.9); // 90% refund

    await prisma.$transaction(async (tx) => {
      // 1. Refund coins
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: refundAmount,
          type: 'refund',
          description: `원데이 클래스 취소 환불: ${enrollment.class.title}`,
          relatedId: enrollment.classId,
          balanceBefore: user.coinBalance,
          balanceAfter: user.coinBalance + refundAmount
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: { coinBalance: { increment: refundAmount } }
      });

      // 2. Update enrollment
      await tx.classEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      });

      // 3. Update session
      await tx.classSession.update({
        where: { id: enrollment.sessionId },
        data: {
          currentEnrolled: { decrement: 1 },
          status: 'open'
        }
      });

      // 4. Update class stats
      await tx.oneDayClass.update({
        where: { id: enrollment.classId },
        data: { enrollmentsCount: { decrement: 1 } }
      });
    });

    return { success: true, refundAmount };
  } catch (error) {
    console.error('Cancellation error:', error);
    return { success: false, error: '취소 처리에 실패했습니다.' };
  }
}

export async function toggleClassLike(userId: number, classId: string) {
  try {
    const existing = await prisma.classLike.findUnique({
      where: { userId_classId: { userId, classId } }
    });

    if (existing) {
      await prisma.$transaction([
        prisma.classLike.delete({ where: { id: existing.id } }),
        prisma.oneDayClass.update({
          where: { id: classId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
      return { success: true, liked: false };
    } else {
      await prisma.$transaction([
        prisma.classLike.create({ data: { userId, classId } }),
        prisma.oneDayClass.update({
          where: { id: classId },
          data: { likesCount: { increment: 1 } }
        })
      ]);
      return { success: true, liked: true };
    }
  } catch (error) {
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

export async function toggleClassBookmark(userId: number, classId: string) {
  try {
    const existing = await prisma.classBookmark.findUnique({
      where: { userId_classId: { userId, classId } }
    });

    if (existing) {
      await prisma.$transaction([
        prisma.classBookmark.delete({ where: { id: existing.id } }),
        prisma.oneDayClass.update({
          where: { id: classId },
          data: { bookmarksCount: { decrement: 1 } }
        })
      ]);
      return { success: true, bookmarked: false };
    } else {
      await prisma.$transaction([
        prisma.classBookmark.create({ data: { userId, classId } }),
        prisma.oneDayClass.update({
          where: { id: classId },
          data: { bookmarksCount: { increment: 1 } }
        })
      ]);
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    return { success: false, error: '북마크 처리에 실패했습니다.' };
  }
}

export async function createClassReview(enrollmentId: string, userId: number, data: any) {
  try {
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { review: true }
    });

    if (!enrollment || enrollment.userId !== userId) {
      return { success: false, error: '권한이 없습니다.' };
    }

    if (enrollment.status !== 'completed') {
      return { success: false, error: '완료된 수업만 리뷰를 작성할 수 있습니다.' };
    }

    if (enrollment.review) {
      return { success: false, error: '이미 리뷰를 작성했습니다.' };
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.classReview.create({
        data: {
          enrollmentId,
          userId,
          classId: enrollment.classId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          instructorRating: data.instructorRating,
          contentRating: data.contentRating,
          facilityRating: data.facilityRating,
          valueRating: data.valueRating,
          tags: data.tags || []
        }
      });

      // Update class rating
      const avgRating = await tx.classReview.aggregate({
        where: { classId: enrollment.classId },
        _avg: { rating: true },
        _count: true
      });

      await tx.oneDayClass.update({
        where: { id: enrollment.classId },
        data: {
          averageRating: avgRating._avg.rating || 0,
          reviewsCount: avgRating._count
        }
      });

      return review;
    });

    return { success: true, reviewId: result.id };
  } catch (error) {
    console.error('Review creation error:', error);
    return { success: false, error: '리뷰 작성에 실패했습니다.' };
  }
}

export async function getClassReviews(classId: string, options?: {
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}) {
  const reviews = await prisma.classReview.findMany({
    where: { classId },
    include: {
      user: {
        select: { id: true, nickname: true }
      }
    },
    orderBy: {
      [options?.sortBy || 'createdAt']: options?.sortOrder?.toLowerCase() || 'desc'
    },
    take: options?.limit || 20,
    skip: options?.offset || 0
  });

  return reviews;
}

export async function getUserEnrollments(userId: number, status?: string[]) {
  const where: any = { userId };
  if (status) {
    where.status = { in: status };
  }

  const enrollments = await prisma.classEnrollment.findMany({
    where,
    include: {
      class: {
        include: {
          instructor: {
            select: { id: true, nickname: true }
          }
        }
      },
      session: true,
      review: true
    },
    orderBy: { enrolledAt: 'desc' }
  });

  return enrollments;
}

export async function getClassEnrollments(classId: string, instructorId?: number) {
  try {
    // 강사 권한 확인 (instructorId가 제공된 경우)
    if (instructorId) {
      const classData = await prisma.oneDayClass.findUnique({
        where: { id: classId },
        select: { instructorId: true }
      });

      if (!classData || classData.instructorId !== instructorId) {
        return { success: false, error: '권한이 없습니다.' };
      }
    }

    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId,
        status: { in: ['confirmed', 'completed'] } // 취소된 건 제외
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true
          }
        },
        session: {
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return { success: true, data: enrollments };
  } catch (error) {
    console.error('Get class enrollments error:', error);
    return { success: false, error: '수강생 목록 조회에 실패했습니다.' };
  }
}

export async function getUserClassBookmarks(userId: number) {
  const bookmarks = await prisma.classBookmark.findMany({
    where: { userId },
    include: {
      class: {
        include: {
          instructor: {
            select: { id: true, nickname: true }
          },
          sessions: {
            where: {
              sessionDate: { gte: new Date() },
              status: 'open'
            },
            orderBy: { sessionDate: 'asc' },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return bookmarks.map(b => b.class);
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
