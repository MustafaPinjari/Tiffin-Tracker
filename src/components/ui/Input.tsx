import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sizeVariant?: 'sm' | 'md' | 'lg';
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
}

const inputSizes = {
  sm: {
    input: 'px-3 py-2 text-sm min-h-[38px]',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-4 py-2.5 text-base min-h-[44px]',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'px-4 py-3 text-lg min-h-[50px]',
    icon: 'w-6 h-6',
  },
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      sizeVariant = 'md',
      error = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const sizeStyles = inputSizes[sizeVariant];

    const inputClasses = [
      'w-full rounded-xl transition-all duration-150',
      'bg-[#0B1220] border text-[#EAF2FF] placeholder:text-[#71829C]',
      'focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error ? 'border-[#FB7185] focus:ring-[#FB7185]' : 'border-[#263751] hover:border-[#3B82F6]/40',
      sizeStyles.input,
      leftIcon ? 'pl-11' : '',
      rightIcon ? 'pr-11' : '',
      className,
    ].filter(Boolean).join(' ');

    const displayError = error && errorText;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#A8B7CE]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className={`absolute left-3.5 text-[#71829C] pointer-events-none flex items-center justify-center ${sizeStyles.icon}`}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={error}
            aria-describedby={
              displayError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <span
              className={`absolute right-3.5 text-[#71829C] flex items-center justify-center ${sizeStyles.icon}`}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {displayError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-[#FB7185] font-medium"
          >
            {errorText}
          </p>
        )}

        {!displayError && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-[#71829C]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';