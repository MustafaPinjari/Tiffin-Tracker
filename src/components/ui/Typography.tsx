import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { typographyClasses, TypographyVariant } from '../../styles/typography';

export interface TypographyProps extends HTMLMotionProps<'div'> {
  variant?: TypographyVariant;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  children: React.ReactNode;
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'bodyRegular',
      as = 'div',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const Component = motion[as] as any;
    const variantClasses = typographyClasses[variant];
    
    const classes = [variantClasses, className].filter(Boolean).join(' ');

    return (
      <Component
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components for common use cases
export const Heading1 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="h1" as="h1" {...props}>
      {children}
    </Typography>
  )
);

export const Heading2 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="h2" as="h2" {...props}>
      {children}
    </Typography>
  )
);

export const Heading3 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="h3" as="h3" {...props}>
      {children}
    </Typography>
  )
);

export const Heading4 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="h4" as="h4" {...props}>
      {children}
    </Typography>
  )
);

export const BodyText = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="bodyRegular" as="p" {...props}>
      {children}
    </Typography>
  )
);

export const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="caption" as="span" {...props}>
      {children}
    </Typography>
  )
);

export const Label = forwardRef<HTMLLabelElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ children, ...props }, ref) => (
    <Typography ref={ref} variant="label" as="label" {...props}>
      {children}
    </Typography>
  )
);

Heading1.displayName = 'Heading1';
Heading2.displayName = 'Heading2';
Heading3.displayName = 'Heading3';
Heading4.displayName = 'Heading4';
BodyText.displayName = 'BodyText';
Caption.displayName = 'Caption';
Label.displayName = 'Label';