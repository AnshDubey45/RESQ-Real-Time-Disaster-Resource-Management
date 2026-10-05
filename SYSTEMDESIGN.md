# RESQ-CLOUD — SYSTEM DESIGN

> **Version:** 1.0  
> **Product:** RESQ-CLOUD  
> **Design Direction:** Emergency Operations / Disaster Intelligence Command Center  
> **Frontend:** React + Tailwind CSS  
> **Component Source:** 21st.dev  
> **Primary Theme:** Dark, high-contrast, data-dense, operational

---

## 1. Design Vision

RESQ-CLOUD is a predictive, explainable, simulation-driven disaster resource intelligence and allocation platform.

The interface must feel like a **modern emergency operations command center**, not a generic SaaS dashboard. The design should communicate:

- urgency without visual chaos
- intelligent decision support
- real-time operational awareness
- resource scarcity
- explainable AI recommendations
- human approval and accountability
- continuous disaster-state changes

### Core product loop

**Predict → Prioritize → Allocate → Explain → Simulate → Reallocate**

The UI should make this workflow visually obvious.

---

# 2. Design Principles

## 2.1 Operational First

Every major screen should answer:

1. What is happening?
2. Where is it happening?
3. How severe is it?
4. What resources are available?
5. What does the system recommend?
6. Why is it recommending this?
7. What action should the operator take?

## 2.2 Information Density

Use compact but readable cards, tables, charts, timelines and maps.

Avoid excessive empty space normally found in marketing websites.

## 2.3 Visual Hierarchy

Critical information must visually dominate normal information.

Use the following semantic hierarchy:

**Critical → Warning → Active → Informational → Neutral**

## 2.4 Explainability

AI output must never appear as a mysterious black box.

Recommendations should expose:

- priority score
- demand prediction
- shortage
- affected population
- medical urgency
- accessibility
- allocation source
- explanation/reasoning

## 2.5 Human-in-the-Loop

AI recommends.

A human approves.

The UI must clearly distinguish:

- AI recommendation
- pending approval
- approved allocation
- dispatched allocation
- completed allocation

---

# 3. Color System

Use these colors as the mandatory RESQ-CLOUD design system.

Do not introduce arbitrary colors unless required for accessibility or chart differentiation.

| Role | Color | Hex | Usage |
|---|---|---|---|
| Base Background | Midnight Blue / Deep Charcoal | `#0B0F19` | Main application background |
| Surface | Elevated Charcoal | `#1E293B` | Cards, panels, tables, sidebar |
| Primary Text | Frosted Silver | `#E2E8F0` | Main text and important labels |
| Primary Accent | Electric Cyan | `#38BDF8` | Primary actions, active states, AI signals |
| Secondary Accent | AI Blue | `#60A5FA` | Charts, secondary actions, informational elements |
| Warning / Uncertainty | Neon Amber | `#FBBF24` | Scarcity, missing data, uncertain predictions |
| Critical / Urgent | Vibrant Coral Red | `#F87171` | Critical incidents, severe shortages, blocked routes |

### Accent Usage Rule

Do not use cyan and blue everywhere.

Accent colors should indicate meaning:

- `#38BDF8` → active / primary action / AI activity
- `#60A5FA` → informational / secondary data
- `#FBBF24` → warning / uncertainty / low stock
- `#F87171` → emergency / critical state

The UI should remain predominantly:

**#0B0F19 + #1E293B + #E2E8F0**

---

# 4. Surface System

## Base

```text
Background: #0B0F19
```

## Elevated surfaces

```text
Cards: #1E293B
Panels: #1E293B
Tables: #1E293B
Sidebar: #1E293B
```

## Borders

Use subtle borders:

```text
rgba(148, 163, 184, 0.12)
```

Avoid bright borders.

## Shadows

Use restrained shadows for hierarchy.

Do not use heavy neon glows on every component.

---

# 5. Typography

Use a modern sans-serif font.

Recommended:

- Inter
- Geist
- Plus Jakarta Sans

### Typography hierarchy

```text
Page Title       28–32px / semibold
Section Title    18–22px / semibold
Card Title       14–16px / semibold
Body             14px
Secondary Text   12–13px
Metric           24–32px / bold
Table Text       13–14px
```

Use `#E2E8F0` for primary text.

Use lower-contrast slate/gray values for secondary metadata where needed.

Avoid pure white `#FFFFFF` as the dominant text color.

---

# 6. Border Radius

Use restrained modern rounding:

