from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.gamification import UserScenarioProgress, UserProverb, Proverb

router = APIRouter(tags=["game"])

@router.post("/finish_scenario")
async def finish_scenario(
    scenario_id: str,
    stars: int, # Calculated on frontend based on patience/score
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update Progress
    progress = db.query(UserScenarioProgress).filter_by(
        user_id=current_user.id, scenario_id=scenario_id
    ).first()
    
    if not progress:
        progress = UserScenarioProgress(user_id=current_user.id, scenario_id=scenario_id)
        db.add(progress)
    
    # Only update if new score is better
    if stars > progress.stars:
        progress.stars = stars
    
    # 2. Loot Logic (If 3 stars or Boss)
    loot = None
    if stars >= 3:
        # Randomly select a proverb user doesn't have
        subquery = db.query(UserProverb.proverb_id).filter(UserProverb.user_id == current_user.id)
        new_proverb = db.query(Proverb).filter(
            Proverb.language == current_user.target_language,
            Proverb.id.not_in(subquery)
        ).order_by(func.random()).first()
        
        if new_proverb:
            user_proverb = UserProverb(user_id=current_user.id, proverb_id=new_proverb.id)
            db.add(user_proverb)
            loot = new_proverb

    db.commit()
    return {"success": True, "stars": stars, "loot": loot}

@router.get("/progress")
async def get_progress(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserScenarioProgress).filter_by(user_id=current_user.id).all()

@router.get("/deck")
async def get_wisdom_deck(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Proverb).join(UserProverb).filter(UserProverb.user_id == current_user.id).all()