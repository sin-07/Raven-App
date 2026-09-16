'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  GraduationCap, 
  Video, 
  MessageCircle, 
  FileText, 
  BarChart, 
  Award,
  ArrowRight,
  Star,
  Users,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Microscope,
  Calculator,
  Monitor,
  BookMarked,
  TrendingUp,
  Palette,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import { LMSFooter, CourseCard } from '@/components/lms';
import { testimonials, features, categories } from '@/constants/lmsData';
import { Course } from '@/types/lms';
import WavyHeading from '@/components/WavyHeading';
import {
  gsap,
  scrollFadeUp,
  scrollStagger,
  cardTilt,
  magneticHover,
} from '@/lib/gsap';

// Lazily load heavy admission section to optimize initial bundle
const AdmissionSection = dynamic(() => import('@/components/AdmissionSection'), {
  ssr: false,
  loading: () => (
    <div className="py-24 flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
    </div>
  ),
});

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  GraduationCap,
  Video,
  MessageCircle,
  FileText,
  BarChart,
  Award,
};

const categoryIconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Microscope,
  Calculator,
  Monitor,
  BookMarked,
  TrendingUp,
  Palette,
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // GSAP animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);

  const featuresSectionRef = useRef<HTMLElement>(null);
  const featuresTitleRef = useRef<HTMLHeadingElement>(null);
  const featuresGridRef = useRef<HTMLDivElement>(null);

  const methodologySectionRef = useRef<HTMLElement>(null);
  const methodologyGridRef = useRef<HTMLDivElement>(null);

  const coursesSectionRef = useRef<HTMLElement>(null);
  const coursesTitleRef = useRef<HTMLDivElement>(null);
  const categoriesSectionRef = useRef<HTMLElement>(null);
  const categoriesGridRef = useRef<HTMLDivElement>(null);
  const testimonialsSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // GSAP animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroBadgeRef.current) {
        tl.fromTo(heroBadgeRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 });
      }

      if (heroTitleRef.current) {
        const titleLines = Array.from(heroTitleRef.current.children);
        tl.fromTo(
          titleLines,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
          '-=0.3'
        );
      }

      if (heroSubRef.current) {
        tl.fromTo(heroSubRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
      }

      if (heroCTARef.current) {
        tl.fromTo(heroCTARef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2');
      }

      if (heroVisualRef.current) {
        gsap.fromTo(
          heroVisualRef.current,
          { opacity: 0, scale: 0.92, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' }
        );
      }

      // 2. Features ScrollTrigger
      if (featuresTitleRef.current) {
        scrollFadeUp(featuresTitleRef.current);
      }
      if (featuresGridRef.current) {
        const cards = featuresGridRef.current.querySelectorAll('.feature-card');
        scrollStagger(cards, 0.1);
        cards.forEach((card) => cardTilt(card as HTMLElement));
      }

      // 3. Methodology ScrollTrigger
      if (methodologyGridRef.current) {
        const steps = methodologyGridRef.current.querySelectorAll('.methodology-step');
        scrollStagger(steps, 0.12);
      }

      // 4. Courses ScrollTrigger
      if (coursesTitleRef.current) {
        scrollFadeUp(coursesTitleRef.current);
      }

      // 5. Categories Grid
      if (categoriesGridRef.current) {
        const catCards = categoriesGridRef.current.querySelectorAll('.cat-card');
        scrollStagger(catCards, 0.06);
      }

      // 6. Testimonials Grid
      if (testimonialsSectionRef.current) {
        const cards = testimonialsSectionRef.current.querySelectorAll('.testimonial-card');
        scrollStagger(cards, 0.1);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'foundation') return c.category.toLowerCase().includes('foundation') || c.category.toLowerCase().includes('class');
    if (activeTab === 'science') return c.category.toLowerCase().includes('science') || c.category.toLowerCase().includes('physics') || c.category.toLowerCase().includes('math');
    if (activeTab === 'competitive') return c.category.toLowerCase().includes('jee') || c.category.toLowerCase().includes('neet');
    return true;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-7">
          {/* Badge Pill */}
          <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Academic Excellence & Competitive Mastery</span>
          </div>

          {/* Display Headline */}
          <WavyHeading
            text="Empower Your Mind."
            gradientText="Lead Your Future."
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.06] tracking-tight font-outfit"
            continuous={true}
          />

          {/* Subtitle */}
          <p
            ref={heroSubRef}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-jakarta font-normal leading-relaxed"
          >
            Premier offline & digital coaching for <span className="text-white font-semibold">CBSE, ICSE, BSEB, JEE (Main & Advanced)</span>, and <span className="text-white font-semibold">NEET</span>. Experience personalized mentorship with India&apos;s finest educators.
          </p>

          {/* Action CTAs */}
          <div ref={heroCTARef} className="flex flex-wrap items-center justify-center gap-4 pt-4 font-outfit">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all duration-300 shadow-xl shadow-emerald-500/25 transform hover:scale-[1.02] text-sm sm:text-base"
            >
              <span>Explore Programs</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#101422]/90 hover:bg-[#151c30] text-white font-semibold rounded-xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 text-sm sm:text-base font-jakarta backdrop-blur-xl shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Apply for Admission</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE RAVEN (FEATURES MATRIX) ────────────────────────── */}
      <section ref={featuresSectionRef} className="py-24 bg-transparent border-t border-white/5 relative z-10 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="pill-badge mb-4">Why Choose RAVEN</span>
            <WavyHeading
              text="An Ecosystem Built for"
              gradientText="High Achievers"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
            />
            <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-jakarta">
              From foundational concepts to advanced competitive problem-solving, our structured methodology ensures top results.
            </p>
          </div>

          <div ref={featuresGridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || GraduationCap;
              return (
                <div
                  key={index}
                  className="feature-card group p-8 rounded-3xl bg-[#0e1320]/75 border border-white/5 hover:border-emerald-500/35 hover:bg-[#12192c]/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 hover:-translate-y-1.5 backdrop-blur-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-outfit group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-jakarta text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4-STEP LEARNING METHODOLOGY ────────────────────────── */}
      <section ref={methodologySectionRef} className="py-24 bg-transparent border-t border-white/5 relative z-10 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="pill-badge mb-4">Structured Pedagogy</span>
            <WavyHeading
              text="The 4-Step Road to"
              gradientText="Rank 1"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
            />
            <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-jakarta">
              A scientifically proven preparation model that leaves zero knowledge gaps.
            </p>
          </div>

          <div ref={methodologyGridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="methodology-step p-7 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-md relative">
              <span className="text-4xl font-black text-emerald-400/25 font-space absolute top-6 right-6">01</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-outfit">Concept Mastery</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-jakarta">
                Deep theoretical breakdown with visualization, live demonstrations, and intuitive understanding.
              </p>
            </div>

            <div className="methodology-step p-7 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-md relative">
              <span className="text-4xl font-black text-emerald-400/25 font-space absolute top-6 right-6">02</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-outfit">Targeted Practice</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-jakarta">
                Graded Daily Practice Papers (DPPs) ranging from foundational boards to high-difficulty competitive questions.
              </p>
            </div>

            <div className="methodology-step p-7 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-md relative">
              <span className="text-4xl font-black text-emerald-400/25 font-space absolute top-6 right-6">03</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-outfit">1-on-1 Doubt Relief</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-jakarta">
                Dedicated daily doubt clearing clinics ensuring no student leaves the classroom with unresolved questions.
              </p>
            </div>

            <div className="methodology-step p-7 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-md relative">
              <span className="text-4xl font-black text-emerald-400/25 font-space absolute top-6 right-6">04</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-outfit">Real-Time Testing</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-jakarta">
                National level mock tests with instant graphical AI analysis, speed benchmarking, and rank prediction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES SHOWCASE ────────────────────────── */}
      <section ref={coursesSectionRef} className="py-24 bg-transparent border-t border-white/5 relative z-10 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={coursesTitleRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="pill-badge mb-4">Academic Catalog</span>
              <WavyHeading
                text="Featured Programs &"
                gradientText="Batches"
                as="h2"
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight !text-left"
              />
              <p className="mt-3 text-base text-gray-400 max-w-xl font-jakarta">
                Choose the specialized batch aligned with your academic year and competitive target.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap font-jakarta text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'all'
                    ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-[#101422] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveTab('foundation')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'foundation'
                    ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-[#101422] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                Class 8 - 10
              </button>
              <button
                onClick={() => setActiveTab('science')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'science'
                    ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-[#101422] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                Class 11 - 12
              </button>
              <button
                onClick={() => setActiveTab('competitive')}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === 'competitive'
                    ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-[#101422] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                JEE & NEET
              </button>
            </div>
          </div>

          {/* Grid of Courses */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-400 font-jakarta">No courses currently found in this category.</p>
              </div>
            ) : (
              filteredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY SUBJECT / CATEGORY ────────────────────────── */}
      <section ref={categoriesSectionRef} className="py-24 bg-transparent border-t border-white/5 relative z-10 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="pill-badge mb-4">Curriculum Disciplines</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight">
              Browse by Subject Focus
            </h2>
          </div>

          <div ref={categoriesGridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const CategoryIcon = categoryIconMap[category.icon] || Microscope;
              return (
                <div key={category.name} className="cat-card">
                  <Link
                    href={`/courses?category=${category.name.toLowerCase()}`}
                    className="block p-6 rounded-2xl bg-[#0e1320]/75 border border-white/5 hover:border-emerald-500 hover:bg-emerald-500 group transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                      <CategoryIcon className="w-6 h-6 text-emerald-400 group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="font-bold text-white group-hover:text-black transition-colors font-outfit text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400 group-hover:text-black/70 transition-colors mt-1 font-jakarta">
                      {category.count} Modules
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ADMISSION FLOW COMPONENT ────────────────────────── */}
      <AdmissionSection />

      {/* ── TESTIMONIALS SECTION ────────────────────────── */}
      <section ref={testimonialsSectionRef} className="py-24 bg-transparent border-t border-white/5 relative z-10 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="pill-badge mb-4">Hall of Fame</span>
            <WavyHeading
              text="Trusted by Students &"
              gradientText="Parents"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
            />
            <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-jakarta">
              Real stories from students who unlocked their dream ranks with RAVEN Tutorials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="testimonial-card rounded-3xl p-7 bg-[#0e1320]/80 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1.5 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-jakarta">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800/60">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <p className="font-bold text-white font-outfit text-sm">{testimonial.name}</p>
                    <p className="text-xs text-emerald-400 font-space">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONVERSION CTA BANNER ────────────────────────── */}
      <section ref={ctaSectionRef} className="py-28 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b12] to-emerald-950/30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-wider font-space font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Admissions for 2026-27 Academic Session Now Open</span>
          </div>

          <WavyHeading
            text="Ready to Accelerate Your"
            gradientText="Learning?"
            as="h2"
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-outfit tracking-tight"
          />

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta leading-relaxed">
            Secure your seat in our premier batch. Experience expert classroom mentorship, personalized tests, and continuous rank improvement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 font-outfit">
            <Link
              href="/admission"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all duration-300 shadow-xl shadow-emerald-500/25 text-base transform hover:scale-[1.02]"
            >
              <span>Apply Online Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#101422]/90 hover:bg-[#151c30] text-white font-semibold rounded-xl border border-white/10 hover:border-emerald-400 transition-all text-base font-jakarta backdrop-blur-xl"
            >
              <span>Speak to Academic Counselor</span>
            </Link>
          </div>
        </div>
      </section>

      <LMSFooter />
    </div>
  );
}


