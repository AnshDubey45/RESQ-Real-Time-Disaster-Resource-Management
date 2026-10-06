import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import type { ResourceRequest } from '@/types';
import { formatNumber } from '@/utils';
import { Search, Filter, Plus, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { CreateRequestModal } from '@/components/resources/CreateRequestModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ResourceRequests() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.getResourceRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch resource requests', error);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as any } : r))
    );
    toast.success('Request approved');
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as any } : r))
    );
    toast.error('Request rejected');
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.areaName.toLowerCase().includes(search.toLowerCase()) ||
        r.resourceType.toLowerCase().includes(search.toLowerCase());
      const matchesUrgency = urgencyFilter === 'All' || r.urgency === urgencyFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesUrgency && matchesStatus;
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [requests, search, urgencyFilter, statusFilter]);

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const critical = requests.filter(r => r.urgency === 'critical').length;

  const columns: Column<ResourceRequest>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (req) => <span className="font-mono text-[#94A3B8]">{req.id.slice(0, 8)}</span>
    },
    {
      key: 'areaName',
      header: 'Area / Disaster',
      render: (req) => (
        <div>
          <div className="font-medium text-[#E2E8F0]">{req.areaName}</div>
          <div className="text-xs text-[#94A3B8]">{req.disasterName}</div>
        </div>
      )
    },
    { key: 'resourceType', header: 'Resource' },
    {
      key: 'requestedQuantity',
      header: 'Qty',
      render: (req) => (
        <span className="font-medium text-[#E2E8F0]">
          {formatNumber(req.requestedQuantity)} <span className="text-[#94A3B8] text-xs font-normal">{req.unit}</span>
        </span>
      )
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (req) => <StatusBadge status={req.urgency} label={req.urgency} size="sm" />
    },
    {
      key: 'status',
      header: 'Status',
      render: (req) => <StatusBadge status={req.status} label={req.status} size="sm" />
    },
    {
      key: 'priorityScore',
      header: 'Score',
      render: (req) => <span className="font-bold text-[#E2E8F0]">{req.priorityScore.toFixed(1)}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (req) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] bg-transparent rounded-lg transition-colors">
            <Eye size={16} />
          </button>
          {req.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(req.id)}
                className="p-1.5 text-green-400 hover:text-green-300 bg-transparent rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleReject(req.id)}
                className="p-1.5 text-red-400 hover:text-red-300 bg-transparent rounded-lg transition-colors"
                title="Reject"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-transparent text-slate-200">
      <PageHeader 
        title="Resource Requests" 
        description="Review and manage critical resource demands." 
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            New Request
          </button>
        } 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: total, color: 'text-white' },
          { label: 'Pending', value: pending, color: 'text-amber-400' },
          { label: 'Approved', value: approved, color: 'text-green-400' },
          { label: 'Critical', value: critical, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700/50 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</h3>
            <p className={`text-4xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search area or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 focus:outline-none focus:border-sky-500 appearance-none font-medium transition-colors"
            >
              <option value="All">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="relative w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 focus:outline-none focus:border-sky-500 appearance-none font-medium transition-colors"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        data={filteredRequests} 
        columns={columns} 
        searchable={false} 
        sortable={false} 
      />
      
      {isModalOpen && (
        <CreateRequestModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            api.getResourceRequests().then(setRequests);
          }}
        />
      )}
    </div>
  );
}
