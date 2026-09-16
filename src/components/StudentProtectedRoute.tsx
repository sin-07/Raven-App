'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface StudentProtectedRouteProps {
  children: React.ReactNode;
}

interface StudentData {
  _id: string;
  studentName: string;
  email: string;
  registrationId: string;
  standard: string;
}

const StudentProtectedRoute: React.FC<StudentProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [student, setStudent] = useState<StudentData | null>(null);

  const verifyAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        // Clear any stale data
        setIsAuthenticated(false);
        setStudent(null);
        
        // Don't show toast for initial page load
        if (pathname !== '/login') {
          toast.error('Session expired. Please login again.');
        }
        
        router.replace('/login');
        return;
      }

      const data = await res.json();
      
      if (data.success && data.student) {
        setIsAuthenticated(true);
        setStudent(data.student);
      } else {
        setIsAuthenticated(false);
        setStudent(null);
        router.replace('/login');
      }
    } catch (error) {
      console.error('[AUTH ERROR] Failed to verify student:', error);
      setIsAuthenticated(false);
      setStudent(null);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Re-verify on window focus (detect if session expired in another tab)
  useEffect(() => {
    const handleFocus = () => {
      verifyAuth();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [verifyAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-jakarta">Verifying student access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-jakarta">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};


export default StudentProtectedRoute;

