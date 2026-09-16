'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import toast from 'react-hot-toast';

interface SessionExpiryHandlerProps {
  type: 'student' | 'admin';
  sessionDuration?: number; // in minutes
  warningTime?: number; // in minutes before expiry
}

const SessionExpiryHandler: React.FC<SessionExpiryHandlerProps> = ({
  type,
  sessionDuration = 60, // 1 hour default
  warningTime = 5 // 5 minutes warning
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration * 60);
  const router = useRouter();
  const pathname = usePathname();
  const { logout: adminLogout } = useAdmin();

  const handleLogout = useCallback(async () => {
    try {
      if (type === 'admin') {
        await adminLogout();
      } else {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('studentInfo');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/login');
  }, [type, adminLogout, router]);

  const extendSession = useCallback(async () => {
    try {
      const endpoint = type === 'admin' ? '/api/admin/extend-session' : '/api/auth/extend-session';
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setTimeRemaining(sessionDuration * 60);
        setShowWarning(false);
        toast.success('Session extended successfully');
      } else {
        throw new Error('Failed to extend session');
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      toast.error('Failed to extend session. Please log in again.');
      handleLogout();
    }
  }, [type, sessionDuration, handleLogout]);

  useEffect(() => {
    // Get session start time from sessionStorage
    const sessionKey = type === 'admin' ? 'adminSessionStart' : 'studentSessionStart';
    const sessionStart = sessionStorage.getItem(sessionKey);
    
    if (!sessionStart) {
      // If no session start time, set it now
      sessionStorage.setItem(sessionKey, Date.now().toString());
    }

    const interval = setInterval(() => {
      const startTime = parseInt(sessionStorage.getItem(sessionKey) || Date.now().toString());
      const elapsed = (Date.now() - startTime) / 1000; // in seconds
      const remaining = (sessionDuration * 60) - elapsed;

      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= warningTime * 60 && remaining > 0) {
        setShowWarning(true);
      }

      if (remaining <= 0) {
        toast.error('Session expired. Please log in again.');
        handleLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [type, sessionDuration, warningTime, handleLogout]);

  // Reset timer on user activity
  useEffect(() => {
    const resetTimer = () => {
      const sessionKey = type === 'admin' ? 'adminSessionStart' : 'studentSessionStart';
      sessionStorage.setItem(sessionKey, Date.now().toString());
      setTimeRemaining(sessionDuration * 60);
      setShowWarning(false);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    // Debounce the reset to avoid excessive updates
    let timeout: NodeJS.Timeout;
    const debouncedReset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(resetTimer, 1000);
    };

    events.forEach(event => {
      window.addEventListener(event, debouncedReset, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, debouncedReset);
      });
      clearTimeout(timeout);
    };
  }, [type, sessionDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800">Session Expiring Soon</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your session will expire in{' '}
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={extendSession}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Extend Session
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryHandler;

