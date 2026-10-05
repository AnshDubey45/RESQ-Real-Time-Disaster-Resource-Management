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
      'bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-4 flex flex-col justify-between min-h-[100px]',
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-medium text-slate-400">{title}</h3>
        {Icon && <Icon className={cn('h-4 w-4', iconColors[variant] || iconColors.default)} />}
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold text-[#E2E8F0] animate-count-up">
          {value}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend.isPositive ? 'text-[#34D399]' : 'text-[#F87171]'
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
