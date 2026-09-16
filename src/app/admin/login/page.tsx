'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}


