'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { LMSFooter } from '@/components/lms';
import WavyHeading from '@/components/WavyHeading';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate contact dispatch
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Admissions Hotline',
      details: ['+91 8618281816', '+91 93041 23456'],
    },
    {
      icon: Mail,
      title: 'Email Inquiries',
      details: ['raventutorials@gmail.com', 'admissions@raventutorials.com'],
    },
    {
      icon: MapPin,
      title: 'Patna Campus',
      details: ['Bajrangpuri, Patna - 800007', 'Bihar, India'],
    },
    {
      icon: Clock,
      title: 'Counseling Hours',
      details: ['Mon - Sat: 8:00 AM - 8:00 PM', 'Sunday: 9:00 AM - 4:00 PM'],
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500 selection:text-black relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative z-10 pt-36 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-4 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-space font-semibold uppercase tracking-wider backdrop-blur-md mx-auto">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Connect with our Patna Faculty</span>
          </div>

          <WavyHeading
            text="Get in"
            gradientText="Touch"
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-outfit tracking-tight leading-[1.1] text-center w-full"
          />

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-jakarta text-center">
            Have questions regarding batch schedules, course fees, or scholarship tests? Send us a message or visit our campus.
          </p>
        </section>

        {/* Contact Information Cards */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="p-6 rounded-3xl bg-[#0e1320]/80 border border-emerald-500/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/45 hover:bg-[#12182c] transition-all duration-300 text-center flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-md shadow-emerald-500/10">
                  <info.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-outfit">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-400 text-xs sm:text-sm font-jakarta">{detail}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Form & Map Section */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-20">
            {/* Contact Form */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#0e1320]/85 border border-emerald-500/25 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-outfit">Send an Inquiry</h2>
                  <p className="text-gray-400 text-xs sm:text-sm font-jakarta">We typically reply within 24 hours</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-outfit">Inquiry Received!</h3>
                  <p className="text-gray-300 text-sm font-jakarta max-w-sm mx-auto">
                    Thank you for reaching out. Our academic counselors will get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-emerald-500 text-black font-bold text-sm font-outfit rounded-xl hover:bg-emerald-400 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 font-jakarta">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-300 mb-2 font-space">
                        Student / Parent Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Aniket Singh"
                        className="w-full px-4 py-3.5 rounded-xl bg-[#08090d] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-300 mb-2 font-space">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-3.5 rounded-xl bg-[#08090d] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-300 mb-2 font-space">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 8618281816"
                        className="w-full px-4 py-3.5 rounded-xl bg-[#08090d] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-300 mb-2 font-space">
                        Interested Track
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-[#08090d] border border-white/10 text-white focus:border-emerald-400 focus:outline-none text-sm"
                        required
                      >
                        <option value="">Select target class/stream</option>
                        <option value="class-9-10">Class 9 & 10 Foundation</option>
                        <option value="class-11-12">Class 11 & 12 Boards</option>
                        <option value="jee-neet">JEE / NEET Prep</option>
                        <option value="crash-course">Exam Crash Course</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-300 mb-2 font-space">
                      Message / Question
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share details about current academic standard or specific questions..."
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#08090d] border border-white/10 text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none text-sm resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl text-sm font-outfit shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Patna Location Map */}
            <div className="rounded-3xl overflow-hidden border border-emerald-500/20 bg-[#0e1320]/80 shadow-2xl backdrop-blur-xl relative min-h-[450px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14392.544773820253!2d85.1843236!3d25.6004944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed58c148fa7949%3A0x6b4f74d6c4eef888!2sBajrangpuri%2C%20Patna%2C%20Bihar%20800007!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '450px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Raven Tutorials Patna Campus Map"
              />
            </div>
          </div>
        </section>

        <LMSFooter />
      </div>
    </>
  );
}


