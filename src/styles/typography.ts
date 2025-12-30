import { designTokens } from './tokens';

// Typography system with consistent hierarchy
export const typography = {
  // Headings
  h1: {
    fontSize: designTokens.fontSize['3xl'][0],
    lineHeight: designTokens.fontSize['3xl'][1].lineHeight,
    fontWeight: designTokens.fontWeight.bold,
    color: designTokens.colors.text.primary,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: designTokens.fontSize['2xl'][0],
    lineHeight: designTokens.fontSize['2xl'][1].lineHeight,
    fontWeight: designTokens.fontWeight.semibold,
    color: designTokens.colors.text.primary,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: designTokens.fontSize.xl[0],
    lineHeight: designTokens.fontSize.xl[1].lineHeight,
    fontWeight: designTokens.fontWeight.semibold,
    color: designTokens.colors.text.primary,
  },
  h4: {
    fontSize: designTokens.fontSize.lg[0],
    lineHeight: designTokens.fontSize.lg[1].lineHeight,
    fontWeight: designTokens.fontWeight.medium,
    color: designTokens.colors.text.primary,
  },
  
  // Body text
  bodyLarge: {
    fontSize: designTokens.fontSize.base[0],
    lineHeight: designTokens.fontSize.base[1].lineHeight,
    fontWeight: designTokens.fontWeight.normal,
    color: designTokens.colors.text.secondary,
  },
  bodyRegular: {
    fontSize: designTokens.fontSize.sm[0],
    lineHeight: designTokens.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.fontWeight.normal,
    color: designTokens.colors.text.secondary,
  },
  bodySmall: {
    fontSize: designTokens.fontSize.xs[0],
    lineHeight: designTokens.fontSize.xs[1].lineHeight,
    fontWeight: designTokens.fontWeight.normal,
    color: designTokens.colors.text.tertiary,
  },
  
  // Special text
  caption: {
    fontSize: designTokens.fontSize.xs[0],
    lineHeight: designTokens.fontSize.xs[1].lineHeight,
    fontWeight: designTokens.fontWeight.normal,
    color: designTokens.colors.text.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  label: {
    fontSize: designTokens.fontSize.sm[0],
    lineHeight: designTokens.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.fontWeight.medium,
    color: designTokens.colors.text.primary,
  },
  button: {
    fontSize: designTokens.fontSize.sm[0],
    lineHeight: designTokens.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.fontWeight.medium,
    letterSpacing: '0.025em',
  },
} as const;

// CSS classes for typography
export const typographyClasses = {
  h1: 'text-3xl font-bold text-white leading-tight tracking-tight',
  h2: 'text-2xl font-semibold text-white leading-snug tracking-tight',
  h3: 'text-xl font-semibold text-white leading-normal',
  h4: 'text-lg font-medium text-white leading-normal',
  bodyLarge: 'text-base font-normal text-gray-300 leading-relaxed',
  bodyRegular: 'text-sm font-normal text-gray-300 leading-normal',
  bodySmall: 'text-xs font-normal text-gray-400 leading-tight',
  caption: 'text-xs font-normal text-gray-500 uppercase tracking-wide',
  label: 'text-sm font-medium text-white',
  button: 'text-sm font-medium tracking-wide',
} as const;

export type TypographyVariant = keyof typeof typography;