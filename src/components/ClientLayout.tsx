'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AmbientGlow from '@/components/AmbientGlow';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Hide navbar on test pages
  const hideNavbar = pathname?.startsWith('/test/');

  return (
    <>
      <AmbientGlow />
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

