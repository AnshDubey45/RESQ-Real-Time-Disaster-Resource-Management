import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Brain, ArrowRight, Check, X } from 'lucide-react';
import type { Allocation } from '@/types';

export const AllocationRecommendations = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    api.getAllocations().then(data => {
      const recs = data.filter(a => a.aiRecommendation).slice(0, 4);
      setAllocations(recs);
    });
  }, []);

  return (
    <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-[#38BDF8]" />
        <h3 className="text-[#E2E8F0] font-semibold">AI Recommended Allocations</h3>
      </div>

      <div className="space-y-4">
        {allocations.map(alloc => (
          <div key={alloc.id} className="bg-[#0B0F19] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#E2E8F0] font-medium text-sm">{alloc.sourceWarehouse}</span>
                <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-[#E2E8F0] font-medium text-sm">{alloc.destinationArea}</span>
              </div>
              <div className="text-sm text-[#94A3B8]">
                {alloc.quantity.toLocaleString()} {alloc.unit} of {alloc.resourceType}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-[#94A3B8]">AI Confidence</div>
                <div className="text-sm font-semibold text-[#38BDF8]">{alloc.aiConfidence}%</div>
              </div>
              
              {alloc.approvalStatus === 'pending_approval' ? (
                <div className="flex gap-2">
                  <button className="p-2 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 rounded border border-[#22C55E]/30" title="Approve">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-[#F87171]/10 text-[#F87171] hover:bg-[#F87171]/20 rounded border border-[#F87171]/30" title="Reject">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 capitalize">
                  {alloc.approvalStatus.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
