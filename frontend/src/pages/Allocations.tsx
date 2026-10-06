import React from 'react';
import { api } from '@/services/api';
import type { Allocation } from '@/types';
import { AllocationSankey } from '@/components/intelligence/AllocationSankey';
import { BadgeCheck, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { toast } from 'sonner';

import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function Allocations() {
  const [allocations, setAllocations] = React.useState<Allocation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const data = await api.getAllocations();
      setAllocations(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleApprove = async (id: string) => {
    await api.approveAllocation(id);
    setAllocations(allocations.map(a => a.id === id ? { ...a, approvalStatus: 'approved' } : a));
    toast.success('Allocation approved');
  };

  const handleReject = async (id: string) => {
    await api.rejectAllocation(id);
    setAllocations(allocations.map(a => a.id === id ? { ...a, approvalStatus: 'rejected' } : a));
    toast.error('Allocation rejected');
  };

  const stats = {
    total: allocations.length,
    pending: allocations.filter(a => a.approvalStatus === 'pending_approval' || a.approvalStatus === 'recommended').length,
    inTransit: allocations.filter(a => a.dispatchStatus === 'dispatched').length,
    completed: allocations.filter(a => a.dispatchStatus === 'delivered').length,
  };

  return (
    <div className="space-y-6 md:space-y-8 bg-transparent">
      <PageHeader 
        title="Allocations & Logistics" 
        description="Monitor and manage resource dispatch and supply chains."
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Allocations" value={stats.total} icon={BadgeCheck} variant="accent" />
        <StatCard title="Pending Approval" value={stats.pending} icon={Clock} variant="warning" />
        <StatCard title="In Transit" value={stats.inTransit} icon={Truck} variant="default" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} variant="default" />
      </div>

      <AllocationSankey allocations={allocations} />

      {/* Human-in-the-loop visual */}
      <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#E2E8F0]">Approval Pipeline</h2>
          <div className="flex items-center space-x-2 text-sm text-[#38BDF8]">
            <AlertCircle className="w-4 h-4" />
            <span>Human-in-the-loop enabled</span>
          </div>
        </div>
        <div className="flex items-center justify-between relative px-8">
          <div className="absolute top-1/2 left-8 right-8 h-px bg-[rgba(148,163,184,0.12)] -z-10 -translate-y-1/2"></div>
          {['AI RECOMMENDS', 'HUMAN APPROVES', 'DISPATCH', 'COMPLETE'].map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 bg-[#1E293B] px-4">
              <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#38BDF8] flex items-center justify-center text-[#38BDF8] font-bold text-sm shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-[#94A3B8] tracking-wider">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B0F19]/50 text-xs uppercase text-[#94A3B8] border-b border-[rgba(148,163,184,0.12)]">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Destination</th>
                <th className="px-6 py-4 font-semibold">Resource</th>
                <th className="px-6 py-4 font-semibold">Qty</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold">AI Rec</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.12)] text-sm text-[#E2E8F0]">
              {allocations.map(a => (
                <tr key={a.id} className="hover:bg-[#263548] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{a.id.substring(0, 8)}</td>
                  <td className="px-6 py-4">{a.sourceWarehouse}</td>
                  <td className="px-6 py-4">{a.destinationArea}</td>
                  <td className="px-6 py-4">{a.resourceType}</td>
                  <td className="px-6 py-4">{a.quantity} {a.unit}</td>
                  <td className="px-6 py-4 font-medium text-slate-300">{a.priorityScore}</td>
                  <td className="px-6 py-4">
                    {a.aiRecommendation && <span className="text-[#38BDF8] flex items-center gap-1">✦ {a.aiConfidence}%</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      status={
                        a.approvalStatus === 'recommended' ? 'info' :
                        a.approvalStatus === 'pending_approval' ? 'warning' :
                        a.approvalStatus === 'approved' ? 'success' :
                        a.approvalStatus === 'rejected' ? 'error' : 'default'
                      } 
                      label={a.approvalStatus.replace('_', ' ')} 
                    />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {(a.approvalStatus === 'pending_approval' || a.approvalStatus === 'recommended') && (
                      <>
                        <button onClick={() => handleApprove(a.id)} className="px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded hover:bg-[#22C55E]/20 transition-colors text-xs font-medium">Approve</button>
                        <button onClick={() => handleReject(a.id)} className="px-2 py-1 bg-[#F87171]/10 text-[#F87171] rounded hover:bg-[#F87171]/20 transition-colors text-xs font-medium">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
