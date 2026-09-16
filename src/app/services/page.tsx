'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Microscope, 
  FileText, 
  BarChart3, 
  Book, 
  Rocket, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { LMSFooter } from '@/components/lms';
import WavyHeading from '@/components/WavyHeading';
import {
  gsap,
  animateSplitText,
  scrollFadeUp,
  scrollStagger,
  cardTilt,
} from '@/lib/gsap';

const Services: React.FC = () => {
  const router = useRouter();

  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pageTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);
  const detailsSectionRef = useRef<HTMLElement>(null);
  const classCardsRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (pageTitleRef.current) animateSplitText(pageTitleRef.current, 0.2, 0.5);

      if (heroSubRef.current) {
        gsap.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.65, delay: 0.5, ease: 'power3.out', clearProps: 'all' }
        );
      }

      if (servicesGridRef.current) {
        const cards = servicesGridRef.current.querySelectorAll('.service-card');
        scrollStagger(cards, 0.08);
        cards.forEach((c) => cardTilt(c as HTMLElement));
      }

      if (detailsSectionRef.current) scrollFadeUp(detailsSectionRef.current);

      if (classCardsRef.current) {
        const cards = classCardsRef.current.querySelectorAll('.class-card');
        scrollStagger(cards, 0.1);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const services = [
    {
      icon: BookOpen,
      title: 'Full Week Classroom Sessions',
      description: 'Systematic daily lectures conducted throughout the week with dedicated doubt-clearing sessions on Sundays.',
    },
    {
      icon: GraduationCap,
      title: 'Career & Olympiad Workshops',
      description: 'Special seminars aimed at guiding students toward competitive examinations, Olympiads, and STEM career opportunities.',
    },
    {
      icon: Users,
      title: '1-on-1 Individual Mentorship',
      description: 'Personalized diagnostic sessions designed to resolve specific learning bottlenecks for each individual student.',
    },
    {
      icon: Microscope,
      title: 'Science Practical Demonstrations',
      description: 'Hands-on laboratory simulations and experiment breakdowns ensuring intuitive real-world comprehension.',
    },
    {
      icon: FileText,
      title: 'Monthly Benchmarking Tests',
      description: 'Rigorous monthly assessments designed to track academic velocity, subject retention, and time management.',
    },
    {
      icon: BarChart3,
      title: 'Board Pattern Proctored Exams',
      description: 'Full-syllabus mock tests strictly matching CBSE, ICSE, and BSEB board patterns for Classes 10 and 12.',
    },
    {
      icon: Book,
      title: 'Specialized Revision Batches',
      description: 'Focused revision modules and formula-sheet reviews before pre-boards and national level competitive exams.',
    },
    {
      icon: Rocket,
      title: 'High-Impact Crash Courses',
      description: 'Fast-track intensive programs covering key high-weightage topics and previous years question (PYQ) solving.',
    }
  ];

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        <div className="relative z-10">
          {/* Header Section */}
          <section className="pt-36 pb-14 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-4 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md mx-auto">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Comprehensive Academic Offerings</span>
            </div>

            <WavyHeading
              text="Academic"
              gradientText="Services & Programs"
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full"
            />

            <p
              ref={heroSubRef}
              className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta leading-relaxed text-center"
            >
              Tailored classroom pedagogy, intensive mock testing series, and individualized doubt mentorship built to guarantee rank improvements.
            </p>
          </section>

          {/* Services Matrix */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div ref={servicesGridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className="service-card p-8 rounded-3xl bg-[#0e1320]/80 border border-white/5 hover:border-emerald-500/35 hover:bg-[#12192c] transition-all duration-300 shadow-xl backdrop-blur-xl hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-md shadow-emerald-500/10">
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 font-outfit">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-jakarta">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Class, Batch & Subject Details */}
          <section ref={detailsSectionRef} className="py-24 bg-[#090b12] border-t border-white/5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="pill-badge mb-4">Batch Framework</span>
                <WavyHeading
                  text="Class & Subject"
                  gradientText="Structure"
                  as="h2"
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
                />
                <p className="mt-3 text-base text-gray-400 max-w-2xl mx-auto font-jakarta">
                  Explore curriculum tracks across foundational and senior secondary standards.
                </p>
              </div>

              {/* Class Cards Grid */}
              <div ref={classCardsRef} className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Class XII */}
                <div className="class-card p-8 rounded-3xl bg-[#0e1320]/85 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-2xl font-outfit shadow-lg shadow-emerald-500/20">
                        12
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-outfit">Class XII</h3>
                        <p className="text-xs text-emerald-400 font-space uppercase">Senior Secondary & Boards</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">Subject-wise</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 font-jakarta text-sm">
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Annual Batch
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Physics (Theory + Numericals)</li>
                        <li>• Chemistry (Organic, Inorganic, Physical)</li>
                        <li>• Biology (Zoology & Botany)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <Rocket className="w-4 h-4 text-emerald-400" />
                        Crash Course
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Rapid Board PYQ Solving</li>
                        <li>• High-Weightage Concept Blitz</li>
                        <li>• Proctored Sample Paper Series</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Class XI */}
                <div className="class-card p-8 rounded-3xl bg-[#0e1320]/85 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-2xl font-outfit shadow-lg shadow-emerald-500/20">
                        11
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-outfit">Class XI</h3>
                        <p className="text-xs text-emerald-400 font-space uppercase">Foundation for Competitive Exams</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">Subject-wise</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 font-jakarta text-sm">
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Annual Batch
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Physics (Mechanics & Waves)</li>
                        <li>• Chemistry (Fundamental Principles)</li>
                        <li>• Biology (Cell & Diversity)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <Rocket className="w-4 h-4 text-emerald-400" />
                        Competitive Edge
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• JEE / NEET Problem Drills</li>
                        <li>• Advanced DPPs & Numerical Sets</li>
                        <li>• Continuous Speed Benchmarking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Class X */}
                <div className="class-card p-8 rounded-3xl bg-[#0e1320]/85 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-2xl font-outfit shadow-lg shadow-emerald-500/20">
                        10
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-outfit">Class X</h3>
                        <p className="text-xs text-emerald-400 font-space uppercase">Board Target Batch</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">Full Syllabus</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 font-jakarta text-sm">
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Comprehensive Batch
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Mathematics & Higher Geometry</li>
                        <li>• Science (Physics, Chem, Bio)</li>
                        <li>• Social Science & English</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <Rocket className="w-4 h-4 text-emerald-400" />
                        Pre-Board Crash Batch
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Full Mock Paper Simulations</li>
                        <li>• Answer Writing Optimization</li>
                        <li>• 100% Board Syllabus Review</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Class IX */}
                <div className="class-card p-8 rounded-3xl bg-[#0e1320]/85 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-black text-2xl font-outfit shadow-lg shadow-emerald-500/20">
                        09
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-outfit">Class IX</h3>
                        <p className="text-xs text-emerald-400 font-space uppercase">Foundation Building</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">Full Syllabus</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 font-jakarta text-sm">
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Annual Program
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• Mathematics & Logical Reasoning</li>
                        <li>• General Science Foundations</li>
                        <li>• English & Social Studies</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                      <p className="font-bold text-white font-outfit mb-2 flex items-center gap-1.5">
                        <Rocket className="w-4 h-4 text-emerald-400" />
                        Exam Revision
                      </p>
                      <ul className="space-y-1.5 text-gray-300 text-xs">
                        <li>• School Exam Question Banks</li>
                        <li>• Weekly Timed Tests</li>
                        <li>• Conceptual Doubt Resolution</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 border-t border-white/5 px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit">
                Ready to Join a Batch?
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto font-jakarta text-base">
                Secure your admission today and start your journey toward academic distinction.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Link
                  href="/admission"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] font-outfit"
                >
                  Apply for Admission
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <LMSFooter />
    </>
  );
};

export default Services;


