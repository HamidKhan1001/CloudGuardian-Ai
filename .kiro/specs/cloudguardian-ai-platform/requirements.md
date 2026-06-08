# Requirements: CloudGuardian AI Platform

## Introduction

CloudGuardian AI is an intelligent cloud operations platform that combines two AI-powered modules — an AI Cloud CFO for financial intelligence and an AI Incident Analyst for infrastructure diagnostics — into a single unified SaaS dashboard. The platform enables engineering and finance teams to proactively manage cloud costs, detect incidents, and receive actionable AI-generated recommendations in real time.

## Glossary

| Term | Definition |
|---|---|
| AI Cloud CFO | The financial intelligence module that forecasts cloud spend, explains cost drivers, and recommends optimizations |
| AI Incident Analyst | The SRE module that ingests logs, diagnoses root causes, and recommends remediation steps |
| Root Cause Analysis (RCA) | The process of identifying the fundamental reason an incident occurred |
| Groq API | The LLM inference API used to run LLaMA 3.3 70B for AI analysis |
| Rules Engine | Deterministic logic layer that generates cost recommendations without LLM involvement |
| Scenario | A named mock cloud environment (default, traffic_spike, db_oversizing, unexpected_cost_surge) |
| Notification | A real-time alert broadcast via WebSocket to all connected dashboard clients |

---

### Requirement 1: Landing Page & Navigation

**User Story:** As a visitor, I want to see a professional landing page that explains the platform's capabilities, so that I can understand what CloudGuardian AI does before launching the dashboard.

#### Acceptance Criteria

1. WHEN a user visits `/`, THEN the system SHALL display a landing page with hero section, feature cards, demo tabs, module overview, tech stack section, and call-to-action.
2. WHEN a user clicks "Launch Dashboard" or "Launch Console", THEN the system SHALL navigate to `/dashboard`.
3. WHEN a user scrolls the navbar, THEN the navbar SHALL increase background opacity after 40px of scroll.
4. WHERE the viewport is mobile-sized, THEN the system SHALL display a hamburger menu that toggles a mobile navigation panel.
5. IF the user clicks a nav link in the mobile menu, THEN the mobile menu SHALL close automatically.
6. WHEN the page loads, THEN the demo section SHALL display the "Traffic Spike" scenario tab by default.
7. IF the user clicks the "Database Failure" tab, THEN the system SHALL switch the demo panel to the database failure scenario.

---

### Requirement 2: App Shell Layout

**User Story:** As an authenticated user, I want a persistent sidebar and top navigation bar across all dashboard pages, so that I can navigate the platform efficiently.

#### Acceptance Criteria

1. WHEN a user is on any dashboard route (`/_app/*`), THEN the system SHALL render the `AppShell` with a sidebar and top navigation.
2. WHEN the sidebar is expanded, THEN it SHALL display at 252px width with logo, navigation items, and user section.
3. WHEN a user clicks the "Collapse" button, THEN the sidebar SHALL animate to 76px width showing only icons.
4. WHEN a navigation item matches the current route, THEN it SHALL display with active styles including a gradient left-border indicator.
5. WHEN the "Incident Analyst" nav item is active, THEN it SHALL display a red badge showing the number 8.
6. WHEN the unread notification count changes via WebSocket, THEN the bell icon in the top nav SHALL update its red dot indicator.
7. WHEN the page loads, THEN the notifications WebSocket connection SHALL be established at `ws://localhost:8000/ws/notifications`.
8. IF the WebSocket connection closes, THEN the system SHALL attempt reconnection after 3 seconds.

---

### Requirement 3: Executive Dashboard

**User Story:** As a platform administrator, I want an executive dashboard showing key cost and incident metrics at a glance, so that I can monitor overall cloud health without navigating individual modules.

#### Acceptance Criteria

1. WHEN a user navigates to `/dashboard`, THEN the system SHALL display four KPI cards: Current Cloud Spend, Predicted Monthly Bill, Active Incidents, and Potential Savings.
2. WHEN displayed, THEN KPI values SHALL animate from 0 to their target value using a cubic-ease count-up animation over 900ms.
3. WHEN a user clicks "Simulate Incident", THEN the system SHALL POST to `http://localhost:8000/api/notifications/simulate` with a critical database incident payload.
4. WHEN a simulate request succeeds, THEN a toast notification SHALL appear via the WebSocket broadcast.
5. WHEN the dashboard renders, THEN it SHALL display a cost trend area chart, monthly bars chart, provider donut chart, service utilization progress bars, AI CFO summary section, savings recommendations, and active incidents list.
6. WHEN a user clicks "Ask AI CFO", THEN the system SHALL navigate to `/cfo`.
7. WHEN a user clicks "Open analyst" in the incidents section, THEN the system SHALL navigate to `/incidents`.

