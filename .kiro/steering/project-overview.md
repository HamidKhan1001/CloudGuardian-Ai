---
inclusion: always
---

# CloudGuardian AI — Project Overview

## What This Project Is

CloudGuardian AI is an AI-powered cloud operations platform built for the **Ship With Kiro Hackathon**. It combines two AI modules into a single unified SaaS dashboard:

1. **AI Cloud CFO** — Financial intelligence: forecasts cloud spend, explains cost drivers, recommends optimizations via natural-language chat
2. **AI Incident Analyst** — SRE intelligence: ingests structured logs, diagnoses root causes, generates remediation plans

## Architecture at a Glance

- **Frontend:** React 19 + TanStack Start (SSR) + TanStack Router (file-based) + Tailwind CSS v4
- **Backend:** Python FastAPI on port 8000
- **AI:** Groq API — `llama-3.3-70b-versatile` model, `response_format: json_object` enforced on all LLM calls
- **Real-time:** WebSocket at `ws://localhost:8000/ws/notifications`
- **Storage:** No database — mock data in `backend/data/mock_database.json`, frontend state in React `useState`

## Running the Project

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev   →   http://localhost:8080
```

## Key File Locations

| What | Where |
|---|---|
| Frontend routes | `src/routes/_app.*.tsx` |
| App shell (sidebar + nav) | `src/components/app-shell.tsx` |
| UI primitives + charts | `src/components/ui-kit.tsx` |
| Notification store (WebSocket) | `src/lib/notifications-store.ts` |
| FastAPI entry point | `backend/main.py` |
| Incident analysis endpoint | `backend/main.py` → `POST /api/analyze-incident` |
| CFO API router | `backend/api/routes_cfo.py` |
| Groq AI service | `backend/services/ai_service.py` |
| Cost rules engine | `backend/services/rules_engine.py` |
| CFO system prompt | `backend/prompts/cfo_system_prompt.txt` |
| Mock cloud data | `backend/data/mock_database.json` |
| API key config | `backend/.env` (gitignored) |

## Design System Tokens

Defined in `src/styles.css` as CSS custom properties:

- `--primary: #4F46E5` (indigo — actions, active states)
- `--accent: #8B5CF6` (violet — AI features)
- `--danger: #EF4444` · `--warning: #F59E0B` · `--success: #22C55E` · `--info: #3B82F6`
- `--card: #151D31` · `--bg: #0B1020`
- Key classes: `.card-surface`, `.glass`, `.grad-primary`, `.grad-text`, `.pill`, `.skeleton`

## Conventions

- All API calls from frontend use hardcoded base `http://localhost:8000`
- Groq calls always use `temperature: 0.2` and `response_format: {"type": "json_object"}`
- Route files are self-contained — no shared data-fetching hooks
- No authentication system — all routes and endpoints are public
