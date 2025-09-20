from fastapi import APIRouter, HTTPException, Path, Body, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services import llm_service
from app.models.chat_models import ChatRequest, ChatResponse
from app.core.config import LanguageCode, settings
from app.db.sql import get_db_session
from app.models.sql_models import ConversationLog
import httpx

router = APIRouter()

SPITCH_BASE_URL = "https://api.spitch.app"  # confirm endpoint with docs
OPENAI_BASE_URL = "https://api.openai.com/v1"

@router.post("/{language_code}", response_model=ChatResponse)
async def handle_chat_message(
    language_code: LanguageCode = Path(..., description="The language code for the conversation (e.g., 'ig', 'yo', 'ha')."),
    chat_request: ChatRequest = Body(...)
):
    """
    Handles a user's chat message and returns the AI tutor's response.
    A `session_id` must be provided by the client to maintain conversation context.
    """
    try:
        ai_reply = await llm_service.get_llm_response(
            session_id=chat_request.session_id,
            language_code=language_code,
            user_message=chat_request.message
        )
        return ChatResponse(
            session_id=chat_request.session_id,
            language_code=language_code,
            reply=ai_reply,
            user_message=chat_request.message
        )
    except ValueError as e: # e.g. API key not set
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Log the exception for debugging
        print(f"Error in chat endpoint: {e}") # Replace with proper logging
        raise HTTPException(status_code=500, detail="An internal error occurred.")


async def _spitch_stt(audio: UploadFile) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        files = {"file": (audio.filename, await audio.read(), audio.content_type)}
        headers = {"Authorization": f"Bearer {settings.SPITCH_API_KEY}"}
        resp = await client.post(f"{SPITCH_BASE_URL}/stt", headers=headers, files=files)
        resp.raise_for_status()
        data = resp.json()
        return data.get("text", "")


async def _whisper_stt(audio: UploadFile) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        files = {"file": (audio.filename, await audio.read(), audio.content_type)}
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
        resp = await client.post(
            f"{OPENAI_BASE_URLaudio/transcriptions}",
            headers=headers,
            files=files,
            data={"model": "whisper-1"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("text", "")


async def _spitch_tts(text: str, language: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        payload = {"text": text, "language": language}
        headers = {"Authorization": f"Bearer {settings.SPITCH_API_KEY}"}
        resp = await client.post("f{SPITCH_BASE_URL}/tts", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("audio_url", "")

async def _spitch_diacritize(text str, language: str) -> str:
    """Normalize text with tone marks using spitch."""
    payload =  {"text": text, "language": language}
    headers = {"Authorization": f"Bearer {settings.SPITCH_API_KEY}"}
    resp = await client.pos(f"{SPITCH_BASE_URL}/diacritize", headers=headers, json=payload)

    if resp.status_code !200:
        return text
    data = resp.json()
    return data.get("normalized_text", text)


@router.post("/{language_code}/audio")
async def chat_with_audio(
    language_code: LanguageCode,
    user_id: str,
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
):
    # Step 1: Transcribe
    transcript = ""
    if settings.SPITCH_API_KEY:
        try:
            transcript = await _spitch_stt(audio)
        except Exception:
            transcript = ""
    if not transcript and settings.OPENAI_API_KEY:
        transcript = await _whisper_stt(audio)
    if not transcript:
        raise HTTPException(status_code=400, detail="No speech detected")

    # Step 2: Generate AI reply via llm_service (respects LLM_PROVIDER/MODEL)
    ai_reply = await llm_service.get_llm_response(
        session_id=user_id, language_code=language_code, user_message=transcript
    )

    # Step 3: TTS
    audio_url = ""
    if settings.SPITCH_API_KEY:
        try:
            audio_url = await _spitch_tts(ai_reply, language_code.value)
        except Exception:
            audio_url = ""

    # Step 4: Log conversation
    convo = ConversationLog(
        user_id=user_id,
        input_text=transcript,
        output_text=ai_reply,
        audio_url=audio_url,
    )
    await db.merge(convo)
    await db.commit()
    return {
        "user_id": user_id,
        "input_text": transcript,
        "output_text": ai_reply,
        "audio_url": audio_url,
    }


@router.delete("/{language_code}/session/{session_id}", status_code=204)
async def clear_chat_session(
    language_code: LanguageCode = Path(..., description="The language code for the session to clear."),
    session_id: str = Path(..., description="The session ID to clear.")
):
    """
    Clears the conversation history for a given session and language from Redis
    and removes the active chain instance from memory.
    """
    try:
        llm_service.clear_chat_history_and_active_chain(session_id, language_code) # Updated call
        return
    except Exception as e:
        print(f"Error clearing session: {e}") # Replace with proper logging
        raise HTTPException(status_code=500, detail="Failed to clear session.")