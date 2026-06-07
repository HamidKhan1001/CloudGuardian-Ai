# ⛨ CloudGuardian AI

> **AI-Powered Cloud Operations Platform** — Cost forecasting, incident analysis, and intelligent recommendations in one unified console.

---

## Project Overview

CloudGuardian AI is a full-stack cloud operations intelligence platform that gives engineering and finance teams a single pane of glass over their cloud infrastructure. It combines two core AI engines:

- **AI Cloud CFO** — monitors cloud usage, forecasts monthly bills, explains cost drivers in plain language, and surfaces actionable savings recommendations.
- **AI Incident Analyst** — accepts raw infrastructure log streams, runs them through a Groq-powered LLM (LLaMA 3.3 70B), and returns a structured diagnosis: root cause, severity, business impact, and a ranked recovery plan.

Real-time alerts are pushed to operators via a WebSocket channel and delivered to Email, Slack, and Microsoft Teams simultaneously.

---

## Problem Statement

Cloud infrastructure costs and incidents are hard to manage at scale:

- Monthly bills arrive as surprises — teams don't know *why* costs spiked until after the invoice.
- Incident diagnosis is slow and manual — engineers sift through thousands of log lines trying to find the root cause.
- Alerts are fragmented — different tools send notifications to different channels with no consistency.

Teams end up reacting instead of preventing, and finance teams have no visibility into cloud spending until it's too late.

---

## Solution

CloudGuardian AI automates both financial oversight and incident response:

1. A **financial forecasting engine** tracks real-time spend across AWS, GCP, and Azure, predicts end-of-month bills, and generates prioritized savings recommendations.
2. An **AI incident analyst** takes any infrastructure log dump, sends it to Groq's LLaMA 3.3 70B model, and returns a structured JSON diagnosis in seconds — no manual log parsing required.
3. A **real-time notification system** broadcasts structured alerts over WebSocket and delivers them to Email, Slack, and Microsoft Teams using rich, pre-built templates.
4. A **unified dashboard** consolidates costs, incidents, utilization, and optimization history in one interface.

---

## Goals of the Project

