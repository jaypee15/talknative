import uuid
import base64
import logging
import time
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from pydantic_ai import BinaryContent
from pydantic_ai.exceptions import ModelHTTPError

from app.core.auth import get_current_user, CurrentUser
from app.core.storage import storage_manager
from app.db.session import get_db
from app.data.scenario_loader import get_scenario_loader
from app.models.conversation import Conversation
from app.models.turn import Turn
from app.models.schemas import ConversationStartRequest, ConversationStartResponse, TurnResponse, ConversationHistoryResponse
from app.ai.agent import get_agent
from app.ai.prompt_builder import build_system_prompt
from app.tts import synthesize_speech

router = APIRouter(tags=["conversations"])

async def process_turn_persistence(
    db: Session,
    user_id: str,
    conversation_id: str,
    turn_number: int,
    user_audio_bytes: bytes,
    ai_audio_bytes: bytes,
    ai_data: any # The result.output object
):
    """
    Handles the slow stuff: Uploading to Supabase and Saving to Postgres.
    """
    try:
        # 1. Upload User Audio
        user_audio_url = await storage_manager.upload_audio(
            audio_data=user_audio_bytes,
            user_id=user_id,
            conversation_id=conversation_id,
            turn_number=turn_number,
            file_type="user"
        )
        
        # 2. Upload AI Audio
        ai_audio_url = await storage_manager.upload_audio(
            audio_data=ai_audio_bytes,
            user_id=user_id,
            conversation_id=conversation_id,
            turn_number=turn_number,
            file_type="ai"
        )

        # 3. Calculate Scores
        grammar_score = 10 if ai_data.grammar_is_correct else 5

        # 4. Save to DB
        turn = Turn(
            conversation_id=conversation_id,
            turn_number=turn_number,
            user_audio_url=user_audio_url,
            user_transcription=ai_data.user_transcription,
            ai_response_text=ai_data.reply_text_local,
            ai_response_text_english=ai_data.reply_text_english,
            ai_response_audio_url=ai_audio_url,
            grammar_correction=ai_data.correction_feedback,
            grammar_score=grammar_score,
            sentiment_score=ai_data.sentiment_score,
            negotiated_price=ai_data.current_price,
            cultural_flag=ai_data.cultural_flag,
            cultural_feedback=ai_data.cultural_feedback
        )
        
        db.add(turn)
        db.commit()
        logging.getLogger(__name__).info("Background task complete for Turn %s", turn_number)
        
    except Exception as e:
        logging.getLogger(__name__).exception("Background Persistence Error: %s", e)
        

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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a new turn in an existing conversation.
    Accepts user audio, processes with AI, generates TTS, and stores everything.
    """
    t_start = time.time()
    # Verify conversation exists and belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation or not conversation.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Conversation"
        )
    
    # Get scenario details
    loader = get_scenario_loader()
    scenario = loader.get_scenario(conversation.scenario_id)
    
    # Read audio file
    t_read_start = time.time()
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"
    t_read_end = time.time()
    
    # Get conversation history (last 6 turns)
    t_hist_start =time.time()
    previous_turns = db.query(Turn).filter(
        Turn.conversation_id == conversation_id
    ).order_by(desc(Turn.turn_number)).limit(6).all()
    
    previous_turns.reverse()  # Chronological order
    
    message_history = []
    for turn in previous_turns:
        message_history.append(f"User: {turn.user_transcription}")
        message_history.append(f"Assistant: {turn.ai_response_text}")
    t_hist_end = time.time()
    
    # Build dynamic system prompt with full scenario data
    t_ai_start = time.time()
    system_prompt = build_system_prompt(
        language=current_user.target_language,
        scenario_prompt=scenario.get('system_prompt_context', scenario.get('system_prompt', '')),
        proficiency_level=current_user.proficiency_level,
        scenario_data=scenario  # Pass full scenario for mission-based prompts
    )
    
    agent = get_agent(current_user.target_language, 'google-gla:gemini-2.5-flash-lite')
    
    try:
        result = await agent.run(
            [system_prompt] + message_history + [
                f"The user is speaking {current_user.target_language}.",
                BinaryContent(data=audio_bytes, media_type=mime_type)
            ]
        )
    except ModelHTTPError as e:
        if e.status_code == 503:
            logging.getLogger(__name__).warning("Fallback to non-lite model due to 503")
            fallback_agent = get_agent(
                current_user.target_language,
                model_name="google-gla:gemini-2.5-flash",
            )
            result = await fallback_agent.run(
                [system_prompt] + message_history + [
                    f"The user is speaking {current_user.target_language}.",
                    BinaryContent(data=audio_bytes, media_type=mime_type)
                ]
            )
        else:
            raise
    data = result.output
    t_ai_end = time.time()
    
    # Run TTS (The second necessary bottleneck)
    t_tts_start = time.time()
    ai_audio_bytes = await synthesize_speech(
        text=data.reply_text_local,
        language=current_user.target_language
    )
    t_tts_end = time.time()
    
    # Prepare response
    # Convert audio to Data URI for immediate playback on frontend
    b64_audio = base64.b64encode(ai_audio_bytes).decode('utf-8')
    audio_data_uri = f"data:audio/mpeg;base64,{b64_audio}"
    
    next_turn_number = len(previous_turns) + 1
    
    #  Offload Storage to Background
    background_tasks.add_task(
        process_turn_persistence,
        db, # NOTE: FastAPI manages this session, might need a fresh one if high concurrency
        current_user.id,
        conversation_id,
        next_turn_number,
        audio_bytes,
        ai_audio_bytes,
        data
    )
    t_total = time.time() - t_start
    
    return TurnResponse(
        turn_number=next_turn_number,
        transcription=data.user_transcription,
        ai_text=data.reply_text_local,
        ai_text_english=data.reply_text_english,
        ai_audio_url=audio_data_uri, # Frontend plays this instantly
        correction=data.correction_feedback,
        grammar_score=10 if data.grammar_is_correct else 5,
        sentiment_score=data.sentiment_score,
        negotiated_price=data.current_price
    )

@router.get("/history", response_model=List[ConversationHistoryResponse])
async def get_conversation_history(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's conversation history with metadata.
    Shows recent conversations for the dashboard.
    """
    # Get user's conversations ordered by most recent
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(desc(Conversation.created_at)).limit(10).all()
    
    loader = get_scenario_loader()
    result = []
    
    for conv in conversations:
        # Get turn count
        turn_count = db.query(Turn).filter(
            Turn.conversation_id == conv.id
        ).count()
        
        # Get latest turn for preview
        latest_turn = db.query(Turn).filter(
            Turn.conversation_id == conv.id
        ).order_by(desc(Turn.turn_number)).first()
        
        # Get scenario details
        scenario = loader.get_scenario(conv.scenario_id)
        
        result.append(ConversationHistoryResponse(
            conversation_id=conv.id,
            scenario_title=scenario['title'] if scenario else "Unknown Scenario",
            scenario_id=conv.scenario_id,
            created_at=conv.created_at,
            turn_count=turn_count,
            last_message=latest_turn.ai_response_text[:100] if latest_turn else None,
            active=conv.active
        ))
    
    return result

@router.get("/{conversation_id}/turns", response_model=List[TurnResponse])
async def get_conversation_turns(
    conversation_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all turns for a specific conversation.
    Used to restore conversation history when user returns to a chat.
    """
    # Verify conversation exists and belongs to user
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Fetch all turns in chronological order
    turns = db.query(Turn).filter(
        Turn.conversation_id == conversation_id
    ).order_by(Turn.turn_number.asc()).all()
    
    return [
        TurnResponse(
            turn_number=t.turn_number,
            transcription=t.user_transcription,
            ai_text=t.ai_response_text,
            ai_text_english=t.ai_response_text_english,
            ai_audio_url=t.ai_response_audio_url or "",
            correction=t.grammar_correction,
            grammar_score=t.grammar_score
        ) for t in turns
    ]
