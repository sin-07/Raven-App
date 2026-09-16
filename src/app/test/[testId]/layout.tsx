import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test - Raven Tutorials',
  description: 'Online test platform for students',
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No navbar in test layout - just render children
  return <>{children}</>;
}

