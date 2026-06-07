# Design: CloudGuardian AI Platform

## Overview

CloudGuardian AI is a modular monolith consisting of a React/TanStack SSR frontend and a Python FastAPI backend, communicating over REST HTTP and WebSocket. The system uses the Groq inference API (LLaMA 3.3 70B) for two distinct AI workloads: cloud financial analysis (CFO) and infrastructure incident diagnosis (Incident Analyst).

The architecture prioritizes developer velocity and demo fidelity over production scalability — appropriate for a hackathon context. The AI layer uses `response_format: json_object` on all LLM calls to guarantee structured output without regex parsing brittleness.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Client                           │
│                                                                 │
│  ┌────────────┐  ┌──────────────────────────────────────────┐  │
│  │  Landing   │  │           Dashboard App Shell            │  │
│  │   Page     │  │  ┌────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  /index    │  │  │ Sidebar│  │  TopNav  │  │  Pages  │  │  │
│  └────────────┘  │  └────────┘  └──────────┘  └─────────┘  │  │
│                  └──────────────────────────────────────────┘  │
│                                                                 │
│  notificationsStore (module singleton)                          │
│  ├── WebSocket client → ws://localhost:8000/ws/notifications    │
│  ├── In-memory list []                                          │
│  └── Pub/sub listeners (Set)                                    │
└─────────────────────────────────────────────────────────────────┘
                          │ HTTP REST + WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend  :8000                        │
