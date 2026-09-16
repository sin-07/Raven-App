'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import toast from 'react-hot-toast';
import { Loader } from '@/components';
import { STANDARDS, STANDARD_LABELS } from '@/constants/classes';

interface StudentData {
  _id: string;
  studentName: string;
  registrationId: string;
  standard: string;
  email: string;
  phoneNumber: string;
  photo?: string;
}

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filterClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/students?paymentStatus=completed`;
      
      if (searchTerm.trim()) url += `&search=${searchTerm.trim()}`;
      if (filterClass) url += `&class=${filterClass}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      
      if (data.success) {
        setStudents(data.data || []);
      } else {
        toast.error(data.message || 'Failed to load students');
        setStudents([]);
      }
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast.error(error.message || 'Error loading students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Student deleted successfully');
        fetchStudents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student');
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
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">Students Management</h2>

        {/* Filters */}
        <div className="bg-[#111111] rounded-lg md:rounded-xl shadow-md p-4 sm:p-5 md:p-6 border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchStudents()}
                placeholder="Search by name, email, ID..."
                className="w-full px-3 sm:px-4 py-2 text-sm bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Filter by Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none text-white"
              >
                <option value="">All Classes</option>
                {STANDARDS.map((std) => (
                  <option key={std} value={std}>
                    {STANDARD_LABELS[std] || std}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchStudents}
                className="w-full px-4 py-2 text-sm font-semibold text-black bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 rounded-lg transition-all focus:ring-2 focus:ring-[#00E5A8] focus:outline-none"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Students Table - Responsive */}
        <div className="bg-[#111111] rounded-lg md:rounded-xl shadow-md overflow-hidden border border-gray-800">
          <div className="overflow-x-auto -mx-4 sm:-mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#080808] hidden sm:table-header-group">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Photo</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Reg ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Standard</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Email</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Phone</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#111111] divide-y divide-gray-800">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-[#111111]/50 block sm:table-row border-b border-gray-800 sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0 space-y-1 sm:space-y-0">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 block sm:table-cell">
                        <span className="block sm:hidden text-xs text-gray-500 font-medium mb-1">Photo: </span>
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt={student.studentName}
                            className="h-8 sm:h-10 w-8 sm:w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-[#00E5A8] flex items-center justify-center text-black font-bold text-xs sm:text-sm">
                            {student.studentName?.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white block sm:table-cell">
                        <span className="block sm:hidden text-gray-500 font-medium text-xs mb-1">Name: </span>
                        {student.studentName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell">
                        <span className="block sm:hidden text-gray-500 font-medium text-xs mb-1">Reg ID: </span>
                        {student.registrationId}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 block sm:table-cell">
                        <span className="block sm:hidden text-gray-500 font-medium text-xs mb-1">Standard: </span>
                        {student.standard}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                        {student.email}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                        {student.phoneNumber}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center block sm:table-cell">
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-500 hover:text-red-400 text-xs sm:text-sm font-semibold hover:bg-red-500/10 px-2 sm:px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <p className="text-gray-500 text-sm sm:text-base font-medium">No students found</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="text-right text-gray-400 px-4 sm:px-0">
          <p className="text-xs sm:text-sm">Total: <span className="font-bold text-base sm:text-lg text-[#00E5A8]">{students.length}</span> students</p>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedAdminStudents = () => (
  <AdminProtectedRoute>
    <AdminStudents />
  </AdminProtectedRoute>
);

export default ProtectedAdminStudents;

