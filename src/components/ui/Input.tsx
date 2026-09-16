import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  children: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const baseStyles = 'w-full px-4 py-2 bg-[#080808] border text-white rounded-lg focus:ring-2 focus:ring-[#00E5A8] focus:border-[#00E5A8] outline-none transition';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`${baseStyles} ${hasError ? 'border-red-500' : 'border-gray-800'} ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`${baseStyles} ${hasError ? 'border-red-500' : 'border-gray-800'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${baseStyles} ${hasError ? 'border-red-500' : 'border-gray-800'} ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

