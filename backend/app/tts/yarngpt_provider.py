import httpx
from app.core.config import settings

VOICE_MAP = {
    "yoruba": "idera",
    "hausa": "zainab",
    "igbo": "adaora",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    voice_id = VOICE_MAP.get(language, "idera")
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://yarngpt.ai/api/v1/tts",
                headers={"Authorization": f"Bearer {settings.YARNGPT_API_KEY}"},
                json={"text": text, "voice_id": voice_id, "language": language},
            )
            r.raise_for_status()
            return r.content
    except Exception:
        return b""
