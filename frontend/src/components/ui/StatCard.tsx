import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'critical' | 'warning' | 'accent';
  className?: string;
}

const iconColors: Record<string, string> = {
  default: 'text-slate-400',
  critical: 'text-[#F87171]',
  warning: 'text-[#FBBF24]',
  accent: 'text-[#38BDF8]',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className
}) => {
  return (
    <div className={cn(
      'bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6 flex flex-col justify-between min-h-[120px]',
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className={cn('h-5 w-5', iconColors[variant] || iconColors.default)} />}
      </div>
      <div className="flex items-baseline space-x-3">
        <div className="text-4xl font-extrabold text-[#E2E8F0] tracking-tight animate-count-up">
          {value}
        </div>
        {trend && (
          <span className={cn(
            'text-sm font-semibold',
            trend.isPositive ? 'text-[#34D399]' : 'text-[#F87171]'
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
};
