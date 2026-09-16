// Dummy data for Raven Tutorials LMS

import { Course, Testimonial, User, DashboardStats } from '@/types/lms';

export const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    enrolledCourses: ['1', '2', '3'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Dr. Priya Singh',
    email: 'priya@instructor.com',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdAt: new Date('2023-06-01'),
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@raven.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    createdAt: new Date('2023-01-01'),
  },
];

export const dummyCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Physics Masterclass',
    description: 'Master physics from basics to advanced concepts with our comprehensive course covering mechanics, thermodynamics, electromagnetism, and modern physics.',
    shortDescription: 'Master physics from basics to advanced with hands-on experiments and problem-solving.',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=500&fit=crop',
    instructor: {
      id: '2',
      name: 'Dr. Priya Singh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    category: 'Science',
    level: 'Intermediate',
    duration: '40 hours',
    totalLessons: 48,
    totalStudents: 1234,
    rating: 4.8,
    price: 2999,
    originalPrice: 5999,
    isFree: false,
    isPopular: true,
    lessons: [
      { id: 'l1', title: 'Introduction to Physics', duration: '15:00', order: 1, isFree: true },
      { id: 'l2', title: 'Units and Measurements', duration: '25:00', order: 2 },
      { id: 'l3', title: 'Motion in a Straight Line', duration: '35:00', order: 3 },
      { id: 'l4', title: 'Motion in a Plane', duration: '40:00', order: 4 },
      { id: 'l5', title: 'Laws of Motion', duration: '45:00', order: 5 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    description: 'Complete mathematics course covering algebra, calculus, trigonometry, and statistics with thousands of practice problems.',
    shortDescription: 'From algebra to calculus - everything you need to excel in mathematics.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=500&fit=crop',
    instructor: {
      id: '4',
      name: 'Prof. Amit Kumar',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    category: 'Mathematics',
    level: 'Advanced',
    duration: '60 hours',
    totalLessons: 72,
    totalStudents: 2567,
    rating: 4.9,
    price: 3499,
    originalPrice: 6999,
    isFree: false,
    isPopular: true,
    lessons: [
      { id: 'l1', title: 'Sets and Functions', duration: '20:00', order: 1, isFree: true },
      { id: 'l2', title: 'Complex Numbers', duration: '30:00', order: 2 },
      { id: 'l3', title: 'Quadratic Equations', duration: '25:00', order: 3 },
      { id: 'l4', title: 'Permutations & Combinations', duration: '35:00', order: 4 },
    ],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    title: 'Chemistry Fundamentals',
    description: 'Learn chemistry from scratch with interactive lessons covering organic, inorganic, and physical chemistry.',
    shortDescription: 'Interactive chemistry lessons with virtual lab experiments.',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&h=500&fit=crop',
    instructor: {
      id: '5',
      name: 'Dr. Neha Gupta',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    category: 'Science',
    level: 'Beginner',
    duration: '35 hours',
    totalLessons: 42,
    totalStudents: 1876,
    rating: 4.7,
    price: 2499,
    originalPrice: 4999,
    isFree: false,
    lessons: [
      { id: 'l1', title: 'Basic Concepts of Chemistry', duration: '18:00', order: 1, isFree: true },
      { id: 'l2', title: 'Atomic Structure', duration: '28:00', order: 2 },
      { id: 'l3', title: 'Classification of Elements', duration: '32:00', order: 3 },
    ],
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    title: 'Biology Complete Course',
    description: 'Comprehensive biology course covering cell biology, genetics, evolution, and human physiology.',
    shortDescription: 'Explore the fascinating world of life sciences.',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=500&fit=crop',
    instructor: {
      id: '6',
      name: 'Dr. Ravi Verma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    category: 'Science',
    level: 'Intermediate',
    duration: '45 hours',
    totalLessons: 54,
    totalStudents: 1456,
    rating: 4.6,
    price: 2799,
    originalPrice: 5499,
    isFree: false,
    lessons: [
      { id: 'l1', title: 'The Living World', duration: '22:00', order: 1, isFree: true },
      { id: 'l2', title: 'Biological Classification', duration: '25:00', order: 2 },
    ],
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '5',
    title: 'English Grammar Mastery',
    description: 'Perfect your English grammar with comprehensive lessons, exercises, and writing practice.',
    shortDescription: 'Master English grammar and improve your communication skills.',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=500&fit=crop',
    instructor: {
      id: '7',
      name: 'Ms. Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    },
    category: 'Language',
    level: 'Beginner',
    duration: '25 hours',
    totalLessons: 30,
    totalStudents: 3245,
    rating: 4.8,
    price: 0,
    isFree: true,
    lessons: [
      { id: 'l1', title: 'Parts of Speech', duration: '20:00', order: 1, isFree: true },
      { id: 'l2', title: 'Tenses', duration: '30:00', order: 2, isFree: true },
    ],
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '6',
    title: 'Computer Science Basics',
    description: 'Learn programming fundamentals, data structures, and algorithms from scratch.',
    shortDescription: 'Start your coding journey with Python and JavaScript.',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=500&fit=crop',
    instructor: {
      id: '8',
      name: 'Vikram Patel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    category: 'Technology',
    level: 'Beginner',
    duration: '50 hours',
    totalLessons: 60,
    totalStudents: 4521,
    rating: 4.9,
    price: 1999,
    originalPrice: 3999,
    isFree: false,
    isPopular: true,
    lessons: [
      { id: 'l1', title: 'Introduction to Programming', duration: '25:00', order: 1, isFree: true },
      { id: 'l2', title: 'Variables and Data Types', duration: '30:00', order: 2 },
    ],
    createdAt: new Date('2024-06-01'),
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ananya Mishra',
    role: 'JEE Advanced Qualifier',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'Raven Tutorials helped me crack JEE Advanced with an excellent rank. The teachers are amazing and the study material is top-notch!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rohit Agarwal',
    role: 'NEET Qualifier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'The biology and chemistry courses are incredibly detailed. I scored 680+ in NEET thanks to Raven Tutorials!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Priya Patel',
    role: 'Class 12 Topper',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: 'The doubt support system is excellent. I could ask questions anytime and get quick responses from teachers.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Arjun Singh',
    role: 'Olympiad Gold Medalist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    content: 'The advanced problem-solving techniques taught here are unmatched. Highly recommend for competitive exams!',
    rating: 5,
  },
];

export const features = [
  {
    icon: 'GraduationCap',
    title: 'Expert Teachers',
    description: 'Learn from IIT/NIT alumni and experienced educators with 10+ years of teaching experience.',
  },
  {
    icon: 'Video',
    title: 'HD Video Lessons',
    description: 'Access 1000+ hours of high-quality recorded video lessons anytime, anywhere.',
  },
  {
    icon: 'MessageCircle',
    title: '24/7 Doubt Support',
    description: 'Get your doubts resolved instantly with our round-the-clock doubt clearing sessions.',
  },
  {
    icon: 'FileText',
    title: 'Study Materials',
    description: 'Comprehensive notes, practice questions, and previous year papers included.',
  },
  {
    icon: 'BarChart',
    title: 'Progress Tracking',
    description: 'Track your learning progress with detailed analytics and performance reports.',
  },
  {
    icon: 'Award',
    title: 'Certificates',
    description: 'Earn recognized certificates upon successful completion of courses.',
  },
];

export const categories = [
  { name: 'Science', count: 45, icon: 'Microscope' },
  { name: 'Mathematics', count: 32, icon: 'Calculator' },
  { name: 'Technology', count: 28, icon: 'Monitor' },
  { name: 'Language', count: 15, icon: 'BookMarked' },
  { name: 'Commerce', count: 20, icon: 'TrendingUp' },
  { name: 'Arts', count: 12, icon: 'Palette' },
];

export const dashboardStats: DashboardStats = {
  totalStudents: 15420,
  totalCourses: 156,
  totalInstructors: 45,
  totalRevenue: 2456000,
  activeEnrollments: 8934,
  completionRate: 78,
};

export const studentProgress = [
  { courseId: '1', courseName: 'Complete Physics Masterclass', progress: 65, lastAccessed: new Date() },
  { courseId: '2', courseName: 'Advanced Mathematics', progress: 45, lastAccessed: new Date() },
  { courseId: '3', courseName: 'Chemistry Fundamentals', progress: 80, lastAccessed: new Date() },
];

export const upcomingClasses = [
  { id: '1', title: 'Physics - Electromagnetism', time: '10:00 AM', date: 'Today', instructor: 'Dr. Priya Singh' },
  { id: '2', title: 'Maths - Calculus Revision', time: '2:00 PM', date: 'Today', instructor: 'Prof. Amit Kumar' },
  { id: '3', title: 'Chemistry - Organic Chemistry', time: '11:00 AM', date: 'Tomorrow', instructor: 'Dr. Neha Gupta' },
];

export const recentActivity = [
  { id: '1', action: 'Completed lesson', detail: 'Laws of Motion - Chapter 5', time: '2 hours ago' },
  { id: '2', action: 'Submitted assignment', detail: 'Physics Problem Set 3', time: '5 hours ago' },
  { id: '3', action: 'Started course', detail: 'Advanced Mathematics', time: '1 day ago' },
  { id: '4', action: 'Earned certificate', detail: 'Chemistry Fundamentals', time: '3 days ago' },
];
