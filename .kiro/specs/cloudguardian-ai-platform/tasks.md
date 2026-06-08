# Implementation Plan: CloudGuardian AI Platform

## Overview

This implementation plan covers the full CloudGuardian AI platform — a unified SaaS dashboard combining an AI Cloud CFO (financial intelligence) and an AI Incident Analyst (SRE diagnostics). The work is organized into 12 task groups executed across 6 waves, from project setup through bug fixes and stability. All tasks reference requirements in `requirements.md` and follow the architecture defined in `design.md`.

## Tasks

---

- [x] 1. Project Setup & Configuration
  - [x] 1.1 Initialise TanStack Start project with TypeScript and Tailwind CSS v4
  - [x] 1.2 Install and configure shadcn/ui component library (40+ components)
  - [x] 1.3 Configure `vite.config.ts` with `@lovable.dev/vite-tanstack-config`
  - [x] 1.4 Set up `tsconfig.json` with path alias `@/` pointing to `src/`
  - [x] 1.5 Create root route `__root.tsx` as document shell
  - [x] 1.6 Set up `src/router.tsx` with TanStack Query integration and scroll restoration
  - [x] 1.7 Initialise FastAPI backend with `uvicorn`, `pydantic`, `python-dotenv`
  - [x] 1.8 Create `backend/.env` and `backend/.env.example` with `GROQ_API_KEY` placeholder
  - [x] 1.9 Add `backend/.env` to `.gitignore`
  - [x] 1.10 Install Groq Python SDK (`groq==0.13.1`)

- [x] 2. Design System & App Shell
  - [x] 2.1 Define CSS custom properties in `src/styles.css` (colors, radii, gradients, shadows)
  - [x] 2.2 Implement global utility classes: `.card-surface`, `.glass`, `.grad-primary`, `.grad-text`, `.pill`, `.skeleton`
  - [x] 2.3 Define animation keyframes: `shimmer`, `fade-up`, `fade-in`, `pulse-ring`
  - [x] 2.4 Build `ui-kit.tsx` with `PageHeader`, `Card`, `Button`, `SectionTitle`, `StatusDot` components
  - [x] 2.5 Build SVG-based chart components: `AreaChart`, `BarsChart`, `DonutChart`, `Sparkline`
  - [x] 2.6 Build `KpiCard` with animated count-up hook using `requestAnimationFrame`
  - [x] 2.7 Build `AppShell` component with collapsible sidebar (252px → 76px transition) — Req 2.1, 2.2, 2.3
  - [x] 2.8 Implement sidebar active state detection using `useRouterState` — Req 2.4
  - [x] 2.9 Implement "Incident Analyst" nav badge showing hardcoded count 8 — Req 2.5
  - [x] 2.10 Build `TopNav` with org switcher, global search, bell icon, and user menu — Req 2.6
  - [x] 2.11 Wire unread notification count badge to `notificationsStore.getUnreadCount()` — Req 2.6
  - [x] 2.12 Create `_app.tsx` layout route wrapping all dashboard pages with `AppShell` — Req 2.1
  - [x] 2.13 Add `sonner` Toaster component to app shell with `position="top-right" richColors`

- [x] 3. Landing Page
  - [x] 3.1 Create `src/routes/index.tsx` with `LandingPage` component — Req 1.1
  - [x] 3.2 Build sticky navbar with scroll-opacity effect (transparent → opaque at 40px scroll) — Req 1.3
  - [x] 3.3 Implement hamburger menu for mobile with toggle state — Req 1.4, 1.5
  - [x] 3.4 Build hero section with badge, headline, CTA buttons, and terminal animation block — Req 1.1
  - [x] 3.5 Build stats strip (4 metric tiles with coloured values)
  - [x] 3.6 Build features grid (6 capability cards)
  - [x] 3.7 Build demo section with tab switcher ("Traffic Spike" / "Database Failure") and step-by-step panels — Req 1.6, 1.7
  - [x] 3.8 Build modules section (4 module cards with numbered titles and capability lists)
  - [x] 3.9 Build workflow section (vertical step chain)
  - [x] 3.10 Build tech stack grid (6 technology cards)
  - [x] 3.11 Build CTA section and footer — Req 1.2
  - [x] 3.12 Create `src/landing.css` with all landing-page-specific styles

