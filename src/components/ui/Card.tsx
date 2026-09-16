import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => (
  <div 
    className={`bg-[#111111] rounded-xl border border-gray-800 ${paddingClasses[padding]} ${className}`}
  >
    {children}
  </div>
);

export default Card;

