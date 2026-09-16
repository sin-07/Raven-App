'use client';

import React from 'react';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide global navbar for admin routes - AdminLayout has its own header */}
      <style jsx global>{`
        body > div > nav:first-of-type {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}

