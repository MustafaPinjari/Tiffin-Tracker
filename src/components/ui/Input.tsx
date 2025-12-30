import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface InputProps extends Omit<HTMLMotionProps<'input'>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
}

const inputSizes = {
  sm: {
    input: 'px-3 py-2 text-sm h-8',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-4 py-3 text-sm h-10',
    icon: 'w-4 h-4',
  },
  lg: {
    input: 'px-4 py-4 text-base h-12',
    icon: 'w-5 h-5',
  },
} as const;

const inputVariants = {
  default: {
    base: 'bg-gray-800 border border-gray-700 text-white',
    focus: 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  },
  filled: {
    base: 'bg-gray-800 border-0 text-white',
    focus: 'focus:ring-2 focus:ring-blue-500',
    error: 'bg-red-900/20 focus:ring-red-500',
  },
  outlined: {
    base: 'bg-transparent border-2 border-gray-600 text-white',
    focus: 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  },
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      error = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeStyles = inputSizes[size];
    const variantStyles = inputVariants[variant];
    
    const inputClasses = [
      // Base styles
      'w-full rounded-xl transition-all duration-200',
      'placeholder:text-gray-500',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Variant styles
      variantStyles.base,
      error ? variantStyles.error : variantStyles.focus,
      
      // Size styles
      sizeStyles.input,
      
      // Icon padding adjustments
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    const displayError = error && errorText;
    const displayHelper = !displayError && helperText;

    return (
      <div className="w-full">
        {label && (
          <motion.label
            className="block text-sm font-medium text-white mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${sizeStyles.icon} text-gray-400`}>
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            className={inputClasses}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            {...props}
          />
          
          {rightIcon && (
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${sizeStyles.icon} text-gray-400`}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {(displayError || displayHelper) && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {displayError && (
              <p className="text-sm text-red-400">{errorText}</p>
            )}
            {displayHelper && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';