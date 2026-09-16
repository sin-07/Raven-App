'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-[#00E5A8]/20 rounded-full`}></div>
        {/* Spinning ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-[#00E5A8] rounded-full animate-spin`}></div>
        {/* Logo or Center dot */}
        {size === 'lg' || fullScreen ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Raven Logo" 
              className="w-8 h-8 object-contain animate-pulse" 
            />

          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-[#00E5A8] rounded-full animate-pulse`}></div>
          </div>
        )}
      </div>
      {text && (
        <p className={`text-gray-300 ${textSizes[size]} font-jakarta font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0b0b0b]/95 backdrop-blur-md flex items-center justify-center z-[150]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

// Simple inline loader for buttons
export const ButtonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={`w-5 h-5 animate-spin ${className}`} />
);

export default Loader;

