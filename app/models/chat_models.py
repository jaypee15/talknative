from pydantic import BaseModel, Field
from app.core.config import LanguageCode

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="A unique identifier for the user's session. Client should generate and persist this.")
    message: str = Field(..., min_length=1, max_length=2000)
    # language_code is now part of the path parameter

class ChatResponse(BaseModel):
    session_id: str
    language_code: LanguageCode
    reply: str
    user_message: str # Echo back the user's message for context