'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Clock, Award, Shield, Heart } from 'lucide-react';
import { gsap, ScrollTrigger, scrollStagger, scrollFadeUp } from '@/lib/gsap';

const Footer: React.FC = React.memo(() => {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const quickLinksRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Scroll: reveal each footer column with stagger
    const columns = [brandRef.current, quickLinksRef.current, contactRef.current, featuresRef.current].filter(Boolean) as Element[];
    if (columns.length) {
      gsap.fromTo(columns,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        }
      );
    }

    // Scroll: bottom bar fade up
    if (bottomRef.current) {
      scrollFadeUp(bottomRef.current, { start: 'top 98%' });
    }

    // Scroll: stagger links inside quick links
    if (quickLinksRef.current) {
      const links = quickLinksRef.current.querySelectorAll('a');
      scrollStagger(links, 0.06, { start: 'top 90%' } as any);
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const currentYear = new Date().getFullYear();

  const contactInfo = [
    { icon: Phone, text: '+91 8618281816' },
    { icon: Mail, text: 'raventutorials@gmail.com' },
    { icon: MapPin, text: 'Bajrangpuri, Patna - 800007' }
  ];

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/admission', label: 'Admission' },
    { path: '/notices', label: 'Notices' },
    { path: '/about', label: 'About Us' }
  ];

  const socialLinks = [
    { icon: Facebook, url: '#', label: 'Facebook' },
    { icon: Twitter, url: '#', label: 'Twitter' },
    { icon: Instagram, url: '#', label: 'Instagram' }
  ];

  const features = [
    { icon: Clock, text: 'Flexible Timings' },
    { icon: Award, text: 'Expert Teachers' },
    { icon: Shield, text: 'Safe Environment' },
    { icon: Heart, text: 'Personal Attention' }
  ];

  return (
    <footer ref={footerRef} className="bg-[#080808] border-t border-gray-800 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div ref={brandRef} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="RAVEN Logo" 
                className="h-10 w-10 object-contain"
              />

              <div className="flex items-baseline gap-1 font-outfit">
                <span className="text-white font-black text-2xl tracking-tight">RAVEN</span>
                <span className="text-[#00E5A8] font-bold text-sm tracking-widest uppercase">Tutorials</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-jakarta leading-relaxed">
              Empowering students with quality education and personalized attention for academic excellence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="p-2 bg-[#111111] border border-gray-800 rounded-full hover:bg-[#00E5A8]/10 hover:border-[#00E5A8]/30 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-[#00E5A8]" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div ref={quickLinksRef}>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-400 hover:text-[#00E5A8] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-[#00E5A8] rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div ref={contactRef}>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2 text-white">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  <info.icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#00E5A8]" />
                  <span>{info.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div ref={featuresRef}>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2 text-white">Why Choose Us</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-400">
                  <div className="p-1.5 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg">
                    <feature.icon className="w-4 h-4 text-[#00E5A8]" />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div ref={bottomRef} className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {currentYear} RAVEN Tutorials. All rights reserved.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link href="/privacy" className="hover:text-[#00E5A8] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#00E5A8] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;

