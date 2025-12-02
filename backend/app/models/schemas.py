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
class ScenarioRoles(BaseModel):
    user: str
    ai: str

class ScenarioMission(BaseModel):
    objective: str
    success_condition: str

class KeyVocabulary(BaseModel):
    word: str
    meaning: str

class HaggleSettings(BaseModel):
    start_price: int
    target_price: int
    reserve_price: int

class ScenarioResponse(BaseModel):
    id: str
    language: LanguageType
    category: Optional[str] = None
    title: str
    difficulty: DifficultyType
    description: Optional[str] = None
    roles: Optional[ScenarioRoles] = None
    mission: Optional[ScenarioMission] = None
    key_vocabulary: Optional[list[KeyVocabulary]] = None
    system_prompt_context: Optional[str] = None
    haggles_settings: Optional[HaggleSettings] = None

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
    ai_text_english: Optional[str]
    ai_audio_url: str
    correction: Optional[str]
    grammar_score: Optional[int]
    sentiment_score: Optional[float] = None
    negotiated_price: Optional[int] = None

# Conversation history schemas
class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    scenario_title: str
    scenario_id: str
    created_at: datetime
    turn_count: int
    last_message: Optional[str]
    active: bool

# Vocabulary schemas
class SaveWordRequest(BaseModel):
    word: str
    translation: str
    context_sentence: Optional[str] = None

class SavedWordResponse(BaseModel):
    id: int
    word: str
    translation: str
    context_sentence: Optional[str]
    language: LanguageType
    created_at: datetime

    class Config:
        from_attributes = True
