'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import toast from 'react-hot-toast';
import { STANDARDS, STANDARD_LABELS } from '@/constants/classes';

interface StudentData {
  _id: string;
  studentName: string;
  registrationId: string;
}

// Separate component for attendance buttons to prevent closure issues
const AttendanceButtons = memo(({ 
  studentId, 
  currentStatus, 
  onStatusChange 
}: { 
  studentId: string; 
  currentStatus: string | undefined; 
  onStatusChange: (id: string, status: string) => void;
}) => {
  return (
    <div className="flex justify-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={() => onStatusChange(studentId, 'Present')}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold transition duration-200 ${
          currentStatus === 'Present'
            ? 'bg-green-600 text-white'
            : 'bg-[#111111] text-gray-400 hover:bg-[#080808]'
        }`}
      >
        P
      </button>
      <button
        type="button"
        onClick={() => onStatusChange(studentId, 'Absent')}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold transition duration-200 ${
          currentStatus === 'Absent'
            ? 'bg-red-600 text-white'
            : 'bg-[#111111] text-gray-400 hover:bg-[#080808]'
        }`}
      >
        A
      </button>
    </div>
  );
});
AttendanceButtons.displayName = 'AttendanceButtons';

const AdminAttendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [existingAttendanceId, setExistingAttendanceId] = useState<string | null>(null);

  const subjects = ['Mathematics', 'Social Science', 'Biology', 'Chemistry', 'Physics', 'English'];

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedDate) {
      checkExistingAttendance();
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  const checkExistingAttendance = async () => {
    try {
      const res = await fetch(
        `/api/admin/attendance?class=${selectedClass}&subject=${selectedSubject}&date=${selectedDate}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        const existingRecord = data.data[0];
        setIsMarked(true);
        setExistingAttendanceId(existingRecord._id);
        
        const attendanceMap: { [key: string]: string } = {};
        existingRecord.students.forEach((student: { studentId: { _id: string } | string; status: string }) => {
          const studentId = typeof student.studentId === 'object' ? student.studentId._id : student.studentId;
          attendanceMap[studentId] = student.status;
        });
        setAttendance(attendanceMap);
      } else {
        setIsMarked(false);
        setExistingAttendanceId(null);
        setAttendance({});
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const fetchStudentsByClass = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students?class=${encodeURIComponent(selectedClass)}`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.data.length === 0) {
          toast('No students enrolled in this class yet', {
            icon: 'ℹ️',
            style: {
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #475569'
            }
          });
        }
        console.log('Fetched students:', data.data.map((s: StudentData) => ({ _id: s._id, name: s.studentName })));
        setStudents(data.data);
      } else {
        toast.error(data.message || 'Error loading students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = useCallback((studentId: string, status: string) => {
    console.log('=== handleStatusChange ===');
    console.log('Student ID:', studentId);
    console.log('Status:', status);
    
    setAttendance(prev => {
      const newState = { ...prev, [studentId]: status };
      console.log('Previous state:', prev);
      console.log('New state:', newState);
      return newState;
    });
  }, []);

  const markAllPresent = () => {
    const newAttendance: { [key: string]: string } = {};
    students.forEach(student => {
      newAttendance[student._id] = 'Present';
    });
    setAttendance(newAttendance);
    toast.success('All students marked as present');
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || students.length === 0) {
      toast.error('Please select a class, subject, and ensure students are loaded');
      return;
    }

    // Check if all students have been marked
    const unmarkedStudents = students.filter(student => !attendance[student._id]);
    if (unmarkedStudents.length > 0) {
      toast.error(`Please mark attendance for all students. ${unmarkedStudents.length} student(s) not marked.`, {
        duration: 4000
      });
      return;
    }

    const attendanceData = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id]
    }));

    setLoading(true);

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          class: selectedClass,
          subject: selectedSubject,
          date: selectedDate,
          students: attendanceData
        })
      });

      const data = await res.json();

      if (data.statusCode === 409 || (data.message && data.message.includes('already marked'))) {
        toast.error('Attendance already marked for this class and subject on this date', { duration: 3000 });
        await checkExistingAttendance();
        return;
      }

      if (data.statusCode === 403 || (data.message && data.message.includes('lock'))) {
        toast.error(data.message, {
          duration: 5000,
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            fontWeight: 'bold',
          }
        });
      } else if (data.success) {
        toast.success(isMarked ? 'Attendance updated successfully!' : 'Attendance saved successfully!');
        await checkExistingAttendance();
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (error: any) {
      console.error('Attendance request error:', error);
      toast.error('Error saving attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">Attendance Management</h2>

        {/* Filters */}
        <div className="bg-[#111111] rounded-lg md:rounded-xl shadow-md p-4 sm:p-5 md:p-6 border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none text-white"
              >
                <option value="">-- Select Class --</option>
                {STANDARDS.map(standard => (
                  <option key={standard} value={standard}>{STANDARD_LABELS[standard]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none text-white"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={markAllPresent}
                disabled={!selectedClass || !selectedSubject || students.length === 0}
                className="w-full bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black py-2 rounded-lg font-semibold disabled:bg-gray-600 disabled:text-white text-sm sm:text-base transition-all"
              >
                Mark All
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Status Indicator */}
        {selectedClass && selectedSubject && isMarked && (
          <div className="bg-[#00E5A8]/10 border-l-4 border-[#00E5A8] p-3 sm:p-4 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-4 sm:h-5 w-4 sm:w-5 text-[#00E5A8]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-[#00E5A8]">
                  [DONE] Attendance for {selectedSubject} already marked for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass && selectedSubject && students.length > 0 && (
          <div className="bg-[#111111] rounded-lg md:rounded-xl shadow-md p-4 sm:p-5 md:p-6 border border-gray-800">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">
              {isMarked ? 'Update Attendance' : 'Mark Attendance'} - {students.length} Students
            </h3>

            <div className="overflow-x-auto -mx-4 sm:-mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-[#080808] hidden sm:table-header-group">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Reg ID</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-400 uppercase">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#111111] divide-y divide-gray-800">
                    {students.map((student, index) => (
                      <tr key={`student-row-${student._id}-${index}`} className="hover:bg-[#111111]/50 block sm:table-row border-b border-gray-800 sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0 space-y-1 sm:space-y-0">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white block sm:table-cell">
                          <span className="sm:hidden text-gray-500 font-medium text-xs">Name: </span>
                          {student.studentName} <span className="text-gray-500 text-xs">({student._id.slice(-6)})</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                          {student.registrationId}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center block sm:table-cell">
                          <AttendanceButtons
                            studentId={student._id}
                            currentStatus={attendance[student._id]}
                            onStatusChange={handleStatusChange}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:text-white text-sm sm:text-base transition-all"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}

        {selectedClass && selectedSubject && students.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-[#111111] rounded-lg md:rounded-xl shadow-md border border-gray-800">
            <p className="text-gray-500 text-sm sm:text-base font-medium">No students found in Class {selectedClass}</p>
          </div>
        )}

        {(!selectedClass || !selectedSubject) && (
          <div className="text-center py-8 sm:py-12 bg-[#111111] rounded-lg md:rounded-xl shadow-md border border-gray-800">
            <p className="text-gray-500 text-sm sm:text-base font-medium">Select a class and subject to view and mark attendance</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedAdminAttendance = () => (
  <AdminProtectedRoute>
    <AdminAttendance />
  </AdminProtectedRoute>
);

export default ProtectedAdminAttendance;

