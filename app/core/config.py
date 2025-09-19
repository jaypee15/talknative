from pydantic_settings import BaseSettings, SettingsConfigDict
from enum import Enum

class LanguageCode(str, Enum):
    IGBO = "ig"
    YORUBA = "yo"
    HAUSA = "ha"
    ENGLISH = "en"

class Settings(BaseSettings):
    APP_NAME: str = "Talk Native Backend"
    API_V1_STR: str = "/api/v1"
    
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str = ""
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    DATABASE_URL: str | None = None 
    SPITCH_API_KEY: str | None = None
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    model_config = SettingsConfigDict(env_file=".env", extra='ignore', case_sensitive=False)

settings = Settings()