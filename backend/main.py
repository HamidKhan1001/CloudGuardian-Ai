import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

from api.routes_cfo import router as cfo_router

app = FastAPI()

# CORS must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
