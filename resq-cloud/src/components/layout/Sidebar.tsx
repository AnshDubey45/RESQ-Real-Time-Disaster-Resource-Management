import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, AlertTriangle, MapPin, ClipboardList, 
  Package, Warehouse, GitBranch, TrendingUp, Target, 
  FlaskConical, FileText, Settings, Shield, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  closeMobile: () => void;
}

const navGroups = [
  {
    title: 'COMMAND CENTER',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Disasters', path: '/disasters', icon: AlertTriangle },
      { name: 'Affected Areas', path: '/areas', icon: MapPin },
      { name: 'Resource Requests', path: '/requests', icon: ClipboardList },
    ]
  },
  {
    title: 'RESOURCE MANAGEMENT',
    items: [
      { name: 'Inventory', path: '/inventory', icon: Package },
      { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
      { name: 'Allocations', path: '/allocations', icon: GitBranch },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Demand Prediction', path: '/predictions', icon: TrendingUp },
      { name: 'Priority Engine', path: '/priority', icon: Target },
      { name: 'What-If Simulator', path: '/simulator', icon: FlaskConical },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Audit Logs', path: '/audit', icon: FileText },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isCollapsed, isMobileOpen, toggleCollapse, closeMobile }: SidebarProps) {
  const location = useLocation();

  const sidebarWidth = isCollapsed ? 'w-[76px]' : 'w-[260px]';
  const mobileTranslate = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMobile}
        />
      )}

      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-[#0F172A] border-r border-[rgba(148,163,184,0.10)]",
          "transition-[width,transform] duration-200 ease-in-out shrink-0 h-screen",
          sidebarWidth,
          mobileTranslate,
          "lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-[76px] flex items-center justify-between px-4 shrink-0 relative">
          <div className="flex items-center gap-3 overflow-hidden flex-1 h-full pt-4 pb-2">
            <div className="flex items-center justify-center w-10 h-10 shrink-0 group relative">
              <Shield className="w-8 h-8 text-[#60A5FA]" fill="currentColor" fillOpacity={0.1} />
              {isCollapsed && (
                <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1E293B] border border-[rgba(148,163,184,0.12)] text-[#E2E8F0] text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  RESQ-CLOUD
                </div>
              )}
            </div>
            
            <div 
              className={cn(
                "flex flex-col transition-opacity duration-200 min-w-0",
                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
              )}
            >
              <span className="font-bold text-[18px] text-white leading-tight tracking-wide">RESQ-CLOUD</span>
              <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-widest leading-none mt-1">
                Emergency Intelligence
              </span>
            </div>
          </div>
          <button className="lg:hidden text-[#94A3B8] hover:text-white p-2" onClick={closeMobile} aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
          
          {/* Collapse Button (Desktop) */}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-[#1E293B] border border-[rgba(148,163,184,0.15)] rounded-full items-center justify-center text-[#94A3B8] hover:text-white hover:bg-slate-700 transition-colors z-50 shadow-md"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-4 px-3 flex flex-col gap-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <h3 className="px-3 mb-1 text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.08em] whitespace-nowrap overflow-hidden">
                  {group.title}
                </h3>
              )}
              {isCollapsed && idx > 0 && <div className="h-[1px] w-8 mx-auto bg-[rgba(148,163,184,0.05)] mb-1" />}
              
              <ul className="flex flex-col gap-[3px]">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path} className="relative group">
                      <NavLink
                        to={item.path}
                        className={cn(
                          "flex items-center h-[42px] transition-all duration-150 relative outline-none focus-visible:ring-2 ring-[#38BDF8] ring-inset",
                          isCollapsed ? "w-[52px] justify-center rounded-xl mx-auto" : "px-3 rounded-lg w-full gap-3",
                          isActive 
                            ? "bg-[rgba(56,189,248,0.10)] text-[#F1F5F9]" 
                            : "bg-transparent text-[#CBD5E1] hover:bg-[rgba(56,189,248,0.06)] hover:text-[#E2E8F0]"
                        )}
                        onClick={() => isMobileOpen && closeMobile()}
                      >
                        {isActive && (
                          <div className={cn(
                            "absolute left-0 bg-[#38BDF8] rounded-r-sm",
                            isCollapsed ? "w-[3px] h-5" : "w-[3px] top-[8px] bottom-[8px]"
                          )} />
                        )}
                        <Icon className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-colors duration-150",
                          isActive ? "text-[#38BDF8]" : "text-[#94A3B8] group-hover:text-[#60A5FA]"
                        )} />
                        
                        {!isCollapsed && <span className="font-medium text-[14px] truncate">{item.name}</span>}
                      </NavLink>
                      
                      {/* Custom Tooltip */}
                      {isCollapsed && (
                        <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1E293B] border border-[rgba(148,163,184,0.12)] text-[#F1F5F9] font-medium text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl flex items-center">
                          {item.name}
                          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-[#1E293B] border-l border-b border-[rgba(148,163,184,0.12)] rotate-45" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(148,163,184,0.10)] p-4 shrink-0 bg-[#0F172A] z-10">
          <div className={cn("flex items-center gap-3 relative group", isCollapsed ? "justify-center" : "")}>
            <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-[#60A5FA] font-bold text-sm shrink-0 relative shadow-inner">
              AD
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#4ADE80] border-2 border-[#0F172A] rounded-full" />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#E2E8F0] truncate">Administrator</span>
                <span className="text-[11px] text-[#94A3B8] truncate mb-0.5">Mission Commander</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                  <span className="text-[10px] text-[#4ADE80] font-medium tracking-wide uppercase">System Operational</span>
                </div>
              </div>
            )}
            
            {/* Footer Tooltip */}
            {isCollapsed && (
              <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 p-3 bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl min-w-[160px]">
                <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-[#1E293B] border-l border-b border-[rgba(148,163,184,0.12)] rotate-45" />
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-semibold text-[#E2E8F0]">Administrator</span>
                  <span className="text-[11px] text-[#94A3B8] mb-2">Mission Commander</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    <span className="text-[10px] text-[#4ADE80] font-medium tracking-wide uppercase">System Operational</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