- [x] 4. Executive Dashboard
  - [x] 4.1 Create `src/routes/_app.dashboard.tsx` — Req 3.1
  - [x] 4.2 Implement 4 KPI cards using `KpiCard` component (spend, forecast, incidents, savings) — Req 3.1, 3.2
  - [x] 4.3 Build cost trend section with `AreaChart`, time-range tab buttons, and 3-provider mini stats — Req 3.5
  - [x] 4.4 Build cost breakdown donut chart with legend — Req 3.5
  - [x] 4.5 Build monthly spending `BarsChart` — Req 3.5
  - [x] 4.6 Build service utilization progress bars (Compute, Storage, Database, CDN) — Req 3.5
  - [x] 4.7 Build AI CFO summary card with forecast narrative and 4 KPI tiles — Req 3.5
  - [x] 4.8 Build savings recommendations list with `SavingsRow` component — Req 3.5
  - [x] 4.9 Build active incidents list with `StatusDot` severity indicators — Req 3.5
  - [x] 4.10 Wire "Simulate Incident" button to `POST http://localhost:8000/api/notifications/simulate` — Req 3.3, 3.4

- [x] 5. AI Cloud CFO Frontend
  - [x] 5.1 Create `src/routes/_app.cfo.tsx` — Req 4.1
  - [x] 5.2 Build forecast insight card with `AreaChart` (12-month projection data) — Req 4.7
  - [x] 5.3 Build key forecast metrics card with 4 `Metric` items — Req 4.1
  - [x] 5.4 Build AI recommendations list with 3 ranked actions and "Apply" buttons — Req 4.1
  - [x] 5.5 Build chat interface with message history, input field, and send button — Req 4.1
  - [x] 5.6 Implement `handleSend` with `POST /api/cfo/chat` including loading state — Req 4.2, 4.3
  - [x] 5.7 Build `ChatBubble` component for user (right-aligned) and AI (left-aligned with bot icon) — Req 4.1
  - [x] 5.8 Handle API response: concatenate summary + recommendations + estimated_savings into chat message — Req 4.4
  - [x] 5.9 Handle API errors: display error text in AI bubble — Req 4.5
  - [x] 5.10 Pre-populate chat with one example Q&A exchange as initial state — Req 4.6

- [x] 6. AI Incident Analyst Frontend
  - [x] 6.1 Create `src/routes/_app.incidents.tsx` — Req 5.1
  - [x] 6.2 Define 5 incident objects with id, label, icon, severity, service, logs array — Req 5.1
  - [x] 6.3 Build 3-column layout using inline CSS grid (`20% 1fr 30%`) — Req 5.1
  - [x] 6.4 Build incident queue panel (Col 1) with clickable cards showing icon, label, service, severity dot — Req 5.1
  - [x] 6.5 Implement active incident selection state (primary highlight border) — Req 5.2, 5.3
  - [x] 6.6 Build log viewer panel (Col 2) with incident header, metadata row, and log table — Req 5.4
  - [x] 6.7 Implement log table with CSS grid columns: timestamp | level badge | message — Req 5.4
  - [x] 6.8 Implement log level colour coding: CRITICAL (red bold), ERROR (red), WARN (amber), INFO (green) — Req 5.4
  - [x] 6.9 Build "Analyze Incident" button with loading/disabled states — Req 5.5, 5.6
  - [x] 6.10 Implement `analyze()` async function with `AbortSignal.timeout(90_000)` — Req 5.5
  - [x] 6.11 Distinguish network errors from timeout errors in catch block — Req 5.8, 5.9
  - [x] 6.12 Build AI analysis panel (Col 3) with Groq branding header — Req 5.1
  - [x] 6.13 Build `AnalysisReport` component with severity card, confidence card, and 3 report blocks — Req 5.7
  - [x] 6.14 Implement confidence score colour logic (green ≥85%, amber ≥65%, red <65%) — Req 5.10
  - [x] 6.15 Build numbered recommended actions list with styled circle badges — Req 5.11
  - [x] 6.16 Build recovery time and affected services footer cards — Req 5.7
  - [x] 6.17 Build `EmptyState`, `ErrorState`, and `ReportSkeleton` components — Req 5.6, 5.7
  - [x] 6.18 Reset analysis state when a different incident is selected — Req 5.3

