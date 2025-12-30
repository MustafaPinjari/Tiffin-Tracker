import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { animations } from '../../utils/animations';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  hover?: boolean;
  children: React.ReactNode;
}

const cardVariants = {
  default: {
    base: 'bg-gray-900 border border-gray-800',
    shadow: '',
  },
  elevated: {
    base: 'bg-gray-900 border border-gray-800',
    shadow: 'shadow-2xl',
  },
  outlined: {
    base: 'bg-transparent border-2 border-gray-700',
    shadow: '',
  },
  glass: {
    base: 'bg-gray-900/50 border border-gray-800/50 backdrop-blur-xl',
    shadow: 'shadow-xl',
  },
} as const;

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

const cardRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-3xl',
  '3xl': 'rounded-3xl',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'lg',
      radius = '2xl',
      hover = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantStyles = cardVariants[variant];
    
    const baseClasses = [
      // Base styles
      'relative',
      'transition-all duration-200',
      
      // Variant styles
      variantStyles.base,
      variantStyles.shadow,
      
      // Padding
      cardPadding[padding],
      
      // Border radius
      cardRadius[radius],
      
      // Hover effects
      hover ? 'hover:border-gray-700 hover:shadow-2xl' : '',
      
      // Custom classes
      className,
    ].filter(Boolean).join(' ');

    const motionProps = hover ? animations.buttonHover : {};

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.div
      ref={ref}
      className={`mb-4 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLMotionProps<'h3'>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.h3
      ref={ref}
      className={`text-lg font-semibold text-white ${className}`}
      {...props}
    >
      {children}
    </motion.h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLMotionProps<'p'>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.p
      ref={ref}
      className={`text-sm text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </motion.p>
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.div
      ref={ref}
      className={`${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, className = '', ...props }, ref) => (
    <motion.div
      ref={ref}
      className={`mt-4 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
);

CardFooter.displayName = 'CardFooter';