```text
Cards:      12–16px
Buttons:    8–10px
Inputs:     8–10px
Badges:     9999px
Tables:     12px
Modals:     16px
```

Avoid excessive pill-shaped UI.

---

# 7. Application Layout

The application should use a persistent dashboard shell.

### Recommended structure

```text
┌──────────────────────────────────────────────────────────┐
│                       TOP BAR                             │
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│   SIDEBAR     │             MAIN CONTENT                 │
│               │                                          │
│               │                                          │
│               │                                          │
│               │                                          │
└───────────────┴──────────────────────────────────────────┘
```

Use a **Dashboard with Collapsible Sidebar** pattern from 21st.dev as the foundation.

### Sidebar

```text
RESQ-CLOUD
────────────────────
COMMAND CENTER

◉ Overview
◉ Disasters
◉ Affected Areas
◉ Resource Requests

RESOURCE MANAGEMENT

◉ Inventory
◉ Warehouses
◉ Allocations

INTELLIGENCE

◉ Demand Prediction
◉ Priority Engine
◉ What-If Simulator

SYSTEM

◉ Audit Logs
◉ Settings

────────────────────
● System Operational
User • Administrator
```

Sidebar requirements:

- collapsible
- clear active state
- icons + labels
- compact navigation
- persistent on desktop
- responsive drawer on mobile

---

# 8. 21st.dev Component Strategy

21st.dev should be treated as the source of modern UI building blocks.

Do not copy unrelated components without adapting them to RESQ-CLOUD.

### Selected components

| Product Area | Recommended 21st Component |
|---|---|
| Application shell | Dashboard with Collapsible Sidebar |
| Main dashboard | Dashboard Overview |
| KPI metrics | Stats Bento |
| Critical incident | Incident Report Large |
| Resource tables | Project Data Table |
| Demand prediction | Area Chart with Glowing Dot Markers |
| Allocation visualization | Allocation Sankey Chart |
| Priority analysis | Radar Score Chart |
| Reallocation history | Modern Timeline |
| Audit | Audit Log Table |
| AI workflow | AI Agent Pipeline-inspired panel |
| Map | 21st Maps component + Leaflet/OpenStreetMap |

The implementation may adapt these components to the RESQ design system.

---

# 9. Main Dashboard

The dashboard is the command center.

It should immediately show:

- active disasters
- critical areas
- resource shortage
- AI/system status
- disaster map
- resource status
- critical incidents
- allocation recommendations

### Recommended layout

```text
┌─────────────────────────────────────────────────────────┐
│ RESQ COMMAND CENTER                     Flood • ACTIVE │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ACTIVE       CRITICAL       RESOURCE       AI           │
│ DISASTERS    AREAS          SHORTAGE       STATUS       │
│    03           08             31%           94%        │
│                                                         │
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│ DISASTER MAP               │ RESOURCE STATUS            │
│                            │                            │
│ Critical zones             │ Water      ███████ 72%    │
│ Warehouses                 │ Food       █████  54%    │
│ Dispatch routes            │ Medicine   ███    31%    │
│                            │                            │
├────────────────────────────┴────────────────────────────┤
│                                                         │
│ AI ALLOCATION RECOMMENDATIONS                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 10. KPI / Stats Bento

Use a Stats Bento-style component.

Recommended metrics:

### Active Disasters

```text
03
+1 since last update
```

### Critical Areas

```text
08
3 require medical support
```

### Resource Coverage

```text
69%
-8% from previous state
```

### AI Confidence

```text
94%
Demand model
```

Avoid unnecessary gradients.

Use accent colors only for status or meaningful changes.

---

# 11. Incident Report Component

Use an Incident Report Large-style component.

Example:

```text
🔴 CRITICAL INCIDENT

Vellore Flood Zone A

Severity                 CRITICAL
Affected Population      2,500
Medical Urgency          94%
Accessibility            LOW

────────────────────────────

⚠ Medicine shortage
⚠ Route blocked
⚠ Water demand increasing

