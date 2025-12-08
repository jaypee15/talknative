import base64
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Map local languages to specific voice configs if available, 
# otherwise use a standard clear voice.
VOICE_MAP = {
    "yoruba": "Archernar", 
    "hausa": "Achird",
    "igbo": "Algenib",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    """
    Generate speech using Google Gemini via direct API.
    """
    voice_name = VOICE_MAP.get(language, "Archernar")
    
    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        model_id = "gemini-2.5-flash-tts" 

        # Explicitly configure response modality to AUDIO
        response = await client.aio.models.generate_content(
            model=model_id,
            contents=f"Read this text aloud naturally. Text: {text}",
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                )
            )
        )

        # Extract audio bytes from the response parts
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("audio"):
                # The SDK usually returns base64 string in inline_data.data for audio
                return base64.b64decode(part.inline_data.data)

        logger.error("Gemini response contained no audio data")
        return b""

    except Exception as e:
        logger.exception("Gemini TTS Direct API error: %s", e)
        return b""