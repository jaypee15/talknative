from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.models.user import Profile
from app.models.schemas import UserProfileUpdate, UserProfileResponse

router = APIRouter(tags=["users"])

@router.post("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile with target language and proficiency level.
    Called during onboarding.
    """
    user = db.query(Profile).filter(Profile.id == current_user.id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user profile
    user.target_language = profile.target_language
    user.proficiency_level = profile.proficiency_level
    
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    user = db.query(Profile).filter(Profile.id == current_user.id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
