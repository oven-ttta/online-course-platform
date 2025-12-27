export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type CourseStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: number;
  children?: Category[];
  _count?: {
    courses: number;
  };
}

export interface CourseStatistics {
  totalEnrollments: number;
  totalReviews: number;
  averageRating: number;
  totalRevenue?: number;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  _count?: {
    courses: number;
  };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  price: number;
  discountPrice?: number;
  level: CourseLevel;
  language: string;
  requirements: string[];
  whatYouLearn: string[];
  totalDuration: number;
  totalLessons: number;
  status: CourseStatus;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  instructor: Instructor;
  category: Category;
  statistics?: CourseStatistics;
  sections?: Section[];
  isEnrolled?: boolean;
  enrollment?: {
    id: string;
    progressPercent: number;
    status: string;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  sortOrder: number;
  isFree: boolean;
  isPublished: boolean;
  quiz?: Quiz;
  progress?: LessonProgress;
}

export interface Quiz {
  id: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: string;
  options: string[];
  points: number;
  sortOrder: number;
}

export interface LessonProgress {
  id: string;
  isCompleted: boolean;
  watchTime: number;
  lastPosition: number;
  completedAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt?: string;
  status: string;
  course: Course;
  lessonProgress: LessonProgress[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  instructorReply?: string;
  repliedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
