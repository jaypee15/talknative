from pydantic_ai import Agent
import logging

VOICE_MAP = {
    "yoruba": "Kainene",
    "hausa": "Aoife",
    "igbo": "Kainene",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    from pydantic import BaseModel, Field
    
    class AudioResponse(BaseModel):
        audio_data: bytes = Field(description="The audio data")
    
    voice_name = VOICE_MAP.get(language, "Kainene")
    
    try:
        agent = Agent('google-gla:gemini-2.5-flash-preview-tts')
        
        result = await agent.run(
            f"Generate speech for this text in {language}",
            message_history=[],
            model_settings={
                "voice_config": {
                    "voice_name": voice_name
                }
            }
        )
        
        if hasattr(result, 'audio_data'):
            return result.audio_data
        return b""
    except Exception as e:
        logging.getLogger(__name__).exception("Gemini TTS error: %s", e)
        return b""
