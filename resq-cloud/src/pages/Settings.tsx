import React from 'react';
import { User, Bell, Monitor, Activity } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#E2E8F0]">System Settings</h1>
      
      <div className="bg-[#1E293B] border border-white/10 rounded-xl p-6 flex items-center gap-6">
        <div className="w-16 h-16 bg-[#38BDF8]/20 rounded-full flex items-center justify-center text-[#38BDF8]">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#E2E8F0]">Cmdr. Sarah Jenkins</h2>
          <p className="text-[#94A3B8]">sarah.jenkins@resq-cloud.gov</p>
          <span className="inline-block mt-2 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full font-semibold">Mission Commander</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1E293B] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#E2E8F0] font-semibold mb-4 border-b border-white/10 pb-2">
            <Bell className="w-5 h-5 text-[#38BDF8]" />
            Notification Preferences
          </div>
          {['Critical AI Reallocations', 'New Field Reports', 'System Health Alerts'].map(pref => (
            <div key={pref} className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">{pref}</span>
              <div className="w-10 h-5 bg-[#38BDF8] rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1E293B] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#E2E8F0] font-semibold mb-4 border-b border-white/10 pb-2">
            <Activity className="w-5 h-5 text-[#34D399]" />
            System Status
          </div>
          {[
            { name: 'Core API Services', status: 'Operational', color: 'bg-green-500' },
            { name: 'Database Clusters', status: 'Operational', color: 'bg-green-500' },
            { name: 'AI Prediction Engine', status: 'High Load', color: 'bg-[#FBBF24]' }
          ].map(sys => (
            <div key={sys.name} className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">{sys.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#E2E8F0]">{sys.status}</span>
                <div className={`w-2 h-2 rounded-full ${sys.color}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