---

### Requirement 4: AI Cloud CFO

**User Story:** As a cloud finance manager, I want to ask natural-language questions about my cloud spend and receive structured AI-generated financial analysis, so that I can make informed cost optimization decisions.

#### Acceptance Criteria

1. WHEN a user navigates to `/cfo`, THEN the system SHALL display a forecast insight card, key forecast metrics, AI recommendations list, and a chat interface.
2. WHEN a user types a message and presses Enter or clicks Send, THEN the system SHALL POST `{query, scenario}` to `http://localhost:8000/api/cfo/chat`.
3. WHILE the API request is in flight, THEN the system SHALL display a "Thinking..." loading bubble and disable the send button.
4. WHEN the API responds successfully, THEN the system SHALL append the AI response as a chat bubble containing the summary, recommendations list, and estimated savings.
5. IF the API call fails, THEN the system SHALL append an error message bubble describing the failure.
6. WHEN the chat renders, THEN it SHALL display a pre-populated example exchange (user question + AI response) as initial state.
7. WHEN the component mounts, THEN an area chart SHALL display 12-month cost forecast data.

---

### Requirement 5: AI Incident Analyst

**User Story:** As a site reliability engineer, I want to select a cloud incident, review its structured logs, and trigger an AI-powered root cause analysis, so that I can diagnose and remediate incidents faster.

#### Acceptance Criteria

1. WHEN a user navigates to `/incidents`, THEN the system SHALL display a 3-column layout: incident queue, log viewer, and AI analysis panel.
2. WHEN the page loads, THEN the first incident ("Database Credential Failure") SHALL be selected by default.
3. WHEN a user clicks an incident in the queue, THEN the log viewer SHALL update to show that incident's logs and the analysis panel SHALL reset to empty state.
4. WHEN logs are displayed, THEN each log entry SHALL appear as a separate row with timestamp, level badge (CRIT/ERR/WARN/INFO), and message columns.
5. WHEN a user clicks "Analyze Incident", THEN the system SHALL POST `{incident_type, logs}` to `http://localhost:8000/api/analyze-incident`.
6. WHILE analysis is running, THEN the system SHALL display a skeleton loading state in the AI panel and show "Analyzing…" in the button.
7. WHEN analysis completes successfully, THEN the system SHALL display structured cards for: Severity, Confidence Score, Root Cause, Business Impact, Recommended Actions, Estimated Recovery Time, and Affected Services.
8. IF the backend is unreachable, THEN the system SHALL display a specific error message instructing the user to start the backend with the exact uvicorn command.
9. IF the request times out (90 seconds), THEN the system SHALL display a timeout-specific error message.
10. WHEN confidence score is >= 85%, THEN the score bar SHALL render in green; >= 65% in amber; below 65% in red.
11. WHEN recommended actions are displayed, THEN each action SHALL be rendered as a numbered list item with a styled circle badge.

---

### Requirement 6: Root Cause Analysis Page

**User Story:** As an SRE, I want to see a detailed AI investigation timeline for an active critical incident, so that I can understand exactly how the root cause was identified.

#### Acceptance Criteria

1. WHEN a user navigates to `/root-cause`, THEN the system SHALL display a hardcoded critical incident: "Database Connection Failure" for `prod-rds-us-east` (INC-2941).
2. WHEN rendered, THEN the page SHALL display a confidence ring showing 96% AI confidence.
3. WHEN rendered, THEN the AI reasoning text SHALL explain the expired IAM token root cause with specific timestamps and service names.
4. WHEN rendered, THEN the investigation timeline SHALL show 5 steps: Detection, Signal Analysis, Root Cause Discovery, Recommendation Generation, and Resolution (pending).
5. WHEN rendered, THEN steps completed by AI SHALL be labeled with an "AI" pill badge.

---

### Requirement 7: Cost Analytics

**User Story:** As a cloud engineer, I want to view detailed multi-cloud spending breakdowns and trends, so that I can identify which services are driving cost growth.

#### Acceptance Criteria

1. WHEN a user navigates to `/cost-analytics`, THEN the system SHALL display a daily spend area chart, provider mix donut chart, monthly bars chart, and a top-services table.
2. WHEN the services table renders, THEN each row SHALL display service name, spend amount, percentage change, and a sparkline trend chart.
3. WHEN a percentage change is positive, THEN it SHALL display in warning (amber) or danger (red) color.
4. WHEN a percentage change is negative (cost reduction), THEN it SHALL display in success (green) color.

---

