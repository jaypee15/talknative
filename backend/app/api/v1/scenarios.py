from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.data.scenario_loader import get_scenario_loader
from app.models.schemas import ScenarioResponse

router = APIRouter(tags=["scenarios"])

@router.get("", response_model=List[ScenarioResponse])
async def get_scenarios(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all scenarios for the user's target language.
    Returns empty list if user hasn't completed onboarding.
    """
    if not current_user.target_language:
        return []
    
    loader = get_scenario_loader()
    scenarios = loader.get_scenarios_by_language(current_user.target_language)
    
    return scenarios
