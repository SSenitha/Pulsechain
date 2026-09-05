# Graph Report - .  (2026-09-05)

## Corpus Check
- Corpus is ~37,070 words - fits in a single context window. You may not need a graph.

## Summary
- 332 nodes · 766 edges · 45 communities (37 shown, 8 thin omitted)
- Extraction: 47% EXTRACTED · 53% INFERRED · 0% AMBIGUOUS · INFERRED: 406 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Toast Notifications|UI Toast Notifications]]
- [[_COMMUNITY_FastAPI Fleet & Telemetry Routes|FastAPI Fleet & Telemetry Routes]]
- [[_COMMUNITY_Frontend API Services|Frontend API Services]]
- [[_COMMUNITY_Data Schemas & Payloads|Data Schemas & Payloads]]
- [[_COMMUNITY_FastAPI Fleet & Telemetry Routes|FastAPI Fleet & Telemetry Routes]]
- [[_COMMUNITY_React State Context|React State Context]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_TypeScript Build Config|TypeScript Build Config]]
- [[_COMMUNITY_UI Toast Notifications|UI Toast Notifications]]
- [[_COMMUNITY_React Error Boundaries|React Error Boundaries]]
- [[_COMMUNITY_UI Toast Notifications|UI Toast Notifications]]
- [[_COMMUNITY_Cold-Chain System Architecture|Cold-Chain System Architecture]]
- [[_COMMUNITY_Linter Config|Linter Config]]
- [[_COMMUNITY_Mock Fleet Data|Mock Fleet Data]]
- [[_COMMUNITY_Status Badges UI|Status Badges UI]]
- [[_COMMUNITY_Analytics() Module|Analytics() Module]]
- [[_COMMUNITY_LiveClock.tsx Module|LiveClock.tsx Module]]
- [[_COMMUNITY_SearchBox.tsx Module|SearchBox.tsx Module]]
- [[_COMMUNITY_SectionTitle.tsx Module|SectionTitle.tsx Module]]
- [[_COMMUNITY_files Module|files Module]]
- [[_COMMUNITY_Button.tsx Module|Button.tsx Module]]
- [[_COMMUNITY_KpiCard.tsx Module|KpiCard.tsx Module]]
- [[_COMMUNITY_tooltip.tsx Module|tooltip.tsx Module]]

## God Nodes (most connected - your core abstractions)
1. `Session` - 37 edges
2. `UserSchema` - 31 edges
3. `str` - 29 edges
4. `DBUser` - 29 edges
5. `DBAssignment` - 28 edges
6. `DBTelemetry` - 28 edges
7. `datetime` - 27 edges
8. `DBLogin` - 27 edges
9. `DBTruck` - 25 edges
10. `DBPackage` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Telemetry Ingestion Spec` --conceptually_related_to--> `PulseChain Platform`  [EXTRACTED]
  API.md → README.md
- `str` --uses--> `DBAssignment`  [INFERRED]
  backend/app/main.py → backend/app/models/models.py
- `str` --uses--> `DBLogin`  [INFERRED]
  backend/app/main.py → backend/app/models/models.py
- `str` --uses--> `DBPackage`  [INFERRED]
  backend/app/main.py → backend/app/models/models.py
- `str` --uses--> `DBTelemetry`  [INFERRED]
  backend/app/main.py → backend/app/models/models.py

## Communities (45 total, 8 thin omitted)

### Community 0 - "UI Toast Notifications"
Cohesion: 0.05
Nodes (42): dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-toast, @radix-ui/react-tooltip, react, react-dom (+34 more)

### Community 1 - "FastAPI Fleet & Telemetry Routes"
Cohesion: 0.22
Nodes (28): get_fleet_overview(), get_packages(), get_truck_telemetry(), get_users(), ingest_telemetry(), track_package_public(), int, Session (+20 more)

### Community 2 - "Frontend API Services"
Cohesion: 0.12
Nodes (20): apiClient(), FetchOptions, authService, LoginPayload, RegisterPayload, fleetService, RegisterTruckPayload, AssignPackagePayload (+12 more)

### Community 3 - "Data Schemas & Payloads"
Cohesion: 0.52
Nodes (25): TruckRegisterRequest, int, TelemetryIngestPayload, BaseModel, datetime, PackageAssignRequest, PackageCreateRequest, PackageAssignRequest (+17 more)

### Community 4 - "FastAPI Fleet & Telemetry Routes"
Cohesion: 0.21
Nodes (21): assign_package(), create_package(), delete_user(), deliver_package(), format_relative_time(), get_analytics_overview(), get_fleet_overview(), get_packages() (+13 more)

### Community 5 - "React State Context"
Cohesion: 0.09
Nodes (11): Admin(), AppContext, ContextValue, useApp(), UserSession, Shell(), Login(), Operations() (+3 more)

### Community 6 - "TypeScript App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+13 more)

### Community 7 - "TypeScript Build Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 8 - "UI Toast Notifications"
Cohesion: 0.15
Nodes (15): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+7 more)

### Community 9 - "React Error Boundaries"
Cohesion: 0.22
Nodes (5): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, ErrorFallbackProps, toError()

### Community 10 - "UI Toast Notifications"
Cohesion: 0.20
Nodes (9): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+1 more)

### Community 11 - "Cold-Chain System Architecture"
Cohesion: 0.33
Nodes (6): Cold-Chain Monitoring, Predictive ML Engine (TensorFlow), PulseChain Platform, Wi-Fi SSID Localization, Tamper & Door Detection, Telemetry Ingestion Spec

### Community 12 - "Linter Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 13 - "Mock Fleet Data"
Cohesion: 0.40
Nodes (4): initialPackages, initialTrucks, initialUsers, truckIds

### Community 14 - "Status Badges UI"
Cohesion: 0.60
Nodes (4): label(), StatusBadge(), StatusBadgeProps, tone()

## Knowledge Gaps
- **128 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `FastAPI Fleet & Telemetry Routes` to `FastAPI Fleet & Telemetry Routes`, `Data Schemas & Payloads`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `datetime` connect `Data Schemas & Payloads` to `FastAPI Fleet & Telemetry Routes`, `FastAPI Fleet & Telemetry Routes`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `Session` (e.g. with `DBAssignment` and `DBLogin`) actually correct?**
  _`Session` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `UserSchema` (e.g. with `get_users()` and `invite_user()`) actually correct?**
  _`UserSchema` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `str` (e.g. with `DBAssignment` and `DBLogin`) actually correct?**
  _`str` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `DBUser` (e.g. with `invite_user()` and `login_user()`) actually correct?**
  _`DBUser` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `DBAssignment` (e.g. with `assign_package()` and `deliver_package()`) actually correct?**
  _`DBAssignment` has 26 INFERRED edges - model-reasoned connections that need verification._