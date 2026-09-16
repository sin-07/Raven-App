'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

/**
 * Application Status Check Page
 * -----------------------------
 * Allows applicants to check their application status using email
 */

interface ApplicationStatus {
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export default function StatusCheckPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/teacher-admission?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setApplication(data.application);
      } else {
        setError(data.message || 'Unable to find application');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Congratulations! Your application has been approved. We will contact you soon with further details.';
      case 'rejected':
        return 'We appreciate your interest, but we are unable to proceed with your application at this time. You may reapply after 6 months.';
      default:
        return 'Your application is currently under review. We will notify you once a decision has been made.';
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Check Application Status
          </h1>
          <p className="text-gray-400">
            Enter your email to check your application status
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleCheck}
          className="bg-[#111111] rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Enter your email address"
              className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5A8] transition-colors"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00E5A8] text-black font-bold rounded-lg hover:bg-[#00cc96] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Status
              </>
            )}
          </button>
        </motion.form>

        {/* Application Status */}
        {application && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111111] rounded-2xl p-8 border border-gray-800 text-center"
          >
            <div className="mb-6">
              {getStatusIcon(application.status)}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Hello, {application.name}!
            </h2>

            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>

            <p className="text-gray-400 mb-6">
              {getStatusMessage(application.status)}
            </p>

            <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
              <p className="text-gray-500">
                <span className="text-gray-400">Submitted:</span>{' '}
                {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              {application.reviewedAt && (
                <p className="text-gray-500">
                  <span className="text-gray-400">Reviewed:</span>{' '}
                  {new Date(application.reviewedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/teacher-admission" className="text-[#00E5A8] hover:underline">
            ← Back to Application Form
          </a>
        </div>
      </div>
    </div>
  );
}
