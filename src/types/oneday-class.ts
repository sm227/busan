export type ClassCategory = 'farming' | 'crafts' | 'cooking' | 'culture' | 'nature';
export type ClassDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ClassStatus = 'active' | 'inactive' | 'soldout';
export type SessionStatus = 'open' | 'full' | 'cancelled' | 'completed';
export type EnrollmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'noshow';
export type AttendanceStatus = 'attended' | 'absent' | 'late';

export interface OneDayClass {
  id: string;
  instructorId: number;
  title: string;
  description: string;
  category: ClassCategory;
  subCategory?: string;

  // Location
  province: string;
  city: string;
  district: string;
  address?: string;
  locationDetail?: string;

  // Difficulty & Target
  difficulty: ClassDifficulty;
  minAge?: number;
  maxAge?: number;
  targetAudience?: string;

  // Pricing
  price: number;
  originalPrice?: number;

  // Images
  thumbnailUrl?: string;
  imageUrls?: string[];

  // Class Info
  duration: number;
  materials?: string[];
  includes?: string[];
  excludes?: string[];
  prerequisites?: string;

  // Stats
  likesCount: number;
  bookmarksCount: number;
  enrollmentsCount: number;
  reviewsCount: number;
  averageRating: number;

  // Status
  status: ClassStatus;
  createdAt: string;
  updatedAt: string;

  // Relations (populated on demand)
  instructor?: {
    id: number;
    nickname: string;
  };
  sessions?: ClassSession[];
  upcomingSessions?: ClassSession[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  userEnrollment?: ClassEnrollment;
}

export interface ClassSession {
  id: string;
  classId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentEnrolled: number;
  status: SessionStatus;
  notes?: string;
  createdAt: string;
  availableSeats?: number;
}

export interface ClassEnrollment {
  id: string;
  userId: number;
  classId: string;
  sessionId: string;
  paidAmount: number;
  transactionId: string;
  status: EnrollmentStatus;
  attendanceStatus?: AttendanceStatus;
  participants: number;
  specialRequests?: string;
  enrolledAt: string;
  cancelledAt?: string;
  completedAt?: string;

  // Relations
  class?: OneDayClass;
  session?: ClassSession;
  review?: ClassReview;
}

export interface ClassReview {
  id: string;
  enrollmentId: string;
  userId: number;
  classId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  instructorRating?: number;
  contentRating?: number;
  facilityRating?: number;
  valueRating?: number;
  tags?: string[];
  helpfulCount: number;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: number;
    nickname: string;
  };
}

export interface ClassFilters {
  search?: string;
  category?: ClassCategory | 'all';
  province?: string;
  city?: string;
  difficulty?: ClassDifficulty | 'all';
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  minRating?: number;
  sortBy?: 'createdAt' | 'averageRating' | 'price' | 'enrollmentsCount' | 'likesCount';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}
