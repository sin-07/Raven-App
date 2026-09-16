'use client';

import React from 'react';
import { Video, Sparkles, Clock, Rocket, Zap, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';

const Videos: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="bg-[#00E5A8] rounded-lg md:rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-black">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Video Management</h2>
          <p className="text-xs sm:text-sm md:text-base text-black/70">Manage educational videos for your students</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-[#111111] rounded-lg md:rounded-xl shadow-md p-4 sm:p-6 md:p-8 border border-gray-800">
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 168, 0.3); }
              50% { box-shadow: 0 0 40px rgba(0, 229, 168, 0.6); }
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            .float-animation { animation: float 3s ease-in-out infinite; }
            .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
            .shimmer {
              background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
              background-size: 1000px 100%;
              animation: shimmer 3s infinite;
            }
          `}</style>

          <div className="text-center mb-6 sm:mb-8 md:mb-12 relative">
            {/* Floating Icons - Hidden on mobile */}
            <div className="hidden md:block absolute -top-10 left-10 opacity-20">
              <Video className="w-16 lg:w-20 h-16 lg:h-20 text-[#00E5A8] float-animation" style={{ animationDelay: '0s' }} />
            </div>
            <div className="hidden md:block absolute -top-5 right-10 opacity-20">
              <Rocket className="w-12 lg:w-16 h-12 lg:h-16 text-[#00E5A8] float-animation" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="hidden lg:block absolute top-20 left-1/4 opacity-10">
              <Zap className="w-10 lg:w-12 h-10 lg:h-12 text-[#00E5A8] float-animation" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-[#00E5A8]/10 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full shadow-lg mb-4 sm:mb-5 md:mb-6 pulse-glow">
                <Sparkles className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-[#00E5A8] animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-bold text-[#00E5A8] text-sm sm:text-base md:text-lg">
                  Video Upload & Management
                </span>
                <Sparkles className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-[#00E5A8] animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-5 md:mb-6 relative">
                <span className="shimmer absolute inset-0"></span>
                <span className="relative text-[#00E5A8]">
                  Coming Soon
                </span>
              </h1>

              <div className="bg-[#00E5A8] rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Clock className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 mx-auto mb-3 sm:mb-4 text-black animate-pulse" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-black">
                  Launching Very Soon! 🚀
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-black/70 max-w-2xl mx-auto px-2">
                  Our development team is putting the finishing touches on this powerful feature.
                  Get ready for an amazing video management experience!
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8 md:mt-12">
                <div className="bg-[#080808] rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-800 hover:border-[#00E5A8]/30">
                  <Video className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 mx-auto mb-3 sm:mb-4 text-[#00E5A8]" />
                  <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white">Upload & Manage</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Easy video upload and organization</p>
                </div>
                <div className="bg-[#080808] rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-800 hover:border-[#00E5A8]/30">
                  <Zap className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 mx-auto mb-3 sm:mb-4 text-[#00E5A8]" />
                  <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white">Lightning Fast</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Optimized streaming for all students</p>
                </div>
                <div className="bg-[#080808] rounded-lg md:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 md:col-span-1 border border-gray-800 hover:border-[#00E5A8]/30">
                  <Star className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 mx-auto mb-3 sm:mb-4 text-[#00E5A8]" />
                  <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white">Rich Features</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Tags, categories, and advanced search</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedVideos = () => (
  <AdminProtectedRoute>
    <Videos />
  </AdminProtectedRoute>
);

export default ProtectedVideos;

