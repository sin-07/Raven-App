'use client';

import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit, Trash2, Play, Square, Calendar, Clock, Users, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import { Loader } from '@/components';
import { STANDARDS, STANDARD_LABELS } from '@/constants/classes';

interface LiveClassData {
  _id: string;
  classId: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxParticipants: number;
  isRecordingEnabled: boolean;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  participants?: string[];
}

interface FormData {
  title: string;
  description: string;
  subject: string;
  class: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: string | number;
  maxParticipants: number;
  isRecordingEnabled: boolean;
}

const AdminLiveClasses: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    subject: '',
    class: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    maxParticipants: 100,
    isRecordingEnabled: false
  });

  const subjects = ['Mathematics', 'Social Science', 'Biology', 'Chemistry', 'Physics', 'English', 'Computer Science', 'General'];

  useEffect(() => {
    fetchLiveClasses();
  }, [filterStatus, filterClass]);

  const fetchLiveClasses = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterClass) queryParams.append('class', filterClass);

      const res = await fetch(`/api/admin/live-classes?${queryParams}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setLiveClasses(data.data);
      }
    } catch (error) {
      toast.error('Error loading live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      setFormData(prev => ({ ...prev, duration: duration > 0 ? duration : '' }));
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [formData.startTime, formData.endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.class || !formData.scheduledDate || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.duration || Number(formData.duration) <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const res = await fetch(
        editingClassId ? `/api/admin/live-classes/${editingClassId}` : '/api/admin/live-classes',
        {
          method: editingClassId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success(editingClassId ? 'Live class updated successfully' : 'Live class created successfully');
        setShowModal(false);
        resetForm();
        fetchLiveClasses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(editingClassId ? 'Error updating live class' : 'Error creating live class');
    }
  };

  const handleEdit = (liveClass: LiveClassData) => {
    setEditingClassId(liveClass.classId);
    setFormData({
      title: liveClass.title,
      description: liveClass.description || '',
      subject: liveClass.subject,
      class: liveClass.class,
      scheduledDate: new Date(liveClass.scheduledDate).toISOString().split('T')[0],
      startTime: liveClass.startTime,
      endTime: liveClass.endTime,
      duration: liveClass.duration,
      maxParticipants: liveClass.maxParticipants,
      isRecordingEnabled: liveClass.isRecordingEnabled
    });
    setShowModal(true);
  };

  const handleDelete = async (classId: string) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) return;

    try {
      const res = await fetch(`/api/admin/live-classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Live class deleted successfully');
        fetchLiveClasses();
      }
    } catch (error) {
      toast.error('Error deleting live class');
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      const res = await fetch(`/api/admin/live-classes/${classId}/start`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Live class started');
        fetchLiveClasses();
        window.open(`/live-class/${classId}`, '_blank');
      }
    } catch (error) {
      toast.error('Error starting live class');
    }
  };

  const handleEndClass = async (classId: string) => {
    if (!window.confirm('Are you sure you want to end this live class?')) return;

    try {
      const res = await fetch(`/api/admin/live-classes/${classId}/end`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Live class ended');
        fetchLiveClasses();
      }
    } catch (error) {
      toast.error('Error ending live class');
    }
  };

  const handleJoinClass = (classId: string) => {
    window.open(`/live-class/${classId}`, '_blank');
  };

  const resetForm = () => {
    setEditingClassId(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      class: '',
      scheduledDate: '',
      startTime: '',
      endTime: '',
      duration: '',
      maxParticipants: 100,
      isRecordingEnabled: false
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      Scheduled: 'bg-blue-500/20 text-blue-400',
      Live: 'bg-green-500/20 text-green-400 animate-pulse',
      Completed: 'bg-gray-500/20 text-gray-400',
      Cancelled: 'bg-red-500/20 text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <AdminLayout><Loader /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Video className="w-8 h-8 text-[#00E5A8]" />
              Live Classes
            </h1>
            <p className="text-gray-400 mt-1">Manage online classes with Jitsi Meet</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Live Class
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#111111] rounded-lg shadow p-4 mb-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
              >
                <option value="">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
              >
                <option value="">All Classes</option>
                {STANDARDS.map(std => (
                  <option key={std} value={std}>{STANDARD_LABELS[std]}</option>
                ))}
                <option value="All">All Students</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Classes List */}
        <div className="grid gap-4">
          {liveClasses.length === 0 ? (
            <div className="bg-[#111111] rounded-lg shadow p-8 text-center border border-gray-800">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No live classes found. Create one to get started!</p>
            </div>
          ) : (
            liveClasses.map(liveClass => (
              <div key={liveClass._id} className="bg-[#111111] rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-800 hover:border-[#00E5A8]/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{liveClass.title}</h3>
                      {getStatusBadge(liveClass.status)}
                    </div>
                    {liveClass.description && (
                      <p className="text-gray-400 text-sm mb-3">{liveClass.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-[#00E5A8]" />
                        <span>{new Date(liveClass.scheduledDate).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-[#00E5A8]" />
                        <span>{liveClass.startTime} - {liveClass.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4 text-[#00E5A8]" />
                        <span>{liveClass.participants?.length || 0} participants</span>
                      </div>
                      <div className="text-gray-300">
                        <strong>Subject:</strong> {liveClass.subject}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <strong>Class:</strong> {liveClass.class} | <strong>Duration:</strong> {liveClass.duration} mins
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {liveClass.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => handleStartClass(liveClass.classId)}
                          className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black p-2 rounded-lg transition-all"
                          title="Start Class"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(liveClass)}
                          className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black p-2 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {liveClass.status === 'Live' && (
                      <>
                        <button
                          onClick={() => handleJoinClass(liveClass.classId)}
                          className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                        >
                          <Video className="w-5 h-5" />
                          Join Class
                        </button>
                        <button
                          onClick={() => handleEndClass(liveClass.classId)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="End Class"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(liveClass.classId)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#111111] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingClassId ? 'Edit Live Class' : 'Create New Live Class'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      >
                        <option value="">Select Class</option>
                        {STANDARDS.map(std => (
                          <option key={std} value={std}>{STANDARD_LABELS[std]}</option>
                        ))}
                        <option value="All">All Students</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>
                  </div>

                  {Number(formData.duration) > 0 && (
                    <div className="bg-[#00E5A8]/10 p-3 rounded-lg">
                      <p className="text-sm text-[#00E5A8]">
                        <strong>Duration:</strong> {formData.duration} minutes ({Math.floor(Number(formData.duration) / 60)}h {Number(formData.duration) % 60}m)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      max="500"
                      className="w-full px-3 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isRecordingEnabled"
                      checked={formData.isRecordingEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-[#00E5A8] border-gray-800 rounded focus:ring-[#00E5A8]"
                    />
                    <label className="text-sm font-medium text-gray-300">
                      Enable Recording (Optional)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black py-2 px-4 rounded-lg font-medium transition-all"
                    >
                      {editingClassId ? 'Update' : 'Create'} Live Class
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedAdminLiveClasses = () => (
  <AdminProtectedRoute>
    <AdminLiveClasses />
  </AdminProtectedRoute>
);

export default ProtectedAdminLiveClasses;

