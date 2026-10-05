# RESQ-CLOUD — Product Requirements Document (PRD)

> **Version:** 1.0
> **Type:** College cloud project, 100% free to build and run
> **One-line pitch:** RESQ-CLOUD is a predictive, explainable and simulation-driven web platform that helps emergency decision-makers allocate limited disaster resources and keep adapting as conditions change.
> **Core loop:** Predict → Prioritize → Allocate → Explain → Simulate → Reallocate (human approves every allocation)
> **Related file:** `SYSTEMDESIGN.md` is the visual and UI source of truth. This PRD is the product, logic, data and API source of truth. If they disagree, see Section 17.

---

## 0. How the AI agent (Antigravity) must use this file

1. Read this whole PRD and `SYSTEMDESIGN.md` before writing code.
2. Build in the order given in **Section 15 (Build Plan)**. Finish each phase and run its checks before moving on.
3. Build the **working local app first**. Do not set up cloud services until the app works on a laptop.
4. Use **mock data first**, behind an API service layer, so UI work never waits for the backend.
5. Never hard-code numbers that should be calculated (priority score, shortages, explanations). Always compute them from data.
6. Never use a paid service, a paid API, or anything that needs a credit card. If a choice needs one, stop and pick a free option from Section 5.
7. All demo data must be labeled **"Synthetic data"** in the UI.
8. Keep modules separate: `frontend`, `backend/api`, `backend/engines`, `backend/ml`. Engines must not import web-framework code, so they are easy to unit test.
9. Do not sacrifice function for visual effects. Subtle animation only.

---

## 1. Product overview

During a disaster, many affected areas ask for the same limited supplies. Information is incomplete, demand keeps changing and roads or warehouses can become unavailable. A normal app can store requests and stock. It cannot answer these questions:

- Which area should get scarce resources first?
- How much food, water and medicine will each area need in the next 24–48 hours?
- What happens if the disaster gets worse?
- Which warehouse should supply which area?
- **Why** was this allocation recommended?
- What changes if a warehouse or route is blocked?

RESQ-CLOUD answers these with five parts: **priority scoring, demand prediction, constrained allocation, explanations, and a what-if simulator**. It supports decisions. It does **not** dispatch anything by itself. An authorized human approves, modifies or rejects every recommendation.

### Product positioning (be honest in the demo)

AI-assisted disaster resource allocation is an existing research area, so RESQ-CLOUD must **not** claim to be unprecedented. Its difference is that it combines **predict + simulate + optimize + explain + approve + reallocate** in one cloud-native, DevOps-enabled academic prototype. It is a decision-support prototype, not a certified emergency system.

---

## 2. Goals and non-goals

### Goals

| # | Goal | How we know it is done |
|---|---|---|
| G1 | Centralize disasters, areas, inventory, requests, allocations | All CRUD screens work with real database data |
| G2 | Transparent priority score | Score and every factor shown in UI and match the formula |
| G3 | Predict future demand | Model returns food, water, medicine demand with model version |
| G4 | Feasible allocation under limited stock | Allocations never exceed available stock (tested) |
| G5 | Explain each recommendation | Explanation lists real factors from the calculation |
| G6 | What-if simulation | Simulator runs and **never** changes live data (tested) |
| G7 | Dynamic reallocation | A change triggers a new plan, a diff and a timeline entry |
| G8 | Human in control | Nothing becomes "approved" without an Administrator action |
| G9 | Role-based access | Backend rejects forbidden actions (tested) |
| G10 | Automated CI | GitHub Actions runs tests on every push |
| G11 | Cost | **Total spend = ₹0 / $0** |

### Non-goals (do not build in the MVP)

Real-time IoT, satellite imagery, real disaster feeds, SMS/paid notifications, paid map APIs, Kubernetes, multi-region deployment, reinforcement learning, SageMaker deployment, autonomous dispatch, real government integrations.

---

## 3. Constraints

| Constraint | Detail |
|---|---|
| Cost | 100% free. No credit card. No paid API. |
| Time | 3–5 day implementation window (see Section 15) |
| Team | College student project, beginner-friendly choices preferred |
| Data | Synthetic only. Must be labeled. |
| Maps | Leaflet + OpenStreetMap only |
| Demo | Must work reliably on demo day, even if a free service is asleep (see mock fallback, Section 5) |

---

## 4. Users and permissions

