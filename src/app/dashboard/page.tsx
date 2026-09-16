'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, BookOpen, BarChart3, Calendar, FileText,
  User, Mail, Phone, AlertCircle, CheckCircle, Clock, Award,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentProtectedRoute } from '@/components';

interface StudentData {
  _id: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  bloodGroup?: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  standard: string;
  registrationId: string;
}

interface AttendanceData {
  subject: string;
  present: number;
  total: number;
  percentage: number;
}

interface TestResult {
  title: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  passingMarks: number;
}

interface UpcomingTest {
  _id: string;
  testId: string;
  title: string;
  subject: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  hasAttempted: boolean;
}

interface StudyMaterial {
  _id: string;
  title: string;
  subject: string;
  description: string;
  fileUrl: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);

  // Data states
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<UpcomingTest[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Verify authentication via httpOnly cookie
      const verifyRes = await fetch('/api/auth/verify', {
        credentials: 'include'
      });

      if (!verifyRes.ok) {
        router.push('/login');
        return;
      }

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        router.push('/login');
        return;
      }

      setStudent(verifyData.student);
      
      // Fetch all data (cookies sent automatically with credentials: 'include')
      await Promise.all([
        fetchAttendance(),
        fetchTestResults(),
        fetchUpcomingTests(),
        fetchStudyMaterials()
      ]);
    } catch (err) {
      console.error('Dashboard init error:', err);
      toast.error('Failed to load dashboard');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/student/attendance', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setAttendance(data.data || []);
    } catch (err) {
      console.error('Attendance error:', err);
    }
  };

  const fetchTestResults = async () => {
    try {
      const res = await fetch('/api/student/tests/results', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setTestResults(data.data || []);
    } catch (err) {
      console.error('Test results error:', err);
    }
  };

  const fetchUpcomingTests = async () => {
    try {
      const res = await fetch('/api/student/tests', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      
      // API already filters to show only PUBLISHED tests within date range
      // Just filter out already attempted tests and limit to 5
      const available = (data.data || []).filter((t: UpcomingTest) => !t.hasAttempted);
      setUpcomingTests(available.slice(0, 5));
    } catch (err) {
      console.error('Upcoming tests error:', err);
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      const res = await fetch('/api/student/study-materials', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setStudyMaterials(data.data || []);
    } catch (err) {
      console.error('Study materials error:', err);
    }
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);

    try {
      const res = await fetch('/api/auth/download-receipt', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to download');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded!');
    } catch (err) {
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#005544] border-t-[#00E5A8] mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-[#00E5A8] animate-ping mx-auto opacity-20"></div>
            </div>
            <p className="text-white text-lg font-medium">Loading your dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </>
    );
  }

  if (!student) return null;

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, s) => sum + (s.percentage || 0), 0) / attendance.length)
    : 0;

  const hasLowAttendance = attendance.some(s => s.percentage < 75);

  return (
    <>
      <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden pt-16">
        {/* Green Radial Glow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#00E5A8] via-[#00C090] to-[#00B386] rounded-2xl p-8 text-black mb-8 shadow-xl border border-[#00E5A8]/20">
            <div className="absolute inset-0 bg-grid-white/5"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-2 drop-shadow-sm font-cormorant">Welcome, {student.studentName}!</h2>
              <p className="text-black/80 font-medium font-bricolage">Class {student.standard} | ID: {student.registrationId}</p>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-[#00E5A8]/10 rounded-full blur-2xl"></div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#111111] rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-800 hover:border-[#00E5A8]/30 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1 font-bricolage">Overall Attendance</p>
                  <p className="text-3xl font-bold text-[#00E5A8] font-cormorant">{overallAttendance}%</p>
                </div>
                <div className="p-3 bg-[#00E5A8]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-[#00E5A8]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-800 hover:border-[#00E5A8]/30 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1 font-bricolage">Tests Completed</p>
                  <p className="text-3xl font-bold text-[#00E5A8] font-cormorant">{testResults.length}</p>
                </div>
                <div className="p-3 bg-[#00E5A8]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-[#00E5A8]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-800 hover:border-[#00E5A8]/30 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1 font-bricolage">Upcoming Tests</p>
                  <p className="text-3xl font-bold text-[#00E5A8] font-cormorant">{upcomingTests.length}</p>
                </div>
                <div className="p-3 bg-[#00E5A8]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-[#00E5A8]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-800 hover:border-[#00E5A8]/30 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1 font-bricolage">Study Materials</p>
                  <p className="text-3xl font-bold text-white font-cormorant">{studyMaterials.length}</p>
                </div>
                <div className="p-3 bg-[#00E5A8]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {hasLowAttendance && (
            <div className="bg-[#111111] border-l-4 border-orange-500 rounded-xl p-5 mb-8 flex gap-4 shadow-md">
              <div className="p-2 bg-orange-500/10 rounded-lg h-fit">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-orange-400 text-lg mb-1">⚠️ Attendance Warning</p>
                <p className="text-gray-400">Your attendance in some subjects is below 75%. Please improve your attendance to meet requirements.</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-[#111111] rounded-xl shadow-md mb-8 overflow-hidden border border-gray-800">
            <div className="flex flex-wrap border-b border-gray-800">
              {['overview', 'attendance', 'marks', 'tests', 'materials', 'profile'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-4 font-semibold transition-all text-sm sm:text-base relative ${
                    activeTab === tab
                      ? 'text-[#00E5A8] bg-[#00E5A8]/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00E5A8] to-[#00C090] rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-[#111111] rounded-xl shadow-md p-8 border border-gray-800">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#080808] border border-[#00E5A8]/20 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg font-cormorant">
                    <CheckCircle className="w-6 h-6 text-[#00E5A8]" />
                    Quick Actions
                  </h3>
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloading}
                    className="px-6 py-3 bg-[#00E5A8] text-black rounded-full hover:bg-[#00E5A8]/90 hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    {downloading ? 'Downloading...' : 'Download Receipt'}
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-white font-cormorant">Subject-wise Attendance</h3>
                {attendance.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {attendance.map(subject => (
                      <div key={subject.subject} className="p-4 border border-gray-800 rounded-lg bg-[#080808]">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white">{subject.subject}</h4>
                          <span className={`text-lg font-bold ${subject.percentage >= 75 ? 'text-green-600' : 'text-orange-600'}`}>
                            {subject.percentage}%
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Attendance</span>
                            <span className="font-medium">{subject.present}/{subject.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${subject.percentage >= 75 ? 'bg-green-500' : 'bg-orange-500'}`}
                              style={{ width: `${subject.percentage}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subject.percentage >= 75 ? '✓ Good attendance' : '⚠ Below 75%'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance data available</p>
                )}
              </div>
            )}

            {/* Marks Tab */}
            {activeTab === 'marks' && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Test Results</h3>
                {testResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Test</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Subject</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900">Marks</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900">%</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {testResults.map((test, idx) => {
                          const percentage = (test.marksObtained / test.totalMarks * 100).toFixed(1);
                          const passed = test.marksObtained >= test.passingMarks;
                          return (
                            <tr key={idx} className="hover:bg-gray-800/50">
                              <td className="px-4 py-3 text-white font-medium">{test.title}</td>
                              <td className="px-4 py-3 text-gray-300">{test.subject}</td>
                              <td className="px-4 py-3 text-center text-white">{test.marksObtained}/{test.totalMarks}</td>
                              <td className="px-4 py-3 text-center text-white">{percentage}%</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {passed ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No test results yet</p>
                )}
              </div>
            )}

            {/* Upcoming Tests Tab */}
            {activeTab === 'tests' && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Available Tests</h3>
                {upcomingTests.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTests.map((test, idx) => (
                      <div key={idx} className="p-4 border border-gray-700 rounded-lg hover:shadow-md hover:border-gray-600 transition bg-gray-800/30">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{test.title}</h4>
                            <p className="text-sm text-gray-300">{test.subject}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Available
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Available Until</p>
                            <p className="font-medium">{new Date(test.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-medium">{test.duration} mins</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Marks</p>
                            <p className="font-medium">{test.totalMarks}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pass Marks</p>
                            <p className="font-medium">{test.passingMarks}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => router.push(`/test/${test._id}`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition"
                          >
                            Start Test
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No tests available</p>
                )}
              </div>
            )}

            {/* Study Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Study Materials</h3>
                {studyMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studyMaterials.map((material, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition">
                        <div className="flex gap-3 mb-3">
                          <FileText className="w-6 h-6 text-orange-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{material.title}</h4>
                            <p className="text-xs text-gray-600">{material.subject}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{material.description}</p>
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-center text-xs font-medium"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No study materials available</p>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Personal Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="font-medium text-white">{student.studentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Father&apos;s Name</p>
                        <p className="font-medium text-white">{student.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Mother&apos;s Name</p>
                        <p className="font-medium text-white">{student.motherName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Gender</p>
                        <p className="font-medium text-white">{student.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Blood Group</p>
                        <p className="font-medium text-white">{student.bloodGroup || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Contact Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium text-white break-all">{student.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="font-medium text-white">{student.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <p className="font-medium text-white">{student.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">City</p>
                        <p className="font-medium text-white">{student.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Class</p>
                        <p className="font-medium text-white">{student.standard}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

// Wrap with StudentProtectedRoute for security
const ProtectedDashboard = () => (
  <StudentProtectedRoute>
    <Dashboard />
  </StudentProtectedRoute>
);

export default ProtectedDashboard;

