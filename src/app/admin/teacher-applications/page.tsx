'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/Layout';

/**
 * Admin Teacher Applications Page
 * --------------------------------
 * Manage teacher applications: view, approve, reject
 */

interface TeacherApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  subjects: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<TeacherApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/admin/teacher-applications${statusParam}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/teacher-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Application ${status} successfully`);
        setSelectedApplication(null);
        setAdminNotes('');
        fetchApplications();
      } else {
        toast.error(data.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Teacher Applications</h1>
          <p className="text-gray-400 mt-1">Review and manage teacher applications</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00E5A8]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {applications.filter(a => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-400">
              {applications.filter(a => a.status === 'approved').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-400">
              {applications.filter(a => a.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E5A8]"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Qualification</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Subjects</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Applied</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-750">
                      <td className="px-4 py-4">
                        <p className="text-white font-medium">{app.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-300 text-sm">{app.email}</p>
                        <p className="text-gray-500 text-sm">{app.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-300 text-sm">{app.qualification}</p>
                        <p className="text-gray-500 text-xs">{app.experience}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {app.subjects.slice(0, 3).map((subject, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                              {subject}
                            </span>
                          ))}
                          {app.subjects.length > 3 && (
                            <span className="text-gray-500 text-xs">+{app.subjects.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-4 text-gray-400 text-sm">
                        {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setAdminNotes(app.adminNotes || '');
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex justify-center">
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-[#00E5A8]">
                      {selectedApplication.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{selectedApplication.name}</p>
                    <p className="text-gray-400 text-sm">Applicant</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-300 text-sm">{selectedApplication.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-300 text-sm">{selectedApplication.phone}</span>
                  </div>
                </div>

                {/* Qualification */}
                <div className="flex items-start gap-2">
                  <GraduationCap size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-white">{selectedApplication.qualification}</p>
                    <p className="text-gray-500 text-sm">Qualification</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-start gap-2">
                  <Briefcase size={16} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-white">{selectedApplication.experience}</p>
                    <p className="text-gray-500 text-sm">Experience</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="flex items-start gap-2">
                  <BookOpen size={16} className="text-gray-500 mt-1" />
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.subjects.map((subject, i) => (
                        <span key={i} className="px-3 py-1 bg-[#00E5A8]/20 text-[#00E5A8] text-sm rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Subjects</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedApplication.status === 'pending' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="Add any notes about this application..."
                    />
                  </div>
                )}

                {/* Show existing notes if already reviewed */}
                {selectedApplication.adminNotes && selectedApplication.status !== 'pending' && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm">Admin Notes:</p>
                    <p className="text-white">{selectedApplication.adminNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                      disabled={updating}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                      disabled={updating}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
