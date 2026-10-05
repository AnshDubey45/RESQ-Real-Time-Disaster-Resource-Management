import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Disasters = React.lazy(() => import('./pages/Disasters'));
const AffectedAreas = React.lazy(() => import('./pages/AffectedAreas'));
const ResourceRequests = React.lazy(() => import('./pages/ResourceRequests'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Warehouses = React.lazy(() => import('./pages/Warehouses'));
const Allocations = React.lazy(() => import('./pages/Allocations'));
const DemandPrediction = React.lazy(() => import('./pages/DemandPrediction'));
const PriorityEngine = React.lazy(() => import('./pages/PriorityEngine'));
const WhatIfSimulator = React.lazy(() => import('./pages/WhatIfSimulator'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#0B0F19] text-[#38BDF8]">Loading...</div>}>
      <Routes>
        <Route element={<DashboardShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/disasters" element={<Disasters />} />
          <Route path="/areas" element={<AffectedAreas />} />
          <Route path="/requests" element={<ResourceRequests />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/allocations" element={<Allocations />} />
          <Route path="/predictions" element={<DemandPrediction />} />
          <Route path="/priority" element={<PriorityEngine />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          <Route path="/audit" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