| Role | Main purpose |
|---|---|
| Administrator | Creates disasters, runs simulations, approves/rejects/modifies allocations, views audit logs, manages users |
| Field Officer | Submits area reports and resource requests, updates field conditions |
| Warehouse Manager | Updates inventory, confirms dispatch, views warehouse allocations |
| Viewer | Read-only dashboards |

### Permission matrix

| Action | Admin | Field Officer | Warehouse Mgr | Viewer |
|---|:-:|:-:|:-:|:-:|
| View dashboards, maps, charts | ✅ | ✅ | ✅ | ✅ |
| Create / edit / delete disaster | ✅ | ❌ | ❌ | ❌ |
| Create / update affected area | ✅ | ✅ | ❌ | ❌ |
| Create resource request | ✅ | ✅ | ❌ | ❌ |
| Update inventory / warehouse status | ✅ | ❌ | ✅ | ❌ |
| Run what-if simulation | ✅ | ❌ | ❌ | ❌ |
| Generate / recalculate recommendations | ✅ | ❌ | ❌ | ❌ |
| Approve / modify / reject allocation | ✅ | ❌ | ❌ | ❌ |
| Confirm dispatch of an approved allocation | ✅ | ❌ | ✅ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |

**Rule:** UI hides or disables forbidden controls, but the **backend is the real security boundary**. Every endpoint checks the role.

---

## 5. Tech stack and 100% free hosting

### 5.1 Chosen stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS | Fast, free, matches `SYSTEMDESIGN.md` |
| UI components | 21st.dev components (adapted) + shadcn-style primitives | Per `SYSTEMDESIGN.md` Section 8 |
| Charts | Recharts (area, radar), a Sankey library such as `d3-sankey` or Recharts Sankey | Free, open source |
| Map | Leaflet + OpenStreetMap tiles | No paid map API |
| Backend | Python + FastAPI | Simple, good for ML in the same language |
| Database | PostgreSQL (local Docker or free hosted Postgres) via SQLAlchemy | Data is relational |
| ML | pandas, NumPy, scikit-learn (RandomForestRegressor) | Free, runs locally |
| Auth | Own JWT auth with hashed passwords and seeded demo users | No paid auth service needed |
| CI | GitHub Actions | Free for student/public repos (check limits) |
| Source control | Git + GitHub | Free |
| Tests | pytest (backend), Vitest + React Testing Library (frontend) | Free |

### 5.2 Hosting options (comparison)

Free-tier rules change often and differ by account. **Before deploying, check each official page below.** Do not assume a limit from this document.

| Part | Option A (recommended) | Option B (safe fallback) | Official page to check |
|---|---|---|---|
| Frontend | Vercel Hobby, Netlify free, or GitHub Pages | Run locally for the demo | https://vercel.com/pricing · https://www.netlify.com/pricing/ · https://docs.github.com/en/pages |
| Backend | Render free web service | Run FastAPI locally for the demo | https://render.com/pricing |
| Database | Supabase free Postgres or Neon free Postgres (use only the connection string) | Local PostgreSQL in Docker | https://supabase.com/pricing · https://neon.tech/pricing |
| CI/CD | GitHub Actions | Manual deploy | https://docs.github.com/en/billing/managing-billing-for-github-actions |
| Storage (reports, model file) | Commit small files to the repo or use free DB storage | Local files | — |

Things to expect from free tiers, and how to handle them:

| Possible issue | Plan |
|---|---|
| Free backend sleeps when idle, first request is slow | Show a "Waking up server…" state. Call the health endpoint a few minutes before the demo. |
| Free database may pause when idle | Check it before the demo. Keep a local Docker Postgres as backup. |
| A free service changes its terms | Keep the app portable: only a `DATABASE_URL` and a few env vars differ between hosts. |

### 5.3 Mock-mode fallback (important)

The frontend must support `VITE_USE_MOCK=true`. In mock mode the API service layer returns local JSON seed data and runs the same priority, allocation and simulation logic in the browser (or returns fixed sample results). This guarantees a working demo even if the backend or database is down.

### 5.4 About AWS

The project documentation describes an AWS target architecture (VPC, API Gateway, Lambda, S3, RDS, SageMaker, CodePipeline, CloudWatch, IAM). For the **100% free** build:

