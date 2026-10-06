import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  toggleMobile: () => void;
}

const getPageTitle = (pathname: string) => {
  const routeMap: Record<string, string> = {
    '/': 'Command Center',
    '/disasters': 'Disasters',
    '/areas': 'Affected Areas',
    '/requests': 'Resource Requests',
    '/inventory': 'Inventory',
    '/warehouses': 'Warehouses',
    '/allocations': 'Allocations',
    '/predictions': 'Demand Prediction',
    '/priority': 'Priority Engine',
    '/simulator': 'What-If Simulator',
    '/audit': 'Audit Logs',
    '/settings': 'Settings',
  };
  return routeMap[pathname] || 'Dashboard';
};

export default function Topbar({ toggleMobile }: TopbarProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-[64px] bg-[#1E293B] border-b border-[rgba(148,163,184,0.12)] flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 text-[#94A3B8] hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#E2E8F0]">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400 tracking-wide">Flood Response • ACTIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> API
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> DB
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> AI
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-[#94A3B8] hover:text-white hover:bg-slate-800 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#38BDF8] rounded-full border-2 border-[#1E293B]" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-[rgba(148,163,184,0.12)]">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
                JD
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#1E293B] rounded-full" />
            </div>
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">John Doe</span>
              <span className="text-xs text-green-400 truncate">System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
