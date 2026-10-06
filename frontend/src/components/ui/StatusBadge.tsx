import React from 'react';
import { cn } from '@/utils';

interface StatusBadgeProps {
  status: 'critical' | 'error' | 'high' | 'warning' | 'medium' | 'info' | 'low' | 'success' | 'active' | 'pending' | string;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusColors: Record<string, string> = {
  critical: 'text-[#F87171] bg-red-500/10',
  error: 'text-[#F87171] bg-red-500/10',
  high: 'text-[#FBBF24] bg-amber-500/10',
  warning: 'text-[#FBBF24] bg-amber-500/10',
  pending: 'text-[#FBBF24] bg-amber-500/10',
  medium: 'text-[#38BDF8] bg-sky-500/10',
  info: 'text-[#38BDF8] bg-sky-500/10',
  active: 'text-[#38BDF8] bg-sky-500/10',
  low: 'text-[#22C55E] bg-green-500/10',
  success: 'text-[#22C55E] bg-green-500/10',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md', className }) => {
  const colorClass = statusColors[status.toLowerCase()] || 'text-slate-400 bg-slate-500/10';
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
};
