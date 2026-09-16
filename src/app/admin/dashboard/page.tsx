'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import toast from 'react-hot-toast';
import { Users, FileText, UserPlus, Calendar, TrendingUp, CheckCircle, GraduationCap, Clock, XCircle, Eye } from 'lucide-react';
import { Loader } from '@/components';
import useSessionTimeout from '@/hooks/useSessionTimeout';

interface TestData {
  _id: string;
  title: string;
  class: string;
  subject: string;
  testDate: string;
  status: string;
}

interface TeacherAppData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface StatsData {
  stats: {
    totalStudents: number;
    totalTests: number;
    recentAdmissions: number;
    totalTeacherApplications: number;
    pendingTeacherApplications: number;
    approvedTeacherApplications: number;
    rejectedTeacherApplications: number;
  };
  upcomingTests: TestData[];
  recentTeacherApplications: TeacherAppData[];
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  
  // Initialize session timeout for admin (auto-logout after 1 hour)
  useSessionTimeout('admin');
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        credentials: 'include'
      });
      
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-5 md:space-y-6 px-0 sm:px-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00E5A8] to-[#00B386] rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 text-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Dashboard Overview</h2>
            <p className="text-xs sm:text-sm text-black/70">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
        </div>

        {/* Stats Cards with animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <div className="bg-[#111111] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-4 md:p-5 lg:p-6 border border-gray-800 hover:border-[#00E5A8]/30 animate-fade-in group" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#00E5A8] text-xs sm:text-xs md:text-sm font-bold uppercase tracking-wide">Total Students</p>
                <p className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1 sm:mt-2">{stats?.stats?.totalStudents || 0}</p>
                <p className="text-xs sm:text-xs md:text-sm text-gray-400 mt-0.5 sm:mt-1 truncate font-medium">Enrolled students</p>
              </div>
              <div className="bg-[#00E5A8] p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:bg-[#00E5A8]/90 transition-all">
                <Users className="text-black" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-4 md:p-5 lg:p-6 border border-gray-800 hover:border-[#00E5A8]/30 animate-fade-in group" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#00E5A8] text-xs sm:text-xs md:text-sm font-bold uppercase tracking-wide">Total Tests</p>
                <p className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1 sm:mt-2">{stats?.stats?.totalTests || 0}</p>
                <p className="text-xs sm:text-xs md:text-sm text-gray-400 mt-0.5 sm:mt-1 truncate font-medium">Created assessments</p>
              </div>
              <div className="bg-[#00E5A8] p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:bg-[#00E5A8]/90 transition-all">
                <FileText className="text-black" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-4 md:p-5 lg:p-6 border border-gray-800 hover:border-[#00E5A8]/30 sm:col-span-2 lg:col-span-1 animate-fade-in group" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#00E5A8] text-xs sm:text-xs md:text-sm font-bold uppercase tracking-wide">Recent Admissions</p>
                <p className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1 sm:mt-2">{stats?.stats?.recentAdmissions || 0}</p>
                <p className="text-xs sm:text-xs md:text-sm text-gray-400 mt-0.5 sm:mt-1 truncate font-medium">Last 7 days</p>
              </div>
              <div className="bg-[#00E5A8] p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:bg-[#00E5A8]/90 transition-all">
                <UserPlus className="text-black" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Applications Stats */}
        <div className="bg-[#111111] rounded-xl shadow-xl border border-gray-800 overflow-hidden animate-slide-up">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-800 bg-[#080808]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-[#00E5A8] p-1.5 sm:p-2 md:p-2.5 rounded-xl shadow-lg flex-shrink-0">
                  <GraduationCap className="text-black" size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Teacher Applications</h3>
                  <p className="text-xs sm:text-xs md:text-sm text-gray-400 hidden sm:block font-medium">Recruitment overview</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/teacher-applications')}
                className="text-xs sm:text-sm bg-[#00E5A8]/10 hover:bg-[#00E5A8]/20 text-[#00E5A8] font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            {/* Teacher Stats Mini Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="bg-[#080808] rounded-lg p-3 sm:p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="text-[#00E5A8]" size={16} />
                  <span className="text-xs text-gray-400 font-medium">Total</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{stats?.stats?.totalTeacherApplications || 0}</p>
              </div>
              <div className="bg-[#080808] rounded-lg p-3 sm:p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-yellow-400" size={16} />
                  <span className="text-xs text-gray-400 font-medium">Pending</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-yellow-400">{stats?.stats?.pendingTeacherApplications || 0}</p>
              </div>
              <div className="bg-[#080808] rounded-lg p-3 sm:p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-xs text-gray-400 font-medium">Approved</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-green-400">{stats?.stats?.approvedTeacherApplications || 0}</p>
              </div>
              <div className="bg-[#080808] rounded-lg p-3 sm:p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-400" size={16} />
                  <span className="text-xs text-gray-400 font-medium">Rejected</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-red-400">{stats?.stats?.rejectedTeacherApplications || 0}</p>
              </div>
            </div>

            {/* Recent Teacher Applications Table */}
            {stats?.recentTeacherApplications && stats.recentTeacherApplications.length > 0 ? (
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-0">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Recent Applications</p>
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-[#080808] hidden sm:table-header-group">
                      <tr>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Name</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Contact</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider hidden md:table-cell">Subjects</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Status</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider hidden lg:table-cell">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#111111] divide-y divide-gray-800">
                      {stats.recentTeacherApplications.map((app) => (
                        <tr key={app._id} className="hover:bg-[#080808]/50 transition-colors block sm:table-row border-b border-gray-800 sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0 space-y-1 sm:space-y-0">
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm font-semibold text-white block sm:table-cell">
                            <span className="sm:hidden text-[#00E5A8] font-medium text-xs">Name: </span>
                            {app.name}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs">Contact: </span>
                            <span className="block text-xs text-gray-300">{app.email}</span>
                            <span className="block text-xs text-gray-500">{app.phone}</span>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell md:hidden lg:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs">Subjects: </span>
                            <div className="flex flex-wrap gap-1">
                              {app.subjects.slice(0, 3).map((sub, i) => (
                                <span key={i} className="inline-block px-1.5 py-0.5 bg-[#00E5A8]/10 text-[#00E5A8] text-xs rounded font-medium">
                                  {sub}
                                </span>
                              ))}
                              {app.subjects.length > 3 && (
                                <span className="text-xs text-gray-500">+{app.subjects.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 block sm:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs mr-1">Status: </span>
                            <span className={`inline-block px-2 sm:px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                              app.status === 'approved'
                                ? 'bg-green-500/20 text-green-400'
                                : app.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell lg:hidden xl:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs">Applied: </span>
                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="bg-[#080808] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={36} className="text-[#00E5A8]" />
                </div>
                <p className="text-sm sm:text-base text-white font-semibold">No teacher applications yet</p>
                <p className="text-xs sm:text-sm text-[#00E5A8] mt-1 font-medium">Applications will appear here when teachers apply</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tests with animation */}
        <div className="bg-[#111111] rounded-xl shadow-xl border border-gray-800 overflow-hidden animate-slide-up">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-800 bg-[#080808]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-[#00E5A8] p-1.5 sm:p-2 md:p-2.5 rounded-xl shadow-lg flex-shrink-0">
                <Calendar className="text-black" size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Upcoming Tests</h3>
                <p className="text-xs sm:text-xs md:text-sm text-gray-400 hidden sm:block font-medium">Scheduled assessments</p>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            {stats?.upcomingTests && stats.upcomingTests.length > 0 ? (
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-0">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-[#080808] hidden sm:table-header-group">
                      <tr>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Test Title</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Class</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider hidden md:table-cell">Subject</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider">Date</th>
                        <th className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-left text-xs font-bold text-[#00E5A8] uppercase tracking-wider hidden lg:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#111111] divide-y divide-gray-800">
                      {stats.upcomingTests.map((test) => (
                        <tr key={test._id} className="hover:bg-[#111111]/50 transition-colors block sm:table-row border-b border-gray-800 sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0 space-y-1 sm:space-y-0">
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm font-semibold text-white block sm:table-cell">
                            <span className="sm:hidden text-[#00E5A8] font-medium text-xs">Test: </span>
                            {test.title}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-[#00E5A8] font-medium block sm:table-cell">
                            <span className="sm:hidden text-gray-400 font-normal text-xs">Class: </span>
                            {test.class}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell md:hidden lg:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs">Subject: </span>
                            {test.subject}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs">Date: </span>
                            {new Date(test.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 md:py-3 block sm:table-cell lg:hidden xl:table-cell">
                            <span className="sm:hidden text-gray-500 font-normal text-xs mr-1">Status: </span>
                            <span className="inline-block px-2 sm:px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black shadow-md">
                              {test.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="bg-[#111111] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={36} className="text-[#00E5A8]" />
                </div>
                <p className="text-sm sm:text-base text-white font-semibold">No upcoming tests scheduled</p>
                <p className="text-xs sm:text-sm text-[#00E5A8] mt-1 font-medium">Create a new test to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedAdminDashboard = () => (
  <AdminProtectedRoute>
    <AdminDashboard />
  </AdminProtectedRoute>
);

export default ProtectedAdminDashboard;

