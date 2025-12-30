import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const spinnerSizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-4',
} as const;

const spinnerColors = {
  primary: 'border-blue-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-600 border-t-transparent',
} as const;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = spinnerSizes[size];
  const colorClasses = spinnerColors[color];
  
  const classes = [
    'rounded-full animate-spin',
    sizeClasses,
    colorClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
};

// Overlay spinner for full-screen loading
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
}> = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center gap-4 border border-gray-800"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <LoadingSpinner size="lg" color="primary" />
        <p className="text-white text-sm font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

// Inline loading state for buttons and small components
export const InlineLoader: React.FC<{
  size?: 'xs' | 'sm' | 'md';
  text?: string;
}> = ({ size = 'sm', text = 'Loading...' }) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size={size} color="white" />
    <span className="text-sm text-gray-300">{text}</span>
  </div>
);