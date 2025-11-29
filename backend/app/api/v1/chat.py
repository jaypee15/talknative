import base64
from fastapi import APIRouter, UploadFile, File, Query
from pydantic_ai import BinaryContent
from app.ai.agent import get_agent
from app.tts import synthesize_speech

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    file: UploadFile = File(...),
    language: str = Query("yoruba", pattern="^(yoruba|hausa|igbo)$")
):
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"

    # Get language-specific agent
    agent = get_agent(language)
    
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    data = result.output

    audio_response = await synthesize_speech(
        text=data.reply_text_local,
        language=language
    )

    return {
        "transcription": data.user_transcription,
        "correction": data.correction_feedback,
        "reply": data.reply_text_local,
        "audio": base64.b64encode(audio_response).decode(),
    }
