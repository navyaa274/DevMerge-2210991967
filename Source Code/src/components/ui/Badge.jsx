import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full mr-1.5',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'error' && 'bg-red-500',
            variant === 'primary' && 'bg-blue-500',
            variant === 'default' && 'bg-gray-500'
          )}
        />
      )}
      {children}
    </motion.span>
  );
};

export const StatusBadge = ({ status, children, ...props }) => {
  const statusVariants = {
    online: 'success',
    offline: 'default',
    busy: 'warning',
    away: 'secondary',
    error: 'error',
  };

  return (
    <Badge variant={statusVariants[status] || 'default'} dot {...props}>
      {children || status}
    </Badge>
  );
};
