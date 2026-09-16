'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Grid3X3, 
  List,
  X,
  GraduationCap,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { LMSFooter, CourseCard } from '@/components/lms';
import { categories, dummyCourses } from '@/constants/lmsData';
import { Course } from '@/types/lms';
import WavyHeading from '@/components/WavyHeading';

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['Most Popular', 'Highest Rated', 'Newest', 'Price: Low to High', 'Price: High to Low'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(dummyCourses);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
        setCourses(data.courses);
      } else {
        setCourses(dummyCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(dummyCourses);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    const matchesPrice = showFreeOnly ? course.isFree : true;

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'Price: Low to High':
        return a.price - b.price;
      case 'Price: High to Low':
        return b.price - a.price;
      default:
        return b.totalStudents - a.totalStudents;
    }
  });

  return (
    <>
      <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative z-10 pt-36 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-5 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md mx-auto">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Curated Academic Curricula</span>
          </div>

          <WavyHeading
            text="Explore Our"
            gradientText="Courses"
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full"
          />

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta text-center">
            Comprehensive foundation programs, board preparations, and competitive JEE & NEET batches taught by master educators.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4 font-jakarta">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject (Physics, Math), standard (Class 10, 12), or topic..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#0e1320]/80 border border-emerald-500/20 text-white placeholder-gray-500 shadow-2xl focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-sm sm:text-base font-jakarta transition backdrop-blur-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filters & Course Catalog */}
        <section className="py-8 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-[#0e1320] text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                All Courses
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-[#0e1320] text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 bg-[#0e1320] rounded-xl border border-white/10 text-xs sm:text-sm font-medium text-gray-300 focus:outline-none focus:border-emerald-400 font-jakarta"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#0e1320] text-white">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center bg-[#0e1320] rounded-xl border border-white/10 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs sm:text-sm text-gray-400 font-jakarta">
              Showing <span className="font-bold text-white">{sortedCourses.length}</span> programs
              {selectedCategory !== 'All' && (
                <span> in <span className="text-emerald-400 font-semibold">{selectedCategory}</span></span>
              )}
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
            </div>
          ) : sortedCourses.length > 0 ? (
            <div className={`grid gap-6 sm:gap-8 ${
              viewMode === 'grid' 
                ? 'sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {sortedCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 rounded-3xl bg-[#0e1320]/60 border border-white/5 max-w-xl mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-outfit mb-2">No matching courses found</h3>
              <p className="text-gray-400 text-sm mb-6 font-jakarta">
                Try adjusting your search keywords or switching category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All Levels');
                }}
                className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-sm font-outfit hover:bg-emerald-400 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        <LMSFooter />
      </div>
    </>
  );
}