- Reduce mean time to root cause (MTTR) from hours to seconds using AI-driven log analysis.
- Give cloud teams proactive cost forecasts before bills arrive, not after.
- Surface savings opportunities with exact dollar estimates and effort levels.
- Deliver consistent, structured alerts across every communication channel a team uses.
- Provide an executive-ready reporting layer for cost, incident, and optimization data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TanStack Router, TanStack Start, TypeScript, Tailwind CSS v4 |
| **UI Components** | Radix UI primitives, shadcn/ui, Recharts, Lucide React |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI / LLM** | Groq API — LLaMA 3.3 70B Versatile |
| **Real-time** | WebSocket (FastAPI native + browser WebSocket API) |
| **State / Notifications** | In-memory store with pub/sub pattern, Sonner toast library |
| **Forms & Validation** | React Hook Form, Zod |
| **Build Tools** | Vite 7, `@lovable.dev/vite-tanstack-config` |
| **Linting / Formatting** | ESLint 9, Prettier |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React / TanStack)         │
│                                                      │
│  Landing Page → Dashboard → AI CFO → Cost Analytics  │
│  Savings Center → Incident Analyst → Root Cause      │
│  Notifications → Reports → Settings                  │
│                        │                             │
│          REST + WebSocket (localhost:8000)           │
└────────────────────────┼────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               FastAPI Backend (Python)               │
│                                                      │
│  POST /api/analyze-incident  ──►  Groq API           │
│  POST /api/notifications/simulate                    │
│  WS   /ws/notifications  ──────►  broadcast          │
│  GET  /  (health check)                             │
└─────────────────────────────────────────────────────┘
```

**Frontend** — TanStack Router handles file-based routing. Each page is a self-contained route component. The notifications store is a lightweight in-memory pub/sub that syncs with the top-nav badge counter and surfaces Sonner toasts on WebSocket messages.

**Backend** — FastAPI serves three routes. The incident analysis route proxies log data to the Groq API, strips markdown from the LLM response, and returns a normalised JSON object. The notifications simulate route broadcasts a JSON payload to every connected WebSocket client. The WebSocket endpoint manages a connection pool with auto-cleanup on disconnect.

**AI Layer** — The Groq client sends a structured system prompt plus the raw log text to `llama-3.3-70b-versatile`. The response is forced to JSON format via `response_format: json_object` and then normalised before being returned to the frontend.

**No persistent database** — the current implementation uses in-memory state for notifications and mock data for cost/incident metrics. All data resets on page reload.

---

## Features

### AI Cloud CFO
- Displays a 12-month cost forecast trending to $18,500/month.
- Plain-language explanation of cost drivers (e.g., EU traffic surge + RDS autoscale misconfiguration).
- Three ranked savings recommendations with exact monthly savings figures.
- Interactive "Ask the CFO" chat interface with pre-populated Q&A.

### Cost Analytics
- Daily spend area chart across all connected providers.
- Provider mix donut chart (AWS, GCP, Azure with dollar breakdowns).
- Monthly spend bar chart (trailing 12 months).
- Top services table with spend, delta, and sparkline trend per service.
- Export and filter controls.

### Savings Center
- Six AI-generated recommendations (Remove Idle Servers, Spot Instances, RDS right-sizing, S3 Glacier lifecycle, NAT Gateway optimisation, Savings Plan commit).
- Each recommendation shows effort level (Easy / Medium / Hard), monthly savings, and a one-click Review button.
- Aggregate total: **$6,120/month** in potential savings shown in a summary banner.

### Incident Analyst *(Live AI integration)*
- Three-panel layout: Incident Queue → Log Viewer → AI Report.
- Five pre-loaded incident scenarios: Database Credential Failure, Traffic Spike, Memory Leak, Storage Full, API Service Down.
- Each scenario has 10 real-world log entries with timestamps and log levels (CRITICAL / ERROR / WARN / INFO).
- "Analyze Incident" sends logs to the backend → Groq → returns structured report with: root cause, severity, confidence score, business impact, recommended actions (numbered steps), affected services, and estimated recovery time.

### Root Cause Analysis
- Static detailed view of the "Database Connection Failure" RCA.
- 96% AI confidence ring visualisation.
- Investigation timeline showing Detection → Signal Analysis → Root Cause Discovery → Recommendation Generation → Resolution.
- One-click remediation actions: Rotate Credentials, Restart Database Service, Verify Access Policies.

### Notification Center
- Live previews of alert templates for Email, Slack, and Microsoft Teams.
- Recent notifications list with severity colour coding and delivery channel labels.
- "Send Test Alert" action.

### Real-time Notifications (WebSocket)
- Backend broadcasts notification JSON to all connected clients.
- Frontend auto-reconnects every 3 seconds on disconnect.
- Incoming notifications surface as Sonner toasts and increment the top-nav badge counter.
- "Simulate Incident" button on the dashboard fires a test notification through the backend.

### Reports Dashboard
- Four report categories: Cost Reports, Incident Reports, Optimisation Reports, Executive Reports.
- Monthly executive summary with KPIs (Total Spend, Incidents, MTTR, Savings Realised).
- Scheduled reports list (weekly digest, monthly brief, postmortem, quarterly review).
- Cost vs Incidents bar chart.

### Settings
- Profile, Notifications, Organisation, Security, API Keys, and Theme tabs.
- Notification preference toggles.
- Connected cloud accounts display (AWS 12 accounts, GCP 3 projects, Azure 2 subscriptions).
- API key management (reveal / rotate).
- Theme selection panel.

### Landing Page
- Full marketing page with hero, stats, feature grid, live demo tabs (Traffic Spike / Database Failure), architecture modules section, tech stack grid, and CTA.
- Responsive navbar with mobile hamburger menu.

---

## API Documentation

The backend exposes four endpoints at `http://localhost:8000`.

---

### `GET /`
**Health check**

Returns the running status of the backend.

**Response**
```json
{
  "status": "running",
  "message": "CloudGuardian-Ai Backend is live!"
}
```

---

### `POST /api/analyze-incident`
**AI incident analysis via Groq / LLaMA 3.3 70B**

Accepts an incident type and raw log text, sends them to the Groq API, and returns a structured diagnosis.

