# Anomaly Detector

A full-stack security operations platform for detecting, investigating, and managing endpoint behavioural anomalies across a corporate network.

![Dashboard Overview](screenshots/02-dashboard-overview.png)

---

## What it does

Endpoint agents continuously collect process execution and network connection telemetry. The backend establishes a statistical baseline per entity (process × user) and scores new observations using Z-score analysis. Analysts use the dashboard to triage alerts, hunt for threats across multiple detection strategies, and investigate lateral movement via an interactive network graph.

---

## Feature Walkthrough

### Dashboard — 5 analytical tabs

**Overview** — live KPIs (events ingested, entity count, outlier rate, agent health) with an activity heatmap and top-process breakdown.

![Dashboard Overview](screenshots/02-dashboard-overview.png)

**Alert Analytics** — severity timeline (Critical / High / Medium / Low), backlog status donut, Z-score distribution histogram, and alert-age breakdown.

![Alert Analytics](screenshots/03-dashboard-alert-analytics.png)

**Processing** — full pipeline funnel showing event-to-stat-to-alert conversion rates, new-key discovery trend, and correlated process → network → file behavioural chains.

![Processing](screenshots/04-dashboard-processing.png)

**Entity Monitoring** — per-entity baseline initialisation status, bucket coverage, and drift over time.

![Entity Monitoring](screenshots/05-dashboard-entity-monitoring.png)

**Operations** — suppression trends, noise analysis, and data-quality metrics for pipeline health.

![Operations](screenshots/06-dashboard-operations.png)

---

### Alerts

Ranked alert queue with Z-score, event count, user, host, and process. Supports read/unread status, multi-field filtering, and one-click drill-through to investigation context.

![Alerts](screenshots/07-alerts.png)

---

### Investigations (vHunt)

Multi-strategy threat-hunting views running in parallel — new signals seen in the last day, spikes in the last hour, processes not seen in the last 3 days, and rare parent→child process relationships. Each view exposes the full process execution chain (agent, user, host, process, parent, command line).

![Investigations](screenshots/11-vhunt-investigations.png)

---

### Network Graph

Interactive force-directed graph of host-to-host communication. Edges are labelled by protocol (HTTP, SSH, RPC, LDAP). Filterable by date range, connection type, protocol, process, minimum connection count, and host. Colour-coded by node type (internal / external / managed).

![Network Graph](screenshots/12-network-graph.png)

---

### Entities

Behavioural baseline registry. Every unique process × user combination tracked across buckets — initialisation state, last-seen, and bucket count visible at a glance.

![Entities](screenshots/08-entities.png)

---

### Anomalies & Dumps

Raw anomaly scores and process memory dump listings for deep forensic investigation.

| Anomalies | Dumps |
|-----------|-------|
| ![Anomalies](screenshots/09-anomalies.png) | ![Dumps](screenshots/10-dumps.png) |

---

### Administration

**Settings** — webhook (host, port, credentials) and syslog integration, auto-lock security policy.

![Settings](screenshots/14-settings.png)

**Configurations** — tunable detection thresholds and pipeline parameters.

![Configurations](screenshots/15-configurations.png)

**User Management & Groups** — local user accounts with role-based access, Azure AD group sync for admin privilege mapping.

| Users | Groups |
|-------|--------|
| ![User Management](screenshots/16-user-management.png) | ![Groups](screenshots/17-groups.png) |

**Exclude Rule Manager** — suppression rules to reduce noise from known-good behaviour.

![Exclude Rules](screenshots/18-exclude-rules.png)

**Network & CMDB Management** — managed host registry and asset inventory with bulk-upsert support.

| Network Management | CMDB |
|--------------------|------|
| ![Network Management](screenshots/19-network-management.png) | ![CMDB](screenshots/20-cmdb-management.png) |

---

## Architecture

```mermaid
graph TD
    Agents["Endpoint Agents\n(process + network telemetry)"]
    API["ASP.NET Core 8 API\n(JWT · Azure AD · Rate limiting)"]
    DB[("SQL Server\n(EF Core)")]
    AzureAD["Azure AD\n(MSAL SSO)"]
    UI["React 18 UI\n(Vite · TypeScript)"]
    Webhook["Webhook / Syslog\n(alert forwarding)"]

    Agents -->|telemetry ingest| API
    UI -->|REST + JWT| API
    UI -->|OAuth2 login| AzureAD
    AzureAD -->|token validation| API
    API -->|EF Core queries| DB
    API -->|alert forwarding| Webhook
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 · C# |
| ORM | Entity Framework Core 9 · SQL Server |
| Auth | JWT Bearer · Microsoft Identity Web (Azure AD SSO) |
| Password hashing | Argon2 |
| Rate limiting | ASP.NET Core built-in sliding window |
| Frontend | React 18 · TypeScript · Vite |
| State / data fetching | Custom hooks |
| Charts | Recharts |
| Network graph | React Force Graph |
| Testing | Vitest · React Testing Library |
| CI | GitHub Actions |

---

## Setup

### Prerequisites
- .NET 8 SDK
- SQL Server (Express or Developer)
- Node.js 18+
- Azure AD app registration (for SSO — optional for local dev with local auth)

### Backend
```bash
cd backend/AnomalyDetectionDashboard
cp appsettings.example.json appsettings.json
# Fill in: connection string, JWT secret, Azure AD tenant/client IDs
dotnet restore && dotnet run
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Fill in: VITE_API_BASE_URL, VITE_MSAL_CLIENT_ID, VITE_MSAL_AUTHORITY
npm install && npm run dev
```
