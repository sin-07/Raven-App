'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, UserCircle, Sparkles, CheckCircle2, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { LMSFooter } from '@/components/lms';
import WavyHeading from '@/components/WavyHeading';

export default function AdmissionPage() {
  return (
    <>
      <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
          {/* Header */}
          <div className="text-center space-y-4 mb-14 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md mx-auto">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Enrollment Portal</span>
            </div>

            <WavyHeading
              text="Begin Your Journey with"
              gradientText="RAVEN"
              className="text-4xl sm:text-6xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full"
            />

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta text-center">
              Choose your profile track below to register for classroom batches or join our teaching faculty.
            </p>
          </div>

          {/* Admission Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Learner Track */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-[#12182c] transition-all duration-300 shadow-2xl backdrop-blur-xl flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/15 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold uppercase font-space tracking-wider mb-3">
                  Student Enrollment
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit mb-3">
                  Admission as a Learner
                </h2>

                <p className="text-gray-300 text-sm font-jakarta leading-relaxed mb-6">
                  Join offline Patna classroom batches, get personalized mentor support, structured DPPs, and comprehensive test series.
                </p>

                <ul className="space-y-3 mb-8 font-jakarta text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Access to Class 9-12 & JEE/NEET tracks</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Daily lectures + Sunday doubt-clearing sessions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>1:15 small batch student-to-teacher attention</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Monthly proctored progress benchmarking</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/admission/learner"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl text-center font-outfit text-base shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Register as a Learner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tutor Track */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#0e1320]/80 border border-white/10 hover:border-emerald-500/40 hover:bg-[#12182c] transition-all duration-300 shadow-2xl backdrop-blur-xl flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 mb-6 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all group-hover:scale-105">
                  <UserCircle className="w-8 h-8" />
                </div>

                <div className="inline-block px-3 py-1 bg-white/5 text-gray-300 rounded-full text-xs font-semibold uppercase font-space tracking-wider mb-3">
                  Faculty Application
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit mb-3">
                  Join as an Instructor
                </h2>

                <p className="text-gray-300 text-sm font-jakarta leading-relaxed mb-6">
                  Teach high-achieving batches, design specialized test series, and mentor the next generation of top performers in Patna.
                </p>

                <ul className="space-y-3 mb-8 font-jakarta text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>State-of-the-art smart classroom setup</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Collaborative academic curriculum design</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Competitive honorarium & performance incentives</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Dedicated teaching assistant support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/admission/tutor"
                className="w-full py-4 bg-[#141a2c] hover:bg-[#1a2238] border border-white/10 text-white font-bold rounded-xl text-center font-outfit text-base transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Apply as Instructor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Login Redirection Footer */}
          <p className="text-center text-sm text-gray-400 font-jakarta">
            Already registered with RAVEN Tutorials?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Sign in to Dashboard →
            </Link>
          </p>
        </div>
      </div>
      <LMSFooter />
    </>
  );
}

