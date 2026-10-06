import React from 'react';
import type { Allocation } from '@/types';

export function AllocationSankey({ allocations }: { allocations: Allocation[] }) {
  return (
    <div className="w-full h-[350px] overflow-hidden bg-[#1E293B] rounded-xl border border-white/10 p-6 flex flex-col">
      <h3 className="text-[#E2E8F0] font-semibold mb-4">Resource Flow Visualization</h3>
      <div className="flex-1 relative w-full">
        <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
          <path d="M 100,50 C 400,50 400,100 700,100" fill="none" stroke="#38BDF8" strokeWidth="15" strokeOpacity="0.3" />
          <path d="M 100,150 C 400,150 400,100 700,100" fill="none" stroke="#38BDF8" strokeWidth="10" strokeOpacity="0.3" />
          <path d="M 100,200 C 400,200 400,200 700,200" fill="none" stroke="#38BDF8" strokeWidth="5" strokeOpacity="0.3" />
          
          <rect x="20" y="30" width="100" height="40" rx="4" fill="#1E40AF" />
          <text x="70" y="55" fill="white" fontSize="12" textAnchor="middle">WH Central</text>

          <rect x="20" y="130" width="100" height="40" rx="4" fill="#1E40AF" />
          <text x="70" y="155" fill="white" fontSize="12" textAnchor="middle">WH East</text>

          <rect x="20" y="180" width="100" height="40" rx="4" fill="#1E40AF" />
          <text x="70" y="205" fill="white" fontSize="12" textAnchor="middle">WH North</text>

          <rect x="680" y="80" width="100" height="40" rx="4" fill="#991B1B" />
          <text x="730" y="105" fill="white" fontSize="12" textAnchor="middle">Downtown (Crit)</text>

          <rect x="680" y="180" width="100" height="40" rx="4" fill="#B45309" />
          <text x="730" y="205" fill="white" fontSize="12" textAnchor="middle">Westside (High)</text>
        </svg>
      </div>
    </div>
  );
}
