from fastapi import APIRouter, HTTPException, Path, Body
from app.services import llm_service
from app.models.chat_models import ChatRequest, ChatResponse
from app.core.config import LanguageCode

router = APIRouter()

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

@router.delete("/{language_code}/session/{session_id}", status_code=204)
async def clear_chat_session(
    language_code: LanguageCode = Path(..., description="The language code for the session to clear."),
    session_id: str = Path(..., description="The session ID to clear.")
):
    """
    Clears the conversation history for a given session and language.
    """
    try:
        llm_service.clear_session_chain(session_id, language_code)
        return
    except Exception as e:
        print(f"Error clearing session: {e}") # Replace with proper logging
        raise HTTPException(status_code=500, detail="Failed to clear session.")