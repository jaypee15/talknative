from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.models.saved_word import SavedWord
from app.models.schemas import SaveWordRequest, SavedWordResponse

router = APIRouter(tags=["vocabulary"])

@router.post("/save", response_model=SavedWordResponse, status_code=status.HTTP_201_CREATED)
async def save_word(
    request: SaveWordRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a word to user's vocabulary list.
    """
    if not current_user.target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no target language set"
        )
    
    # Check if word already exists for this user
    existing = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id,
        SavedWord.word == request.word
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Word already saved"
        )
    
    saved_word = SavedWord(
        user_id=current_user.id,
        word=request.word,
        translation=request.translation,
        context_sentence=request.context_sentence,
        language=current_user.target_language
    )
    
    db.add(saved_word)
    db.commit()
    db.refresh(saved_word)
    
    return saved_word

@router.get("", response_model=List[SavedWordResponse])
async def get_saved_words(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all saved words for the current user.
    """
    words = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id
    ).order_by(SavedWord.created_at.desc()).all()
    
    return words

@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_word(
    word_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a saved word.
    """
    word = db.query(SavedWord).filter(
        SavedWord.id == word_id,
        SavedWord.user_id == current_user.id
    ).first()
    
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found"
        )
    
    db.delete(word)
    db.commit()
    
    return None