[ VIEW INCIDENT ]
```

### Critical state

Use:

```text
#F87171
```

for critical indicators.

Do not color the entire card red.

---

# 12. Resource Management Tables

Use a modern Project Data Table-style component.

Tables must support:

- sorting
- filtering
- status badges
- search
- pagination where required
- responsive behavior
- clear column hierarchy

### Resource Requests

```text
AREA       RESOURCE    REQUIRED   URGENCY   STATUS
──────────────────────────────────────────────────
Zone A     Water       5,000 L    CRITICAL  Pending
Zone B     Medicine      500      HIGH      Approved
Zone C     Food        3,000      MEDIUM    Dispatch
```

### Inventory

```text
WAREHOUSE     RESOURCE     STOCK     RESERVED
Warehouse A   Water        8,500 L   4,000 L
Warehouse B   Medicine     1,200       750
Warehouse C   Food         6,400     2,100
```

---

# 13. Demand Prediction

Use an Area Chart with Glowing Dot Markers-style visualization.

Purpose:

- show historical demand
- show predicted demand
- show trends
- show thresholds
- show uncertainty

Example:

```text
PREDICTED WATER DEMAND

12k ┤                         ●
10k ┤                     ●───╯
 8k ┤                 ●───╯
 6k ┤            ●────╯
 4k ┤       ●────╯
    └──────────────────────────
       T+1   T+2   T+3   T+4
```

### Chart semantics

```text
Normal data       #60A5FA
AI prediction     #38BDF8
Uncertainty       #FBBF24
Critical limit    #F87171
```

Charts should always include labels and legends where needed.

---

# 14. Allocation Visualization

This should be one of the signature visualizations of RESQ-CLOUD.

Use an **Allocation Sankey Chart**.

Purpose:

Show how limited resources move from warehouses to affected areas.

Example:

```text
WAREHOUSES                  AFFECTED AREAS

Warehouse A ──────────────► Area A
      │                         │
      │                         └── 4,000 L Water
      │
      └──────────────────────► Area C

Warehouse B ──────────────► Area B
      │
      └──────────────────────► Area D
```

The visualization must communicate:

**Source → Allocation → Destination**

It should update when allocations are recalculated.

---

# 15. Priority Engine

Use a Radar Score Chart-style component.

Priority factors:

```text
Severity
Population Impact
Medical Urgency
Resource Shortage
Accessibility
```

Example:

```text
PRIORITY SCORE

91.4 / 100

CRITICAL

Severity              95
Population            88
Medical Urgency       94
Resource Shortage     91
Accessibility         70
```

### Priority formula

```text
Priority Score =
    30% Severity
  + 25% Population Impact
  + 20% Medical Urgency
  + 15% Resource Shortage
  + 10% Accessibility
```

The frontend must display the factors behind the score.

---

# 16. AI Decision Explanation

Do not build a generic chatbot as the primary AI UI.

Use an AI decision/explanation panel.

### AI pipeline

```text
DATA INGESTION
      ↓
DEMAND PREDICTION
      ↓
PRIORITY ANALYSIS
      ↓
RESOURCE OPTIMIZATION
      ↓
RECOMMENDATION
      ↓
HUMAN APPROVAL
```

### Example explanation

```text
✦ RESQ INTELLIGENCE

Why Area A was prioritized

Severity              +28.5
Medical Urgency       +18.8
Population            +22.0
Resource Shortage     +13.6
Accessibility          +7.0

Priority Score        91.4
```

The explanation must be generated from actual system factors.

Never display invented reasoning.

---

# 17. What-If Simulation

The simulator is a major product feature.

Users should be able to modify scenario variables:

- disaster type
- population
- severity
- duration
- inventory
- medical urgency
- accessibility

The simulation must not modify live operational data.

### Example

```text
Scenario

Disaster: Flood
Population: 10,000
Severity: 8/10
Duration: 5 days

                 CURRENT     SIMULATED
Water Demand      8,200 L    11,500 L
Food Demand       4,750      6,200
Medicine            620        810

Additional Water Shortage:
3,300 L
```

Primary action:

```text
[ RUN SIMULATION ]
```

Use `#38BDF8` for the primary action.

---

# 18. Dynamic Reallocation

Use a Modern Timeline-style component.

Example:

```text
● 14:32  INITIAL ALLOCATION
│        Area A → 800 units
│
● 14:47  NEW FIELD REPORT
│        Medical urgency increased
│
● 14:51  ROUTE CHANGE
│        Warehouse A inaccessible
│
● 14:53  AI REALLOCATION
│        Area A → 650
│        Area C → 750
│
● 14:55  APPROVAL
         Admin approved
```

This communicates:

**Detect → Recalculate → Reallocate → Approve → Audit**

---

# 19. Audit Logs

Use an Audit Log Table-style component.

Example:

```text
TIME       USER       ACTION              RESULT
────────────────────────────────────────────────
14:32      Admin      Allocation created  SUCCESS
14:47      Officer    Incident updated    UPDATED
14:51      System     Route blocked       WARNING
14:53      AI Engine  Reallocation        CREATED
14:55      Admin      Allocation approved APPROVED
```

