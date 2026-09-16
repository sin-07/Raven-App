'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/Layout';
import AdminProtectedRoute from '@/components/admin/ProtectedRoute';
import toast from 'react-hot-toast';
import { Loader } from '@/components';
import { STANDARDS } from '@/constants/classes';

interface Question {
  questionText: string;
  questionType: 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
  options: string[];
  correctAnswer: string;
  marks: string | number;
}

interface TestData {
  _id: string;
  testId: string;
  title: string;
  description: string;
  standard: string;
  subject: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED';
  publishedAt?: string;
}

interface FormData {
  title: string;
  description: string;
  standard: string;
  subject: string;
  startDate: string;
  endDate: string;
  duration: string;
  totalMarks: string;
  passingMarks: string;
  questions: Question[];
}

const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    standard: '',
    subject: '',
    startDate: '',
    endDate: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: '',
    questionType: 'MCQ',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: ''
  });

  const classes = STANDARDS;

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      toast.error('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.marks) {
      toast.error('Please fill question text and marks');
      return;
    }

    if (currentQuestion.questionType === 'MCQ') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Please provide at least 2 options for MCQ');
        return;
      }
      if (!currentQuestion.correctAnswer) {
        toast.error('Please select the correct answer');
        return;
      }
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      questionText: '',
      questionType: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: ''
    });

    toast.success('Question added');
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Calculate total marks from questions
    const calculatedTotalMarks = formData.questions.reduce((sum, q) => sum + Number(q.marks), 0);

    try {
      const res = await fetch(
        editingTestId ? `/api/admin/tests/${editingTestId}` : '/api/admin/tests',
        {
          method: editingTestId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            totalMarks: calculatedTotalMarks
          })
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success(editingTestId ? 'Test updated successfully' : 'Test created as Draft');
        setShowModal(false);
        setCurrentStep(1);
        setEditingTestId(null);
        setFormData({
          title: '', description: '', standard: '', subject: '',
          startDate: '', endDate: '', duration: '', totalMarks: '', passingMarks: '',
          questions: []
        });
        fetchTests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(editingTestId ? 'Error updating test' : 'Error creating test');
    }
  };

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'publish' })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Test published successfully! Students can now see it.');
        fetchTests();
      } else {
        toast.error(data.message || 'Failed to publish test');
      }
    } catch (error) {
      toast.error('Error publishing test');
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to unpublish this test? Students will no longer be able to see it.')) return;
    
    setPublishingId(id);
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'unpublish' })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Test unpublished. Students can no longer see it.');
        fetchTests();
      } else {
        toast.error(data.message || 'Failed to unpublish test');
      }
    } catch (error) {
      toast.error('Error unpublishing test');
    } finally {
      setPublishingId(null);
    }
  };

  const handleEdit = async (test: TestData) => {
    if (test.status !== 'DRAFT') {
      toast.error('Only DRAFT tests can be edited. Unpublish first to edit.');
      return;
    }
    
    setEditingTestId(test._id);
    setFormData({
      title: test.title,
      description: test.description,
      standard: test.standard,
      subject: test.subject,
      startDate: new Date(test.startDate).toISOString().split('T')[0],
      endDate: new Date(test.endDate).toISOString().split('T')[0],
      duration: String(test.duration),
      totalMarks: String(test.totalMarks),
      passingMarks: String(test.passingMarks),
      questions: test.questions || []
    });
    setShowModal(true);
    setCurrentStep(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Test deleted successfully');
        fetchTests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error deleting test');
    }
  };

  const calculateTotalMarks = () => {
    return formData.questions.reduce((sum, q) => sum + Number(q.marks), 0);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingTestId(null);
    setCurrentStep(1);
    setFormData({
      title: '', description: '', standard: '', subject: '',
      startDate: '', endDate: '', duration: '', totalMarks: '', passingMarks: '',
      questions: []
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500/20 text-green-400';
      case 'EXPIRED':
        return 'bg-red-500/20 text-red-400';
      case 'DRAFT':
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">Tests Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-all"
          >
            + Create Test
          </button>
        </div>

        {/* Status Legend */}
        <div className="bg-[#111111] rounded-lg p-3 sm:p-4 border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Status Legend:</p>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500/40"></span>
              <span className="text-yellow-400">DRAFT</span> - Not visible to students
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500/40"></span>
              <span className="text-green-400">PUBLISHED</span> - Visible to students (within date range)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
              <span className="text-red-400">EXPIRED</span> - Past end date, no longer visible
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-[#111111] rounded-lg md:rounded-xl shadow-md overflow-x-auto border border-gray-800">
          <table className="w-full">
            <thead className="bg-[#080808]">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Test ID</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Standard</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Subject</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date Range</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Questions</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Marks</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#111111] divide-y divide-gray-800">
              {tests.map((test) => (
                <tr key={test._id} className="hover:bg-[#111111]/50">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs text-gray-500 font-mono">{test.testId}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-white">{test.title}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400">{test.standard}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400">{test.subject}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400">
                    {formatDateRange(test.startDate, test.endDate)}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400">{test.questions?.length || 0}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400">{test.totalMarks}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      {test.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleEdit(test)}
                            className="text-[#00E5A8] hover:text-[#00E5A8]/80 hover:bg-[#00E5A8]/10 px-2 sm:px-3 py-1 rounded transition-colors text-sm"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handlePublish(test._id)}
                            disabled={publishingId === test._id}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10 px-2 sm:px-3 py-1 rounded transition-colors text-sm disabled:opacity-50"
                            title="Publish"
                          >
                            {publishingId === test._id ? '⏳' : '📢'}
                          </button>
                        </>
                      )}
                      {test.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleUnpublish(test._id)}
                          disabled={publishingId === test._id}
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-2 sm:px-3 py-1 rounded transition-colors text-sm disabled:opacity-50"
                          title="Unpublish (back to Draft)"
                        >
                          {publishingId === test._id ? '⏳' : '🔒'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(test._id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 sm:px-3 py-1 rounded transition-colors text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tests created yet</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {tests.map((test) => (
            <div key={test._id} className="bg-[#111111] rounded-lg md:rounded-xl shadow-md p-3 sm:p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-mono mb-1">{test.testId}</p>
                  <h3 className="font-semibold text-white text-sm sm:text-base mb-1 truncate">{test.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(test.status)}`}>
                    {test.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className="bg-[#080808] p-2 rounded">
                  <p className="text-gray-500 text-xs">Standard</p>
                  <p className="font-medium text-white">{test.standard}</p>
                </div>
                <div className="bg-[#080808] p-2 rounded">
                  <p className="text-gray-500 text-xs">Subject</p>
                  <p className="font-medium text-white truncate">{test.subject}</p>
                </div>
                <div className="bg-[#080808] p-2 rounded">
                  <p className="text-gray-500 text-xs">Date Range</p>
                  <p className="font-medium text-white text-xs">{formatDateRange(test.startDate, test.endDate)}</p>
                </div>
                <div className="bg-[#080808] p-2 rounded">
                  <p className="text-gray-500 text-xs">Questions</p>
                  <p className="font-medium text-white">{test.questions?.length || 0}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 sm:pt-3 border-t border-gray-800">
                {test.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => handleEdit(test)}
                      className="flex-1 bg-[#00E5A8]/10 text-[#00E5A8] hover:bg-[#00E5A8]/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handlePublish(test._id)}
                      disabled={publishingId === test._id}
                      className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {publishingId === test._id ? '⏳' : '📢 Publish'}
                    </button>
                  </>
                )}
                {test.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleUnpublish(test._id)}
                    disabled={publishingId === test._id}
                    className="flex-1 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {publishingId === test._id ? '⏳' : '🔒 Unpublish'}
                  </button>
                )}
                {test.status === 'EXPIRED' && (
                  <span className="flex-1 text-center text-gray-500 text-xs sm:text-sm py-1.5 sm:py-2">
                    Test has expired
                  </span>
                )}
                <button
                  onClick={() => handleDelete(test._id)}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {tests.length === 0 && (
            <div className="bg-[#111111] rounded-lg shadow-md p-12 text-center border border-gray-800">
              <p className="text-gray-500 text-base">No tests created yet</p>
            </div>
          )}
        </div>

        {/* Create Test Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-[#111111] rounded-lg p-4 sm:p-6 lg:p-8 max-w-4xl w-full my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                {editingTestId ? 'Edit Test' : 'Create New Test'} - {currentStep === 1 ? 'Basic Information' : 'Add Questions'}
              </h3>
              
              {!editingTestId && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-400 text-sm">
                    ℹ️ New tests are created as <strong>DRAFT</strong>. Students won&apos;t see them until you publish.
                  </p>
                </div>
              )}
              
              {currentStep === 1 ? (
                <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Test Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Standard *</label>
                      <select
                        value={formData.standard}
                        onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      >
                        <option value="">Select Standard</option>
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Date * (Students can see from this date)</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Date * (Test expires after this date)</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Passing Marks *</label>
                      <input
                        type="number"
                        value={formData.passingMarks}
                        onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        required
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black py-2 rounded-lg font-semibold transition-all"
                    >
                      Next: Add Questions →
                    </button>
                    <button
                      type="button"
                      onClick={resetModal}
                      className="flex-1 bg-[#111111] hover:bg-[#080808] text-gray-300 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Added Questions List */}
                  {formData.questions.length > 0 && (
                    <div className="bg-[#080808] p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-300 mb-3">
                        Added Questions ({formData.questions.length}) - Total Marks: {calculateTotalMarks()}
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.questions.map((q, index) => (
                          <div key={index} className="flex justify-between items-center bg-[#111111] p-3 rounded border border-gray-800">
                            <div className="flex-1 text-white">
                              <span className="font-medium">Q{index + 1}:</span> {q.questionText.substring(0, 50)}...
                              <span className="ml-2 text-sm text-gray-400">({q.questionType} - {q.marks} marks)</span>
                            </div>
                            <button
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-red-500 hover:text-red-400 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Question Form */}
                  <div className="border-2 border-dashed border-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-4">Add New Question</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Question Type</label>
                        <select
                          value={currentQuestion.questionType}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value as Question['questionType'] })}
                          className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white"
                        >
                          <option value="MCQ">Multiple Choice (MCQ)</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Long Answer">Long Answer</option>
                          <option value="True/False">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Question Text *</label>
                        <textarea
                          value={currentQuestion.questionText}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                          className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500"
                          rows={3}
                          placeholder="Enter your question here..."
                        />
                      </div>

                      {currentQuestion.questionType === 'MCQ' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Options (MCQ) *</label>
                          {currentQuestion.options.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-white">{String.fromCharCode(65 + idx)}.</span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...currentQuestion.options];
                                  newOptions[idx] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="flex-1 px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500"
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              />
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === option && option !== ''}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                                className="w-5 h-5 accent-[#00E5A8]"
                                disabled={option === ''}
                              />
                              <span className="text-sm text-gray-400">Correct</span>
                            </div>
                          ))}
                          <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer</p>
                        </div>
                      )}

                      {currentQuestion.questionType === 'True/False' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Correct Answer *</label>
                          <div className="flex gap-4">
                            <label className="flex items-center text-white">
                              <input
                                type="radio"
                                name="trueFalse"
                                value="True"
                                checked={currentQuestion.correctAnswer === 'True'}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                className="mr-2 accent-[#00E5A8]"
                              />
                              True
                            </label>
                            <label className="flex items-center text-white">
                              <input
                                type="radio"
                                name="trueFalse"
                                value="False"
                                checked={currentQuestion.correctAnswer === 'False'}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                className="mr-2 accent-[#00E5A8]"
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Marks *</label>
                        <input
                          type="number"
                          value={currentQuestion.marks}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: e.target.value })}
                          className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500"
                          placeholder="Enter marks for this question"
                          min="1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black py-2 rounded-lg font-semibold transition-all"
                      >
                        + Add This Question
                      </button>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-[#111111] hover:bg-[#080808] text-gray-300 py-2 rounded-lg font-semibold"
                    >
                      ← Back to Basic Info
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={formData.questions.length === 0}
                      className={`flex-1 py-2 rounded-lg font-semibold ${
                        formData.questions.length === 0
                          ? 'bg-[#111111] text-gray-500 cursor-not-allowed'
                          : 'bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black transition-all'
                      }`}
                    >
                      {editingTestId ? 'Update Test' : 'Save as Draft'} ({formData.questions.length} questions, {calculateTotalMarks()} marks)
                    </button>
                    <button
                      type="button"
                      onClick={resetModal}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute for security
const ProtectedAdminTests = () => (
  <AdminProtectedRoute>
    <AdminTests />
  </AdminProtectedRoute>
);

export default ProtectedAdminTests;