**Request body**
```json
{
  "incident_type": "Database Credential Failure",
  "logs": "[03:12:01] ERROR Authentication failed for user 'app_user'\n[03:12:08] CRITICAL /api/health returning 503"
}
```

**Success response** (`200`)
```json
{
  "status": "ok",
  "analysis": {
    "incidentType": "Database Credential Failure",
    "rootCause": "IAM role missing GetSecretValue permission after credential rotation",
    "severity": "Critical",
    "confidenceScore": "94%",
    "businessImpact": "All database connections rejected — checkout service fully down",
    "recommendedActions": [
      "Step 1: Rotate the IAM credentials for svc-checkout-prod",
      "Step 2: Update the dependent services with the new secret",
      "Step 3: Verify /api/health returns 200",
      "Step 4: Add automated rotation monitoring"
    ],
    "affected_services": ["prod-rds-us-east", "checkout-svc"],
    "estimated_recovery_time": "15-30 minutes"
  }
}
```

**Error responses**
| Code | Reason |
|---|---|
| `503` | `GROQ_API_KEY` not configured |
| `401` | Invalid API key |
| `429` | Groq rate limit hit (free tier: 14,400 req/day) |
| `502` | LLM returned unparseable JSON |
| `500` | Unexpected server error |

---

### `POST /api/notifications/simulate`
**Broadcast a notification to all connected WebSocket clients**

Used by the Dashboard "Simulate Incident" button to push a test notification.

**Request body**
```json
{
  "type": "critical",
  "title": "Database Connection Failure",
  "message": "prod-rds-us-east scaled and is rejecting connection bursts.",
  "service": "prod-rds-us-east"
}
```
`type` must be one of: `critical`, `warning`, `info`, `success`.

**Response**
```json
{
  "status": "ok",
  "broadcasted": true
}
```

---

### `WS /ws/notifications`
**Real-time notification stream (WebSocket)**

Connect from the browser to receive live notification events. The server broadcasts a `NotificationItem` JSON object to all connected clients whenever `/api/notifications/simulate` is called.

**Broadcast message shape**
```json
{
  "id": "notif-backend-1718000000000",
  "type": "critical",
  "title": "Database Connection Failure",
  "message": "prod-rds-us-east is rejecting connection bursts.",
  "service": "prod-rds-us-east",
  "time": "Just now",
  "read": false
}
```

The frontend auto-reconnects on disconnect with a 3-second delay.

---

## Database Documentation

CloudGuardian AI **does not use a persistent database** in the current implementation. All data is held in memory.

| Data | Storage mechanism |
|---|---|
| Notifications | `notificationsStore` — a module-level JavaScript array with subscribe/emit pub/sub |
| Cost metrics & KPIs | Hardcoded arrays in route components (used for chart rendering) |
| Incident log scenarios | Static constant array `INCIDENTS` in the Incident Analyst route |
| Savings recommendations | Static array `recs` in the Savings Center route |
| Settings / profile | UI state only (`useState`), not persisted |

**How notifications flow:**
1. A WebSocket message arrives or `notificationsStore.addNotification()` is called.
2. The new item is prepended to the in-memory `notificationsList` array.
3. All registered listeners are notified via `emit()`.
4. The top-nav badge re-renders with the new unread count.
5. A Sonner toast fires automatically based on notification type.

To add persistence, the `notificationsStore` pattern is ready to be backed by a MongoDB collection or any REST API — replace the array operations with async fetch calls.

---

## User Manual

### 1. Open the app

Navigate to `http://localhost:3000` (or the Vite dev server port shown in your terminal). The landing page loads first.

### 2. Launch the console

Click **Launch Dashboard →** in the hero or navbar. You land on the **Executive Dashboard**.

### 3. Review the dashboard

- The top KPI row shows: Current Cloud Spend, Predicted Monthly Bill, Active Incidents, and Potential Savings.
- The **Cost Trend** area chart shows 30-day spend. Use the `1D / 7D / 30D / 90D / 1Y` buttons to change the window.
- The **AI Cloud CFO** card summarises the forecast. Click **View Plan** to go to the full CFO page.

