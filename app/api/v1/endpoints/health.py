from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    app_name: str
    api_version: str

@router.get("", response_model=HealthResponse)
async def health_check():
    """
    Provides a health check for the application.
    """
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        api_version=settings.API_V1_STR
    )