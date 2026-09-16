// LMS Types for Raven Tutorials

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  enrolledCourses?: string[];
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    qualification?: string;
    avatar: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  isPopular?: boolean;
  lessons?: Lesson[];
  features?: string[];
  syllabus?: string[];
  totalRatings?: number;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  isCompleted?: boolean;
  isFree?: boolean;
  order: number;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: Date;
  description: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  enrolledAt: Date;
  completedLessons: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  totalRevenue: number;
  activeEnrollments: number;
  completionRate: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}
