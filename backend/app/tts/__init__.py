from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        audio = await gemini_tts(text, language)
        if audio:
            return audio
        logger.warning("Gemini TTS produced empty audio; attempting YarnGPT fallback")
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        return await yarngpt_tts(text, language)
    else:
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        audio = await yarngpt_tts(text, language)
        if audio:
            return audio
        logger.warning("YarnGPT TTS produced empty audio; attempting Gemini fallback")
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        return await gemini_tts(text, language)
