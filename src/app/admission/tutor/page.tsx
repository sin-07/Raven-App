'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  BookOpen,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

/**
 * Teacher Admission Page
 * ----------------------
 * Public page for teachers to submit their applications
 */

const subjectOptions = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'English',
  'Social Science',
  'Computer Science',
  'Hindi',
  'Sanskrit',
  'Other'
];

const experienceOptions = [
  'Fresher (0-1 years)',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
];

export default function TeacherAdmissionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    subjects: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.qualification || !formData.experience) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/teacher-admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          qualification: '',
          experience: '',
          subjects: [],
        });
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to submit application. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111111] rounded-2xl p-8 max-w-md w-full text-center border border-gray-800"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for your interest in joining Raven Tutorials. We will review your application and get back to you within 3-5 business days.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-[#00E5A8] text-black font-semibold rounded-lg hover:bg-[#00cc96] transition-colors"
          >
            Submit Another Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Join Our Teaching Team
          </h1>
          <p className="text-gray-400 text-lg">
            Share your knowledge and inspire the next generation of learners
          </p>
        </motion.div>

        {/* Application Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-[#111111] rounded-2xl p-8 border border-gray-800"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5A8] transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5A8] transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5A8] transition-colors"
                required
              />
            </div>
          </div>

          {/* Qualification */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Highest Qualification *
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="e.g., M.Sc Physics, B.Ed, PhD Chemistry"
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5A8] transition-colors"
                required
              />
            </div>
          </div>

          {/* Experience */}
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Teaching Experience *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00E5A8] transition-colors appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select experience level</option>
                {experienceOptions.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              <BookOpen className="inline w-4 h-4 mr-2" />
              Subjects You Can Teach *
            </label>
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectToggle(subject)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.subjects.includes(subject)
                      ? 'bg-[#00E5A8] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {formData.subjects.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {formData.subjects.join(', ')}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00E5A8] text-black font-bold rounded-lg hover:bg-[#00cc96] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Application
              </>
            )}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            By submitting, you agree to our terms and privacy policy
          </p>
        </motion.form>

        {/* Check Status Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400">
            Already applied?{' '}
            <a href="/admission/tutor/status" className="text-[#00E5A8] hover:underline">
              Check your application status
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
