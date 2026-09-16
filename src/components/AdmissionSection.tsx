'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Upload,
  Send,
  CreditCard,
  CheckCircle,
  Loader,
  Key,
  X,
  ArrowRight,
  ArrowLeft,
  Shield,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { STANDARDS } from '@/constants/classes';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormData {
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  category: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  standard: string;
  previousSchool: string;
  photo: File | null;
}

interface Credentials {
  registrationId: string;
  password: string;
  email: string;
}

export default function AdmissionSection() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Payment, 4: Success
  const [tempAdmissionId, setTempAdmissionId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1);
  const [credentials, setCredentials] = useState<Credentials>({ registrationId: '', password: '', email: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    category: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    standard: '',
    previousSchool: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const resetForm = () => {
    setStep(1);
    setTempAdmissionId(null);
    setOtp('');
    setCredentials({ registrationId: '', password: '', email: '' });
    setFormData({
      studentName: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      category: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      standard: '',
      previousSchool: '',
      photo: null
    });
    setPhotoPreview(null);
    setAcceptedTerms(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    if (!formData.photo) {
      toast.error('Please upload your photo');
      return;
    }
    
    const requiredFields: (keyof FormData)[] = [
      'studentName', 'fatherName', 'motherName', 'dateOfBirth', 
      'gender', 'bloodGroup', 'category', 'phoneNumber', 
      'email', 'address', 'city', 'state', 'pincode', 
      'standard', 'previousSchool'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormData];
        if (value) {
          formDataToSend.append(key, value as string | Blob);
        }
      });

      const response = await fetch('/api/admission/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to submit form');
        return;
      }

      if (data.success) {
        setTempAdmissionId(data.data.tempAdmissionId);
        setPaymentAmount(data.data.amount);
        setStep(2);
        toast.success(`OTP sent to ${formData.email}`);
      } else {
        toast.error(data.message || 'Failed to submit form');
      }
    } catch (error: any) {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admission/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: tempAdmissionId,
          otp: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
        toast.success('OTP verified! Please proceed to payment.');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          receipt: `admission_${tempAdmissionId}`
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error('Error creating payment order');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'RAVEN Tutorials',
        description: 'Admission Fee',
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tempAdmissionId: tempAdmissionId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setCredentials({
                registrationId: verifyData.data.registrationId,
                password: verifyData.data.password,
                email: verifyData.data.loginEmail
              });
              setStep(4);
              toast.success('Payment successful! Registration complete.');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
          }
        },
        prefill: {
          name: formData.studentName,
          email: formData.email,
          contact: formData.phoneNumber
        },
        theme: {
          color: '#7c3aed'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (step === 4) {
      resetForm();
    }
    setShowModal(false);
  };

  return (
    <>
      {/* I Want to Learn Section */}
      <section className="py-20 bg-[#080808]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#00E5A8]/10 text-[#00E5A8] rounded-full text-xs font-space uppercase tracking-wider font-semibold mb-4 border border-[#00E5A8]/20">
              Start Your Journey
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white font-outfit tracking-tight">
              I Want to Learn
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta">
              Take the first step towards your academic success. Join Raven Tutorials and unlock your potential with expert guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 font-jakarta"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00E5A8] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00E5A8]/20">
                  <GraduationCap className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">Expert Faculty</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Learn from experienced educators who are passionate about teaching.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">Comprehensive Curriculum</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Well-structured courses covering all subjects with detailed study materials.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">Personalized Attention</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Small batch sizes ensure every student gets individual attention.</p>
                </div>
              </div>

              <div className="pt-4 font-outfit">
                <p className="text-2xl font-bold text-white">
                  Admission Fee: <span className="text-[#00E5A8]">₹1,000</span>
                </p>
                <p className="text-gray-400 text-xs font-jakarta mt-1">One-time registration fee</p>
              </div>
            </motion.div>

            {/* Right Side - CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#10131c] rounded-2xl shadow-2xl p-8 border border-white/5 font-jakarta"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00E5A8]/10">
                  <GraduationCap className="w-10 h-10 text-[#00E5A8]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit">Ready to Join?</h3>
                <p className="text-gray-400 mb-8 font-jakarta text-sm sm:text-base">
                  Complete our simple admission process and start your learning journey today.
                </p>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-[#00E5A8]" />
                    <span>Fill the admission form</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-[#00E5A8]" />
                    <span>Verify your email with OTP</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-[#00E5A8]" />
                    <span>Complete payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-[#00E5A8]" />
                    <span>Get your login credentials</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 bg-[#00E5A8] text-white font-semibold rounded-xl hover:bg-[#00E5A8]/90 transition-all shadow-lg shadow-[#00E5A8]/25 flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  Take Admission Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Admission Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && step !== 4 && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#111111] rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto border border-gray-800"
            >
              {/* Close Button */}
              {step !== 4 && (
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#1a1a1a] transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}

              {/* Step Indicator */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  {['Form', 'OTP', 'Payment', 'Success'].map((label, index) => (
                    <div key={label} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step > index + 1 ? 'bg-[#00E5A8] text-white' :
                        step === index + 1 ? 'bg-[#00E5A8] text-white' :
                        'bg-[#222222] text-gray-500'
                      }`}>
                        {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      {index < 3 && (
                        <div className={`w-12 sm:w-16 h-1 mx-1 ${
                          step > index + 1 ? 'bg-[#00E5A8]' : 'bg-[#222222]'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Form */}
                {step === 1 && (
                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-6">Admission Form</h3>
                    
                    {/* Photo Upload */}
                    <div className="flex justify-center mb-6">
                      <label className="cursor-pointer">
                        <div className={`w-24 h-24 rounded-full border-2 border-dashed ${photoPreview ? 'border-[#00E5A8]' : 'border-gray-700'} flex items-center justify-center overflow-hidden bg-[#080808] hover:bg-[#1a1a1a] transition-colors`}>
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        <p className="text-xs text-gray-500 text-center mt-2">Upload Photo*</p>
                      </label>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Student Name*</label>
                        <input
                          type="text"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Father&apos;s Name*</label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mother&apos;s Name*</label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth*</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gender*</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Blood Group*</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        >
                          <option value="">Select Blood Group</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category*</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        >
                          <option value="">Select Category</option>
                          {['General', 'OBC', 'SC', 'ST', 'EWS'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Standard*</label>
                        <select
                          name="standard"
                          value={formData.standard}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        >
                          <option value="">Select Standard</option>
                          {STANDARDS.map(std => (
                            <option key={std} value={std}>{std}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email*</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number*</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Alternate Phone</label>
                        <input
                          type="tel"
                          name="alternatePhoneNumber"
                          value={formData.alternatePhoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Address*</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">City*</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">State*</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Pincode*</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Previous School*</label>
                      <input
                        type="text"
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#00E5A8] bg-[#080808] border-gray-800 rounded focus:ring-[#00E5A8]"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-400">
                        I agree to the terms and conditions and understand that my data will be stored securely.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#00E5A8] text-white font-semibold rounded-xl hover:bg-[#00E5A8]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit & Get OTP
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-[#00E5A8]/20 flex items-center justify-center mx-auto">
                      <Mail className="w-10 h-10 text-[#00E5A8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
                      <p className="text-gray-400">
                        We&apos;ve sent a 6-digit OTP to <span className="font-medium text-[#00E5A8]">{formData.email}</span>
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-[#080808] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-[#00E5A8] focus:border-transparent"
                        maxLength={6}
                      />
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      className="w-full max-w-xs mx-auto py-3 bg-[#00E5A8] text-white font-semibold rounded-xl hover:bg-[#00E5A8]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Form
                    </button>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-[#00E5A8]/20 flex items-center justify-center mx-auto">
                      <CreditCard className="w-10 h-10 text-[#00E5A8]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Complete Payment</h3>
                      <p className="text-gray-400">
                        Pay the admission fee to complete your registration
                      </p>
                    </div>

                    <div className="bg-[#080808] rounded-xl p-6 max-w-sm mx-auto border border-gray-800">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Admission Fee</span>
                        <span className="text-2xl font-bold text-white">₹{paymentAmount}</span>
                      </div>
                      <div className="text-left text-sm text-gray-500 space-y-1">
                        <p>• Secure payment via Razorpay</p>
                        <p>• Instant confirmation</p>
                        <p>• Get login credentials after payment</p>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full max-w-sm mx-auto py-3 bg-[#00E5A8] text-white font-semibold rounded-xl hover:bg-[#00E5A8]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₹{paymentAmount}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 rounded-full bg-[#00E5A8]/20 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-12 h-12 text-[#00E5A8]" />
                    </motion.div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-[#00E5A8] mb-2">Registration Successful!</h3>
                      <p className="text-gray-400">
                        Welcome to Raven Tutorials! Your account has been created.
                      </p>
                    </div>

                    <div className="bg-[#080808] rounded-xl p-6 max-w-sm mx-auto text-left border border-gray-800">
                      <h4 className="font-semibold text-white mb-4 text-center">Your Login Credentials</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-gray-700">
                          <Key className="w-5 h-5 text-[#00E5A8]" />
                          <div>
                            <p className="text-xs text-gray-500">Registration ID</p>
                            <p className="font-mono font-bold text-white">{credentials.registrationId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-gray-700">
                          <Mail className="w-5 h-5 text-[#00E5A8]" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-white">{credentials.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-gray-700">
                          <Shield className="w-5 h-5 text-[#00E5A8]" />
                          <div>
                            <p className="text-xs text-gray-500">Password</p>
                            <p className="font-mono font-bold text-white">{credentials.password}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-red-400 mt-4 text-center">
                        ⚠️ Please save these credentials. You&apos;ll need them to login.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        resetForm();
                        setShowModal(false);
                        window.location.href = '/login';
                      }}
                      className="w-full max-w-sm mx-auto py-3 bg-[#00E5A8] text-white font-semibold rounded-xl hover:bg-[#00E5A8]/90 transition-all flex items-center justify-center gap-2"
                    >
                      Go to Login
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

