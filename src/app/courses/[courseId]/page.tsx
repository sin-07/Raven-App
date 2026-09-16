'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  PlayCircle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Download,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { LMSFooter } from '@/components/lms';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  level: string;
  duration: string;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  totalRatings: number;
  price: number;
  originalPrice: number;
  isFree: boolean;
  isPopular: boolean;
  features: string[];
  syllabus: string[];
  createdAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      } else {
        setError(data.message || 'Course not found');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, fetchCourse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E5A8]"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
        <p className="text-gray-400 mb-6">{error || 'The course you are looking for does not exist.'}</p>
        <Link
          href="/courses"
          className="px-6 py-3 bg-[#00E5A8] text-black font-semibold rounded-full hover:bg-[#00E5A8]/90"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  // Group syllabus items into sections
  const syllabusPerSection = Math.ceil(course.syllabus.length / 3) || 1;
  const sections = course.syllabus.length > 0 ? [
    { title: 'Getting Started', items: course.syllabus.slice(0, syllabusPerSection) },
    { title: 'Core Concepts', items: course.syllabus.slice(syllabusPerSection, syllabusPerSection * 2) },
    { title: 'Advanced Topics', items: course.syllabus.slice(syllabusPerSection * 2) },
  ].filter(s => s.items.length > 0) : [];

  const features = [
    { icon: Clock, text: `${course.duration} of content` },
    { icon: BookOpen, text: `${course.totalLessons} lessons` },
    { icon: Download, text: 'Downloadable resources' },
    { icon: Award, text: 'Certificate of completion' },
    { icon: MessageCircle, text: 'Doubt support' },
    { icon: PlayCircle, text: 'Lifetime access' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 bg-gradient-to-br from-[#080808] via-[#111111] to-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <Link 
                href="/courses" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Link>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-[#00E5A8]/20 text-[#00E5A8] rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {course.level}
                </span>
                {course.isPopular && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                    Bestseller
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-white">{course.rating}</span>
                  <span>({course.totalRatings} ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                  <p className="text-gray-400 text-sm">Created by</p>
                  <p className="text-white font-medium">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Right - Course Card (Desktop) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 bg-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-[#080808]">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 text-[#00E5A8] ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    {course.isFree ? (
                      <p className="text-3xl font-bold text-green-400">Free</p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-bold text-white">
                          ₹{course.price.toLocaleString()}
                        </p>
                        {course.originalPrice && (
                          <p className="text-lg text-gray-500 line-through">
                            ₹{course.originalPrice.toLocaleString()}
                          </p>
                        )}
                        {course.originalPrice && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded">
                            {Math.round((1 - course.price / course.originalPrice) * 100)}% off
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button className="w-full py-3.5 bg-[#00E5A8] text-black font-semibold rounded-full hover:bg-[#00E5A8]/90 hover:scale-105 transition-all shadow-lg">
                      {course.isFree ? 'Enroll Now - Free' : 'Buy Now'}
                    </button>
                    {!course.isFree && (
                      <button className="w-full py-3.5 border-2 border-gray-700 text-gray-300 font-semibold rounded-full hover:bg-gray-800 transition-all">
                        Add to Cart
                      </button>
                    )}
                  </div>

                  {/* Wishlist & Share */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-800">
                    <button 
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm">Wishlist</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-[#00E5A8] transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                    <h4 className="font-semibold text-white">This course includes:</h4>
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-gray-400">
                        <feature.icon className="w-5 h-5 text-[#00E5A8]" />
                        {feature.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Price Card */}
      <div className="lg:hidden sticky top-16 z-40 bg-[#111111] border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            {course.isFree ? (
              <p className="text-2xl font-bold text-green-400">Free</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">₹{course.price.toLocaleString()}</p>
                {course.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">₹{course.originalPrice.toLocaleString()}</p>
                )}
              </div>
            )}
          </div>
          <button className="px-6 py-3 bg-[#00E5A8] text-black font-semibold rounded-full hover:bg-[#00E5A8]/90">
            {course.isFree ? 'Enroll Free' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:max-w-2xl">
            {/* What you'll learn - From features */}
            {course.features.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">What you&apos;ll learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.features.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content - Syllabus */}
            {sections.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Course Content</h2>
                  <p className="text-sm text-gray-500">
                    {sections.length} sections • {course.syllabus.length} modules • {course.duration}
                  </p>
                </div>

                <div className="border border-gray-800 rounded-2xl overflow-hidden">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-b border-gray-800 last:border-b-0">
                      <button
                        onClick={() => setExpandedSection(expandedSection === sectionIndex ? -1 : sectionIndex)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSection === sectionIndex ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="font-medium text-white">{section.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {section.items.length} modules
                        </span>
                      </button>

                      {expandedSection === sectionIndex && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-[#080808]"
                        >
                          {section.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center gap-3 px-4 py-3 border-t border-gray-800"
                            >
                              <BookOpen className="w-5 h-5 text-[#00E5A8]" />
                              <span className="text-gray-300">{item}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Your Instructor</h2>
              <div className="bg-[#111111] rounded-2xl p-6 border border-gray-800">
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{course.instructor.name}</h3>
                    <p className="text-gray-500 mb-3">Senior Educator & Subject Expert</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>4.8 Instructor Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>10,000+ Students</span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-400 leading-relaxed">
                      With over 10 years of teaching experience, specializing in competitive exam preparation. 
                      Alumni of IIT Delhi with a passion for making complex concepts simple and accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LMSFooter />
    </div>
  );
}