### 4. Use the AI Cloud CFO

Go to **AI Cloud CFO** in the sidebar.

- Read the forecast insight and the 12-month projection chart.
- Review the three ranked recommendations. Click **Apply** on any to act.
- Type a question in the **Ask the CFO** chat input (e.g. *"Why did our DB costs spike last week?"*).

### 5. Explore cost data

Go to **Cost Analytics** to drill into daily spend, provider mix, monthly trends, and a per-service table with sparklines and delta indicators.

### 6. Review savings opportunities

Go to **Savings Center** to see all six AI-recommended optimisations ranked by monthly savings. Click **Review** on any item or use **Apply All Easy Wins** to action the low-effort items.

### 7. Analyse an incident with AI

Go to **Incident Analyst**.

1. Select an incident from the **Incident Queue** on the left (e.g. *Database Credential Failure*).
2. The middle panel shows the raw system logs with timestamps and log levels colour-coded.
3. Click **Analyze Incident**. The system sends the logs to the backend and Groq API.
4. The right panel populates with: Root Cause, Business Impact, Recommended Actions, Estimated Recovery Time, and Affected Services.

> The backend must be running and `GROQ_API_KEY` must be configured for this step to work.

### 8. View root cause details

Go to **Root Cause Analysis** for a detailed step-by-step AI investigation trace of the database connection failure, including confidence score and one-click remediation buttons.

### 9. Test real-time notifications

Click **Simulate Incident** on the dashboard toolbar. A WebSocket message is dispatched through the backend and a critical toast notification appears in the bottom-right corner. The bell icon in the top nav updates its unread badge.

### 10. Check the Notification Center

Go to **Notifications** to see live previews of Email, Slack, and Microsoft Teams alert templates, plus the recent notification history.

### 11. Generate reports

Go to **Reports** to browse report categories, view the monthly executive summary, and see the schedule of automated reports.

### 12. Adjust settings

Go to **Settings** to manage your profile, notification preferences, organisation details, security options (2FA, SSO, session timeout), API keys, and theme.

---

## Testing Summary

**Backend (manual)**
- FastAPI health check `GET /` verified returns `{"status": "running"}`.
- `POST /api/analyze-incident` tested with all five incident log scenarios (Database Credential Failure, Traffic Spike, Memory Leak, Storage Full, API Service Down) — each returns a valid structured JSON analysis from Groq.
- Error handling verified: missing API key returns `503`, invalid key returns `401`, rate limit returns `429`.
- WebSocket `/ws/notifications` verified: frontend connects, `POST /api/notifications/simulate` broadcasts to all clients, toast fires and badge updates.

**Frontend (manual)**
- All nine sidebar routes rendered and verified: Dashboard, AI CFO, Cost Analytics, Savings Center, Incident Analyst, Root Cause, Notifications, Reports, Settings.
- Incident Analyst three-panel layout tested with each of the five incident scenarios.
- "Simulate Incident" button fires backend call and triggers toast notification.
- Sidebar collapse/expand toggle verified.
- Mobile navigation hamburger menu on landing page verified.
- WebSocket auto-reconnect verified on backend restart.

**No automated test suite** is configured in this version.

---

## How to Run the Project

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- A free **Groq API key** — get one at [console.groq.com/keys](https://console.groq.com/keys)

---

### Frontend

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app is available at `http://localhost:3000` (or the port Vite prints in the terminal).

Other scripts:

```bash
npm run build       # Production build
npm run preview     # Preview the production build
npm run lint        # ESLint
npm run format      # Prettier
```

---

### Backend

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Create your environment file
copy .env.example .env       # Windows CMD
# cp .env.example .env       # macOS / Linux

# 4. Add your Groq API key to .env
# GROQ_API_KEY=gsk_your_key_here

# 5. Start the server
uvicorn main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the auto-generated Swagger UI.

> The AI Incident Analyst feature requires the backend to be running with a valid `GROQ_API_KEY`. All other frontend pages work without the backend.

---

## 👤 Author

This project was independently developed by Hasher Mustafa Siddiqui as part of the **Ship With Kiro Hackathon**.

---

*Built for the **Ship With Kiro Hackathon**.*