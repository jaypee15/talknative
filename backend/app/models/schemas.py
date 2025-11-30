from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

# Enums
LanguageType = Literal["yoruba", "hausa", "igbo"]
ProficiencyType = Literal["beginner", "intermediate", "advanced"]
DifficultyType = Literal["beginner", "intermediate", "advanced"]

# User schemas
class UserProfileUpdate(BaseModel):
    target_language: LanguageType
    proficiency_level: ProficiencyType

class UserProfileResponse(BaseModel):
    id: str
    email: str
    target_language: Optional[LanguageType]
    proficiency_level: Optional[ProficiencyType]
    created_at: datetime

    class Config:
        from_attributes = True

# Scenario schemas
class ScenarioResponse(BaseModel):
    id: str
    language: LanguageType
    title: str
    difficulty: DifficultyType
    description: Optional[str] = None

# Conversation schemas
class ConversationStartRequest(BaseModel):
    scenario_id: str

class ConversationStartResponse(BaseModel):
    conversation_id: str
    initial_ai_greeting: Optional[str] = None
    initial_ai_audio_url: Optional[str] = None

# Turn schemas
class TurnResponse(BaseModel):
    turn_number: int
    transcription: str
    ai_text: str
    ai_audio_url: str
    correction: Optional[str]
    grammar_score: Optional[int]
