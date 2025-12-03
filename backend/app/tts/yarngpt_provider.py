import httpx
import asyncio
from app.core.config import settings
from app.core.logging import get_logger

VOICE_MAP = {
    "yoruba": "idera",
    "hausa": "zainab",
    "igbo": "adaora",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    voice_id = VOICE_MAP.get(language, "idera")
    attempts = 1
    for i in range(attempts):
        try:
            timeout = httpx.Timeout(connect=5.0, read=45.0, write=10.0, pool=5.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                r = await client.post(
                    "https://yarngpt.ai/api/v1/tts",
                    headers={"Authorization": f"Bearer {settings.YARNGPT_API_KEY}"},
                    json={"text": text, "voice_id": voice_id, "language": language},
                )
                r.raise_for_status()
                return r.content
        except Exception as e:
            logger.warning("YarnGPT TTS attempt %s failed: %s", i + 1, e)
            if i < attempts - 1:
                await asyncio.sleep(0.6 * (i + 1))
            else:
                logger.exception("YarnGPT TTS error: %s", e)
                return b""

logger = get_logger(__name__)
