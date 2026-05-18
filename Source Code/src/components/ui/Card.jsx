import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const cardVariants = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl',
  glass: 'glass-effect border border-white/20',
  gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700',
};

export const Card = React.forwardRef(({
  children,
  variant = 'default',
  className = '',
  hover = false,
  onClick,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        cardVariants[variant],
        hover && 'hover-lift cursor-pointer',
        className
      )}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
);