| AWS service in the doc | In the free MVP |
|---|---|
| Lambda + API Gateway | Replaced by FastAPI on a free host. Keep Lambda-friendly code (stateless handlers) so it can move later. |
| RDS PostgreSQL | Replaced by local or free hosted PostgreSQL |
| S3 | Replaced by repo files or free DB storage |
| SageMaker | Replaced by local scikit-learn training |
| CodePipeline / CodeBuild | Replaced by GitHub Actions |
| CloudWatch | Replaced by app logs + `/health` endpoint + an in-app status indicator |
| IAM / VPC / Security Groups | Shown in an **architecture diagram and viva slide** as the production design. Not required to run. |

Optional: if the college requires real AWS usage, only use services confirmed free-tier eligible on the student's own account, and set a billing alert first. This is **not** part of the required MVP.

---

## 6. System architecture

```text
React (Vite) ── API service layer ── FastAPI ── PostgreSQL
                                        │
                                        ├── engines/priority.py
                                        ├── engines/allocation.py
                                        ├── engines/explain.py
                                        ├── engines/simulation.py
                                        ├── engines/reallocation.py
                                        └── ml/ (train.py, predict.py, model.joblib)
```

Principles:

- UI components never talk to the database. They call the API service layer.
- Engines are plain Python functions with no web or database code inside. They take data in and return results.
- The simulator calls the same engines on **copies** of data and never writes to live tables.
- Every important action writes an audit record.

---

## 7. Core logic (the heart of the product)

### 7.1 Priority score

All factors are normalized to **0–100**.

```text
Priority Score = 0.30 × Severity
               + 0.25 × Population Impact
               + 0.20 × Medical Urgency
               + 0.15 × Resource Shortage
               + 0.10 × Accessibility Need
```

Weights live in a config file so they can be changed and shown in the UI.

**How to get each factor (0–100):**

| Factor | Calculation |
|---|---|
| Severity | Field-reported severity 1–10 × 10 |
| Population Impact | `affected_population / max_population_in_this_disaster × 100` |
| Medical Urgency | Field-reported 0–100 |
| Resource Shortage | `100 − current_coverage_percent` for the requested resource (coverage = stock on hand in the area ÷ need) |
| Accessibility Need | Higher score when the area is **harder** to reach (so hard-to-reach areas are not ignored). Field-reported "accessibility" 0–100 where 100 = easiest; use `100 − accessibility` **or** keep the factor as reported. Pick one, document it in `docs/decisions.md`, and keep it consistent. |

**Priority levels:** 80–100 CRITICAL · 60–79 HIGH · 40–59 MEDIUM · below 40 LOW.

**Worked example (from the project doc):** Severity 95, Population 80, Medical 90, Shortage 85, Accessibility 70:

`0.30×95 + 0.25×80 + 0.20×90 + 0.15×85 + 0.10×70 = 28.5 + 20 + 18 + 12.75 + 7 = 86.25`

> ⚠️ The project PDF prints this result as **86.75**, but the correct sum is **86.25**. The unit test must use 86.25. See Section 17.

### 7.2 Demand prediction (ML)

| Item | Decision |
|---|---|
| Model | `RandomForestRegressor` (one model per resource, or multi-output) |
| Training data | **Synthetic** dataset made by `ml/generate_data.py` (formula + random noise). Clearly labeled synthetic. |
| Inputs | disaster_type, severity, affected_population, duration_days, medical_urgency, accessibility, region/type code, current_stock |
| Outputs | Predicted demand for food, water (litres), medicine, blankets over the chosen horizon (default 48h) |
| Uncertainty | Use the spread (standard deviation) of predictions across the forest's trees as a simple uncertainty band |
| Evaluation | Train/test split. Save MAE and R² to `model_meta.json`. Show them on the Prediction page. |
| Versioning | Save `model_version` (e.g. `rf-1.0.0`). Store it with every prediction. |
| Safety | Clip predictions to a sensible range (never negative). Show "Synthetic training data" badge. |

Predictions are **stored** (table `predictions`) so the UI can show trends and which model version was used.

### 7.3 Allocation engine (priority-ordered greedy)

```text
INPUT: open requests, warehouses, stock, reserve_percent, area priority scores
FOR each request, sorted by priority score (highest first):
    candidate_warehouses = warehouses that are
        - status = operational
        - able to reach the area (route not blocked)
        - have available stock of the resource
    sort candidates by distance to the area (haversine), nearest first
    needed = requested_quantity
    FOR each warehouse in candidates:
        available = stock − reserved − reserve_floor (reserve_percent × total stock)
        take = min(needed, available)
        if take > 0:
            create recommendation (warehouse → area, resource, take)
            reserve `take` in a working copy of stock
            needed −= take
        if needed == 0: break
    shortage = needed   (record it if > 0)
OUTPUT: recommendations + shortages + reserve kept
```

