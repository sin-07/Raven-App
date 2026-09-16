'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, Loader2, AlertCircle, FileText, ChevronDown, CheckCircle2 } from 'lucide-react';
import WavyHeading from '@/components/WavyHeading';

export default function LearnerAdmissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showCodeOfConduct, setShowCodeOfConduct] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToConduct, setAgreedToConduct] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: 'Test Student',
    fatherName: 'Test Father',
    motherName: 'Test Mother',
    dateOfBirth: '2001-12-18',
    gender: 'Male',
    bloodGroup: 'O+',
    category: 'General',
    phoneNumber: '9876543210',
    alternatePhoneNumber: '9876543211',
    email: 'aniket.singh07vs@gmail.com',
    address: 'Test Address, Street No. 1',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800007',
    standard: '10th',
    previousSchool: 'Test School',
    photo: null as File | null
  });

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full px-4 py-2 bg-[#080808] border text-white rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none transition";
    const errorClass = fieldErrors[fieldName] ? "border-red-500" : "border-gray-800";
    return `${baseClass} ${errorClass}`;
  };

  const handleConductScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: false }));
    setError('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
      setFieldErrors(prev => ({ ...prev, photo: false }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields and collect all errors
      const requiredFields = [
        'studentName', 'fatherName', 'motherName', 'dateOfBirth',
        'gender', 'bloodGroup', 'category', 'phoneNumber',
        'email', 'address', 'city', 'state', 'pincode',
        'standard', 'previousSchool'
      ];

      const errors: Record<string, boolean> = {};
      let hasErrors = false;

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          errors[field] = true;
          hasErrors = true;
        }
      }

      if (!formData.photo) {
        errors.photo = true;
        hasErrors = true;
      }

      if (hasErrors) {
        setFieldErrors(errors);
        toast.error('Fill all the details', {
          duration: 3000,
          position: 'top-center',
        });
        setLoading(false);
        return;
      }

      // Validate Code of Conduct agreement
      if (!agreedToConduct) {
        toast.error('Please read and agree to the Code of Conduct', {
          duration: 3000,
          position: 'top-center',
        });
        setLoading(false);
        return;
      }

      // Validate email
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Validate phone
      if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      if (formData.alternatePhoneNumber && !/^[0-9]{10}$/.test(formData.alternatePhoneNumber)) {
        setError('Please enter a valid 10-digit alternate phone number');
        setLoading(false);
        return;
      }

      // Validate pincode
      if (!/^[0-9]{6}$/.test(formData.pincode)) {
        setError('Please enter a valid 6-digit pincode');
        setLoading(false);
        return;
      }

      // Create form data for submission
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          submitData.append(key, value);
        }
      });

      const response = await fetch('/api/admission/submit', {
        method: 'POST',
        body: submitData
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response:', response.status);
        throw new Error(`Server error. Status: ${response.status}. Please try again later.`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a duplicate email error
        if (data.message && data.message.toLowerCase().includes('email') && data.message.toLowerCase().includes('already')) {
          toast.error('This email is already registered!', {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '⚠️',
          });
        }
        throw new Error(data.message || 'Failed to submit admission form');
      }

      // Show success toast
      toast.success('OTP sent to your email!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '12px',
        },
      });

      // Store temp admission data in session storage
      sessionStorage.setItem('tempAdmission', JSON.stringify(data.data));
      
      // Redirect to OTP verification page
      router.push('/admission/verify-otp');

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      // Show error toast if not already shown
      if (!err.message?.toLowerCase().includes('email') || !err.message?.toLowerCase().includes('already')) {
        toast.error(err.message || 'Something went wrong. Please try again.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden py-24">
      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-8 px-4 flex flex-col items-center justify-center">
          <WavyHeading
            text="Learner Admission"
            gradientText="Form"
            className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full mb-2"
          />
          <p className="text-gray-400 font-jakarta">Fill in your details to complete the admission process</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 mx-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111111] shadow-xl p-4 md:p-8 border-y border-gray-800">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={getInputClassName("studentName")}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className={getInputClassName("fatherName")}
                  placeholder="Enter father's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mother's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  className={getInputClassName("motherName")}
                  placeholder="Enter mother's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={getInputClassName("dateOfBirth")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={getInputClassName("gender")}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className={getInputClassName("bloodGroup")}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={getInputClassName("category")}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Contact Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={getInputClassName("phoneNumber")}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone Number
                </label>
                <input
                  type="tel"
                  name="alternatePhoneNumber"
                  value={formData.alternatePhoneNumber}
                  onChange={handleInputChange}
                  className={getInputClassName("alternatePhoneNumber")}
                  placeholder="10-digit phone number"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getInputClassName("email")}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={getInputClassName("address")}
                  placeholder="Enter complete address"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={getInputClassName("city")}
                  placeholder="Enter city"
                  required
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={getInputClassName("state")}
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={getInputClassName("pincode")}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Educational Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Standard/Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="standard"
                  value={formData.standard}
                  onChange={handleInputChange}
                  className={getInputClassName("standard")}
                  required
                >
                  <option value="">Select Standard</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Previous School <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleInputChange}
                  className={getInputClassName("previousSchool")}
                  placeholder="Enter previous school name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Upload Photo</h2>
            
            <div className="flex flex-col items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-40 h-40 object-cover rounded-lg border-2 border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photo: null }));
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#00E5A8] transition bg-[#080808] ${
                  fieldErrors.photo ? 'border-red-500' : 'border-gray-800'
                }`}>
                  <Upload className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400 mb-1">Click to upload photo</p>
                  <p className="text-sm text-gray-500">Max size: 5MB (JPG, PNG)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="mb-8">
            <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#080808]">
              {/* Header */}
              <button
                type="button"
                onClick={() => setShowCodeOfConduct(!showCodeOfConduct)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#111111] transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#00E5A8]" />
                  <h2 className="text-xl font-bold text-white">Code of Conduct</h2>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    showCodeOfConduct ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Content */}
              {showCodeOfConduct && (
                <div className="border-t border-gray-800">
                  <div 
                    className="max-h-96 overflow-y-auto p-6 space-y-4 scroll-smooth"
                    onScroll={handleConductScroll}
                  >
                    <p className="text-gray-300 leading-relaxed">
                      By enrolling at <span className="text-[#00E5A8] font-semibold">Raven Tutorials</span>, you agree to abide by the following Code of Conduct to maintain a respectful, safe, and productive learning environment:
                    </p>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">1.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Respect and Courtesy:</span> Treat all students, teachers, and staff with respect and kindness. Harassment, bullying, or discrimination of any kind will not be tolerated.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">2.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Punctuality:</span> Arrive on time for all classes, exams, and scheduled activities. Consistent tardiness disrupts the learning environment.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">3.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Academic Integrity:</span> Maintain honesty in all academic work. Cheating, plagiarism, or any form of academic dishonesty will result in serious consequences.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">4.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Attendance:</span> Regular attendance is mandatory. Maintain at least 75% attendance to be eligible for examinations and certifications.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">5.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Classroom Behavior:</span> Maintain appropriate behavior during classes. Use of mobile phones during class is strictly prohibited unless authorized by the instructor.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">6.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Dress Code:</span> Dress appropriately and professionally. Maintain a neat and clean appearance at all times.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">7.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Property Care:</span> Respect and take care of institute property, including furniture, equipment, and learning materials. Any damage caused will be subject to charges.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">8.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Safety and Security:</span> Follow all safety protocols and security measures. Report any safety concerns immediately to staff members.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">9.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Communication:</span> Use official communication channels for all institute-related correspondence. Check emails and notices regularly.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">10.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Fee Payment:</span> Pay all fees on time as per the payment schedule. Late payments may result in temporary suspension of services.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">11.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Technology Use:</span> Use institute technology and resources responsibly. Unauthorized access or misuse of systems is strictly prohibited.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">12.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Confidentiality:</span> Maintain confidentiality of proprietary study materials and teaching methods. Sharing or distributing institute materials without permission is prohibited.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-[#00E5A8] font-bold flex-shrink-0">13.</span>
                        <p className="text-gray-300">
                          <span className="font-semibold text-white">Compliance:</span> Comply with all institute policies, rules, and regulations. Violation of the Code of Conduct may result in disciplinary action, including suspension or expulsion.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg">
                      <p className="text-[#00E5A8] text-sm font-medium">
                        By proceeding with this admission, you acknowledge that you have read, understood, and agree to abide by this Code of Conduct.
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="border-t border-gray-800 p-4 bg-[#111111]">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
                        <input
                          type="checkbox"
                          checked={agreedToConduct}
                          onChange={(e) => setAgreedToConduct(e.target.checked)}
                          disabled={!hasScrolledToBottom}
                          className="w-5 h-5 rounded border-2 border-gray-600 bg-[#080808] checked:bg-[#00E5A8] checked:border-[#00E5A8] disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#00E5A8] focus:ring-offset-2 focus:ring-offset-[#111111] transition"
                        />
                        {agreedToConduct && (
                          <CheckCircle2 className="w-5 h-5 text-[#00E5A8] absolute pointer-events-none" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium group-hover:text-[#00E5A8] transition">
                          I have read and agree to the Code of Conduct
                        </p>
                        {!hasScrolledToBottom && (
                          <p className="text-xs text-gray-500 mt-1">
                            Please scroll to the bottom to enable this checkbox
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 border-2 border-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !agreedToConduct}
              className="flex-1 py-3 px-6 bg-[#00E5A8] text-black font-semibold rounded-full hover:bg-[#00E5A8]/90 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit & Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

