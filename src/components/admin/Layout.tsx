'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, Users, CheckSquare, FileText, BookOpen, Megaphone, Video, MessageSquare } from 'lucide-react';
import Navbar from '../Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(newIsDesktop);
      if (newIsDesktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initialize on mount
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [sidebarOpen, isDesktop]);

  const menuItems = [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/attendance', icon: CheckSquare, label: 'Attendance' },
    { path: '/admin/tests', icon: FileText, label: 'Tests' },
    { path: '/admin/study-materials', icon: BookOpen, label: 'Study Materials' },
    { path: '/admin/videos', icon: Video, label: 'Videos' },
    { path: '/admin/live-classes', icon: Video, label: 'Live Classes' },
    { path: '/admin/feedbacks', icon: MessageSquare, label: 'Feedbacks' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 relative overflow-hidden">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.7;
          }
        }

        @keyframes menuItemSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sidebar-animate-open {
          animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .sidebar-animate-close {
          animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .overlay-animate {
          animation: fadeInOverlay 0.3s ease-out;
        }

        .menu-item-animate {
          animation: menuItemSlideIn 0.4s ease-out;
        }
      `}</style>

      {/* Regular Navbar - Hidden on mobile/tablet when sidebar is open */}
      {!(sidebarOpen && !isDesktop) && <Navbar />}
      
      {/* Mobile Menu Toggle Button */}
      <div className={`lg:hidden fixed top-16 right-4 z-20 pt-2 transition-all duration-300 ${sidebarOpen && !isDesktop ? 'hidden' : ''}`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[#111111] border border-gray-800 shadow-lg hover:shadow-xl hover:border-[#00E5A8]/30 transition-all hover:scale-110 active:scale-95 duration-200"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X size={24} className="text-white transition-transform duration-300 rotate-90" />
          ) : (
            <Menu size={24} className="text-white transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-10 lg:hidden overlay-animate backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`flex pt-16 ${sidebarOpen && !isDesktop ? 'max-h-screen overflow-hidden' : ''}`}>
        {/* Sidebar - Fixed position, scrollable content */}
        <aside
          className={`${
            sidebarOpen ? 'sidebar-animate-open lg:translate-x-0' : 'sidebar-animate-close lg:translate-x-0'
          } lg:!animate-none fixed w-64 bg-[#080808]/95 backdrop-blur-sm border-r border-gray-800 shadow-lg lg:shadow-md transition-all duration-300 ease-out z-10 ${sidebarOpen && !isDesktop ? 'top-0' : 'top-16'} left-0 bottom-0 overflow-y-auto`}
        >
          {/* Sidebar Header with Logo - Only show when mobile sidebar is open */}
          {sidebarOpen && !isDesktop && (
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
              <img 
                src="/logo.png" 
                alt="RAVEN Logo" 
                className="h-10 w-10 object-contain"
              />

              <div>
                <span className="text-lg font-bold text-white">RAVEN</span>
                <span className="text-lg font-bold text-[#00E5A8]"> Admin</span>
              </div>
            </div>
          )}
          <nav className="mt-4 sm:mt-5 md:mt-6">
            {menuItems.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 text-gray-400 hover:bg-[#00E5A8]/10 hover:text-[#00E5A8] transition-all duration-300 gap-3 relative overflow-hidden group ${
                  pathname === item.path ? 'bg-[#00E5A8]/10 text-[#00E5A8] border-r-4 border-[#00E5A8] shadow-md' : ''
                }`}
                style={{ 
                  animation: sidebarOpen ? `menuItemSlideIn 0.4s ease-out ${index * 0.05}s both` : 'none',
                }}
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E5A8]/0 to-[#00E5A8]/0 group-hover:from-[#00E5A8]/5 group-hover:to-[#00E5A8]/10 transition-all duration-300"></div>
                
                <item.icon size={22} className="flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium text-sm sm:text-base relative z-10">{item.label}</span>
              </Link>
            ))}
            {/* Post Notice Button */}
            <Link
              href="/admin/notices"
              className={`flex items-center px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 text-[#00E5A8] hover:bg-[#00E5A8]/10 hover:text-[#00E5A8] transition-all duration-300 gap-3 relative overflow-hidden group ${
                pathname === '/admin/notices' ? 'bg-[#00E5A8]/10 text-[#00E5A8] border-r-4 border-[#00E5A8] shadow-md' : ''
              }`}
              style={{ 
                animation: sidebarOpen ? `menuItemSlideIn 0.4s ease-out ${menuItems.length * 0.05}s both` : 'none',
              }}
            >
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E5A8]/0 to-[#00E5A8]/0 group-hover:from-[#00E5A8]/5 group-hover:to-[#00E5A8]/10 transition-all duration-300"></div>
              
              <Megaphone size={22} className="flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium text-sm sm:text-base relative z-10">Post Notice</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content - Scrollable area with fixed sidebar on desktop */}
        <main className={`flex-1 w-full ${sidebarOpen && isDesktop ? 'ml-64' : 'ml-0'} p-4 sm:p-5 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] overflow-y-auto`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

