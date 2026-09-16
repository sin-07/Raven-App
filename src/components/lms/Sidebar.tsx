'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Settings,
  GraduationCap,
  Users,
  BarChart3,
  FileText,
  Bell,
  Award,
  Clock,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'instructor' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', href: '/dashboard/courses' },
    { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
    { icon: FileText, label: 'Assignments', href: '/dashboard/assignments' },
    { icon: Award, label: 'Certificates', href: '/dashboard/certificates' },
    { icon: Clock, label: 'Watch History', href: '/dashboard/history' },
    { icon: MessageSquare, label: 'Discussions', href: '/dashboard/discussions' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ],
  instructor: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/instructor' },
    { icon: BookOpen, label: 'My Courses', href: '/instructor/courses' },
    { icon: Users, label: 'Students', href: '/instructor/students' },
    { icon: BarChart3, label: 'Analytics', href: '/instructor/analytics' },
    { icon: MessageSquare, label: 'Messages', href: '/instructor/messages' },
    { icon: FileText, label: 'Assignments', href: '/instructor/assignments' },
    { icon: Calendar, label: 'Schedule', href: '/instructor/schedule' },
    { icon: Settings, label: 'Settings', href: '/instructor/settings' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
    { icon: GraduationCap, label: 'Instructors', href: '/admin/instructors' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: FileText, label: 'Reports', href: '/admin/reports' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ],
};

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#111111] border-r border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="RAVEN Logo" 
                className="h-8 w-8 object-contain"
              />

              <div className="flex items-baseline gap-1 font-outfit">
                <span className="text-base font-extrabold text-white">RAVEN</span>
                <span className="text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Tutorials</span>
              </div>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 lg:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-black shadow-md shadow-[#00E5A8]/25' 
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

