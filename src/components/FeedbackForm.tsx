'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackFormProps {
  studentId?: string;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ studentId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    message: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isAuthenticated = !!studentId;

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'course_content', label: 'Course Content' },
    { value: 'teaching_method', label: 'Teaching Method' },
    { value: 'study_materials', label: 'Study Materials' },
    { value: 'online_classes', label: 'Online Classes' },
    { value: 'test_system', label: 'Test System' },
    { value: 'complaint', label: 'Complaint' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to submit feedback');
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit feedback');
      }

      toast.success('Thank you! Your feedback has been received.');
      setSubmitted(true);
      setFormData({
        category: 'general',
        subject: '',
        message: '',
        rating: 5
      });

      if (onSubmitSuccess) {
        setTimeout(() => onSubmitSuccess(), 1500);
      }

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error('Feedback error:', err);
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] rounded-lg shadow border border-gray-800 p-6">
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <Send className="w-5 h-5 text-[#00E5A8]" />
        {isAuthenticated ? 'Share Your Feedback' : 'Send Us Your Feedback'}
      </h3>
      <p className="text-sm text-gray-400 mb-6">Help us improve by sharing your thoughts and suggestions</p>

      {submitted && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-400 text-sm">Thank you! Your feedback has been recorded.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Authentication Required Message */}
        {!isAuthenticated && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-400">
                Please <a href="/login" className="font-semibold underline text-yellow-300 hover:text-yellow-200">login</a> to submit feedback.
              </p>
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Feedback Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!isAuthenticated}
            className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={!isAuthenticated}
            placeholder="Brief subject of your feedback"
            className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] text-white placeholder-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/100</p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                disabled={!isAuthenticated}
                className={`text-3xl transition-colors ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-600'
                } disabled:cursor-not-allowed`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Feedback
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={!isAuthenticated}
            placeholder="Share your detailed feedback, suggestions, or concerns..."
            rows={5}
            className="w-full px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] resize-none text-white placeholder-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000</p>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg flex gap-3">
          <AlertCircle className="w-4 h-4 text-[#00E5A8] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300">
            {isAuthenticated 
              ? 'Your feedback is valuable and helps us improve. All submissions are reviewed by our team.'
              : 'Login as a registered student to submit feedback and help us improve our services.'
            }
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isAuthenticated}
          className="w-full px-6 py-3 bg-[#00E5A8] text-black rounded-full hover:bg-[#00E5A8]/90 hover:scale-105 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

