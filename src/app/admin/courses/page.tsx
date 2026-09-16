'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/Layout';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorQualification?: string;
  instructorAvatar?: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  syllabus: string[];
  features: string[];
  isPublished: boolean;
  enrolledStudents: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  instructorQualification: string;
  instructorAvatar: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  syllabus: string[];
  features: string[];
}

const initialFormData: CourseFormData = {
  title: '',
  description: '',
  instructor: '',
  instructorQualification: '',
  instructorAvatar: '',
  duration: '',
  level: 'Beginner',
  category: '',
  price: 0,
  originalPrice: 0,
  thumbnail: '',
  syllabus: [''],
  features: [''],
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleArrayChange = (field: 'syllabus' | 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'syllabus' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'syllabus' | 'features', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          instructorAvatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const filteredSyllabus = formData.syllabus.filter(item => item.trim() !== '');
      const filteredFeatures = formData.features.filter(item => item.trim() !== '');

      const payload = {
        ...formData,
        syllabus: filteredSyllabus,
        features: filteredFeatures,
      };

      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse._id}` 
        : '/api/admin/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
        setShowModal(false);
        setEditingCourse(null);
        setFormData(initialFormData);
        fetchCourses();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      instructorQualification: course.instructorQualification || '',
      instructorAvatar: course.instructorAvatar || '',
      duration: course.duration,
      level: course.level,
      category: course.category,
      price: course.price,
      originalPrice: course.originalPrice || 0,
      thumbnail: course.thumbnail || '',
      syllabus: course.syllabus.length > 0 ? course.syllabus : [''],
      features: course.features.length > 0 ? course.features : [''],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        toast.error(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      const response = await fetch(`/api/admin/courses/${course._id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
        fetchCourses();
      } else {
        toast.error(data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Course Management</h1>
            <p className="text-gray-400 mt-1">Manage your courses and curriculum</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#00E5A8] hover:bg-[#00cc96] text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00E5A8]"
          />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00E5A8]"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No courses found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-[#00E5A8] hover:underline"
            >
              Create your first course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-[#00E5A8] transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gray-700">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    course.isPublished ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {course.instructorAvatar && (
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-gray-300 text-sm">{course.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{course.level}</span>
                    <span>{course.duration}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[#00E5A8] font-bold text-lg">₹{course.price}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-gray-500 line-through ml-2 text-sm">₹{course.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">{course.enrolledStudents} enrolled</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePublish(course)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        course.isPublished
                          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      }`}
                    >
                      {course.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                    placeholder="Course title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                    placeholder="Course description"
                  />
                </div>

                {/* Instructor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Instructor Name *</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="Instructor name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Instructor Qualification</label>
                    <input
                      type="text"
                      name="instructorQualification"
                      value={formData.instructorQualification}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="e.g., M.Sc Physics, PhD Chemistry"
                    />
                  </div>
                </div>

                {/* Instructor Avatar */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Instructor Avatar</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-pointer hover:border-[#00E5A8] transition-colors"
                    >
                      <Upload size={16} />
                      Upload
                    </label>
                    {formData.instructorAvatar && (
                      <>
                        <img
                          src={formData.instructorAvatar}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, instructorAvatar: '' }))}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Duration, Level, Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="e.g., 12 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Level *</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="e.g., Web Development"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Syllabus */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Syllabus</label>
                  {formData.syllabus.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('syllabus', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                        placeholder={`Module ${index + 1}`}
                      />
                      {formData.syllabus.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('syllabus', index)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('syllabus')}
                    className="text-[#00E5A8] text-sm hover:underline"
                  >
                    + Add Module
                  </button>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Features</label>
                  {formData.features.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('features', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00E5A8]"
                        placeholder={`Feature ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('features', index)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('features')}
                    className="text-[#00E5A8] text-sm hover:underline"
                  >
                    + Add Feature
                  </button>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-[#00E5A8] text-black font-semibold rounded-lg hover:bg-[#00cc96] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
