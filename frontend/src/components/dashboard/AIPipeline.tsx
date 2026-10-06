import React from 'react';
import { Database, TrendingUp, AlertTriangle, PackageSearch, BrainCircuit, UserCheck } from 'lucide-react';

export const AIPipeline = () => {
  const steps = [
    { id: 1, label: 'DATA INGESTION', icon: <Database className="w-5 h-5" />, status: 'completed' },
    { id: 2, label: 'DEMAND PREDICTION', icon: <TrendingUp className="w-5 h-5" />, status: 'completed' },
    { id: 3, label: 'PRIORITY ANALYSIS', icon: <AlertTriangle className="w-5 h-5" />, status: 'completed' },
    { id: 4, label: 'RESOURCE OPTIMIZATION', icon: <PackageSearch className="w-5 h-5" />, status: 'active' },
    { id: 5, label: 'RECOMMENDATION', icon: <BrainCircuit className="w-5 h-5" />, status: 'pending' },
    { id: 6, label: 'HUMAN APPROVAL', icon: <UserCheck className="w-5 h-5" />, status: 'pending' }
  ];

  return (
    <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6">
      <h3 className="text-[#E2E8F0] font-semibold mb-6 text-sm">AI Pipeline Status</h3>
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 relative">
        {/* Connection line */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-[rgba(148,163,184,0.12)] -z-10" />
        
        {steps.map((step, i) => {
          let color = 'text-[#94A3B8] border-[rgba(148,163,184,0.12)] bg-[#0B0F19]';
          if (step.status === 'completed') color = 'text-[#22C55E] border-[#22C55E] bg-[#22C55E]/10';
          if (step.status === 'active') color = 'text-[#38BDF8] border-[#38BDF8] bg-[#38BDF8]/10 animate-pulse';

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-full lg:w-auto">
              {i !== 0 && <div className="lg:hidden w-[2px] h-4 bg-[rgba(148,163,184,0.12)] my-1" />}
              
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${color}`}>
                {step.icon}
              </div>
              <div className="text-center">
                <div className={`text-xs font-semibold ${step.status === 'active' ? 'text-[#38BDF8]' : 'text-[#94A3B8]'}`}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
