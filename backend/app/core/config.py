from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    YARNGPT_API_KEY: str
    DATABASE_URL: str
    CORS_ALLOW_ORIGINS: list[str] = ["*"]
    
    TTS_PROVIDER: Literal["yarngpt", "gemini"] = "yarngpt"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()
