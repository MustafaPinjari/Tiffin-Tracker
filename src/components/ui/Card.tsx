import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'strong' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-[#111B2E] border border-[#263751] text-[#EAF2FF] shadow-sm',
  elevated: 'bg-[#17243A] border border-[#263751] text-[#EAF2FF] shadow-xl shadow-black/40',
  strong: 'bg-[#1E2E49] border border-[#263751] text-[#EAF2FF] shadow-md',
  interactive: 'bg-[#111B2E] border border-[#263751] text-[#EAF2FF] hover:border-[#3B82F6]/50 hover:bg-[#17243A] transition-all duration-150 cursor-pointer',
} as const;

const cardPaddings = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl ${cardVariants[variant]} ${cardPaddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';