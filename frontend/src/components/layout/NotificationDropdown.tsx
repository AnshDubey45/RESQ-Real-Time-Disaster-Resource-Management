import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, CheckCheck, Trash2, X, AlertTriangle, 
  GitBranch, Warehouse, ClipboardList, Activity, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'disaster' | 'allocation' | 'warehouse' | 'request' | 'system';
  route: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Critical Flood Warning: Palar River Basin',
    description: 'Disaster DIS-001 severity spiked to 9.2 Critical. 142,500 population affected in low-lying sectors.',
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    timeAgo: '6m ago',
    type: 'critical',
    category: 'disaster',
    route: '/disasters',
    read: false
  },
  {
    id: 'NOTIF-002',
    title: 'AI Allocation Pending Approval',
    description: 'AI Engine proposed 50,000L Water from Chennai Central Depot to Chennai Central (95% AI confidence).',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    timeAgo: '18m ago',
    type: 'warning',
    category: 'allocation',
    route: '/allocations',
    read: false
  },
  {
    id: 'NOTIF-003',
    title: 'Logistics Corridor Blocked',
    description: 'Villupuram Reserve (Villupuram) route status marked blocked due to bridge inundation.',
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    timeAgo: '34m ago',
    type: 'critical',
    category: 'warehouse',
    route: '/warehouses',
    read: false
  },
  {
    id: 'NOTIF-004',
    title: 'New Urgent Field Request',
    description: 'Field post in Chengalpattu requested 2,000 Emergency Medicine Kits. Urgency: Critical.',
    timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
    timeAgo: '52m ago',
    type: 'warning',
    category: 'request',
    route: '/requests',
    read: false
  },
  {
    id: 'NOTIF-005',
    title: 'ML Inference Engine Online',
    description: 'RandomForest model loaded from S3 bucket (resq-models-597694935710). Operational at 94.2% accuracy.',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    timeAgo: '2h ago',
    type: 'success',
    category: 'system',
    route: '/predictions',
    read: true
  }
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('resq_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('resq_notifications', JSON.stringify(notifications));
    } catch {
      // ignore storage quota issues
    }
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info('Notification tray cleared');
  };

  const handleNotificationClick = (item: SystemNotification) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setIsOpen(false);
    navigate(item.route);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.type === 'critical';
    return true;
  });

  const getCategoryIcon = (category: SystemNotification['category']) => {
    switch (category) {
      case 'disaster':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'allocation':
        return <GitBranch className="w-4 h-4 text-sky-400" />;
      case 'warehouse':
        return <Warehouse className="w-4 h-4 text-amber-400" />;
      case 'request':
        return <ClipboardList className="w-4 h-4 text-purple-400" />;
      case 'system':
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="System Notifications"
        className="relative p-2 text-[#94A3B8] hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-[rgba(148,163,184,0.18)] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{ maxHeight: 'calc(100vh - 90px)' }}
        >
          {/* Header */}
          <div className="p-4 bg-[#1E293B]/80 border-b border-[rgba(148,163,184,0.12)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#E2E8F0]">Operations Alerts</h3>
                <p className="text-[11px] text-[#94A3B8]">
                  {unreadCount > 0 ? `${unreadCount} unread mission alert${unreadCount > 1 ? 's' : ''}` : 'All alerts caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 text-xs text-[#94A3B8] hover:text-[#38BDF8] hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  title="Clear all alerts"
                  className="p-1.5 text-xs text-[#94A3B8] hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="px-4 py-2 bg-[#0B0F19]/50 border-b border-[rgba(148,163,184,0.08)] flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${filter === 'all' ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30' : 'text-[#94A3B8] hover:text-white hover:bg-slate-800/60'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${filter === 'unread' ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30' : 'text-[#94A3B8] hover:text-white hover:bg-slate-800/60'}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${filter === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-[#94A3B8] hover:text-white hover:bg-slate-800/60'}`}
            >
              Critical ({notifications.filter(n => n.type === 'critical').length})
            </button>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto divide-y divide-[rgba(148,163,184,0.08)]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400 flex flex-col items-center">
                <CheckCheck className="w-10 h-10 text-emerald-400/60 mb-2" />
                <p className="text-sm font-medium text-slate-300">No active alerts in this category</p>
                <p className="text-xs text-slate-500 mt-1">System telemetry is operational</p>
              </div>
            ) : (
              filteredNotifications.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 hover:bg-[#1E293B]/70 transition-all cursor-pointer relative group flex gap-3 ${!item.read ? 'bg-[rgba(56,189,248,0.04)]' : ''}`}
                >
                  {/* Category icon */}
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0 h-fit self-start">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className={`text-xs font-semibold truncate ${item.read ? 'text-[#CBD5E1]' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">
                        {item.timeAgo}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2 mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                        item.type === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        item.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        item.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}>
                        {item.category}
                      </span>

                      <span className="text-[10px] text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {!item.read && (
                    <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#38BDF8]" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#0B0F19] border-t border-[rgba(148,163,184,0.10)] flex items-center justify-between text-[11px] text-slate-400 px-3 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Connected
            </span>
            <button 
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
              className="text-[#38BDF8] hover:underline"
            >
              Configure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