Audit logs should be visually quiet but easy to inspect.

---

# 20. Disaster Map

Use a map as an operational visualization.

Recommended technology:

- Leaflet
- OpenStreetMap

Avoid paid map APIs for the college MVP.

### Marker semantics

```text
🔴 Critical affected area
🟠 High priority area
🟡 Medium priority area
🔵 Warehouse
🚚 Active dispatch
```

Clicking a zone should open a compact information panel.

Example:

```text
AREA A

Population       2,500
Severity         9.2
Medical          94%
Water Shortage   63%

Priority         91.4

[ VIEW DETAILS ]
[ ALLOCATE ]
```

---

# 21. Status System

Use consistent status badges.

### Critical

```text
Background: rgba(248,113,113,0.12)
Text: #F87171
```

### Warning

```text
Background: rgba(251,191,36,0.12)
Text: #FBBF24
```

### Active

```text
Background: rgba(56,189,248,0.12)
Text: #38BDF8
```

### Informational

```text
Background: rgba(96,165,250,0.12)
Text: #60A5FA
```

Do not rely on color alone. Include labels/icons.

---

# 22. Buttons

## Primary

```text
Background: #38BDF8
Text: #0B0F19
```

Examples:

- Run Simulation
- Recalculate
- Approve Allocation
- Create Disaster

## Secondary

Dark surface with subtle border.

Examples:

- View Details
- Cancel
- Export

## Destructive

Use coral red only for genuinely destructive actions.

Example:

- Reject Allocation
- Delete Disaster

---

# 23. Animation Guidelines

Use subtle animation only.

Recommended:

- 150–250ms card transitions
- count-up for KPI values
- subtle map-marker pulse
- table-row entrance
- timeline progression
- AI processing indicator
- Sankey flow transitions

Avoid:

- excessive particle effects
- constant glowing animations
- full-screen animated backgrounds
- distracting parallax
- excessive hover movement

The interface must remain usable during an emergency.

---

# 24. Responsive Design

Desktop is the primary target because RESQ-CLOUD is an operations dashboard.

Still support:

- laptop
- tablet
- mobile

### Desktop

Persistent sidebar.

### Tablet

Collapsible sidebar.

### Mobile

Drawer navigation and stacked cards.

Tables should become horizontally scrollable or transform into compact cards.

Maps and charts must remain usable without overflowing.

---

# 25. Accessibility

Requirements:

- sufficient contrast
- keyboard navigation
- visible focus states
- semantic buttons
- labels for inputs
- text alternatives for icons
- do not rely exclusively on color
- accessible chart labels
- readable font sizes

Critical/warning states should use icons and text in addition to colors.

---

# 26. Component Architecture

Recommended frontend structure:

```text
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar
│   │   ├── Topbar
│   │   └── DashboardShell
│   │
│   ├── dashboard/
│   │   ├── StatsBento
│   │   ├── IncidentCard
│   │   ├── ResourceStatus
│   │   └── AllocationRecommendations
│   │
│   ├── disaster/
│   │   ├── DisasterMap
│   │   ├── IncidentReport
│   │   └── AffectedArea
│   │
│   ├── resources/
│   │   ├── ResourceTable
│   │   ├── InventoryTable
│   │   └── WarehouseCard
│   │
│   ├── intelligence/
│   │   ├── DemandChart
│   │   ├── PriorityRadar
│   │   ├── AllocationSankey
│   │   ├── AIExplanation
│   │   └── SimulationPanel
│   │
│   ├── audit/
│   │   ├── AuditTable
│   │   └── ReallocationTimeline
│   │
│   └── ui/
│       ├── Button
│       ├── Badge
│       ├── Card
│       ├── Modal
│       ├── Input
│       └── DataTable
│
├── pages/
│   ├── Dashboard
│   ├── Disasters
│   ├── Areas
│   ├── Requests
│   ├── Inventory
│   ├── Warehouses
│   ├── Allocations
│   ├── Predictions
│   ├── Simulator
│   └── AuditLogs
│
├── services/
│   └── api
│
├── hooks/
├── utils/
└── styles/
```

---

# 27. Frontend Pages

## Dashboard

Primary command center.

## Disasters

Create and manage disasters.

## Affected Areas

View severity, population, urgency, accessibility and priority.

## Resource Requests

Review and approve requests.

## Inventory

