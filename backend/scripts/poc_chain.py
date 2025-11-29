import asyncio
import time
import os
import sys
from pathlib import Path
import httpx

# Add parent directory to path to import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic_ai import BinaryContent
from app.ai.agent import get_agent

async def test_chain(audio_file_path: str, language: str = "igbo"):
    print(f"Starting POC chain test with {audio_file_path}")
    print(f"Language: {language}")
    
    start_total = time.time()
    
    with open(audio_file_path, "rb") as f:
        audio_bytes = f.read()
    
    print(f"Audio file loaded: {len(audio_bytes)} bytes")
    
    # Get language-specific agent
    agent = get_agent(language)
    print(f"Using language-specific agent for {language}")
    
    start_gemini = time.time()
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type="audio/webm")
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    gemini_time = time.time() - start_gemini
    
    data = result.output
    print(f"\nGemini Response ({gemini_time:.2f}s):")
    print(f"  Transcription: {data.user_transcription}")
    print(f"  Grammar Correct: {data.grammar_is_correct}")
    print(f"  Correction: {data.correction_feedback}")
    print(f"  Reply (Local): {data.reply_text_local}")
    print(f"  Reply (English): {data.reply_text_english}")
    
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
    print(f"\nYarnGPT TTS ({tts_time:.2f}s):")
    print(f"  Audio saved to: {output_file}")
    
    total_time = time.time() - start_total
    print(f"\nTotal latency: {total_time:.2f}s")
    
    if total_time > 4:
        print("⚠️  Warning: Latency exceeds 4s target")
    else:
        print("✓ Latency within 4s target")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python poc_chain.py <audio_file_path> [language]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "yoruba"
    
    asyncio.run(test_chain(audio_path, lang))
