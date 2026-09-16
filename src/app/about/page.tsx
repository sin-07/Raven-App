'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Target, BookOpen, Users, X, ZoomIn, Sparkles } from 'lucide-react';
import { LMSFooter } from '@/components/lms';
import WavyHeading from '@/components/WavyHeading';
import {
  gsap,
  animateSplitText,
  scrollFadeUp,
  scrollStagger,
  cardTilt,
} from '@/lib/gsap';

interface FacultyMember {
  name: string;
  role: string;
  description: string;
  image?: string;
  specialty: string;
  dept: string;
  qualification: string;
}

interface DevTeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  bio: string;
  education: string;
  skills: string[];
  fullProfile: {
    about: string;
    skills: string[];
    education: string;
    experience: string;
  };
}

const AboutUs: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pageTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const facultyGridRef = useRef<HTMLDivElement>(null);
  const devSectionRef = useRef<HTMLElement>(null);

  const pillars = [
    {
      icon: Target,
      title: 'Our Mission',
      desc: 'To provide accessible, high-impact education that builds rock-solid conceptual mastery and moral discipline, equipping students to conquer competitive exams and future careers.',
    },
    {
      icon: BookOpen,
      title: 'Our Approach',
      desc: 'Detailed theory reinforced with real-life visualization, graded Daily Practice Papers (DPPs), periodic proctored mock exams, and instant 1-on-1 doubt resolution clinics.',
    },
    {
      icon: Users,
      title: 'Our Philosophy',
      desc: 'We believe true mentorship requires educators to be passionate lifelong learners. We cultivate curiosity, discipline, and critical thinking in every single classroom session.',
    },
  ];

  const faculty: FacultyMember[] = [
    {
      name: 'S. Nandan Verma',
      role: 'Faculty & Operations Head',
      dept: 'Life Sciences',
      specialty: 'Life Sciences & Biology',
      qualification: 'M.Sc Life Sciences',
      description: 'Dedicated to developing an inquisitive aptitude in students regarding their education and competitive career paths.',
    },
    {
      name: 'Rakesh Ranjan',
      role: 'CEO & Senior Faculty',
      dept: 'Medical Pedagogy',
      specialty: 'Medical Sciences & Pedagogy',
      qualification: 'MBBS (Pursuing), NMCH',
      description: 'Experienced educator focusing on concept-first pedagogy. Committed to creating a premier platform for aspiring medical students.',
    },
    {
      name: 'Abhinay Gupta',
      role: 'Chief Project Officer',
      dept: 'Management & Logistics',
      specialty: 'Commerce & Management',
      qualification: 'M.Com, Educational Strategy',
      description: 'Ensuring structured operational excellence and seamless academic batch scheduling across all branches.',
    },
    {
      name: 'Niraj Kumar',
      role: 'Faculty & CPRO',
      dept: 'Foundational Sciences',
      specialty: 'Foundational Pedagogy',
      qualification: 'B.A-B.Ed (BRABU), CTET Qualified',
      description: 'Extensive teaching expertise in conceptual clarity, child psychology, and structured board preparations.',
    },
    {
      name: 'Guddu Kumar',
      role: 'Senior Mathematics Faculty',
      dept: 'Higher Mathematics',
      specialty: 'Higher Mathematics & Logic',
      qualification: 'B.Sc. Mathematics',
      description: 'Passionate about transforming complex mathematical formulas and calculus into intuitive problem-solving models.',
    },
  ];

  const devTeam: DevTeamMember[] = [
    {
      name: 'ANIKET SINGH',
      role: 'CTO & Lead Architect',
      education: 'ITER College - Computer Science Engineering',
      bio: 'Full-stack software architect and CTO at RAVEN Tutorials. Specializing in high-performance cloud architectures, real-time student portals, and fluid user experiences.',
      description: 'Full-stack software engineer & CTO at RAVEN Tutorials with 5+ years of software development experience.',
      image: '/AniketSingh.jpg',
      skills: ['Next.js 14', 'React.js', 'Node.js', 'MongoDB', 'TypeScript', 'GSAP Animation', 'Express.js', 'Python'],
      fullProfile: {
        about: 'Passionate full-stack developer and CTO at RAVEN Tutorials with expertise across Next.js, Node.js, and MongoDB. Currently pursuing Computer Science Engineering at ITER College, I specialize in crafting high-performance, real-time educational systems and seamless digital learning portals.',
        skills: [
          'Next.js 14',
          'React.js',
          'TypeScript',
          'Node.js',
          'MongoDB',
          'Express.js',
          'Python',
          'UI/UX & GSAP'
        ],
        education: 'ITER College - Computer Science Engineering',
        experience: '5+ years in Full Stack Architecture & Engineering'
      }
    }
  ];

  // GSAP animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (pageTitleRef.current) animateSplitText(pageTitleRef.current, 0.2, 0.5);

      if (heroSubRef.current) {
        gsap.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.5, ease: 'power3.out', clearProps: 'all' }
        );
      }

      if (missionRef.current) scrollFadeUp(missionRef.current);

      if (facultyGridRef.current) {
        const cards = facultyGridRef.current.querySelectorAll('.faculty-card');
        scrollStagger(cards, 0.12);
        cards.forEach((card) => cardTilt(card as HTMLElement));
      }

      if (devSectionRef.current) scrollFadeUp(devSectionRef.current);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (showModal || showImageModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal, showImageModal]);

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        <div className="relative z-10">
          {/* Header Section */}
          <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-4 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md mx-auto">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>About RAVEN Tutorials</span>
            </div>

            <WavyHeading
              text="Architecting"
              gradientText="Academic Excellence"
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full"
            />

            <p
              ref={heroSubRef}
              className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta leading-relaxed text-center"
            >
              A premier educational institution in Patna, Bihar dedicated to empowering students through rigorous conceptual clarity, empathetic mentorship, and modern digital learning.
            </p>
          </section>

          {/* Core Pillars: Mission, Approach & Philosophy */}
          <section ref={missionRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/45 hover:bg-[#12182c] transition-all duration-300 group hover:-translate-y-1.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                    <pillar.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-outfit mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-300 text-sm font-jakarta leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Faculty Showcase */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 content-auto">
            <div className="text-center mb-14">
              <span className="pill-badge mb-4">Master Mentors</span>
              <WavyHeading
                text="Our Distinguished"
                gradientText="Faculty"
                as="h2"
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
              />
              <p className="mt-3 text-base text-gray-400 max-w-2xl mx-auto font-jakarta">
                Educators with decades of collective experience producing top 100 ranks across Board and National competitive exams.
              </p>
            </div>

            <div ref={facultyGridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {faculty.map((member, index) => (
                <div
                  key={index}
                  className="faculty-card p-6 rounded-3xl bg-[#0e1320]/80 border border-white/10 hover:border-emerald-500/40 hover:bg-[#12182c] transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-800/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 mx-auto font-black text-2xl font-outfit shadow-md">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-space font-semibold uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {member.dept}
                      </span>
                      <h3 className="text-xl font-bold text-white font-outfit mt-3 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-jakarta mb-3">
                        {member.qualification}
                      </p>
                      <p className="text-xs text-gray-300 font-jakarta leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technology & Development Team */}
          <section ref={devSectionRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 content-auto">
            <div className="text-center mb-14">
              <span className="pill-badge mb-4">Engineering & Architecture</span>
              <WavyHeading
                text="Digital Infrastructure &"
                gradientText="Development"
                as="h2"
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-outfit tracking-tight"
              />
              <p className="mt-3 text-base text-gray-400 max-w-2xl mx-auto font-jakarta">
                The core technology stack and digital learning engineering powering RAVEN Tutorials.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              {devTeam.map((dev, index) => (
                <div
                  key={index}
                  className="p-8 sm:p-10 rounded-3xl bg-[#0e1320]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6 hover:border-emerald-500/60 transition-all"
                >
                  <div 
                    className="relative w-36 h-36 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 group cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <Image
                      src={dev.image || "/AniketSingh.jpg"}
                      alt={dev.name}
                      fill
                      unoptimized
                      priority
                      className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-outfit font-bold backdrop-blur-[2px]">
                      <ZoomIn className="w-4 h-4 text-emerald-400" />
                      <span>View Photo</span>
                    </div>
                  </div>

                  <div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-space tracking-wider">
                      {dev.role}
                    </span>
                    <h3 className="text-3xl font-black text-white font-outfit mt-3">
                      {dev.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-jakarta mt-1">
                      {dev.education}
                    </p>
                  </div>

                  <p className="text-gray-300 text-sm font-jakarta leading-relaxed">
                    {dev.bio}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {dev.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1 bg-[#141a2c] text-gray-300 rounded-xl text-xs font-medium border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all duration-300 shadow-xl shadow-emerald-500/25 text-sm font-outfit transform hover:scale-[1.02]"
                  >
                    View Full Profile & Tech Stack
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Global High-Priority Modal rendered via React Portal directly into body */}
      {mounted && showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex items-center justify-center z-[999999] p-4 sm:p-6 overflow-y-auto" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-[#0e1320] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl overflow-hidden relative z-[1000000] my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-8 relative text-black">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-black hover:bg-black/20 rounded-full p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-black/30 overflow-hidden shadow-2xl relative">
                <Image
                  src={devTeam[0].image || "/AniketSingh.jpg"}
                  alt={devTeam[0].name}
                  fill
                  unoptimized
                  priority
                  className="object-cover object-top"
                />
              </div>
              <h2 className="text-3xl font-black text-center font-outfit">
                {devTeam[0].name}
              </h2>
              <p className="text-black/80 text-center font-space text-sm font-semibold tracking-wider uppercase">
                {devTeam[0].role}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 font-jakarta">
              <div>
                <h4 className="text-lg font-bold text-white font-outfit mb-2">About Me</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {devTeam[0].fullProfile.about}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-outfit mb-3">Core Skills & Technologies</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {devTeam[0].fullProfile.skills.map((skill, skillIndex) => (
                    <div 
                      key={skillIndex}
                      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-center text-xs font-semibold font-space"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                  <p className="text-xs text-emerald-400 font-space uppercase">Education</p>
                  <p className="text-sm text-gray-200 font-semibold mt-1">{devTeam[0].fullProfile.education}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#141a2c] border border-white/5">
                  <p className="text-xs text-emerald-400 font-space uppercase">Experience</p>
                  <p className="text-sm text-gray-200 font-semibold mt-1">{devTeam[0].fullProfile.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Photo Modal rendered via React Portal */}
      {mounted && showImageModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[999999] p-4" 
          onClick={() => setShowImageModal(false)}
        >
          <button 
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition z-[1000000]"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={devTeam[0].image || "/AniketSingh.jpg"}
              alt="Aniket Singh"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>,
        document.body
      )}

      <LMSFooter />
    </>
  );
};

export default AboutUs;
