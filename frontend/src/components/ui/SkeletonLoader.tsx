import React from 'react';
import { cn } from '@/utils';

interface SkeletonLoaderProps {
  variant: 'card' | 'table' | 'chart' | 'text' | 'stat';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, className }) => {
  const baseClass = 'animate-pulse bg-white/[0.05] rounded-xl';

  if (variant === 'stat') {
    return (
      <div className={cn('bg-[#1E293B] border border-white/[0.12] rounded-xl p-5', className)}>
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-24 bg-white/[0.05] rounded animate-pulse" />
          <div className="h-5 w-5 bg-white/[0.05] rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-white/[0.05] rounded animate-pulse mt-3" />
        <div className="h-3 w-32 bg-white/[0.05] rounded animate-pulse mt-3" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('w-full border border-white/[0.12] rounded-xl overflow-hidden bg-[#1E293B]', className)}>
        <div className="h-10 border-b border-white/[0.12] bg-[#0B0F19]/50 flex items-center px-4 gap-4">
          <div className="h-4 w-1/4 bg-white/[0.05] rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-white/[0.05] rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-white/[0.05] rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 border-b border-white/[0.12] flex items-center px-4 gap-4">
            <div className="h-4 w-1/4 bg-white/[0.05] rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-white/[0.05] rounded animate-pulse" />
            <div className="h-4 w-1/5 bg-white/[0.05] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('bg-[#1E293B] border border-white/[0.12] rounded-xl p-5 h-64 flex flex-col', className)}>
        <div className="h-5 w-32 bg-white/[0.05] rounded animate-pulse mb-6" />
        <div className="flex-1 w-full bg-white/[0.03] rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="h-4 w-full bg-white/[0.05] rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/[0.05] rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-white/[0.05] rounded animate-pulse" />
      </div>
    );
  }

  // card
  return (
    <div className={cn('bg-[#1E293B] border border-white/[0.12] rounded-xl p-5 h-48', className)}>
      <div className="h-5 w-1/3 bg-white/[0.05] rounded animate-pulse mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-white/[0.05] rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/[0.05] rounded animate-pulse" />
      </div>
    </div>
  );
};
