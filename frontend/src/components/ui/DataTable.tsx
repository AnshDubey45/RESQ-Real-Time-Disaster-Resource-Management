import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import { cn } from '@/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  sortable = false,
  emptyMessage = 'No data available',
  emptyAction,
  className
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: '', direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = data;

    if (searchable && searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    if (sortable && sortConfig.direction && sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, searchable, sortable]);

  return (
    <div className={cn('w-full flex flex-col', className)}>
      {searchable && (
        <div className="relative mb-6 w-full max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium transition-colors"
          />
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#1E293B] shadow-lg">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0B0F19]/50 text-[#94A3B8] border-b border-[rgba(148,163,184,0.12)]">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-4 text-sm font-semibold tracking-wider transition-colors uppercase',
                    sortable && col.sortable !== false ? 'cursor-pointer hover:text-[#E2E8F0]' : '',
                    col.width
                  )}
                  onClick={() => (sortable && col.sortable !== false) ? handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortable && col.sortable !== false && sortConfig.key === col.key && (
                      <span className="text-[#38BDF8]">
                        {sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : sortConfig.direction === 'desc' ? <ChevronDown className="h-4 w-4" /> : null}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#E2E8F0] divide-y divide-[rgba(148,163,184,0.12)]">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                    <Inbox className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-base font-medium">{emptyMessage}</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
