'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Custom hook to handle automatic session timeout after 1 hour
 * Tracks user activity and triggers logout when session expires
 * 
 * @param userType - 'student' or 'admin'
 */
const useSessionTimeout = (userType: 'student' | 'admin' = 'student') => {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  
  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before expiry

  const clearAllTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  };

  const handleSessionExpiry = () => {
    console.log('🔴 Session expired - logging out user');
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      
      // Clear all cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    
    // Clear timeouts
    clearAllTimeouts();
    
    // Dispatch session expired event to show modal popup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session-expired', { 
        detail: { type: userType } 
      }));
    }
  };

  const showWarning = () => {
    toast('⏰ Your session will expire in 5 minutes. Save your work!', {
      duration: 10000,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  };

  const resetSessionTimer = () => {
    // Don't reset if not on protected routes
    const isProtectedRoute = userType === 'admin' 
      ? pathname?.startsWith('/admin/dashboard')
      : pathname?.startsWith('/dashboard');
    
    if (!isProtectedRoute) {
      return;
    }

    // Check if session info exists
    if (typeof window === 'undefined') return;
    
    const sessionInfo = sessionStorage.getItem(`${userType}Info`);
    if (!sessionInfo) {
      return;
    }

    // Clear existing timeouts
    clearAllTimeouts();

    // Set session start time if not already set
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
      console.log(`🟢 Session started for ${userType} at`, new Date().toLocaleTimeString());
    }

    // Calculate time elapsed since session start
    const timeElapsed = Date.now() - sessionStartRef.current;
    const timeRemaining = SESSION_DURATION - timeElapsed;

    // If session should have expired, logout immediately
    if (timeRemaining <= 0) {
      handleSessionExpiry();
      return;
    }

    // Set warning timeout (5 minutes before expiry)
    const warningDelay = timeRemaining - WARNING_TIME;
    if (warningDelay > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, warningDelay);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleSessionExpiry();
    }, timeRemaining);
  };

  useEffect(() => {
    resetSessionTimer();

    return () => {
      clearAllTimeouts();
    };
  }, [pathname, userType]);

  return { resetSessionTimer };
};

export default useSessionTimeout;
