'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader, AlertCircle, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import FeedbackForm from '@/components/FeedbackForm';
import { StudentProtectedRoute } from '@/components';

interface Feedback {
  _id: string;
  subject: string;
  message: string;
  category: string;
  rating?: number;
  status: string;
  adminResponse?: string;
  createdAt: string;
}

interface StudentInfo {
  _id: string;
  name: string;
  email: string;
}

function FeedbackPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        credentials: 'include'
      });

      if (!res.ok) {
        router.push('/login');
        return;
      }

      const { student: studentData } = await res.json();
      setStudent(studentData);
      await fetchFeedback();
    } catch (err) {
      console.error('Init error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setFeedbackList(data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load feedback');
    }
  }, []);

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    setDeleting(feedbackId);

    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback deleted');
        await fetchFeedback();
      } else {
        toast.error('Failed to delete feedback');
      }
    } catch (err) {
      toast.error('Failed to delete feedback');
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      general: 'bg-blue-500/20 text-blue-400',
      course_content: 'bg-blue-500/20 text-blue-400',
      teaching_method: 'bg-green-500/20 text-green-400',
      study_materials: 'bg-orange-500/20 text-orange-400',
      online_classes: 'bg-pink-500/20 text-pink-400',
      test_system: 'bg-blue-500/20 text-blue-400',
      complaint: 'bg-red-500/20 text-red-400'
    };
    return colors[category] || colors.general;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      new: 'bg-yellow-500/20 text-yellow-400',
      reviewed: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#00E5A8] mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden flex flex-col">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
            <MessageSquare className="w-8 h-8 text-[#00E5A8]" />
            Feedback & Support
          </h1>
          <p className="text-gray-400">Share your feedback to help us improve</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-1">
            <FeedbackForm
              studentId={student?._id}
              onSubmitSuccess={() => fetchFeedback()}
            />
          </div>

          {/* Feedback List */}
          <div className="lg:col-span-2">
            <div className="bg-[#111111] rounded-lg shadow border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Your Feedback History</h2>
                <p className="text-sm text-gray-400">Total: {feedbackList.length} submissions</p>
              </div>

              {feedbackList.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {feedbackList.map(feedback => (
                    <div key={feedback._id} className="p-6 hover:bg-gray-800/50 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                              {feedback.category?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status || 'new')}`}>
                              {(feedback.status || 'new').toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-white">{feedback.subject}</h3>
                        </div>
                        <button
                          onClick={() => setSelectedFeedback(selectedFeedback?._id === feedback._id ? null : feedback)}
                          className="text-[#00E5A8] hover:text-[#00E5A8]/80"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Rating */}
                      {feedback.rating && (
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${i < feedback.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()} at{' '}
                          {new Date(feedback.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <button
                          onClick={() => handleDeleteFeedback(feedback._id)}
                          disabled={deleting === feedback._id}
                          className="text-red-500 hover:text-red-400 disabled:text-gray-500 transition flex items-center gap-1"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded View */}
                      {selectedFeedback?._id === feedback._id && (
                        <div className="mt-4 pt-4 border-t border-gray-800 bg-[#080808] rounded p-4">
                          <h4 className="font-medium text-white mb-2">Message:</h4>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                            {feedback.message}
                          </p>
                          {feedback.adminResponse && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#00E5A8] rounded-full"></span>
                                Admin Response
                              </h4>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                                {feedback.adminResponse}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No feedback submitted yet</p>
                  <p className="text-sm text-gray-500">Your feedback submissions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#00E5A8] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-2">We Value Your Feedback</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Your feedback helps us improve our teaching methods and course content</li>
                <li>• All feedback is reviewed by our admin team and kept confidential</li>
                <li>• You will receive responses to important feedback submissions</li>
                <li>• Share your concerns, suggestions, or compliments anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap with StudentProtectedRoute for security
export default function ProtectedFeedbackPage() {
  return (
    <StudentProtectedRoute>
      <FeedbackPage />
    </StudentProtectedRoute>
  );
}

