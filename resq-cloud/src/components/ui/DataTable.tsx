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
        <div className="relative mb-4 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E293B] border border-[rgba(148,163,184,0.12)] rounded-lg pl-9 pr-4 py-2 text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
          />
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#1E293B]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0B0F19]/50 text-[#94A3B8] border-b border-[rgba(148,163,184,0.12)]">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-medium transition-colors',
                    sortable && col.sortable !== false ? 'cursor-pointer hover:text-[#E2E8F0]' : '',
                    col.width
                  )}
                  onClick={() => (sortable && col.sortable !== false) ? handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortable && col.sortable !== false && sortConfig.key === col.key && (
                      <span className="text-[#38BDF8]">
                        {sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : sortConfig.direction === 'desc' ? <ChevronDown className="h-3 w-3" /> : null}
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
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                    <Inbox className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{emptyMessage}</p>
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
