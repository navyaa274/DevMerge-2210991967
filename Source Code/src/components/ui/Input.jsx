import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const inputVariants = {
  default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
  filled: 'border-0 bg-gray-100 dark:bg-gray-700',
  underlined: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none px-0',
};

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Input = forwardRef(({
  type = 'text',
  variant = 'default',
  size = 'md',
  className = '',
  error = false,
  disabled = false,
  icon,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
          inputVariants[variant],
          inputSizes[size],
          error && 'border-red-500 focus:ring-red-500',
          icon && 'pl-10',
          className
        )}
        disabled={disabled}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({
  variant = 'default',
  size = 'md',
  className = '',
  error = false,
  rows = 4,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none',
        inputVariants[variant],
        inputSizes[size],
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
