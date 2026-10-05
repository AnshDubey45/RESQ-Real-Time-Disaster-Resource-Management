import React from 'react';
import { api } from '@/services/api';
import type { AuditLog } from '@/types';
import { AuditTable } from '@/components/audit/AuditTable';
import { ReallocationTimeline } from '@/components/audit/ReallocationTimeline';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AuditLogs() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    async function load() {
      const data = await api.getAuditLogs();
      setLogs(data);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen text-[#E2E8F0]">
      <PageHeader 
        title="Audit & System Logs" 
        description="Monitor system activities and reallocation events"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[65%_1fr] gap-6">
        <div>
          <AuditTable logs={logs} />
        </div>
        <div>
          <ReallocationTimeline />
        </div>
      </div>
    </div>
  );
}
