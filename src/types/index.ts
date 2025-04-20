export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  createdAt: string;
  lastActive: string;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: any[];
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface FilterState {
  role?: string;
  status?: string;
  department?: string;
  search?: string;
}
export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  progress: number;
  completionRate: number;
  lastActive: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  totalCourses: number;
  publishedCourses: number;
  totalEarnings: number;
  approvalRate: number;
}

export interface DashboardStats {
  activeUsers: number;
  inactiveUsers: number;
  publishedCourses: number;
  pendingCourses: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  completionRate: number;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  timestamp: string;
}export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  enrolledCourses: string[];
  enrolledSessions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  image: string;
  category: string;
  price: number;
  progress: number;
  rating: number;
  materials: CourseMaterial[];
  codeExamples: CodeExample[];
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseMaterial {
  title: string;
  type: string;
  url: string;
  size: string;
}

export interface CodeExample {
  title: string;
  description: string;
  language: string;
  code: string;
  preview: boolean;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
}

export interface UserCourseProgress {
  _id: string;
  user: User;
  course: Course;
  completedLessons: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  user: User;
  course: Course;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  completionRate: string;
  totalRevenue: string;
  activeUsers: number;
  upcomingSessions: number;
}