Rules:

- **Never** allocate more than available stock (a unit test must try to break this).
- Keep an **emergency reserve** (default 10%, configurable) so everything is not given out at once.
- Ties are broken by higher medical urgency, then older request time.
- If predicted demand is higher than the requested quantity, flag **"Request may be too low"** for the Administrator. Do not silently change the request.
- The engine works on a copy of stock. Stock only changes when a human approves.

### 7.4 Allocation lifecycle

```text
RECOMMENDED → PENDING_APPROVAL → APPROVED → DISPATCHED → COMPLETED
                      │
                      ├── MODIFIED (admin edited quantity or source, then approved)
                      ├── REJECTED
                      └── SUPERSEDED (replaced by a newer plan before approval)
```

- Reserved stock is held when an allocation is **approved**.
- Stock is deducted when it is **dispatched**.
- The UI must show each state with a different badge (per `SYSTEMDESIGN.md` Section 2.5).

### 7.5 Explanation engine

Every recommendation gets an explanation **generated from real values**. Never write invented reasons.

For each recommendation, return:

```json
{
  "priority_score": 89.95,
  "factor_contributions": [
    {"factor": "Severity", "value": 95, "weight": 0.30, "points": 28.5},
    {"factor": "Population Impact", "value": 88, "weight": 0.25, "points": 22.0},
    {"factor": "Medical Urgency", "value": 94, "weight": 0.20, "points": 18.8},
    {"factor": "Resource Shortage", "value": 91, "weight": 0.15, "points": 13.65},
    {"factor": "Accessibility", "value": 70, "weight": 0.10, "points": 7.0}
  ],
  "facts": [
    "2,500 people affected",
    "Medicine coverage is 18%",
    "Predicted demand is 31% higher than the latest request",
    "Warehouse B is the nearest operational source (12.4 km)"
  ],
  "recommendation": "250 medicine kits from Warehouse B",
  "warnings": ["Medicine stock will be below reserve after this allocation"]
}
```

Test rule: `sum(points) == priority_score` (within rounding).

### 7.6 What-if simulator

Inputs: disaster type, population, severity, duration, inventory overrides, medical urgency, accessibility.

Output:

| Resource | Predicted demand | Current stock | Coverage % | Shortage |
|---|---|---|---|---|

- Supports **Scenario A vs Scenario B** side by side (e.g. moderate vs severe).
- Saved in `simulation_runs` only. **Must not change** areas, requests, inventory or allocations.
- Includes a "what to do" hint: e.g. "Activate more warehouses or request external supply for: Medicine".
- Test: take a snapshot of all live tables, run a simulation, compare snapshots, they must be identical.

### 7.7 Dynamic reallocation

**Triggers:** (1) a field report changes an area's severity, urgency or accessibility, (2) a warehouse becomes inaccessible or its stock changes, (3) a new request arrives, (4) the Administrator presses **Recalculate**.

**Steps:**

```text
Detect change → recompute priorities → rerun allocation (only on unapproved/undispatched quantities)
→ diff old plan vs new plan → mark old as SUPERSEDED → create new recommendations
→ add timeline events → wait for human approval → audit log
```

Rules:

- Already **dispatched** quantities are never reallocated. Only pending quantities can change.
- The diff must show for each area: old quantity, new quantity, and the reason (e.g. "Warehouse A route blocked").
- The Reallocation Timeline shows: initial allocation → new report → route change → AI reallocation → approval.

---

## 8. Data model

Use PostgreSQL. Use UUID or integer primary keys, foreign keys with constraints, and `created_at` / `updated_at` on every table.

