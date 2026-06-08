import os
import json
import logging
from pathlib import Path
from groq import Groq
from models.pydantic_schemas import ChatResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
PROMPT_PATH = BASE_DIR / "prompts" / "cfo_system_prompt.txt"

def get_cfo_chat_response(query: str, context: dict, inefficiencies: list) -> ChatResponse:
    api_key = os.getenv("GROQ_API_KEY")
    # 2. Verify GROQ_API_KEY is loaded correctly
    logger.info(f"GROQ_API_KEY loaded: {'Yes' if api_key else 'No'}")
    
    client = Groq(api_key=api_key)
    
    with open(PROMPT_PATH, "r") as f:
        prompt_template = f.read()

    inefficiencies_str = ", ".join(inefficiencies) if inefficiencies else "None"
    system_prompt = prompt_template.replace("${current_spend}", str(context['current_cloud_spend'])) \
                                   .replace("${predicted_spend}", str(context['predicted_monthly_bill'])) \
                                   .replace("{inefficiencies}", inefficiencies_str)

    # 1. Add logging before the Groq API call
    # 3. Verify the model exists and responds
    logger.info("Calling Groq API with model: llama-3.3-70b-versatile")
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        # 1. Add logging after the Groq API call
        logger.info("Groq API call successful")
        
        raw_response = chat_completion.choices[0].message.content
        logger.info(f"Raw response: {raw_response}")
        
        parsed_json = json.loads(raw_response)
        return ChatResponse(**parsed_json)
    except Exception as e:
        logger.error(f"Error during Groq API call or parsing: {e}")
        return ChatResponse(
            summary=f"Failed to fetch or parse LLM response: {str(e)}",
            identified_issues=[],
            recommendations=[],
            estimated_savings=0.0,
            risk_level="Unknown"
        )
