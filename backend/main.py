import asyncio
import os
import re
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

from api.routes_cfo import router as cfo_router

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI()

# Allow CORS for the frontend running on port 8080 or 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cfo_router, prefix="/api/cfo", tags=["CFO"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        json_msg = json.dumps(message)
        # Creating a copy to iterate safely
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json_msg)
            except Exception as e:
                print(f"Error sending to connection: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

class SimulateRequest(BaseModel):
    type: str
    title: str
    message: str
    service: str

@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any messages from client (e.g. pings)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.post("/api/notifications/simulate")
async def simulate_notification(req: SimulateRequest):
    # Prepare the notification payload matching frontend NotificationItem
    notification = {
        "id": f"notif-backend-{int(time.time() * 1000)}",
        "type": req.type,
        "title": req.title,
        "message": req.message,
        "service": req.service,
        "time": "Just now",
        "read": False
    }
    
    # Broadcast to all connected WebSockets
    await manager.broadcast(notification)
    return {"status": "ok", "broadcasted": True}

@app.get("/")
def read_root():
    return {"status": "running", "message": "CloudGuardian-Ai Backend is live!"}


# ─────────────────────────────────────────────
#  Incident Analyst — Groq-powered analysis
# ─────────────────────────────────────────────

class IncidentAnalysisRequest(BaseModel):
    incident_type: str
    logs: str

SYSTEM_PROMPT = """You are a Senior Cloud Incident Analyst and SRE expert.
Your job is to analyze infrastructure logs and return a structured JSON diagnosis.
Always respond with ONLY valid JSON — no markdown, no code fences, no explanation outside the JSON."""

USER_PROMPT_TEMPLATE = """Analyze the following cloud incident logs and return ONLY a JSON object.

Incident Type: {incident_type}

Logs:
{logs}

Return ONLY this JSON (no markdown, no extra text):
{{
  "incidentType": "{incident_type}",
  "rootCause": "Precise technical explanation of what caused this incident",
  "severity": "Critical",
  "confidenceScore": "94%",
  "businessImpact": "Clear description of impact on users, revenue, and operations",
  "recommendedActions": [
    "Step 1: Immediate remediation action",
    "Step 2: Root fix",
    "Step 3: Verification",
    "Step 4: Prevention measure"
  ],
  "affected_services": ["service-a", "service-b"],
  "estimated_recovery_time": "15-30 minutes"
}}

Rules:
- severity must be one of: Critical, High, Medium, Low
- confidenceScore must be a percentage string like "94%"
- recommendedActions must be an array of strings
- All fields are required"""


def _extract_json(text: str) -> dict:
    """Strip any markdown fences and extract the first valid JSON object."""
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text.strip(), flags=re.MULTILINE)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        return json.loads(text[start:end])
    raise ValueError(f"No valid JSON found in response:\n{text[:500]}")


@app.post("/api/analyze-incident")
async def analyze_incident(req: IncidentAnalysisRequest):
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if not api_key or api_key == "your_groq_api_key_here":
        raise HTTPException(
            status_code=503,
            detail=(
                "GROQ_API_KEY is not configured. "
                "Get a free key at https://console.groq.com/keys "
                "then add it to backend/.env as GROQ_API_KEY=your_key"
            ),
        )

    try:
        from groq import Groq, RateLimitError, AuthenticationError

        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": USER_PROMPT_TEMPLATE.format(
                        incident_type=req.incident_type,
                        logs=req.logs,
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"},  # forces valid JSON output
        )

        raw = completion.choices[0].message.content or ""
        result = _extract_json(raw)

        # Normalise to consistent keys
        normalised = {
            "incidentType":            result.get("incidentType") or req.incident_type,
            "rootCause":               result.get("rootCause", ""),
            "severity":                result.get("severity", "Unknown"),
            "confidenceScore":         str(result.get("confidenceScore", "N/A")),
            "businessImpact":          result.get("businessImpact", ""),
            "recommendedActions":      result.get("recommendedActions") or [],
            "affected_services":       result.get("affected_services") or [],
            "estimated_recovery_time": result.get("estimated_recovery_time", ""),
        }

        return {"status": "ok", "analysis": normalised}

    except HTTPException:
        raise
    except Exception as e:
        err = str(e)
        if "AuthenticationError" in type(e).__name__ or "auth" in err.lower() or "invalid api key" in err.lower():
            raise HTTPException(status_code=401, detail="Invalid GROQ_API_KEY. Check your key at https://console.groq.com/keys")
        if "RateLimitError" in type(e).__name__ or "rate_limit" in err.lower() or "429" in err:
            raise HTTPException(status_code=429, detail="Groq rate limit hit. Free tier allows 14,400 req/day. Wait a moment and retry.")
        if "json" in err.lower():
            raise HTTPException(status_code=502, detail=f"Could not parse AI response as JSON: {err}")
        raise HTTPException(status_code=500, detail=f"AI analysis error: {err}")



