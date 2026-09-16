'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Users, BookOpen, PlayCircle } from 'lucide-react';
import { Course } from '@/types/lms';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={index > 0 ? { opacity: 0, y: 20 } : false}
      whileInView={index > 0 ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={`/courses/${course.id}`}>
        <div className="group bg-[#111111] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-800 hover:border-[#00E5A8]/30 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <PlayCircle className="w-8 h-8 text-[#00E5A8] ml-1" />
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {course.isPopular && (
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
              {course.isFree && (
                <span className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                  Free
                </span>
              )}
            </div>

            {/* Level Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {course.level}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col font-jakarta">
            {/* Category */}
            <span className="text-xs font-space font-medium text-[#00E5A8] uppercase tracking-wider">
              {course.category}
            </span>

            {/* Title */}
            <h3 className="mt-2 text-lg font-bold text-white group-hover:text-[#00E5A8] transition-colors line-clamp-2 font-outfit">
              {course.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-400 line-clamp-2 flex-1 font-jakarta leading-relaxed">
              {course.shortDescription}
            </p>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-white/5" />

            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              {/* Instructor */}
              <div className="flex items-center gap-2">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/20"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-300 truncate max-w-[100px] font-outfit">
                    {course.instructor.name}
                  </span>
                  {course.instructor.qualification && (
                    <span className="text-[11px] text-gray-500 truncate max-w-[100px]">
                      {course.instructor.qualification}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-gray-200 font-space">{course.rating}</span>
                </div>
                <div className="text-right font-space">
                  {course.isFree ? (
                    <span className="text-base font-bold text-emerald-400">Free</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {course.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{course.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-base font-bold text-[#00E5A8]">
                        ₹{course.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

