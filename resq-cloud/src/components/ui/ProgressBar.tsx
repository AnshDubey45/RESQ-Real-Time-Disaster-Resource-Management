import React from 'react';
import { cn } from '@/utils';

interface ProgressBarProps {
  value: number;
  label?: string;
  variant?: 'healthy' | 'warning' | 'critical' | 'default';
  showLabel?: boolean;
  className?: string;
}

const variantColors = {
  healthy: 'bg-[#34D399]',
  warning: 'bg-[#FBBF24]',
  critical: 'bg-[#F87171]',
  default: 'bg-[#38BDF8]',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  variant = 'default',
  showLabel = true,
  className
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          {label && <span className="text-[#94A3B8] font-medium">{label}</span>}
          {showLabel && <span className="text-[#E2E8F0] font-medium">{clampedValue}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-[#0B0F19] rounded-full overflow-hidden border border-white/[0.05]">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantColors[variant])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
