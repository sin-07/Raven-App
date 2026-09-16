// Mobile TypeScript interfaces for Raven Tutorials LMS

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  registrationId: string;
  standard: string;
  phone: string;
  enrolledCourses?: string[];
  createdAt: string;
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
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-based index
  marks: number;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  standard: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questionsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
}

export interface TestResult {
  testId: string;
  testTitle: string;
  subject: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctAnswersCount: number;
  answers: { [questionId: string]: number };
}

export interface LiveSession {
  id: string;
  title: string;
  subject: string;
  standard: string;
  instructor: string;
  instructorAvatar: string;
  scheduledTime: string;
  scheduledDate: string;
  durationMinutes: number;
  status: 'live' | 'upcoming' | 'completed';
  roomUrl?: string;
  participantsCount?: number;
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  subject: string;
  standard: string;
  duration: string;
  instructor: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  postedBy: string;
  category: 'General' | 'Exam' | 'Urgent' | 'Academic';
  date: string;
  isImportant?: boolean;
  attachmentUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface Category {
  name: string;
  count: number;
  icon: string;
  color: string;
}

export interface AdmissionFormData {
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  category: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  standard: string;
  previousSchool: string;
  stream?: string;
  courseType?: string;
  subject?: string;
}

export interface FeedbackFormData {
  category: 'course_content' | 'teaching_method' | 'study_materials' | 'online_classes' | 'test_system' | 'general';
  subject: string;
  message: string;
  rating: number;
}