| Table | Key fields | Notes |
|---|---|---|
| `users` | id, name, email (unique), password_hash, role, created_at | role is one of the four roles |
| `disasters` | id, type, name, location, latitude, longitude, severity (1–10), start_time, status | status: planned / active / closed |
| `affected_areas` | id, disaster_id (FK), name, latitude, longitude, population, severity, medical_urgency, accessibility, trapped_people (optional), updated_at | for earthquake case study |
| `warehouses` | id, name, latitude, longitude, status | status: operational / degraded / inaccessible |
| `resources` | id, warehouse_id (FK), resource_type, unit, quantity, reserved_quantity | check: `reserved_quantity <= quantity` |
| `resource_requests` | id, area_id (FK), resource_type, requested_quantity, urgency, status, requested_by (FK) | status: open / planned / fulfilled / cancelled |
| `allocation_plans` | id, disaster_id (FK), version, created_at, created_by, reason, status | one plan per recalculation |
| `allocations` | id, plan_id (FK), request_id (FK), warehouse_id (FK), allocated_quantity, priority_score, status, explanation_json, approved_by (FK, nullable), approved_at | status per Section 7.4 |
| `predictions` | id, area_id (FK), resource_type, predicted_quantity, lower_bound, upper_bound, horizon_hours, model_version, created_at | |
| `simulation_runs` | id, scenario_inputs_json, predicted_demand_json, shortages_json, created_by, created_at | never touches live tables |
| `audit_logs` | id, user_id (nullable for system/AI), actor_type (user / system / ai), action, object_type, object_id, previous_value_json, new_value_json, timestamp | |
| `timeline_events` | id, disaster_id (FK), event_type, title, details, timestamp | feeds Reallocation Timeline |

Core relationship:

```text
Disaster ─┬─ Affected Areas ── Resource Requests ── Allocations ── Warehouses ── Resources
          └─ Allocation Plans ── Allocations
```

Audit record format: `user → action → object → timestamp → previous value → new value`.

---

## 9. API specification (REST, JSON)

Base path: `/api/v1`. All endpoints (except login and health) need a JWT. Return clear error JSON: `{ "error": "message", "code": "..." }`.

| Method | Path | Purpose | Roles |
|---|---|---|---|
| GET | `/health` | Health check (API, DB, model loaded) | public |
| POST | `/auth/login` | Login, returns JWT + role | public |
| GET | `/auth/me` | Current user | all |
| GET/POST | `/disasters` | List / create disaster | all / admin |
| GET/PATCH/DELETE | `/disasters/{id}` | Read / update / delete | all / admin / admin |
| GET/POST | `/disasters/{id}/areas` | List / add affected areas | all / admin, officer |
| PATCH | `/areas/{id}` | Update field conditions (triggers reallocation check) | admin, officer |
| GET/POST | `/requests` | List / create resource requests | all / admin, officer |
| GET | `/warehouses` | List warehouses with status | all |
| PATCH | `/warehouses/{id}` | Update status (e.g. inaccessible) | admin, warehouse |
| GET | `/inventory` | Stock and reserved per warehouse | all |
| PATCH | `/inventory/{id}` | Update quantity | admin, warehouse |
| GET | `/disasters/{id}/priorities` | Priority scores with factor breakdown | all |
| GET | `/disasters/{id}/predictions` | Predicted demand with bounds + model version | all |
| POST | `/disasters/{id}/recommendations` | Generate or recalculate a plan | admin |
| GET | `/allocations` | List allocations (filter by status/plan) | all |
| POST | `/allocations/{id}/approve` | Approve (optionally with modified quantity/source) | admin |
| POST | `/allocations/{id}/reject` | Reject with reason | admin |
| POST | `/allocations/{id}/dispatch` | Confirm dispatch | admin, warehouse |
| POST | `/simulations` | Run what-if (no live writes) | admin |
| GET | `/simulations` | List past runs | admin |
| GET | `/disasters/{id}/timeline` | Reallocation timeline events | all |
| GET | `/audit-logs` | Audit log (paginated, filterable) | admin |
| GET | `/model/info` | Model version, metrics, "synthetic" flag | all |

Pagination: `?page=1&page_size=20` on list endpoints. Sorting and filtering via query params.

---

## 10. Features and acceptance criteria

IDs match the project doc (FR-01 to FR-15). Tiers match `SYSTEMDESIGN.md` Section 31.

### Tier 1 — Must have

| ID | Feature | Acceptance criteria |
|---|---|---|
| FR-01 | Login + roles | 4 seeded demo users; wrong role gets 403 from the API |
| FR-02 | Disaster management | Admin can create, edit, close a disaster; list shows status badges |
| FR-03 | Affected areas | Table shows severity, population, urgency, accessibility, priority; officer can update |
| FR-04 | Resource requests | Officer can create; table supports sort, filter, search, pagination |
| FR-05 | Inventory + warehouses | Stock and reserved shown per warehouse; manager can update; `reserved ≤ quantity` enforced |
| FR-06 | Priority scoring | Score + factor breakdown match Section 7.1; radar chart shows factors |
| FR-07 | Demand prediction | Area chart with history, prediction, uncertainty band, critical limit; model version shown |
| FR-08 | Allocation recommendation | Plan generated per Section 7.3; never exceeds stock; shortages listed |
| FR-09 | AI explanation | Panel per recommendation with factor points that sum to the score |
| FR-10 | What-if simulation | Run button, Scenario A vs B, shortages; no live data change |
| FR-11 | Human approval | Approve / Modify / Reject controls; only admin; state badges |

