import React from 'react';

export interface BadgeProps {
  variant?: 'blue' | 'emerald' | 'amber' | 'slate' | 'red';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  blue: 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/30',
  emerald: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
  amber: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
  slate: 'bg-[#17243A] text-[#A8B7CE] border-[#263751]',
  red: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30',
};

const badgeSizes = {
  sm: 'text-[11px] px-2 py-0.5 rounded-full font-semibold',
  md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blue',
  size = 'md',
  children,
  icon,
  className = ''
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
