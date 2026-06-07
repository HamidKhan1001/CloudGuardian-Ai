import logging
from fastapi import APIRouter, HTTPException
import json
import os
from models.pydantic_schemas import ChatRequest, ChatResponse, DashboardResponse, RecommendationResponse
from services.ai_service import get_cfo_chat_response
from services.rules_engine import generate_recommendations

logger = logging.getLogger(__name__)

router = APIRouter()

def get_mock_data(scenario: str = "default"):
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_database.json")
    with open(db_path, "r") as f:
        data = json.load(f)
    return data.get(scenario, data["default"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(scenario: str = "default"):
    data = get_mock_data(scenario)
    return DashboardResponse(
        current_spend=data["current_cloud_spend"],
        predicted_spend=data["predicted_monthly_bill"],
        potential_savings=data["potential_savings"]
    )

@router.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations(scenario: str = "default"):
    data = get_mock_data(scenario)
    recommendations, total_savings = generate_recommendations(data["resources"])
    return RecommendationResponse(
        recommendations=recommendations,
        total_savings=total_savings
    )

@router.post("/chat", response_model=ChatResponse)
def chat_with_cfo(req: ChatRequest):
    logger.info(f"Received chat request: {req.query}")
    try:
        data = get_mock_data(req.scenario)
        logger.info("Mock data loaded successfully")
        
        recommendations, _ = generate_recommendations(data["resources"])
        logger.info("Recommendations generated successfully")
        
        response = get_cfo_chat_response(req.query, data, recommendations)
        logger.info("AI service returned successfully")
        return response
    except Exception as e:
        logger.error(f"Error in chat_with_cfo endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
