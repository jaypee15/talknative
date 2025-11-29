# This file is deprecated. Use the new modular structure:
# - yarngpt_provider.py for YarnGPT TTS
# - gemini_provider.py for Gemini TTS
# - __init__.py for the router

# For backward compatibility, import from the main module
from app.tts import synthesize_speech

__all__ = ['synthesize_speech']