### Tier 2 — Strongly recommended

| ID | Feature | Acceptance criteria |
|---|---|---|
| FR-12 | Dynamic reallocation | Blocking a warehouse or raising urgency produces a new plan, a diff, and timeline events |
| FR-13 | Audit logs | Every approval, edit, recalculation and inventory change is recorded with old and new values |
| T2-a | Allocation Sankey | Warehouse → area flows; updates after recalculation |
| T2-b | Disaster map | Leaflet markers with color + icon by priority; click opens info panel |
| T2-c | Reallocation timeline | Shows the 5-step story from Section 7.7 |
| FR-14 | Health/status | Top bar shows API, DB and AI engine status from `/health` |
| FR-15 | CI | GitHub Actions runs backend and frontend tests; fails when a test fails |

### Tier 3 — Future (do not build now)

Real-time IoT, satellite imagery, real disaster feeds, advanced optimization (linear programming), SMS, SageMaker, Kubernetes, multi-region.

---

## 11. UI requirements (summary — full detail in `SYSTEMDESIGN.md`)

### 11.1 Design tokens

| Role | Hex | Usage |
|---|---|---|
| Base background | `#0B0F19` | App background |
| Surface | `#1E293B` | Cards, panels, tables, sidebar |
| Primary text | `#E2E8F0` | Main text (avoid pure white) |
| Primary accent (Electric Cyan) | `#38BDF8` | Primary actions, active states, AI activity |
| Secondary accent (AI Blue) | `#60A5FA` | Charts, informational data |
| Warning (Neon Amber) | `#FBBF24` | Low stock, uncertainty, warnings |
| Critical (Coral Red) | `#F87171` | Critical incidents, severe shortages, blocked routes |
| Border | `rgba(148,163,184,0.12)` | Subtle borders |

Rules: UI stays mostly `#0B0F19` + `#1E293B` + `#E2E8F0`. Accent colors carry meaning, not decoration. Never color a whole card red. Never rely on color alone (add icon + text). Font: Inter, Geist or Plus Jakarta Sans. Radius: cards 12–16px, buttons 8–10px.

### 11.2 Layout and pages

Persistent dashboard shell with a top bar and a collapsible sidebar (drawer on mobile).

| Sidebar group | Pages |
|---|---|
| Command Center | Overview, Disasters, Affected Areas, Resource Requests |
| Resource Management | Inventory, Warehouses, Allocations |
| Intelligence | Demand Prediction, Priority Engine, What-If Simulator |
| System | Audit Logs, Settings |

### 11.3 Component map

| Area | Component |
|---|---|
| App shell | Dashboard with Collapsible Sidebar (21st.dev) |
| KPIs | Stats Bento: Active Disasters, Critical Areas, Resource Coverage, AI Confidence |
| Critical incident | Incident Report Large |
| Tables | Project Data Table (sort, filter, search, badges, pagination) |
| Demand | Area Chart with Glowing Dot Markers |
| Allocation | Allocation Sankey Chart |
| Priority | Radar Score Chart |
| History | Modern Timeline |
| Audit | Audit Log Table |
| AI | AI pipeline panel: Ingestion → Prediction → Priority → Optimization → Recommendation → Human Approval |
| Map | Leaflet + OpenStreetMap |

**Signature four:** Incident Report, Priority Radar, Allocation Sankey, Reallocation Timeline. They tell one story: *Incident → Priority → Allocation → Change → Reallocation.*

### 11.4 Every data component must handle

| State | Requirement |
|---|---|
| Loading | Skeleton loader |
| Empty | Helpful message + action button (e.g. "Create disaster") |
| Error | Explain what happened + Retry button |
| Success | Short confirmation |
| Stale | "Last updated 42 seconds ago". Do not pretend data is real-time. |

### 11.5 Accessibility and responsiveness

Keyboard navigation, visible focus, labels on inputs, alt text for icons, readable font sizes, accessible chart labels. Desktop first, but laptop, tablet and mobile must work (tables scroll or become cards; charts and maps must not overflow).

### 11.6 Animation

Allowed: 150–250ms transitions, KPI count-up, subtle marker pulse, timeline progress, AI-processing indicator, Sankey transitions. Not allowed: particles, constant glow, animated full-screen backgrounds, parallax.

