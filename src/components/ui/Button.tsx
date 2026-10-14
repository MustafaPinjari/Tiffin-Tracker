import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const buttonVariants = {
  primary: {
    base: 'bg-[#2563EB] text-[#EAF2FF] border-[#2563EB] shadow-md shadow-[#2563EB]/25',
    hover: 'hover:bg-[#3B82F6] hover:border-[#3B82F6]',
    active: 'active:bg-[#1D4ED8]',
    disabled: 'disabled:bg-[#17243A] disabled:border-[#263751] disabled:text-[#71829C]',
  },
  emerald: {
    base: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40 shadow-sm',
    hover: 'hover:bg-[#34D399]/30 hover:border-[#34D399]/60',
    active: 'active:bg-[#34D399]/40',
    disabled: 'disabled:bg-[#17243A] disabled:border-[#263751] disabled:text-[#71829C]',
  },
  secondary: {
    base: 'bg-[#17243A] text-[#EAF2FF] border-[#263751] shadow-sm',
    hover: 'hover:bg-[#1E2E49] hover:border-[#3B82F6]/50',
    active: 'active:bg-[#111B2E]',
    disabled: 'disabled:bg-[#111B2E] disabled:border-[#263751] disabled:text-[#71829C]',
  },
  danger: {
    base: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30 shadow-sm',
    hover: 'hover:bg-[#FB7185]/25 hover:border-[#FB7185]/50',
    active: 'active:bg-[#FB7185]/35',
    disabled: 'disabled:bg-[#111B2E] disabled:border-[#263751] disabled:text-[#71829C]',
  },
  ghost: {
    base: 'bg-transparent text-[#A8B7CE] border-transparent',
    hover: 'hover:bg-[#17243A] hover:text-[#EAF2FF]',
    active: 'active:bg-[#111B2E]',
    disabled: 'disabled:text-[#71829C]',
  },
  outline: {
    base: 'bg-transparent text-[#EAF2FF] border-[#263751]',
    hover: 'hover:bg-[#17243A] hover:border-[#3B82F6]/50',
    active: 'active:bg-[#111B2E]',
    disabled: 'disabled:text-[#71829C] disabled:border-[#263751]',
  },
} as const;

const buttonSizes = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-xs font-semibold',
    minHeight: 'min-h-[36px]',
    iconSize: 'w-4 h-4',
  },
  md: {
    padding: 'px-4 py-2.5',
    text: 'text-sm font-semibold',
    minHeight: 'min-h-[44px]',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'px-6 py-3.5',
    text: 'text-base font-bold',
    minHeight: 'min-h-[50px]',
    iconSize: 'w-5 h-5',
  },
} as const;

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
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];

    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'rounded-xl border font-medium transition-all duration-150 select-none cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]',
      'disabled:cursor-not-allowed',
      variantStyles.base,
      variantStyles.hover,
      variantStyles.active,
      variantStyles.disabled,
      sizeStyles.padding,
      sizeStyles.text,
      sizeStyles.minHeight,
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <motion.button
        ref={ref}
        type={type}
        className={baseClasses}
        disabled={disabled || loading}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon && <span className={sizeStyles.iconSize}>{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className={sizeStyles.iconSize}>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';