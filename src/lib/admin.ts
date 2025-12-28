// 관리자 권한 체크 유틸리티
import { prisma } from './prisma';

/**
 * 사용자가 관리자 권한이 있는지 확인
 */
export async function isAdmin(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  return user?.role === 'admin';
}

/**
 * 관리자 권한 체크 (권한 없으면 에러)
 */
export async function requireAdmin(userId: number): Promise<void> {
  const hasPermission = await isAdmin(userId);
  if (!hasPermission) {
    throw new Error('관리자 권한이 필요합니다.');
  }
}

/**
 * 승인 대기 중인 클래스 목록 조회
 */
export async function getPendingClasses(options: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) {
  const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder.toLowerCase();

  const [classes, total] = await Promise.all([
    prisma.oneDayClass.findMany({
      where: { status: 'pending' },
      include: {
        instructor: {
          select: { id: true, nickname: true, createdAt: true }
        },
        sessions: true,
        _count: {
          select: {
            sessions: true,
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.oneDayClass.count({ where: { status: 'pending' } })
  ]);

  return { classes, total };
}

/**
 * 상태별 클래스 목록 조회
 */
export async function getClassesByStatus(options: {
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  category?: string;
}) {
  const {
    status,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    search,
    category
  } = options;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (category && category !== 'all') {
    where.category = category;
  }

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder.toLowerCase();

  const [classes, total] = await Promise.all([
    prisma.oneDayClass.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, nickname: true, createdAt: true }
        },
        _count: {
          select: {
            sessions: true,
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.oneDayClass.count({ where })
  ]);

  return { classes, total };
}

/**
 * 클래스 상세 정보 조회 (관리자용)
 */
export async function getClassDetailForAdmin(classId: string) {
  const classData = await prisma.oneDayClass.findUnique({
    where: { id: classId },
    include: {
      instructor: {
        select: {
          id: true,
          nickname: true,
          createdAt: true,
          coinBalance: true,
          _count: {
            select: {
              instructorClasses: true,
              classEnrollments: true
            }
          }
        }
      },
      sessions: {
        orderBy: { sessionDate: 'asc' }
      },
      enrollments: {
        include: {
          user: {
            select: { id: true, nickname: true }
          },
          session: true
        },
        orderBy: { enrolledAt: 'desc' }
      },
      reviews: {
        include: {
          user: {
            select: { id: true, nickname: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return classData;
}

/**
 * 클래스 승인
 */
export async function approveClass(classId: string, adminId: number) {
  await requireAdmin(adminId);

  const updated = await prisma.oneDayClass.update({
    where: { id: classId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null
    },
    include: {
      instructor: {
        select: { id: true, nickname: true }
      }
    }
  });

  // TODO: 강사에게 승인 알림 전송

  return updated;
}

/**
 * 클래스 거부
 */
export async function rejectClass(
  classId: string,
  adminId: number,
  reason: string
) {
  await requireAdmin(adminId);

  if (!reason || reason.trim().length === 0) {
    throw new Error('거부 사유를 입력해주세요.');
  }

  const updated = await prisma.oneDayClass.update({
    where: { id: classId },
    data: {
      status: 'rejected',
      rejectionReason: reason,
      approvedAt: null,
      approvedBy: null
    },
    include: {
      instructor: {
        select: { id: true, nickname: true }
      }
    }
  });

  // TODO: 강사에게 거부 알림 전송

  return updated;
}

/**
 * 클래스 상태 변경 (활성화/비활성화)
 */
export async function updateClassStatus(
  classId: string,
  adminId: number,
  newStatus: 'active' | 'inactive'
) {
  await requireAdmin(adminId);

  const classData = await prisma.oneDayClass.findUnique({
    where: { id: classId },
    select: { status: true }
  });

  if (!classData) {
    throw new Error('클래스를 찾을 수 없습니다.');
  }

  if (classData.status === 'pending') {
    throw new Error('승인되지 않은 클래스입니다.');
  }

  const updated = await prisma.oneDayClass.update({
    where: { id: classId },
    data: { status: newStatus }
  });

  return updated;
}

/**
 * 관리자 통계 조회
 */
export async function getAdminStats() {
  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    activeCount,
    totalInstructors,
    totalEnrollments,
    totalRevenue
  ] = await Promise.all([
    prisma.oneDayClass.count({ where: { status: 'pending' } }),
    prisma.oneDayClass.count({ where: { status: 'approved' } }),
    prisma.oneDayClass.count({ where: { status: 'rejected' } }),
    prisma.oneDayClass.count({ where: { status: 'active' } }),
    prisma.oneDayClass.groupBy({
      by: ['instructorId'],
      _count: true
    }).then(result => result.length),
    prisma.classEnrollment.count({ where: { status: 'confirmed' } }),
    prisma.classEnrollment.aggregate({
      where: { status: 'confirmed' },
      _sum: { paidAmount: true }
    }).then(result => result._sum.paidAmount || 0)
  ]);

  return {
    classes: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      active: activeCount,
      total: pendingCount + approvedCount + rejectedCount + activeCount
    },
    instructors: totalInstructors,
    enrollments: totalEnrollments,
    revenue: totalRevenue
  };
}

/**
 * 최근 활동 로그 조회
 */
export async function getRecentActivity(limit: number = 20) {
  const [recentClasses, recentEnrollments, recentReviews] = await Promise.all([
    prisma.oneDayClass.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        instructor: {
          select: { nickname: true }
        }
      }
    }),
    prisma.classEnrollment.findMany({
      take: limit,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        enrolledAt: true,
        paidAmount: true,
        user: {
          select: { nickname: true }
        },
        class: {
          select: { title: true }
        }
      }
    }),
    prisma.classReview.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        user: {
          select: { nickname: true }
        },
        class: {
          select: { title: true }
        }
      }
    })
  ]);

  return {
    classes: recentClasses,
    enrollments: recentEnrollments,
    reviews: recentReviews
  };
}
