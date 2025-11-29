from app.core.config import settings

async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        return await gemini_tts(text, language)
    else:
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        return await yarngpt_tts(text, language)
