import asyncio
import time
import os
import sys
from pathlib import Path
import httpx
from app.core.logging import configure_logging, get_logger

# Add parent directory to path to import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic_ai import BinaryContent
from app.ai.agent import get_agent

async def test_chain(audio_file_path: str, language: str = "igbo"):
    configure_logging()
    logger = get_logger(__name__)
    logger.info("Starting POC chain test with %s", audio_file_path)
    logger.info("Language: %s", language)
    
    start_total = time.time()
    
    with open(audio_file_path, "rb") as f:
        audio_bytes = f.read()
    
    logger.info("Audio file loaded: %s bytes", len(audio_bytes))
    
    # Get language-specific agent
    agent = get_agent(language)
    logger.info("Using language-specific agent for %s", language)
    
    start_gemini = time.time()
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type="audio/webm")
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    gemini_time = time.time() - start_gemini
    
    data = result.output
    logger.info("Gemini Response (%.2fs):", gemini_time)
    logger.info("Transcription: %s", data.user_transcription)
    logger.info("Grammar Correct: %s", data.grammar_is_correct)
    logger.info("Correction: %s", data.correction_feedback)
    logger.info("Reply (Local): %s", data.reply_text_local)
    logger.info("Reply (English): %s", data.reply_text_english)
    
    start_tts = time.time()
    yarngpt_key = os.getenv("YARNGPT_API_KEY", "YOUR_YARNGPT_API_KEY")
    async with httpx.AsyncClient(timeout=20) as client:
        tts_response = await client.post(
            "https://yarngpt.ai/api/v1/tts",
            headers={"Authorization": f"Bearer {yarngpt_key}"},
            json={"text": data.reply_text_local, "voice_id": "idera", "language": language},
        )
        tts_response.raise_for_status()
        audio_output = tts_response.content
    tts_time = time.time() - start_tts
    
    output_file = Path("output_audio.wav")
    output_file.write_bytes(audio_output)
    logger.info("YarnGPT TTS (%.2fs):", tts_time)
    logger.info("Audio saved to: %s", output_file)
    
    total_time = time.time() - start_total
    logger.info("Total latency: %.2fs", total_time)
    
    if total_time > 4:
        logger.warning("Warning: Latency exceeds 4s target")
    else:
        logger.info("Latency within 4s target")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        configure_logging()
        get_logger(__name__).error("Usage: python poc_chain.py <audio_file_path> [language]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "yoruba"
    
    asyncio.run(test_chain(audio_path, lang))
