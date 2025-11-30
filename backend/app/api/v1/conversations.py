import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from pydantic_ai import BinaryContent

from app.core.auth import get_current_user, CurrentUser
from app.core.storage import storage_manager
from app.db.session import get_db
from app.data.scenario_loader import get_scenario_loader
from app.models.conversation import Conversation
from app.models.turn import Turn
from app.models.schemas import ConversationStartRequest, ConversationStartResponse, TurnResponse
from app.ai.agent import get_agent
from app.ai.prompt_builder import build_system_prompt
from app.tts import synthesize_speech

router = APIRouter(tags=["conversations"])

@router.post("/start", response_model=ConversationStartResponse)
async def start_conversation(
    request: ConversationStartRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new conversation with a specific scenario.
    """
    # Verify user has completed onboarding
    if not current_user.target_language or not current_user.proficiency_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete onboarding first"
        )
    
    # Verify scenario exists and matches user's language
    loader = get_scenario_loader()
    scenario = loader.get_scenario(request.scenario_id)
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    if scenario['language'] != current_user.target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scenario language doesn't match your target language"
        )
    
    # Create new conversation
    conversation_id = str(uuid.uuid4())
    conversation = Conversation(
        id=conversation_id,
        user_id=current_user.id,
        scenario_id=request.scenario_id,
        active=True
    )
    
    db.add(conversation)
    db.commit()
    
    # TODO: Optionally generate initial AI greeting
    # For now, return without greeting
    
    return ConversationStartResponse(
        conversation_id=conversation_id,
        initial_ai_greeting=None,
        initial_ai_audio_url=None
    )

@router.post("/{conversation_id}/turn", response_model=TurnResponse)
async def create_turn(
    conversation_id: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a new turn in an existing conversation.
    Accepts user audio, processes with AI, generates TTS, and stores everything.
    """
    # Verify conversation exists and belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if not conversation.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation is not active"
        )
    
    # Get scenario details
    loader = get_scenario_loader()
    scenario = loader.get_scenario(conversation.scenario_id)
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Scenario configuration not found"
        )
    
    # Read audio file
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"
    
    # Get conversation history (last 6 turns)
    previous_turns = db.query(Turn).filter(
        Turn.conversation_id == conversation_id
    ).order_by(desc(Turn.turn_number)).limit(6).all()
    
    previous_turns.reverse()  # Chronological order
    
    # Build message history for Pydantic AI
    message_history = []
    for turn in previous_turns:
        message_history.append(f"User: {turn.user_transcription}")
        message_history.append(f"Assistant: {turn.ai_response_text}")
    
    # Build dynamic system prompt
    system_prompt = build_system_prompt(
        language=current_user.target_language,
        scenario_prompt=scenario['system_prompt'],
        proficiency_level=current_user.proficiency_level
    )
    
    # Get language-specific agent with dynamic prompt
    agent = get_agent(current_user.target_language)
    
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)
    
    # Run AI agent with history and scenario context
    messages = [system_prompt] + message_history + [
        f"The user is speaking {current_user.target_language}. Respond in {current_user.target_language}.",
        audio_content
    ]
    
    result = await agent.run(messages)
    data = result.output
    
    # Generate TTS for AI response
    ai_audio_bytes = await synthesize_speech(
        text=data.reply_text_local,
        language=current_user.target_language
    )
    
    # Calculate turn number
    turn_number = len(previous_turns) + 1
    
    # Upload audios to Supabase Storage
    user_audio_url = await storage_manager.upload_audio(
        audio_data=audio_bytes,
        user_id=current_user.id,
        conversation_id=conversation_id,
        turn_number=turn_number,
        file_type="user"
    )
    
    ai_audio_url = await storage_manager.upload_audio(
        audio_data=ai_audio_bytes,
        user_id=current_user.id,
        conversation_id=conversation_id,
        turn_number=turn_number,
        file_type="ai"
    )
    
    # Calculate grammar score (simple: 10 if correct, 5 if has correction)
    grammar_score = 10 if data.grammar_is_correct else 5
    
    # Save turn to database
    turn = Turn(
        conversation_id=conversation_id,
        turn_number=turn_number,
        user_audio_url=user_audio_url,
        user_transcription=data.user_transcription,
        ai_response_text=data.reply_text_local,
        ai_response_audio_url=ai_audio_url,
        grammar_correction=data.correction_feedback,
        grammar_score=grammar_score
    )
    
    db.add(turn)
    db.commit()
    db.refresh(turn)
    
    return TurnResponse(
        turn_number=turn_number,
        transcription=data.user_transcription,
        ai_text=data.reply_text_local,
        ai_audio_url=ai_audio_url or "",
        correction=data.correction_feedback,
        grammar_score=grammar_score
    )
