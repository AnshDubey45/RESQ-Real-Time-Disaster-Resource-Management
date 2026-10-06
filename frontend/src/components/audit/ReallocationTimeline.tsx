import React from 'react';
import { CheckCircle, AlertTriangle, Info, Brain, User, Navigation } from 'lucide-react';

const timelineEvents = [
  { time: '14:32', title: 'Initial Allocation', desc: 'Convoy A dispatched to North Zone', icon: Navigation, color: 'text-blue-400', bg: 'bg-blue-400/20' },
  { time: '14:47', title: 'New Field Report', desc: 'Bridge collapse reported on Route 4', icon: AlertTriangle, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/20' },
  { time: '14:51', title: 'Route Blocked', desc: 'Convoy A halted. ETA delayed by 4hrs', icon: Info, color: 'text-[#F87171]', bg: 'bg-[#F87171]/20' },
  { time: '14:53', title: 'AI Reallocation', desc: 'Rerouting Convoy B to North Zone. Convoy A redirected to East Zone.', icon: Brain, color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/20' },
  { time: '14:55', title: 'Human Approval', desc: 'Cmdr. Sarah Jenkins approved reroute', icon: User, color: 'text-[#34D399]', bg: 'bg-[#34D399]/20' },
  { time: '15:00', title: 'Convoy Rerouted', desc: 'New routes established successfully', icon: CheckCircle, color: 'text-[#34D399]', bg: 'bg-[#34D399]/20' },
];

export function ReallocationTimeline() {
  return (
    <div className="bg-transparent border border-[rgba(148,163,184,0.12)] rounded-xl p-4">
      <h3 className="font-semibold text-[#E2E8F0] mb-4 text-sm">Case Study: Reallocation Event</h3>
      
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-white/10">
        {timelineEvents.map((event, idx) => (
          <div key={idx} className="relative flex items-start gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-transparent ${event.bg} ${event.color} shrink-0 z-10`}>
              <event.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-white/5 p-3 rounded-lg border border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-semibold text-[#E2E8F0] text-xs">{event.title}</h4>
                <span className="text-[10px] text-[#38BDF8] font-mono">{event.time}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">{event.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
