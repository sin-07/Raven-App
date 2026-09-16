'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { AdminContextType, Admin } from '@/types';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only verify admin token if we're on an admin route
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setAdmin(data.data.admin);
      }
    } catch (error) {
      console.error('Unexpected admin verification error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        setAdmin(data.data.admin);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
    }
  }, []);

  const value = useMemo(() => ({
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin
  }), [admin, loading, login, logout]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;

