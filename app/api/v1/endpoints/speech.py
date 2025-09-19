from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None


@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    if not settings.SPITCH_API_KEY:
        raise HTTPException(status_code=500, detail="SPITCH_API_KEY not configured")
    # Placeholder: implement call to STT provider
    return {"transcript": "<stubbed transcript>"}


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    if not settings.SPITCH_API_KEY:
        raise HTTPException(status_code=500, detail="SPITCH_API_KEY not configured")
    # Placeholder: implement call to TTS provider
    return {"audio_url": "https://example.com/audio.mp3"}


