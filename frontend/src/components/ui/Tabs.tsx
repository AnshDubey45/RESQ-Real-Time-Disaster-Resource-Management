import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

export interface Tab {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex space-x-1 border-b border-white/[0.12]', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors relative',
              isActive 
                ? 'text-[#38BDF8]' 
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/[0.02]'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38BDF8] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
