'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Loader2, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AdmissionPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Get payment order data from session storage
    const data = sessionStorage.getItem('paymentOrder');
    if (!data) {
      router.push('/admission/learner');
      return;
    }
    setPaymentData(JSON.parse(data));
  }, [router]);

  const handlePayment = async () => {
    if (!paymentData) return;

    setLoading(true);
    setError('');

    try {
      const options = {
        key: paymentData.razorpayKeyId,
        amount: paymentData.amount * 100,
        currency: paymentData.currency,
        name: 'Raven Tutorials',
        description: 'Admission Fee Payment',
        order_id: paymentData.orderId,
        prefill: {
          name: paymentData.studentName,
          email: paymentData.email,
        },
        notes: {
          tempAdmissionId: paymentData.tempAdmissionId,
          standard: paymentData.standard
        },
        theme: {
          color: '#7C3AED'
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/admission/payment-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tempAdmissionId: paymentData.tempAdmissionId
              })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            // Store success data and redirect
            sessionStorage.setItem('admissionSuccess', JSON.stringify(verifyData.data));
            sessionStorage.removeItem('paymentOrder');
            sessionStorage.removeItem('tempAdmission');
            
            router.push('/admission/success');

          } catch (err: any) {
            setError(err.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // Clear session data and redirect to admission form
            sessionStorage.removeItem('paymentOrder');
            sessionStorage.removeItem('tempAdmission');
            alert('Payment cancelled. You will be redirected to start a new admission.');
            router.push('/admission/learner');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setLoading(false);
        // Clear session data and redirect to admission form
        sessionStorage.removeItem('paymentOrder');
        sessionStorage.removeItem('tempAdmission');
        alert(response.error.description || 'Payment failed. You will be redirected to start a new admission.');
        router.push('/admission/learner');
      });

      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center p-4 pt-24">
        <div className="relative z-10 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00E5A8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-[#00E5A8]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
            <p className="text-gray-400">
              Pay admission fee to complete your enrollment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-[#111111] rounded-2xl shadow-xl p-8 mb-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Student Name</span>
                <span className="font-medium text-white">{paymentData.studentName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Email</span>
                <span className="font-medium text-white">{paymentData.email}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Standard</span>
                <span className="font-medium text-white">{paymentData.standard}</span>
              </div>
              
              <div className="flex justify-between py-3 mt-4">
                <span className="text-lg font-semibold text-white">Admission Fee</span>
                <span className="text-2xl font-bold text-[#00E5A8]">₹{paymentData.amount}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 p-3 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg mb-6">
              <ShieldCheck className="w-5 h-5 text-[#00E5A8]" />
              <p className="text-sm text-[#00E5A8]">
                Secured by Razorpay - India's most trusted payment gateway
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 bg-[#00E5A8] text-black font-semibold rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ₹{paymentData.amount}
                </>
              )}
            </button>

            {/* Payment Methods */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-2">Accepted Payment Methods</p>
              <div className="flex justify-center gap-2 text-xs text-gray-400">
                <span>Credit Card</span>
                <span>•</span>
                <span>Debit Card</span>
                <span>•</span>
                <span>UPI</span>
                <span>•</span>
                <span>Net Banking</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>By proceeding with payment, you agree to our</p>
            <p>
              <a href="/terms" className="text-[#00E5A8] hover:text-[#00E5A8]/80">Terms & Conditions</a>
              {' and '}
              <a href="/privacy" className="text-[#00E5A8] hover:text-[#00E5A8]/80">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

