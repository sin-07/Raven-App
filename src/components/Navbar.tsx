'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, User, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext';
import { magneticHover } from '@/lib/gsap';

const Navbar: React.FC = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout: adminLogout } = useAdmin();

  // GSAP refs
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  // Check if student session is active
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setIsStudentLoggedIn(data.success === true && !!data.student);
        } else {
          setIsStudentLoggedIn(false);
        }
      } catch {
        setIsStudentLoggedIn(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const isAdminLoggedIn = !!admin;

  // High-performance passive scroll handling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const logo = logoRef.current;
    const cleanupMagnetic = logo ? magneticHover(logo, logo, 0.12) : null;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          
          if (currentY > 15 !== scrolled) {
            setScrolled(currentY > 15);
          }

          if (currentY < 40) {
            setNavVisible(true);
          } else if (currentY > lastScrollY + 8 && currentY > 100) {
            setNavVisible(false);
          } else if (currentY < lastScrollY - 6) {
            setNavVisible(true);
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (cleanupMagnetic) cleanupMagnetic();
    };
  }, [scrolled]);

  const navLinks = useMemo(() => [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/services', label: 'Services' },
    ...(!isStudentLoggedIn ? [{ path: '/admission', label: 'Admission' }] : []),
    { path: '/notices', label: 'Notices' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ], [isStudentLoggedIn]);

  const isActive = (path: string) => pathname === path;

  const handleStudentLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsStudentLoggedIn(false);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      setIsStudentLoggedIn(false);
      router.push('/login');
    }
  };

  const handleAdminLogout = async () => {
    await adminLogout();
    toast.success('Admin logged out');
    router.push('/login');
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 will-change-transform ${
          navVisible ? 'translate-y-0 opacity-100' : '-translate-y-28 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Cyber-Obsidian Glass Capsule Navbar Container */}
          <div className={`relative flex items-center justify-between h-[64px] px-4 sm:px-6 rounded-full transition-all duration-300 border ${
            scrolled
              ? 'bg-[#080a11]/92 backdrop-blur-2xl border-emerald-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] shadow-emerald-950/25'
              : 'bg-[#090c15]/85 backdrop-blur-xl border-emerald-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] shadow-emerald-950/15'
          }`}>
            {/* Top specular hairline shine */}
            <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            {/* Brand Logo & Identifier */}
            <Link ref={logoRef} href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-[#10192e] to-[#0a0f1d] border border-emerald-500/40 group-hover:border-emerald-400/80 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_22px_rgba(16,185,129,0.4)]">
                <img
                  src="/logo.png"
                  alt="RAVEN Logo"
                  className="h-6 w-6 object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-white font-black text-xl tracking-tight font-outfit group-hover:text-white transition-colors">
                    RAVEN
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-space font-bold uppercase tracking-widest text-emerald-400">
                    Tutorials
                  </span>
                </div>
                <span className="text-[9px] font-space text-gray-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                  Patna Campus
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links Dock */}
            <div ref={linksRef} className="hidden md:flex items-center space-x-1 bg-[#0e1322]/80 p-1.5 rounded-full border border-white/[0.07] font-jakarta shadow-inner">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                      active
                        ? 'text-white bg-gradient-to-r from-emerald-500/30 via-emerald-500/20 to-teal-500/10 border border-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    )}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Action CTA Button (Right) */}
            <div className="hidden sm:flex items-center gap-3">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs font-outfit uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300 transform hover:scale-[1.03]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold transition"
                    title="Logout Admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isStudentLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs font-outfit uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300 transform hover:scale-[1.03]"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Student Dashboard</span>
                  </Link>
                  <button
                    onClick={handleStudentLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold transition"
                    title="Logout Student"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-[#02130e] font-extrabold text-xs font-outfit uppercase tracking-wider rounded-full shadow-[0_0_22px_rgba(16,185,129,0.4)] hover:shadow-[0_0_32px_rgba(16,185,129,0.7)] transition-all duration-300 transform hover:scale-[1.04] active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-[#101424] hover:bg-[#141a2e] border border-emerald-500/30 text-gray-300 hover:text-emerald-400 transition shadow-md"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5 text-emerald-400' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2 text-emerald-400' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Drawer Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden mt-2 p-5 rounded-3xl bg-[#0a0d17]/95 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.9)] space-y-3">
              <div className="space-y-1 font-jakarta">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                        active
                          ? 'text-white bg-emerald-500/20 border border-emerald-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-800">
                {isAdminLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-center font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 font-outfit uppercase tracking-wider"
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleAdminLogout();
                      }}
                      className="block w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-center font-semibold text-sm rounded-2xl"
                    >
                      Logout Admin
                    </button>
                  </div>
                ) : isStudentLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-center font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 font-outfit uppercase tracking-wider"
                    >
                      Student Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleStudentLogout();
                      }}
                      className="block w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-center font-semibold text-sm rounded-2xl"
                    >
                      Logout Student
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-[#02130e] text-center font-extrabold text-sm rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] font-outfit uppercase tracking-wider"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Portal Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
