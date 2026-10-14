import React, { type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<'button'> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#60a5fa',
      shimmerSize = '0.08em',
      shimmerDuration = '3s',
      borderRadius = '0.875rem',
      background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-blue-400/30 px-5 py-3 whitespace-nowrap text-white [background:var(--bg)] font-semibold shadow-lg shadow-blue-500/20',
          'transform-gpu transition-all duration-300 ease-out active:scale-[0.98] hover:shadow-blue-500/40 hover:border-blue-400/60',
          disabled && 'opacity-50 cursor-not-allowed hover:shadow-none active:scale-100',
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {/* spark container */}
        {!disabled && (
          <div className="-z-30 blur-[2px] absolute inset-0 overflow-hidden pointer-events-none">
            <div className="animate-spin-around absolute -inset-full w-[200%] h-[200%] rotate-0 [background:conic-gradient(from_0deg,transparent_0_300deg,var(--shimmer-color)_340deg,transparent_360deg)] opacity-70" />
          </div>
        )}

        {/* content */}
        <span className="relative z-10 flex items-center gap-2 justify-center">
          {children}
        </span>

        {/* highlight overlay */}
        <div
          className={cn(
            'absolute inset-0 size-full pointer-events-none',
            'rounded-[inherit] text-sm font-medium shadow-[inset_0_-4px_8px_#ffffff20]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-2px_12px_#ffffff40]'
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
