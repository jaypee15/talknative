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
    MONGODB_URL: str | None = None
    MONGODB_DB_NAME: str = "talknative_mvp"
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra='ignore', case_sensitive=False)

settings = Settings()