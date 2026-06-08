from pydantic import BaseModel
from typing import List, Optional

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
