import React, { type ReactNode } from 'react';
import { cn } from '@/utils';

export interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}>
      <div>
        <h1 className="text-[28px] sm:text-[32px] text-[#E2E8F0] font-semibold tracking-tight">{title}</h1>
        <p className="text-[13px] sm:text-[14px] text-[#94A3B8] mt-1">{description}</p>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
