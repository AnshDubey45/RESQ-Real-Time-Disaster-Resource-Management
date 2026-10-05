import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="h-12 w-12 rounded-full bg-[#60A5FA]/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[#60A5FA]" />
      </div>
      <h3 className="text-[#E2E8F0] font-medium text-lg mb-2">{title}</h3>
      <p className="text-[#94A3B8] text-sm max-w-sm mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#38BDF8] text-[#0B0F19] font-medium text-sm rounded-lg hover:bg-[#38BDF8]/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
