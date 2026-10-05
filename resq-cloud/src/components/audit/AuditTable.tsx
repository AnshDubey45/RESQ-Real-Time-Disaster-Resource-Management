import React from 'react';
import type { AuditLog } from '@/types';
import { formatDate, cn } from '@/utils';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';

export function AuditTable({ logs }: { logs: AuditLog[] }) {
  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => <span className="text-[#94A3B8] text-xs">{formatDate(row.timestamp)}</span>,
    },
    {
      key: 'user',
      header: 'User/System',
      render: (row) => (
        <div>
          <div className="font-medium text-[#E2E8F0]">{row.user}</div>
          <div className="text-xs text-[#94A3B8]">{row.userRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.action}</div>
          <div className="text-xs text-white/40 font-mono mt-0.5">{row.objectType}: {row.objectId}</div>
        </div>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      render: (row) => (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium border",
          row.result === 'success' ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20' : 
          row.result === 'error' ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20' : 
          'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20'
        )}>
          {row.result}
        </span>
      ),
    }
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      <h3 className="font-semibold text-[#E2E8F0] mb-4">System Audit Trail</h3>
      <DataTable 
        data={logs} 
        columns={columns} 
        searchable={true}
        sortable={true}
        className="flex-1"
      />
    </div>
  );
}