- [x] 7. Supporting Dashboard Pages
  - [x] 7.1 Create `_app.root-cause.tsx` with hardcoded INC-2941 investigation — Req 6.1
  - [x] 7.2 Build confidence ring SVG component with gradient stroke — Req 6.2
  - [x] 7.3 Build investigation timeline with 5 steps and AI pill badges — Req 6.4, 6.5
  - [x] 7.4 Build recommended actions list with "Run" buttons — Req 6.3
  - [x] 7.5 Create `_app.cost-analytics.tsx` with daily chart, provider donut, services table, sparklines — Req 7.1, 7.2
  - [x] 7.6 Create `_app.savings.tsx` with total savings banner, effort badges, sorted recommendations grid — Req 8.1, 8.2, 8.3, 8.4
  - [x] 7.7 Create `_app.notifications.tsx` with Email/Slack/Teams channel preview cards and notification history — Req 9.1, 9.2, 9.3, 9.4
  - [x] 7.8 Create `_app.reports.tsx` with report category cards, monthly summary, scheduled reports
  - [x] 7.9 Create `_app.settings.tsx` with 6-tab settings panel (Profile, Notifications, Org, Security, API, Theme)

- [x] 8. Real-time Notification System
  - [x] 8.1 Define `NotificationItem` interface in `notifications-store.ts` — Req 10.1
  - [x] 8.2 Implement module-level singleton store with in-memory array — Req 10.1
  - [x] 8.3 Implement `initWebSocket()` connecting to `ws://localhost:8000/ws/notifications` — Req 10.1, 2.7
  - [x] 8.4 Implement `ws.onmessage` handler: parse JSON → prepend to list → fire sonner toast → emit() — Req 10.2, 2.6
  - [x] 8.5 Implement 3-second auto-reconnect on WebSocket close — Req 2.8
  - [x] 8.6 Implement pub/sub with `subscribe(listener)` returning unsubscribe function — Req 2.6
  - [x] 8.7 Implement `markAsRead`, `markAllAsRead`, `clearAll`, `addNotification` methods
  - [x] 8.8 Auto-initialise WebSocket on module load (client-side guard: `typeof window !== "undefined"`) — Req 2.7
  - [x] 8.9 Implement FastAPI `ConnectionManager` class in `main.py` — Req 10.1
  - [x] 8.10 Create `POST /api/notifications/simulate` endpoint that broadcasts to all connections — Req 10.2
  - [x] 8.11 Create `WS /ws/notifications` endpoint using `ConnectionManager` — Req 10.1
  - [x] 8.12 Wire TopNav bell icon to `notificationsStore.subscribe()` via `useEffect` — Req 2.6

- [x] 9. Backend — AI Incident Analysis Endpoint
  - [x] 9.1 Define `IncidentAnalysisRequest` Pydantic model `{incident_type: str, logs: str}` — Req 11.1
  - [x] 9.2 Write `SYSTEM_PROMPT` constant (SRE persona, JSON-only instruction) — Req 11.1
  - [x] 9.3 Write `USER_PROMPT_TEMPLATE` with placeholders and explicit JSON schema — Req 11.1
  - [x] 9.4 Implement `_extract_json()` utility: strip markdown fences → `json.loads()` → fallback `{..}` scan — Req 11.6
  - [x] 9.5 Implement `POST /api/analyze-incident` endpoint with GROQ_API_KEY validation — Req 11.1, 11.3
  - [x] 9.6 Call Groq API with `model="llama-3.3-70b-versatile"`, `temperature=0.2`, `max_tokens=1024`, `response_format={"type":"json_object"}` — Req 11.1
  - [x] 9.7 Normalise response to 8 consistent camelCase keys — Req 11.2
  - [x] 9.8 Implement exception handling: 503 (no key), 401 (invalid key), 429 (rate limit), 502 (JSON parse), 500 (general) — Req 11.3, 11.4, 11.5