---

## 12. Synthetic seed data (for demo and tests)

Label everything "Synthetic data". Seed script: `backend/seed.py` (idempotent).

**Disaster 1 — Flood (main demo):** "Vellore Flood" with 3 areas (matches project case study 1):

| Area | Population | Severity | Medical urgency |
|---|---|---|---|
| A | 2,000 | 9/10 | 9/10 |
| B | 5,000 | 6/10 | 5/10 |
| C | 3,000 | 8/10 | 8/10 |

Expected behavior: A and C rank above B even though B has more people.

**Disaster 2 — Earthquake (optional):** zones A/B/C with buildings damaged, people trapped, medical urgency; resources are rescue teams, ambulances and medicine kits; keep a small reserve.

**Disaster 3 — Cyclone (optional):** used only through the simulator to show proactive planning.

Also seed: 3 warehouses (A, B, C) with latitude/longitude, stock of food, water, medicine, blankets, some existing requests, 4 demo users (one per role), and about 6 months of synthetic history for the demand chart.

---

## 13. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Allocation and priority calls return in a few seconds on the free host; paginate big tables; lazy-load heavy pages; avoid thousands of map markers |
| Reliability | Inventory and allocations stay consistent: use database transactions when approving or dispatching |
| Security | JWT auth, hashed passwords, role checks on every endpoint, secrets only in environment variables (never in Git), CORS limited to the frontend URL, input validation (Pydantic) |
| Maintainability | Modular folders, typed code, small functions, docstrings for the engines |
| Observability | Structured logs, `/health`, model version stored per prediction, audit log |
| Cost | No paid services. Check the free-tier pages in Section 5.2 before deploying. |
| Honesty | "Synthetic data" badge; "Decision support, not an emergency authority" footer |

---

## 14. Testing and CI/CD

### 14.1 Required tests

| Category | Examples |
|---|---|
| Unit | Priority formula (use 86.25 example), shortage calculation, allocation never exceeds stock, reserve is respected, explanation points sum to score |
| API | Create disaster, create request, get inventory, approve allocation |
| Database | Foreign keys, `reserved ≤ quantity`, transaction rollback on failure |
| ML | Prediction is non-negative, feature schema matches, metrics file exists |
| Simulation | Snapshot of live tables is identical before and after a simulation |
| Security | Viewer cannot approve; warehouse manager cannot create disasters or manage users; no token gets 401 |
| Failure | Warehouse inaccessible, zero stock, invalid quantity, duplicate request |
| Reallocation | Blocking a warehouse creates a new plan; dispatched quantities do not change |
| Frontend | Components render loading, empty, error and data states; role-based buttons hidden |
| CI | Pipeline fails on a failing test and passes after the fix |

### 14.2 GitHub Actions (free)

`.github/workflows/ci.yml`:

1. Trigger on push and pull request.
2. Backend job: set up Python, install requirements, run `pytest`.
3. Frontend job: set up Node, `npm ci`, run lint, `vitest`, `npm run build`.
4. Optional deploy job after tests pass (frontend host often auto-deploys from GitHub).
5. Show a CI status badge in `README.md` and a "Build passing" indicator in the app (Tier 2).

### 14.3 MLOps (lightweight, free)

`generate_data.py` → `train.py` (split, train, evaluate) → save `model.joblib` + `model_meta.json` (version, MAE, R², trained_at, "synthetic") → loaded by the API at startup → `model_version` stored with each prediction. Retraining is one command.

---

## 15. Build plan (3–5 days)

| Day | Phase | Output | Check before moving on |
|---|---|---|---|
| 1 | Setup + UI shell | Repo, Vite + Tailwind, design tokens, sidebar + top bar, mock API layer, Dashboard with mock data, Stats Bento | App runs; colors match tokens; mock mode works |
| 2 | Backend + database | FastAPI, PostgreSQL schema, seed script, auth + roles, CRUD for disasters, areas, requests, inventory | pytest for CRUD and roles passes |
| 3 | Intelligence | Priority engine, allocation engine, explanation engine, synthetic data + ML training + prediction endpoint | Unit tests pass; flood demo ranks A and C above B |
| 4 | Advanced screens | Simulator, approval flow, reallocation + timeline, Sankey, radar, demand chart, map, audit log | Simulation does not change live data; approve updates stock correctly |
| 5 | Polish + deploy | CI, deploy to free hosts, health indicator, error/empty states, README, demo rehearsal, backup screen recording | Full demo script (Section 16) runs on the deployed site AND locally |

