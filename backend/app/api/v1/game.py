from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import random
from app.db.session import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.gamification import UserScenarioProgress, UserProverb
from app.data.proverb_loader import get_proverb_loader

router = APIRouter(tags=["game"])

@router.post("/finish_scenario")
async def finish_scenario(
    payload: dict,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    scenario_id = payload.get("scenario_id")
    stars = payload.get("stars")
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
    
    # 2. Loot Logic 
    loot = None
    if stars >= 2:
        loader = get_proverb_loader()
        # Get IDs user already has
        user_owned_ids = [
            up.proverb_id for up in 
            db.query(UserProverb).filter(UserProverb.user_id == current_user.id).all()
        ]
        
        # Get available proverbs in user's language
        available_proverbs = [
            p for p in loader.get_proverbs_by_language(current_user.target_language)
            if p['id'] not in user_owned_ids
        ]
        
        # Random pick
        if available_proverbs:
            new_proverb = random.choice(available_proverbs)
            
            # Save ownership to DB
            user_proverb = UserProverb(user_id=current_user.id, proverb_id=new_proverb['id'])
            db.add(user_proverb)
            db.commit()
            
            loot = new_proverb

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
    # 1. Get IDs from DB
    user_proverbs = db.query(UserProverb).filter_by(user_id=current_user.id).all()
    
    # 2. Get Content from JSON Loader
    loader = get_proverb_loader()
    deck = []
    
    for up in user_proverbs:
        proverb_data = loader.get_proverb(up.proverb_id)
        if proverb_data:
            deck.append(proverb_data)
            
    return deck