### Requirement 8: Savings Center

**User Story:** As a platform administrator, I want to see all AI-recommended cost optimizations ranked by monthly impact, so that I can prioritize and apply the highest-value changes first.

#### Acceptance Criteria

1. WHEN a user navigates to `/savings`, THEN the system SHALL display a total savings banner with the sum of all recommendation savings.
2. WHEN rendered, THEN savings recommendations SHALL be sorted by monthly savings value (descending).
3. WHEN rendered, THEN each recommendation SHALL display an effort badge: Easy (green), Medium (amber), or Hard (red).
4. WHEN the total banner renders, THEN it SHALL also display the projected annual savings (monthly × 12) and a count breakdown by effort level.

---

### Requirement 9: Notification Center

**User Story:** As a team lead, I want to see all recent notifications and previews of how they appear across channels, so that I can verify the platform is keeping my team informed.

#### Acceptance Criteria

1. WHEN a user navigates to `/notifications`, THEN the system SHALL display channel preview cards for Email, Slack, and Microsoft Teams.
2. WHEN rendered, THEN each channel card SHALL show a mock notification formatted in that channel's visual style.
3. WHEN rendered, THEN all channel cards SHALL display a "Connected" status badge.
4. WHEN rendered, THEN a recent notifications table SHALL display the last 4 notifications with type, title, context, delivery channel, and timestamp.

---

### Requirement 10: Backend — Notification WebSocket

**User Story:** As a frontend client, I want to receive real-time incident and cost notifications via WebSocket, so that alerts appear instantly without polling.

#### Acceptance Criteria

1. WHEN a client connects to `ws://localhost:8000/ws/notifications`, THEN the server SHALL accept the connection and add it to the active connections pool.
2. WHEN a POST request is made to `/api/notifications/simulate`, THEN the server SHALL broadcast the notification object to all active WebSocket connections.
3. WHEN a client disconnects, THEN the server SHALL remove it from the active connections pool without crashing other connections.
4. IF broadcasting to a connection fails, THEN the server SHALL catch the exception and remove that connection without affecting others.

---

### Requirement 11: Backend — AI Incident Analysis Endpoint

**User Story:** As the incident analyst frontend, I want to submit logs to the backend and receive a structured AI diagnosis, so that I can display root cause analysis to the user.

#### Acceptance Criteria

1. WHEN `POST /api/analyze-incident` is called with `{incident_type, logs}`, THEN the server SHALL call the Groq API with `llama-3.3-70b-versatile` model.
2. WHEN Groq responds, THEN the server SHALL extract and normalise the JSON to keys: `incidentType`, `rootCause`, `severity`, `confidenceScore`, `businessImpact`, `recommendedActions`, `affected_services`, `estimated_recovery_time`.
3. IF `GROQ_API_KEY` is missing or equals the placeholder value, THEN the server SHALL return HTTP 503 with a descriptive error message including the setup instructions.
4. IF the Groq API returns a 429 rate limit error, THEN the server SHALL return HTTP 429 with a message explaining the free tier limits.
5. IF the Groq API key is invalid, THEN the server SHALL return HTTP 401 with a message linking to the API key console.
6. WHEN Groq returns markdown-wrapped JSON, THEN the server SHALL strip code fences before parsing.
7. WHEN CORS preflight requests arrive, THEN the server SHALL respond with appropriate CORS headers allowing all origins.

---

### Requirement 12: Backend — AI CFO Chat Endpoint

**User Story:** As the CFO frontend, I want to submit financial questions to the backend and receive structured AI analysis of mock cloud data, so that I can display contextual financial insights to the user.

#### Acceptance Criteria

1. WHEN `POST /api/cfo/chat` is called with `{query, scenario}`, THEN the server SHALL load mock data for the specified scenario from `mock_database.json`.
2. WHEN mock data is loaded, THEN the server SHALL run the rules engine to generate deterministic recommendations before calling the AI.
3. WHEN calling Groq, THEN the server SHALL inject current spend, predicted spend, and inefficiencies into the system prompt template.
4. WHEN Groq responds, THEN the server SHALL return a `ChatResponse` with `summary`, `identified_issues`, `recommendations`, `estimated_savings`, and `risk_level`.
5. IF an exception occurs anywhere in the CFO chat flow, THEN the server SHALL log the error and return HTTP 500 with the error detail.
6. WHEN `GET /api/cfo/dashboard` is called, THEN the server SHALL return `current_spend`, `predicted_spend`, and `potential_savings` from the mock data.
7. WHEN `GET /api/cfo/recommendations` is called, THEN the server SHALL return the rules-engine-generated recommendations list and total savings.
