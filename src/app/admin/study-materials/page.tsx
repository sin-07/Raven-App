'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import { STANDARDS } from '@/constants/classes';

interface MaterialData {
  _id: string;
  title: string;
  description: string;
  class: string;
  subject: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

interface FormDataState {
  title: string;
  description: string;
  class: string;
  subject: string;
  file: File | null;
}

const StudyMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    class: '',
    subject: '',
    file: null
  });

  const classes = STANDARDS;
  const subjects = ['Mathematics', 'Social Science', 'Biology', 'Chemistry', 'Physics', 'English'];

  useEffect(() => {
    fetchMaterials();
  }, [filterClass, filterSubject]);

  const fetchMaterials = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterClass) queryParams.append('class', filterClass);
      if (filterSubject) queryParams.append('subject', filterSubject);

      const res = await fetch(`/api/admin/study-materials?${queryParams}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.class || !formData.subject || !formData.file) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('class', formData.class);
      uploadData.append('subject', formData.subject);
      uploadData.append('file', formData.file);

      const res = await fetch('/api/admin/study-materials/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Study material uploaded successfully!');
        setFormData({ title: '', description: '', class: '', subject: '', file: null });
        setShowUploadForm(false);
        fetchMaterials();
      } else {
        toast.error(data.message || 'Failed to upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading material');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const res = await fetch(`/api/admin/study-materials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Material deleted successfully');
        fetchMaterials();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting material');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Study Materials</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-[#00E5A8] text-black px-4 py-2 rounded-lg hover:bg-[#00E5A8]/90 hover:scale-105 flex items-center gap-2 transition-all"
          >
            <Upload size={20} />
            Upload Material
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-[#111111] rounded-lg shadow-md p-6 mb-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Upload New Study Material</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500"
                    placeholder="e.g., Chapter 5 - Quadratic Equations"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PDF File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                    required
                  />
                  {formData.file && (
                    <p className="text-sm text-gray-400 mt-1">{formData.file.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500"
                  placeholder="Brief description of the material..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00E5A8] text-black px-6 py-2 rounded-lg hover:bg-[#00E5A8]/90 hover:scale-105 disabled:bg-gray-600 disabled:text-white transition-all"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-[#111111] text-gray-300 px-6 py-2 rounded-lg hover:bg-[#080808]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#111111] rounded-lg shadow-md p-4 mb-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-400" />
            <h3 className="font-semibold text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8]"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8]"
            >
              <option value="">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-[#111111] rounded-lg shadow-md border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-semibold text-white">
              Uploaded Materials ({materials.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-800">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                <p>No study materials uploaded yet</p>
              </div>
            ) : (
              materials.map(material => (
                <div key={material._id} className="p-4 hover:bg-[#111111]/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-white">{material.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{material.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="bg-[#00E5A8]/20 text-[#00E5A8] px-2 py-1 rounded">
                          {material.class}
                        </span>
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          {material.subject}
                        </span>
                        <span className="text-gray-500">
                          {formatFileSize(material.fileSize)}
                        </span>
                        <span className="text-gray-500">
                          {new Date(material.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-[#00E5A8] hover:bg-[#00E5A8]/10 rounded"
                        title="Download"
                      >
                        <Download size={20} />
                      </a>
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedStudyMaterials = () => (
  <AdminProtectedRoute>
    <StudyMaterials />
  </AdminProtectedRoute>
);

export default ProtectedStudyMaterials;

