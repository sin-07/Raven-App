'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

interface AdminData {
  id: string;
  email: string;
  name: string;
  role: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [admin, setAdmin] = useState<AdminData | null>(null);

  const verifyAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        setIsAuthenticated(false);
        setAdmin(null);

        if (pathname !== '/login') {
          toast.error('Admin session expired or access unauthorized.');
        }

        router.replace('/login');
        return;
      }

      const data = await res.json();

      if (data.success && data.data?.admin) {
        setIsAuthenticated(true);
        setAdmin(data.data.admin);
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
        router.replace('/login');
      }
    } catch (error) {
      console.error('[ADMIN AUTH ERROR] Failed to verify admin:', error);
      setIsAuthenticated(false);
      setAdmin(null);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Re-verify on window focus
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
          <p className="text-gray-400 text-sm font-jakarta">Verifying admin access...</p>
        </div>
      </div>
    );
  }

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

export default AdminProtectedRoute;