- [x] 10. Backend — AI CFO Module
  - [x] 10.1 Create `backend/models/pydantic_schemas.py` with `ChatRequest`, `ChatResponse`, `DashboardResponse`, `RecommendationResponse` — Req 12.4
  - [x] 10.2 Create `backend/data/mock_database.json` with 4 scenarios — Req 12.1
  - [x] 10.3 Create `backend/prompts/cfo_system_prompt.txt` with context placeholders and JSON output schema — Req 12.3
  - [x] 10.4 Create `backend/services/rules_engine.py` with `generate_recommendations()` function — Req 12.2
  - [x] 10.5 Implement rules: terminate idle Compute (<5% CPU), downsize Database (<20% CPU), delete unattached Storage — Req 12.2
  - [x] 10.6 Create `backend/services/ai_service.py` with `get_cfo_chat_response()` function — Req 12.3
  - [x] 10.7 Implement prompt template loading from disk and string replacement for spend and inefficiency values — Req 12.3
  - [x] 10.8 Call Groq API and return `ChatResponse(**parsed_json)` Pydantic model — Req 12.4
  - [x] 10.9 Implement error fallback: return `ChatResponse` with error in `summary` field on exception — Req 12.5
  - [x] 10.10 Create `backend/api/__init__.py` and `backend/api/routes_cfo.py` with `APIRouter` — Req 12.1
  - [x] 10.11 Implement `GET /dashboard`, `GET /recommendations`, `POST /chat` endpoints in CFO router — Req 12.6, 12.7
  - [x] 10.12 Register CFO router in `main.py` with prefix `/api/cfo` — Req 12.1

- [x] 11. Integration & Backend Fixes
  - [x] 11.1 Fix duplicate `load_dotenv()` call in `main.py` (merge conflict resolution)
  - [x] 11.2 Fix CORS: change `allow_credentials=True` to `allow_credentials=False` when `allow_origins=["*"]` — Req 11.7
  - [x] 11.3 Move CFO router import to after `app = FastAPI()` instantiation
  - [x] 11.4 Update `backend/requirements.txt` with all required packages and pinned versions
  - [x] 11.5 Verify all backend imports succeed: `routes_cfo`, `ai_service`, `rules_engine`, `pydantic_schemas`
  - [x] 11.6 Verify GROQ_API_KEY loads correctly from `.env` file via `python-dotenv`

- [x] 12. Bug Fixes & Stability
  - [x] 12.1 Migrate from Gemini API to Groq API — Req 11.1
  - [x] 12.2 Update frontend error handling to distinguish "backend not running" from "request timeout" — Req 5.8, 5.9
  - [x] 12.3 Update `AbortSignal.timeout` from 60s to 90s to accommodate Groq response time — Req 5.5
  - [x] 12.4 Update all frontend references from "Powered by Gemini" to "Powered by Groq · LLaMA 3.3 70B"
  - [x] 12.5 Fix error display panel to use `whitespace-pre-wrap` for multi-line error messages — Req 5.8
  - [x] 12.6 Update `recommendedActions` rendering from plain text to numbered list component — Req 5.11
  - [x] 12.7 Update `confidenceScore` parsing to handle both `"92%"` string and numeric `92` formats — Req 5.7
  - [x] 12.8 Verify all TypeScript diagnostics pass with zero errors on `_app.incidents.tsx`

## Notes

- All 12 tasks are complete. The platform is fully implemented and running.
- Backend runs on `http://localhost:8000` — start with `uvicorn main:app --reload --port 8000` from the `backend/` directory.
- Frontend runs on `http://localhost:8080` — start with `npm run dev` from the project root.
- `GROQ_API_KEY` must be present in `backend/.env` for the AI Incident Analyst and AI CFO chat features to function.
- `backend/services/prediction_logic.py` exists in the codebase but is not imported or used in any active flow.
- The `/root-cause` route is a static demonstration page — it does not call any backend API.
- No authentication system is implemented. All routes and API endpoints are publicly accessible.
- Mock cloud data is read from `backend/data/mock_database.json` on every request — no caching is applied.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "9", "10"]
    },
    {
      "wave": 2,
      "tasks": ["2", "8"]
    },
    {
      "wave": 3,
      "tasks": ["3", "4", "5", "6", "7"]
    },
    {
      "wave": 4,
      "tasks": ["11"]
    },
    {
      "wave": 5,
      "tasks": ["12"]
    }
  ]
}
```