│                                                                 │
│  main.py                                                        │
│  ├── CORS middleware (allow_origins=["*"])                       │
│  ├── ConnectionManager (WebSocket pool)                         │
│  ├── POST /api/analyze-incident  ──────────────┐               │
│  ├── POST /api/notifications/simulate           │               │
│  ├── WS  /ws/notifications                      │               │
│  └── CFO Router (/api/cfo/*)                    │               │
│       ├── GET  /dashboard                       │               │
│       ├── GET  /recommendations                 │               │
│       └── POST /chat  ──────────────────────────┤              │
│                                                 ▼               │
│  services/                              Groq API                │
│  ├── ai_service.py  ────────────────► llama-3.3-70b-versatile  │
│  └── rules_engine.py (deterministic)                            │
│                                                                 │
│  data/mock_database.json  (4 scenarios, read-only)             │
│  prompts/cfo_system_prompt.txt                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Framework & Routing

- **TanStack Start** (SSR meta-framework built on Vite + TanStack Router)
- **File-based routing** — route files in `src/routes/` auto-generate `routeTree.gen.ts`
- **Route layout hierarchy:**
  ```
  __root.tsx          (HTML document shell)
  ├── index.tsx        (Landing page — no shell)
  └── _app.tsx         (AppShell wrapper — all dashboard routes)
      ├── _app.dashboard.tsx
      ├── _app.cfo.tsx
      ├── _app.incidents.tsx
      ├── _app.root-cause.tsx
      ├── _app.cost-analytics.tsx
      ├── _app.savings.tsx
      ├── _app.notifications.tsx
      ├── _app.reports.tsx
      └── _app.settings.tsx
  ```

### State Management

No global state library. Three patterns used:

| Pattern | Used For | Files |
|---|---|---|
| `useState` (local) | Page-level UI state, form inputs, selected incident, analysis result | All route components |
| Module singleton | Notification list, WebSocket connection, unread count | `notifications-store.ts` |
| Pub/sub (`Set<listener>`) | Subscribing TopNav to notification count changes | `notifications-store.ts` |

### Design System

CSS custom properties defined in `:root` in `styles.css`:

```css
--bg: #0B1020          /* page background */
--card: #151D31        /* card surface */
--primary: #4F46E5     /* indigo — actions, active states */
--accent: #8B5CF6      /* violet — AI features */
--success: #22C55E
--warning: #F59E0B
--danger: #EF4444
--info: #3B82F6
--muted-foreground: #94A3B8
```

Utility classes: `.card-surface`, `.glass`, `.grad-primary`, `.grad-text`, `.pill`, `.skeleton`

Custom chart components in `ui-kit.tsx`: `AreaChart`, `BarsChart`, `DonutChart`, `Sparkline` — all built on raw SVG, no chart library dependency.

### Component Hierarchy

```
AppShell
├── <aside> Sidebar (252px / 76px collapsed)
│   ├── Logo + brand
│   ├── nav[] — Link items with active detection
│   └── Collapse button
└── <div> Main content area
    ├── TopNav (sticky, h-16)
    │   ├── Org switcher
    │   ├── Global search input
    │   └── Bell (unread count badge) + User menu
    └── <main> (px-8 py-8 max-w-[1600px])
        └── <Outlet /> — current route component
```

---

## Backend Architecture

### FastAPI Application Structure

```
backend/
├── main.py                    # App factory, middleware, routes, incident endpoint
├── api/
│   └── routes_cfo.py          # APIRouter with 3 CFO endpoints
├── services/
│   ├── ai_service.py          # Groq client, prompt assembly, response parsing
│   ├── rules_engine.py        # Deterministic cost rules
│   └── prediction_logic.py    # Present but not imported in active flow
├── models/
│   └── pydantic_schemas.py    # ChatRequest, ChatResponse, DashboardResponse, RecommendationResponse
├── prompts/
│   └── cfo_system_prompt.txt  # System prompt template with ${} placeholders
└── data/
    └── mock_database.json     # Scenarios: default, traffic_spike, db_oversizing, unexpected_cost_surge
```

### Request Lifecycle — Incident Analysis

```
POST /api/analyze-incident
{incident_type: str, logs: str}
         │
         ▼
1. Validate GROQ_API_KEY (env var)
         │
         ▼
2. Build SYSTEM_PROMPT (hardcoded SRE persona)
   Build USER_PROMPT (incident_type + logs injected)
         │
         ▼
3. Groq API call
   model = "llama-3.3-70b-versatile"
   temperature = 0.2
   max_tokens = 1024
   response_format = {"type": "json_object"}
         │
         ▼
4. _extract_json(raw_text)
   → strip ```json fences
   → json.loads()
   → fallback: scan for {..} block
         │
         ▼
5. Normalise to 8 consistent keys
         │
         ▼
6. Return {"status": "ok", "analysis": {...}}
```

### Request Lifecycle — CFO Chat

```
POST /api/cfo/chat
{query: str, scenario: str}
         │
         ▼
1. get_mock_data(scenario)
   → open data/mock_database.json
   → return scenario dict
         │
         ▼
2. rules_engine.generate_recommendations(resources)
   → FOR each resource:
     Compute + cpu_util < 5% → "Terminate idle {id}"
     Database + cpu_util < 20% → "Downsize RDS {id}"
     Storage + unattached → "Delete EBS {id}"
         │
         ▼
3. ai_service.get_cfo_chat_response(query, data, recs)
   → Load prompts/cfo_system_prompt.txt
   → Replace ${current_spend}, ${predicted_spend}, {inefficiencies}
   → Groq API call (same model, response_format=json_object)
   → json.loads() → ChatResponse(**parsed)
         │
         ▼
4. Return ChatResponse
   {summary, identified_issues, recommendations,
    estimated_savings, risk_level}
```

### WebSocket Architecture

```
ConnectionManager (in-memory)
├── active_connections: list[WebSocket]
├── connect(ws)   → ws.accept(), append to list
├── disconnect(ws) → remove from list
└── broadcast(msg) → for each ws: ws.send_text(json)
                      on failure: disconnect(ws)

Client (notificationsStore)
├── new WebSocket("ws://localhost:8000/ws/notifications")
├── onmessage → parse JSON → prepend to list → toast → emit()
├── onclose   → ws = null → setTimeout(reconnect, 3000)
└── subscribe(listener) → returns unsubscribe fn
```

---

## AI Integration Design

### Model Selection

Both AI features use `llama-3.3-70b-versatile` via Groq. This model is:
- Available on the Groq free tier (14,400 req/day)
- Capable of reliable structured JSON output
- Fast enough for real-time UX (~1s inference)

### Structured Output Strategy

All Groq calls use `response_format: {"type": "json_object"}` which forces the model to output only valid JSON. This eliminates the need for complex parsing logic. The `_extract_json()` utility in `main.py` provides a fallback layer for edge cases where fences slip through.

### Prompt Design

**Incident Analyst prompt:**
- System: SRE persona, instructs JSON-only output
- User: incident type + raw log string, exact JSON schema specified with field descriptions and constraints (severity enum, confidenceScore as "%")

**CFO prompt (`cfo_system_prompt.txt`):**
- Context injection: `${current_spend}`, `${predicted_spend}`, `{inefficiencies}`
- Explicit JSON schema in the prompt with example values
- Risk level enumeration: Low/Medium/High
- Instruction: "Do not add anything before or after the JSON"

---

## Data Design

### Mock Database Schema (`mock_database.json`)

```typescript
interface Scenario {
  current_cloud_spend: number;       // Current month-to-date spend ($)
  predicted_monthly_bill: number;    // AI-forecasted end-of-month bill ($)
  potential_savings: number;         // Total identifiable savings ($)
  resources: Resource[];
  daily_costs: DailyCost[];
}

interface Resource {
  id: string;          // e.g. "ec2-001", "rds-primary"
  type: "Compute" | "Database" | "Storage" | "Network";
  cost: number;        // Monthly cost ($)
  status: "running" | "unattached" | "active";
  cpu_util?: number;   // CPU utilization percentage (0-100)
  size_gb?: number;    // For storage resources
  traffic_gb?: number; // For network resources
}

interface DailyCost {
  date: string;   // "YYYY-MM-DD"
  cost: number;   // Daily spend ($)
}
```

**4 Scenarios:**

| Scenario | spend | predicted | savings | Use case |
|---|---|---|---|---|
| `default` | $12,450 | $18,200 | $3,150 | Normal operations |
| `traffic_spike` | $16,500 | $25,000 | $500 | Sudden traffic surge |
| `db_oversizing` | $15,200 | $15,200 | $2,400 | Idle DB resources |
| `unexpected_cost_surge` | $18,900 | $28,000 | $4,500 | Multiple waste sources |

### Pydantic Schemas

```python
class ChatRequest(BaseModel):
    query: str
    scenario: Optional[str] = "default"

class ChatResponse(BaseModel):
    summary: str
    identified_issues: List[str]
    recommendations: List[str]
    estimated_savings: float
    risk_level: str

class DashboardResponse(BaseModel):
    current_spend: float
    predicted_spend: float
    potential_savings: float

class RecommendationResponse(BaseModel):
    recommendations: List[str]
    total_savings: float
```

---

## API Contract

### Incident Analysis

**Request:**
```http
POST /api/analyze-incident
Content-Type: application/json

{
  "incident_type": "Database Credential Failure",
  "logs": "[03:12:01] ERROR [rds-proxy] Authentication failed..."
}
```

**Response (200):**
```json
{
  "status": "ok",
  "analysis": {
    "incidentType": "Database Credential Failure",
    "rootCause": "...",
    "severity": "Critical",
    "confidenceScore": "94%",
    "businessImpact": "...",
    "recommendedActions": ["Step 1...", "Step 2..."],
    "affected_services": ["prod-rds-us-east-1"],
    "estimated_recovery_time": "15-30 minutes"
  }
}
```

**Error responses:**
- `503` — GROQ_API_KEY not configured
- `401` — Invalid API key
- `429` — Rate limit exceeded
- `502` — JSON parse failure
- `500` — General AI error

### CFO Chat

**Request:**
```http
POST /api/cfo/chat
Content-Type: application/json

{ "query": "Why did our costs spike?", "scenario": "default" }
```

**Response (200):**
```json
{
  "summary": "...",
  "identified_issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Action 1", "Action 2"],
  "estimated_savings": 1500.00,
  "risk_level": "Low"
}
```

### Notification Simulation

**Request:**
```http
POST /api/notifications/simulate
Content-Type: application/json

{
  "type": "critical",
  "title": "Database Connection Failure",
  "message": "prod-rds-us-east is rejecting connections.",
  "service": "prod-rds-us-east"
}
```

**Response (200):**
```json
{ "status": "ok", "broadcasted": true }
```

---

## Security Considerations

| Area | Current State | Notes |
|---|---|---|
| Authentication | Not implemented | No login, no tokens, no route guards |
| Authorization | Not implemented | All API endpoints publicly accessible |
| CORS | `allow_origins=["*"]` | Appropriate for local dev/demo |
| API Key Storage | `.env` file, gitignored | `.env.example` provided as template |
| Input Validation | Pydantic on backend | Frontend sends raw user input |

---

## Deployment Architecture (Current)

```
Developer Machine
├── Terminal 1: cd backend && uvicorn main:app --reload --port 8000
└── Terminal 2: npm run dev  →  http://localhost:8080
```

Frontend references backend at `http://localhost:8000` — hardcoded in all route components that make API calls.

---

## Known Limitations

1. **`prediction_logic.py`** exists in `services/` but is not imported or called anywhere in the active codebase.
2. **Frontend API base URL** is hardcoded as `http://localhost:8000` in three route files — not driven by environment config.
3. **`cfo_system_prompt.txt`** is loaded from disk on every request — not cached in memory.
4. **Root Cause Analysis page** (`/root-cause`) is fully static — it does not call any backend API.
5. **No persistent storage** — all notification and chat history is lost on page refresh.
6. **Mock data only** — no integration with real AWS, GCP, or Azure cost APIs.
