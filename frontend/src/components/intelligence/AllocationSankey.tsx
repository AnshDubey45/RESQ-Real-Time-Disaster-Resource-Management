import React, { useState, useMemo } from 'react';
import type { Allocation, Warehouse } from '@/types';
import { 
  Building2, MapPin, AlertTriangle, ShieldCheck, 
  Sparkles, Filter, Navigation2, CheckCircle2, 
  Clock, Truck, Layers, Eye
} from 'lucide-react';
import { formatNumber } from '@/utils';

interface AllocationSankeyProps {
  allocations: Allocation[];
  warehouses?: Warehouse[];
}

export function AllocationSankey({ allocations, warehouses = [] }: AllocationSankeyProps) {
  const [selectedResource, setSelectedResource] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ type: 'source' | 'dest'; name: string } | null>(null);

  // Map of warehouses by ID and Name for fast lookup
  const warehouseMap = useMemo(() => {
    const map = new Map<string, Warehouse>();
    warehouses.forEach(w => {
      map.set(w.id, w);
      map.set(w.name, w);
    });
    return map;
  }, [warehouses]);

  // Filter allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      if (selectedResource !== 'ALL' && a.resourceType !== selectedResource) return false;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'pending' && a.approvalStatus !== 'pending_approval' && a.approvalStatus !== 'recommended') return false;
        if (selectedStatus === 'approved' && a.approvalStatus !== 'approved') return false;
        if (selectedStatus === 'in_transit' && a.dispatchStatus !== 'en_route' && a.dispatchStatus !== 'dispatched') return false;
        if (selectedStatus === 'completed' && a.dispatchStatus !== 'delivered' && a.approvalStatus !== 'completed') return false;
      }
      return true;
    });
  }, [allocations, selectedResource, selectedStatus]);

  // Get distinct source warehouses from database and allocations
  const sourceNodes = useMemo(() => {
    const counts = new Map<string, { totalQty: number; count: number; warehouse?: Warehouse }>();

    // Start with all warehouses known in database
    warehouses.forEach(w => {
      counts.set(w.name, { totalQty: 0, count: 0, warehouse: w });
    });

    // Accumulate actual flow from allocations
    filteredAllocations.forEach(a => {
      const whName = a.sourceWarehouse;
      const current = counts.get(whName) || { 
        totalQty: 0, 
        count: 0, 
        warehouse: warehouseMap.get(a.sourceWarehouseId) || warehouseMap.get(whName)
      };
      current.totalQty += a.quantity;
      current.count += 1;
      counts.set(whName, current);
    });

    // Convert to sorted array
    return Array.from(counts.entries())
      .filter(([_, data]) => warehouses.length === 0 || data.count > 0 || warehouses.some(w => w.name === _))
      .slice(0, 4) // Primary regional logistics hubs
      .map(([name, data], idx) => {
        const wh = data.warehouse;
        // Exact location pulled directly from the database record
        const dbLocation = wh?.location 
          ? `${wh.location}, Tamil Nadu`
          : 'Regional Depot, TN';

        return {
          id: wh?.id || `W-${idx + 1}`,
          name,
          location: dbLocation,
          routeStatus: wh?.routeStatus || 'clear',
          operationalStatus: wh?.operationalStatus || 'operational',
          totalQty: data.totalQty,
          allocationCount: data.count,
          capacity: wh?.capacity,
          usedCapacity: wh?.usedCapacity
        };
      });
  }, [warehouses, filteredAllocations, warehouseMap]);

  // Get distinct destination areas from allocations
  const destNodes = useMemo(() => {
    const counts = new Map<string, { totalQty: number; count: number; priority: number }>();

    filteredAllocations.forEach(a => {
      const current = counts.get(a.destinationArea) || { totalQty: 0, count: 0, priority: a.priorityScore };
      current.totalQty += a.quantity;
      current.count += 1;
      current.priority = Math.max(current.priority, a.priorityScore);
      counts.set(a.destinationArea, current);
    });

    return Array.from(counts.entries())
      .map(([name, data], idx) => ({
        id: `D-${idx + 1}`,
        name,
        totalQty: data.totalQty,
        count: data.count,
        priority: data.priority,
        severity: data.priority >= 85 ? 'Critical' : data.priority >= 70 ? 'High' : 'Moderate'
      }))
      .sort((a, b) => b.priority - a.priority);
  }, [filteredAllocations]);

  // Map coordinates
  const SVG_WIDTH = 1040;
  const SVG_HEIGHT = 460;
  const NODE_WIDTH = 240;

  const sourceSpacing = sourceNodes.length > 0 ? (SVG_HEIGHT - 60) / sourceNodes.length : 100;
  const destSpacing = destNodes.length > 0 ? (SVG_HEIGHT - 60) / destNodes.length : 100;

  const sourceCoords = useMemo(() => {
    const coords = new Map<string, { x: number; y: number; centerY: number }>();
    sourceNodes.forEach((node, idx) => {
      const y = 30 + idx * sourceSpacing;
      coords.set(node.name, { x: 20, y, centerY: y + 36 });
    });
    return coords;
  }, [sourceNodes, sourceSpacing]);

  const destCoords = useMemo(() => {
    const coords = new Map<string, { x: number; y: number; centerY: number }>();
    destNodes.forEach((node, idx) => {
      const y = 30 + idx * destSpacing;
      coords.set(node.name, { x: SVG_WIDTH - NODE_WIDTH - 20, y, centerY: y + 30 });
    });
    return coords;
  }, [destNodes, destSpacing]);

  // Max quantity for width scaling
  const maxQty = useMemo(() => {
    return Math.max(...allocations.map(a => a.quantity), 1000);
  }, [allocations]);

  // Resource styling
  const getResourceColor = (type: string) => {
    switch (type) {
      case 'Water': return '#38BDF8';
      case 'Food Packets': return '#F59E0B';
      case 'Medicine': return '#F43F5E';
      case 'Shelter Kits': return '#A855F7';
      case 'Rescue Equipment': return '#10B981';
      default: return '#60A5FA';
    }
  };

  const activeAllocation = useMemo(() => {
    if (!hoveredId) return null;
    return allocations.find(a => a.id === hoveredId);
  }, [hoveredId, allocations]);

  const totalVolume = useMemo(() => {
    return filteredAllocations.reduce((sum, a) => sum + a.quantity, 0);
  }, [filteredAllocations]);

  return (
    <div className="w-full bg-[#1E293B] rounded-xl border border-[rgba(148,163,184,0.14)] p-5 md:p-6 shadow-xl flex flex-col gap-5">
      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.12)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#38BDF8]/10 rounded-lg text-[#38BDF8] border border-[#38BDF8]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#E2E8F0] tracking-wide flex items-center gap-2">
                Logistics Corridors & Resource Flow
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Live DB Synced
                </span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Real-time multi-echelon resource routing from database-verified depots to emergency sectors.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry stats pill */}
        <div className="flex items-center gap-3 text-xs bg-[#0F172A] px-3.5 py-2 rounded-lg border border-[rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-1.5 text-[#CBD5E1]">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-white">{sourceNodes.length}</span> Hubs
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[#CBD5E1]">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-white">{destNodes.length}</span> Zones
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[#CBD5E1]">
            <Navigation2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{filteredAllocations.length}</span> Corridors
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[#CBD5E1]">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">{formatNumber(totalVolume)}</span> Units
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A]/70 p-3 rounded-lg border border-[rgba(148,163,184,0.08)]">
        {/* Resource Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#94A3B8] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-400" /> Resource:
          </span>
          {['ALL', 'Water', 'Food Packets', 'Medicine', 'Shelter Kits', 'Rescue Equipment'].map(res => (
            <button
              key={res}
              onClick={() => setSelectedResource(res)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedResource === res
                  ? 'bg-[#38BDF8] text-[#0B0F19] font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {res === 'ALL' ? 'All Resources' : res}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#94A3B8] font-medium mr-1">Status:</span>
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'in_transit', label: 'In Transit' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedStatus === st.id
                  ? 'bg-slate-700 text-white border border-[#38BDF8]/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* The Diagram Visualizer Area */}
      <div className="relative w-full overflow-x-auto bg-[#0B0F19] rounded-xl border border-[rgba(148,163,184,0.12)] p-2">
        <svg 
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
          className="w-full min-w-[850px] h-auto select-none"
          style={{ minHeight: '440px' }}
        >
          <defs>
            {/* Gradients for ribbons */}
            <linearGradient id="grad-Water" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-Food" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-Medicine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E11D48" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FB7185" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-Shelter" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-Rescue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND GRID CORRIDORS */}
          <line x1="260" y1="20" x2="260" y2={SVG_HEIGHT - 20} stroke="rgba(148,163,184,0.08)" strokeDasharray="4,4" />
          <line x1={SVG_WIDTH - NODE_WIDTH - 20} y1="20" x2={SVG_WIDTH - NODE_WIDTH - 20} y2={SVG_HEIGHT - 20} stroke="rgba(148,163,184,0.08)" strokeDasharray="4,4" />

          {/* COLUMN LABELS */}
          <text x="140" y="20" fill="#94A3B8" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
            REGIONAL SUPPLY DEPOTS (DATABASE)
          </text>
          <text x={SVG_WIDTH / 2} y="20" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.08em">
            ACTIVE TRANSIT CORRIDORS
          </text>
          <text x={SVG_WIDTH - 140} y="20" fill="#94A3B8" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
            CRISIS TARGET SECTORS
          </text>

          {/* FLOW RIBBONS */}
          {filteredAllocations.map(alloc => {
            const source = sourceCoords.get(alloc.sourceWarehouse);
            const dest = destCoords.get(alloc.destinationArea);

            if (!source || !dest) return null;

            const startX = source.x + NODE_WIDTH;
            const startY = source.centerY;
            const endX = dest.x;
            const endY = dest.centerY;

            const isHovered = hoveredId === alloc.id;
            const isSourceSelected = hoveredNode?.type === 'source' && hoveredNode.name === alloc.sourceWarehouse;
            const isDestSelected = hoveredNode?.type === 'dest' && hoveredNode.name === alloc.destinationArea;

            const isHighlighted = isHovered || isSourceSelected || isDestSelected;
            const isDimmed = (hoveredId !== null || hoveredNode !== null) && !isHighlighted;

            // Proportional stroke width
            const strokeWidth = Math.max(3.5, Math.min(22, (alloc.quantity / maxQty) * 20 + 3.5));

            // Curvature control
            const deltaX = (endX - startX) * 0.55;
            const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

            let gradId = 'grad-Water';
            if (alloc.resourceType.includes('Food')) gradId = 'grad-Food';
            else if (alloc.resourceType.includes('Medicine')) gradId = 'grad-Medicine';
            else if (alloc.resourceType.includes('Shelter')) gradId = 'grad-Shelter';
            else if (alloc.resourceType.includes('Rescue')) gradId = 'grad-Rescue';

            return (
              <g 
                key={alloc.id} 
                className="cursor-pointer transition-opacity duration-200"
                onMouseEnter={() => setHoveredId(alloc.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Glow underlay if highlighted */}
                {isHighlighted && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={getResourceColor(alloc.resourceType)}
                    strokeWidth={strokeWidth + 6}
                    strokeOpacity="0.4"
                    filter="url(#glow)"
                  />
                )}

                {/* Primary Ribbon Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={strokeWidth}
                  strokeOpacity={isDimmed ? 0.08 : isHighlighted ? 0.95 : 0.45}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />

                {/* Animated Flow Pulse for in-transit or approved items */}
                {(alloc.dispatchStatus === 'en_route' || alloc.dispatchStatus === 'dispatched' || isHighlighted) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={Math.max(1.5, strokeWidth * 0.35)}
                    strokeOpacity={isHighlighted ? 0.8 : 0.4}
                    strokeDasharray="6,12"
                    strokeLinecap="round"
                  >
                    <animate 
                      attributeName="stroke-dashoffset" 
                      from="36" 
                      to="0" 
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                  </path>
                )}
              </g>
            );
          })}

          {/* LEFT COLUMN: WAREHOUSE NODES (FROM DATABASE) */}
          {sourceNodes.map(node => {
            const coord = sourceCoords.get(node.name);
            if (!coord) return null;

            const isHovered = hoveredNode?.type === 'source' && hoveredNode.name === node.name;
            const isLinkedToActive = activeAllocation?.sourceWarehouse === node.name;

            const routeColor = 
              node.routeStatus === 'clear' ? '#22C55E' : 
              node.routeStatus === 'delayed' ? '#F59E0B' : '#EF4444';

            return (
              <g 
                key={node.id} 
                transform={`translate(${coord.x}, ${coord.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode({ type: 'source', name: node.name })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Box */}
                <rect 
                  width={NODE_WIDTH} 
                  height="72" 
                  rx="8" 
                  fill={isHovered || isLinkedToActive ? '#1E293B' : '#0F172A'} 
                  stroke={isHovered || isLinkedToActive ? '#38BDF8' : 'rgba(148,163,184,0.18)'} 
                  strokeWidth={isHovered || isLinkedToActive ? '2' : '1'}
                  className="transition-all duration-200"
                />

                {/* Left accent line */}
                <rect 
                  x="0" 
                  y="6" 
                  width="4" 
                  height="60" 
                  rx="2" 
                  fill={routeColor} 
                />

                {/* Warehouse Name */}
                <text x="16" y="24" fill="#F1F5F9" fontSize="12" fontWeight="700">
                  {node.name}
                </text>

                {/* Database Verified Location Tag */}
                <g transform="translate(16, 32)">
                  <circle cx="4" cy="7" r="3" fill="#38BDF8" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1" />
                  <text x="12" y="11" fill="#38BDF8" fontSize="10.5" fontWeight="600">
                    📍 {node.location}
                  </text>
                </g>

                {/* Outflow volume & Route status */}
                <text x="16" y="60" fill="#94A3B8" fontSize="10">
                  Outflow: <tspan fill="#E2E8F0" fontWeight="600">{formatNumber(node.totalQty)}</tspan> units
                </text>

                {/* Route status badge on the right */}
                <rect 
                  x={NODE_WIDTH - 68} 
                  y="46" 
                  width="58" 
                  height="18" 
                  rx="4" 
                  fill="rgba(15,23,42,0.8)" 
                  stroke={routeColor}
                  strokeWidth="0.8"
                />
                <circle cx={NODE_WIDTH - 60} cy="55" r="2.5" fill={routeColor} />
                <text x={NODE_WIDTH - 53} y="58" fill={routeColor} fontSize="8.5" fontWeight="700" letterSpacing="0.04em">
                  {node.routeStatus.toUpperCase()}
                </text>

                {/* Connection Anchor Dot */}
                <circle 
                  cx={NODE_WIDTH} 
                  cy="36" 
                  r="5" 
                  fill="#0F172A" 
                  stroke="#38BDF8" 
                  strokeWidth="2" 
                />
              </g>
            );
          })}

          {/* RIGHT COLUMN: DESTINATION NODES */}
          {destNodes.map(node => {
            const coord = destCoords.get(node.name);
            if (!coord) return null;

            const isHovered = hoveredNode?.type === 'dest' && hoveredNode.name === node.name;
            const isLinkedToActive = activeAllocation?.destinationArea === node.name;

            const sevColor = 
              node.severity === 'Critical' ? '#EF4444' : 
              node.severity === 'High' ? '#F59E0B' : '#38BDF8';

            return (
              <g 
                key={node.id} 
                transform={`translate(${coord.x}, ${coord.y})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode({ type: 'dest', name: node.name })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Box */}
                <rect 
                  width={NODE_WIDTH} 
                  height="60" 
                  rx="8" 
                  fill={isHovered || isLinkedToActive ? '#1E293B' : '#0F172A'} 
                  stroke={isHovered || isLinkedToActive ? sevColor : 'rgba(148,163,184,0.18)'} 
                  strokeWidth={isHovered || isLinkedToActive ? '2' : '1'}
                  className="transition-all duration-200"
                />

                {/* Right accent line */}
                <rect 
                  x={NODE_WIDTH - 4} 
                  y="5" 
                  width="4" 
                  height="50" 
                  rx="2" 
                  fill={sevColor} 
                />

                {/* Area Name */}
                <text x="16" y="24" fill="#F1F5F9" fontSize="12" fontWeight="700">
                  {node.name}
                </text>

                {/* Inflow stats */}
                <text x="16" y="44" fill="#94A3B8" fontSize="10">
                  Receiving: <tspan fill="#E2E8F0" fontWeight="600">{formatNumber(node.totalQty)}</tspan> units ({node.count} corridors)
                </text>

                {/* Severity Badge */}
                <rect 
                  x={NODE_WIDTH - 82} 
                  y="12" 
                  width="70" 
                  height="18" 
                  rx="4" 
                  fill={`${sevColor}22`} 
                  stroke={sevColor}
                  strokeWidth="0.8"
                />
                <text x={NODE_WIDTH - 47} y="24" fill={sevColor} fontSize="8.5" fontWeight="800" textAnchor="middle">
                  {node.severity.toUpperCase()} ({node.priority})
                </text>

                {/* Connection Anchor Dot */}
                <circle 
                  cx="0" 
                  cy="30" 
                  r="5" 
                  fill="#0F172A" 
                  stroke={sevColor} 
                  strokeWidth="2" 
                />
              </g>
            );
          })}
        </svg>

        {/* ACTIVE CORRIDOR HOVER HUD CARD */}
        {activeAllocation && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0F172A]/95 border border-[#38BDF8]/40 shadow-2xl rounded-xl p-3.5 backdrop-blur-md flex items-center gap-5 z-20 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getResourceColor(activeAllocation.resourceType) }} />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Corridor</span>
                <span className="text-white font-mono font-bold">{activeAllocation.id}</span>
              </div>
            </div>

            <div className="h-7 w-px bg-slate-700" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Source Hub</span>
              <span className="text-white font-medium flex items-center gap-1">
                {activeAllocation.sourceWarehouse}
                <span className="text-sky-400 text-[10px]">
                  ({warehouseMap.get(activeAllocation.sourceWarehouseId)?.location || 'TN Depot'})
                </span>
              </span>
            </div>

            <span className="text-slate-500 font-bold">➔</span>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Target Sector</span>
              <span className="text-white font-medium">{activeAllocation.destinationArea}</span>
            </div>

            <div className="h-7 w-px bg-slate-700" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Payload</span>
              <span className="text-sky-400 font-bold">{formatNumber(activeAllocation.quantity)} {activeAllocation.unit} {activeAllocation.resourceType}</span>
            </div>

            {activeAllocation.aiRecommendation && (
              <>
                <div className="h-7 w-px bg-slate-700" />
                <div className="flex items-center gap-1 text-sky-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI {Math.round(activeAllocation.aiConfidence * 100)}%</span>
                </div>
              </>
            )}

            <div className="h-7 w-px bg-slate-700" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Status</span>
              <span className="capitalize font-semibold text-emerald-400">
                {activeAllocation.approvalStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend & Telemetry Guide */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#94A3B8] pt-2 px-1 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-300">Resource Legend:</span>
          {[
            { label: 'Water', color: '#38BDF8' },
            { label: 'Food Packets', color: '#F59E0B' },
            { label: 'Medicine', color: '#F43F5E' },
            { label: 'Shelter Kits', color: '#A855F7' },
            { label: 'Rescue Equipment', color: '#10B981' }
          ].map(r => (
            <div key={r.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-slate-300 text-[11px]">{r.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Route Clear</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
