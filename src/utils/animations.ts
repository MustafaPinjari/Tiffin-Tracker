import { Variants, Transition } from 'framer-motion';

// Standard animation presets
export const animations = {
  // Basic animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  scaleInBounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { 
      duration: 0.4, 
      ease: [0.175, 0.885, 0.32, 1.275] // Custom bounce easing
    }
  },
  
  // Modal/overlay animations
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // List animations
  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Button interactions
  buttonTap: {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 }
  },
  
  buttonHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },
  
  iconButton: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: { duration: 0.15 }
  },
  
  // Number counter animation
  numberChange: {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
} as const;

// Transition presets
export const transitions: Record<string, Transition> = {
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.2, ease: 'easeOut' },
  slow: { duration: 0.3, ease: 'easeOut' },
  bounce: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
};

// Easing functions
export const easings = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.175, 0.885, 0.32, 1.275],
  anticipate: [0.175, 0.885, 0.32, 1.275],
} as const;

// Animation variants for complex components
export const variants: Record<string, Variants> = {
  // Card hover effects
  card: {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98, y: 0 }
  },
  
  // Navigation items
  navItem: {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.1, opacity: 1 }
  },
  
  // Loading states
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Success/error states
  success: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 }
  },
  
  error: {
    initial: { scale: 0, rotate: 180 },
    animate: { scale: 1, rotate: 0 }
  }
};

export type AnimationPreset = keyof typeof animations;