// User Types
export interface Student {
  _id: string;
  registrationId: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'Other';
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  standard: string;
  previousSchool: string;
  photo?: string;
  photoUrl?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentAmount?: number;
  submittedAt?: string;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin';
  isActive: boolean;
  lastLogin?: string;
}

// Test Types
export interface Question {
  _id?: string;
  questionText: string;
  questionType: 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
  options: string[];
  correctAnswer: string;
  marks: number;
}

export interface TestResult {
  studentId: string;
  marksObtained: number;
  status: 'Pass' | 'Fail' | 'Absent';
  submittedAt?: string;
  answers?: Array<{
    questionId: string;
    answer: string;
    marksAwarded: number;
  }>;
  violations?: Array<{
    violationType: string;
    timestamp: string;
    question: number;
  }>;
  timeSpent?: number;
}

export interface Test {
  _id: string;
  title: string;
  description?: string;
  class: string;
  subject: string;
  testDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  results?: TestResult[];
  status: 'Draft' | 'Published' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}

// Attendance Types
export interface AttendanceRecord {
  _id: string;
  class: string;
  subject: string;
  date: string;
  students: Array<{
    studentId: string | Student;
    status: 'Present' | 'Absent' | 'Late';
  }>;
  createdAt?: string;
}

// Notice Types
export interface Notice {
  _id: string;
  title: string;
  message: string;
  documentUrl?: string;
  createdBy?: string;
  isImportant?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Feedback Types
export interface Feedback {
  _id: string;
  studentId: string | Student;
  category: 'general' | 'course_content' | 'teaching_method' | 'study_materials' | 'online_classes' | 'test_system' | 'complaint';
  subject: string;
  message: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'resolved';
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

// Study Material Types
export interface StudyMaterial {
  _id: string;
  title: string;
  subject: string;
  class: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  uploadedBy?: string;
  createdAt: string;
}

// Video Types
export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  subject: string;
  class: string;
  duration?: number;
  createdAt: string;
}

// Live Class Types
export interface LiveClass {
  _id: string;
  title: string;
  description?: string;
  roomName: string;
  class: string;
  subject: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  isRecordingEnabled?: boolean;
  createdBy?: string;
  participants?: Array<{
    participantId: string;
    joinedAt: string;
    leftAt?: string;
  }>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Form Data Types
export interface AdmissionFormData {
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
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
  photo: File | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Context Types
export interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
