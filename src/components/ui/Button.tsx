import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { animations } from '../../utils/animations';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: {
    base: 'bg-blue-600 text-white border-blue-600',
    hover: 'hover:bg-blue-700 hover:border-blue-700',
    active: 'active:bg-blue-800',
    disabled: 'disabled:bg-blue-400 disabled:border-blue-400',
  },
  secondary: {
    base: 'bg-gray-800 text-white border-gray-800',
    hover: 'hover:bg-gray-700 hover:border-gray-700',
    active: 'active:bg-gray-900',
    disabled: 'disabled:bg-gray-600 disabled:border-gray-600',
  },
  danger: {
    base: 'bg-red-600 text-white border-red-600',
    hover: 'hover:bg-red-700 hover:border-red-700',
    active: 'active:bg-red-800',
    disabled: 'disabled:bg-red-400 disabled:border-red-400',
  },
  ghost: {
    base: 'bg-transparent text-gray-300 border-transparent',
    hover: 'hover:bg-gray-800 hover:text-white',
    active: 'active:bg-gray-900',
    disabled: 'disabled:text-gray-600',
  },
  outline: {
    base: 'bg-transparent text-gray-300 border-gray-600',
    hover: 'hover:bg-gray-800 hover:text-white hover:border-gray-500',
    active: 'active:bg-gray-900',
    disabled: 'disabled:text-gray-600 disabled:border-gray-700',
  },
} as const;

const buttonSizes = {
  sm: {
    padding: 'px-3 py-2',
    text: 'text-sm',
    height: 'h-8',
    iconSize: 'w-4 h-4',
  },
  md: {
    padding: 'px-4 py-3',
    text: 'text-sm',
    height: 'h-10',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'px-6 py-4',
    text: 'text-base',
    height: 'h-12',
    iconSize: 'w-5 h-5',
  },
  xl: {
    padding: 'px-8 py-5',
    text: 'text-lg',
    height: 'h-14',
    iconSize: 'w-6 h-6',
  },
} as const;

const LoadingSpinner = ({ size }: { size: keyof typeof buttonSizes }) => (
  <motion.div
    className={`${buttonSizes[size].iconSize} border-2 border-current border-t-transparent rounded-full`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];
    
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center',
      'font-medium tracking-wide',
      'border transition-all duration-200',
      'rounded-2xl',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // Variant styles
      variantStyles.base,
      variantStyles.hover,
      variantStyles.active,
      variantStyles.disabled,
      
      // Size styles
      sizeStyles.padding,
      sizeStyles.text,
      sizeStyles.height,
      
      // Width
      fullWidth ? 'w-full' : '',
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    const content = (
      <>
        {loading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {leftIcon && (
              <span className={`${sizeStyles.iconSize} mr-2 flex-shrink-0`}>
                {leftIcon}
              </span>
            )}
            <span className="flex-1">{children}</span>
            {rightIcon && (
              <span className={`${sizeStyles.iconSize} ml-2 flex-shrink-0`}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </>
    );

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        {...animations.buttonHover}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';