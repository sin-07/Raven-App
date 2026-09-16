'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [tempAdmission, setTempAdmission] = useState<any>(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown

  useEffect(() => {
    // Get temp admission data from session storage
    const data = sessionStorage.getItem('tempAdmission');
    if (!data) {
      router.push('/admission/learner');
      return;
    }
    setTempAdmission(JSON.parse(data));
  }, [router]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admission/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempAdmissionId: tempAdmission.tempAdmissionId,
          otp: otpValue,
          email: tempAdmission.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setSuccess('OTP verified successfully! Redirecting to payment...');
      
      // Store order data and redirect to payment
      sessionStorage.setItem('paymentOrder', JSON.stringify(data.data));
      
      setTimeout(() => {
        router.push('/admission/payment');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admission/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempAdmissionId: tempAdmission.tempAdmissionId,
          email: tempAdmission.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent successfully! Please check your email.');
      setOtp(['', '', '', '', '', '']);
      setCountdown(120);
      
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!tempAdmission) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center p-4 pt-24">
      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#00E5A8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#00E5A8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
          <p className="text-gray-400">
            We've sent a 6-digit OTP to
            <br />
            <span className="font-medium text-white">{tempAdmission.email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#00E5A8] mt-0.5 flex-shrink-0" />
            <p className="text-[#00E5A8]">{success}</p>
          </div>
        )}

        {/* OTP Input */}
        <div className="bg-[#111111] rounded-2xl shadow-xl p-8 border border-gray-800">
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold bg-[#080808] border-2 border-gray-800 text-white rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none transition"
              />
            ))}
          </div>

          {/* Countdown Timer */}
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-gray-400">
                Time remaining:{' '}
                <span className="font-semibold text-[#00E5A8]">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </p>
            ) : (
              <p className="text-red-400 font-medium">OTP expired! Please request a new one.</p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOTP}
            disabled={loading || countdown === 0}
            className="w-full py-3 bg-[#00E5A8] text-black font-semibold rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-400 mb-2">Didn't receive the OTP?</p>
            <button
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              className="text-[#00E5A8] font-medium hover:text-[#00E5A8]/80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Student: <span className="font-medium text-gray-300">{tempAdmission.studentName}</span>
          </p>
          <p className="text-sm text-gray-500">
            Admission Fee: <span className="font-medium text-gray-300">₹{tempAdmission.amount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

