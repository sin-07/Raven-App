'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const footerLinks = {
  quick: [
    { name: 'Home', href: '/' },
    { name: 'All Courses', href: '/courses' },
    { name: 'Services', href: '/services' },
    { name: 'Admission', href: '/admission' },
    { name: 'Notices', href: '/notices' },
    { name: 'About Us', href: '/about' },
  ],
  programs: [
    { name: 'Foundation (Classes 8-10)', href: '/courses' },
    { name: 'Senior Secondary (11-12)', href: '/courses' },
    { name: 'JEE Main & Advanced', href: '/courses' },
    { name: 'NEET Medical Prep', href: '/courses' },
    { name: 'Comprehensive Test Series', href: '/services' },
  ],
  studentSupport: [
    { name: 'Student Dashboard', href: '/dashboard' },
    { name: 'Contact Support', href: '/contact' },
    { name: 'Admission Status', href: '/admission' },
    { name: 'Notice Board', href: '/notices' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function LMSFooter() {
  return (
    <footer className="bg-[#08090d] border-t border-emerald-500/15 text-white relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.12)_0%,_transparent_70%)] pointer-events-none" />

      {/* Newsletter Bar */}
      <div className="border-b border-white/5 bg-[#0b0e17]/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-black text-white font-outfit">Stay Ahead with RAVEN</h3>
              </div>
              <p className="text-gray-400 text-sm font-jakarta">Get real-time exam notifications, study material updates, and batch schedules.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full sm:w-80 px-4 py-3 rounded-xl bg-[#101422] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-jakarta transition"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm font-outfit shadow-lg shadow-emerald-500/20">
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Address */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <div className="p-2 rounded-xl bg-[#101422] border border-emerald-500/30 group-hover:border-emerald-400/50 transition-all shadow-md shadow-emerald-500/10">
                <img 
                  src="/logo.png" 
                  alt="RAVEN Logo" 
                  className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-baseline gap-1.5 font-outfit">
                <span className="text-white font-black text-2xl tracking-tight">RAVEN</span>
                <span className="text-emerald-400 font-bold text-base uppercase tracking-wider">Tutorials</span>
              </div>
            </Link>

            <p className="text-gray-400 leading-relaxed font-jakarta text-sm">
              Empowering students to achieve academic excellence through quality education, 
              expert faculty mentorship, and state-of-the-art interactive digital learning.
            </p>

            <div className="space-y-3 font-jakarta text-xs text-gray-300 pt-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Bajrangpuri, Patna - 800007, Bihar</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 8618281816</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>raventutorials@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 font-space mb-4">Quick Links</h4>
            <ul className="space-y-2.5 font-jakarta text-sm">
              {footerLinks.quick.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 font-space mb-4">Academic Programs</h4>
            <ul className="space-y-2.5 font-jakarta text-sm">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 font-space mb-4">Student Portal</h4>
            <ul className="space-y-2.5 font-jakarta text-sm">
              {footerLinks.studentSupport.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold font-space">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Admissions Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-800/80 bg-[#06070a] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-jakarta">
              © {new Date().getFullYear()} RAVEN Tutorials. All rights reserved. Empowering next-generation learners.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#101422] border border-gray-800 flex items-center justify-center text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