If time runs short on Day 5, cut in this order: GitHub Actions status in the UI → Sankey → map → timeline. **Never cut:** priority score, allocation, explanation, prediction, simulation, approval.

---

## 16. Demo script (what the professor should see)

1. Open the Command Center. Point out the KPIs and the "Synthetic data" badge.
2. Open the flood disaster. Show priorities. Click Area A: radar chart and factor points.
3. Show demand prediction with the uncertainty band and model version.
4. Click **Generate recommendation**. Show allocations, shortages and the Sankey chart.
5. Open an explanation panel: "this is calculated, not invented."
6. Log in as Viewer: show that Approve is not available. Switch to Admin and **Approve** one allocation.
7. Run the simulator: Flood, 10,000 people, severity 8, 5 days. Compare moderate vs severe. Show shortages. Prove nothing live changed.
8. Mark Warehouse A **inaccessible**. Show the new plan, the diff and the timeline.
9. Open the audit log: show who changed what, with old and new values.
10. Show the GitHub Actions run and the architecture slide (including the AWS production design).

---

## 17. Known inconsistencies in the source documents (resolved here)

| Where | Problem | Decision in this PRD |
|---|---|---|
| Project PDF, Section 17 | Worked example sums to 86.25 but PDF prints 86.75 | Use **86.25** |
| `SYSTEMDESIGN.md` Sections 15–16 | Example shows priority **91.4**, but its own factor points (28.5 + 22.0 + 18.8 + 13.65 + 7.0) add up to **about 89.95** | Never hard-code 91.4. Always compute. Mock data may use 89.95 |
| PDF vs design doc simulator tables | Different example numbers | Treat both as illustrations. Real numbers come from the model |
| PDF dashboard coverage 72% vs design doc 69% | Different mock values | Treat as mock values. Compute from inventory |
| PDF "Accessibility" factor | Unclear if high = easy or hard to reach | Documented choice in Section 7.1. Keep it consistent |

---

## 18. Risks, limitations, ethics

| Risk | Mitigation |
|---|---|
| Free host sleeps or pauses | Warm up before demo; mock mode; local backup; screen recording |
| Free-tier terms change | Check official pages in Section 5.2; keep the app portable |
| Predictions based on synthetic data | Label clearly; show model metrics; never claim real accuracy |
| Model or data bias | Show factors; human approval; document limitations |
| Over-trust in AI | Explanations from real factors; Approve/Modify/Reject always required |
| Security | Role checks in backend; secrets in env vars; this is a prototype and not production-hardened |
| Simulation gap | State that a college simulation cannot represent real emergencies |

**Footer text for the app:** "RESQ-CLOUD is a decision-support prototype using synthetic data. It is not a certified emergency-response system."

---

## 19. Definition of done

- [ ] All Tier 1 features work with the real backend and database
- [ ] Mock mode works with one environment variable
- [ ] All required tests in Section 14.1 pass locally and in GitHub Actions
- [ ] Allocation never exceeds stock; simulation never changes live data (both tested)
- [ ] Only admins can approve; backend enforces it (tested)
- [ ] Every explanation's factor points sum to its priority score (tested)
- [ ] Deployed on free hosting with no credit card and no spend
- [ ] README explains setup, env vars, seed, train, run, test, deploy
- [ ] Demo script (Section 16) rehearsed on the deployed site and locally
- [ ] "Synthetic data" labels and the decision-support footer are visible

---

## 20. Suggested repository structure

```text
resq-cloud/
├── PRD.md
├── SYSTEMDESIGN.md
├── README.md
├── docs/
│   └── decisions.md
├── .github/workflows/ci.yml
├── frontend/
│   ├── src/ (components, pages, services/api, hooks, utils, styles — see SYSTEMDESIGN.md §26)
│   └── .env.example            # VITE_API_URL, VITE_USE_MOCK
└── backend/
    ├── app/ (main.py, routers/, models/, schemas/, auth/, db.py)
    ├── engines/ (priority.py, allocation.py, explain.py, simulation.py, reallocation.py)
    ├── ml/ (generate_data.py, train.py, predict.py, model.joblib, model_meta.json)
    ├── seed.py
    ├── tests/
    ├── requirements.txt
    └── .env.example            # DATABASE_URL, JWT_SECRET, CORS_ORIGINS
```

---

*End of PRD.*