View warehouse stock and reservations.

## Warehouses

View warehouse status and available resources.

## Allocations

Review AI recommendations and approve allocations.

## Demand Prediction

View predicted resource demand.

## What-If Simulator

Run hypothetical disaster scenarios.

## Audit Logs

Track system and human actions.

---

# 28. Data States

Every data-driven component should support:

### Loading

Use skeleton loaders.

### Empty

Provide meaningful empty-state messaging.

Example:

```text
No active disasters

Create a disaster scenario to begin
resource analysis.

[ CREATE DISASTER ]
```

### Error

Explain what happened and provide retry.

### Success

Use concise confirmation.

### Stale Data

Show:

```text
Last updated 42 seconds ago
```

Do not pretend data is real-time if it is not.

---

# 29. Frontend-to-Backend Integration

The frontend must initially work with mock data so UI development does not block backend development.

Use an API service layer:

```text
React
  ↓
API Service
  ↓
FastAPI
  ↓
PostgreSQL
```

Do not directly couple UI components to database logic.

Mock APIs should later be replaceable by real API calls without redesigning components.

---

# 30. Cloud-Aware UI

The UI should visually communicate system health without becoming a cloud infrastructure dashboard.

Example top-bar indicator:

```text
● API Operational
● Database Operational
● AI Engine Ready
```

Possible future states:

```text
● Operational
● Degraded
● Offline
```

Use `#38BDF8` for operational state and `#F87171` for critical failures.

---

# 31. Demo-Critical Features

Because this project has a 3–5 day implementation window, prioritize these features:

### Tier 1 — Must Have

1. Dashboard
2. Disaster management
3. Affected areas
4. Resource requests
5. Inventory
6. Priority scoring
7. Allocation recommendation
8. AI explanation
9. Demand prediction
10. What-if simulation

### Tier 2 — Strongly Recommended

11. Allocation Sankey
12. Disaster map
13. Reallocation timeline
14. Audit logs
15. GitHub Actions status

### Tier 3 — Future

16. Real-time IoT
17. Satellite imagery
18. Real disaster feeds
19. Advanced optimization
20. SMS notifications
21. Large-scale SageMaker deployment
22. Kubernetes
23. Multi-region deployment

---

# 32. Performance Guidelines

The dashboard should feel fast.

Recommendations:

- lazy-load heavy pages
- avoid unnecessary API calls
- debounce search/filter inputs
- paginate large tables
- cache static data
- avoid rendering thousands of map markers simultaneously
- optimize chart rendering
- use skeleton states instead of blank screens

---

# 33. Security UI Guidelines

The interface should support role-based behavior.

### Administrator

Can:

- create disasters
- approve allocations
- run simulations
- modify resources
- view audit logs

### Field Officer

Can:

- submit reports
- create resource requests
- update affected-area information

### Warehouse Manager

Can:

- update inventory
- confirm dispatch
- view warehouse allocations

### Viewer

Read-only access.

UI controls must reflect permissions, but backend authorization remains the actual security boundary.

---

# 34. Final Visual Identity

RESQ-CLOUD should feel like:

> **A high-end emergency response intelligence platform used by a modern disaster operations center.**

It should NOT feel like:

- a generic admin template
- a cryptocurrency dashboard
- a gaming interface
- a neon cyberpunk website
- a marketing landing page
- an AI chatbot wrapper

### Desired visual keywords

**Command Center · Intelligent · Precise · Urgent · Reliable · Data-Driven · Modern · Controlled · Professional**

---

# 35. Signature RESQ-CLOUD UI

The following four components should become the visual identity of the project:

### 1. Incident Report

Shows what is happening.

### 2. Priority Radar

Shows why an area matters.

### 3. Allocation Sankey

Shows where resources are going.

### 4. Reallocation Timeline

Shows how decisions change over time.

Together they tell the complete story:

```text
INCIDENT
   ↓
PRIORITY
   ↓
ALLOCATION
   ↓
CHANGE
   ↓
REALLOCATION
```

This should be the central visual narrative of RESQ-CLOUD.

---

# 36. Final Implementation Rule

**Do not sacrifice functionality for visual effects.**

The frontend should be impressive because the information architecture is intelligent, not because it contains excessive animation.

The final experience should make a professor immediately understand:

> “This system receives disaster information, determines which areas need help most, predicts resource demand, recommends where limited resources should go, explains why, allows a human to approve the decision, and dynamically recalculates when conditions change.”

That is the core RESQ-CLOUD experience.
