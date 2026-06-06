# CloudGuardian AI

> **Your Cloud Infrastructure, Intelligently Managed**

CloudGuardian AI is an AI-powered Cloud Operations Platform that transforms raw cloud data into actionable business insights — combining an AI Cloud CFO and an AI Incident Analyst in one unified platform.

---

## Problem Statement

### Cloud Cost Management
Teams struggle to understand why costs are rising, which resources waste money, and how to reduce monthly bills. Dashboards show numbers but rarely provide intelligent recommendations.

### Incident Analysis
When outages occur, engineers manually inspect logs, root causes take time to identify, and downtime increases operational costs. Monitoring tools detect issues but do not explain them.

---

## Solution

CloudGuardian AI adds an AI-powered decision layer on top of cloud operations — analyzing metrics, spending trends, incidents, and logs to provide:

- Cost forecasting and optimization recommendations
- Incident analysis and root cause identification
- Recovery suggestions and executive-level reporting

---

## Core Modules

| Module | Purpose |
|---|---|
| **AI Cloud CFO** | Cloud financial advisor — predicts bills, explains cost drivers, recommends savings |
| **AI Incident Analyst** | Operations engineer — reads logs, identifies root causes, recommends recovery |
| **Notification Center** | Delivers structured alerts via Email, Slack, and Microsoft Teams |
| **Unified Dashboard** | Visual interface for costs, incidents, reports, and optimization history |

---

## Demo Scenarios

### Scenario 1 — Traffic Spike
| Input | AI Output |
|---|---|
| Current Spend: $12,450 | Predicted Bill: **$18,500** |
| Traffic Growth: 40% | Recommendations: Spot Instances, Remove Idle Resources |
| | Potential Savings: **$4,200/month** |

### Scenario 2 — Database Failure
| Input | AI Output |
|---|---|
| `ERROR: Database Connection Failed` | Severity: **Critical** |
| | Root Cause: **Expired Credentials** |
| | Action: Restart Database Service |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js · React · Tailwind CSS |
| Backend | Node.js |
| Database | MongoDB |
| AI / LLM | Claude · OpenAI · AWS Bedrock |
| Deployment | AWS |

---

## MVP Scope (Hackathon)

**Included:** Simulated cloud data, AI-powered analysis, cost forecasting, root cause analysis, recommendations, notifications, dashboard visualization.

**Not Included:** Real AWS/CloudWatch integration, real infrastructure modifications, production monitoring.

---

## Getting Started

```bash
# Serve the homepage locally (no install needed)
# Option 1 — Python
python -m http.server 8080

# Option 2 — Node
npx serve .

# Then open: http://localhost:8080
```

---

## Target Users
Startups · DevOps Teams · Cloud Engineers · IT Operations · Small Businesses

---

*Built for the Ship With Kiro Hackathon*
