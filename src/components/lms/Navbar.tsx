'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown,
  GraduationCap,
  LogIn,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function LMSNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="RAVEN Logo" 
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-300"
            />

            <div className="flex items-baseline gap-1.5 font-outfit">
              <span className="text-white font-extrabold text-2xl tracking-tight">RAVEN</span>
              <span className="text-[#00E5A8] font-bold text-lg tracking-wide uppercase">Tutorials</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  isActive(link.href)
                    ? 'text-[#00E5A8]'
                    : 'text-gray-400 hover:text-[#00E5A8]'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#00E5A8] transition-transform origin-left ${
                  isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#00E5A8] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-black bg-[#00E5A8] rounded-full hover:bg-[#00E5A8]/90 hover:scale-105 transition-all shadow-md shadow-[#00E5A8]/25 hover:shadow-lg hover:shadow-[#00E5A8]/30"
            >
              <UserPlus className="w-4 h-4" />
              Admission
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#111111] border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#00E5A8]/10 text-[#00E5A8]'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium text-black bg-[#00E5A8] rounded-full hover:bg-[#00E5A8]/90 transition-all"
                >
                  Admission
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

