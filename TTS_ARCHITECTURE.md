# TTS Architecture - Modular Design

## Directory Structure

```
backend/app/tts/
├── __init__.py              # Smart router (switches providers)
├── yarngpt_provider.py      # YarnGPT implementation
├── gemini_provider.py       # Gemini TTS implementation
└── yarngpt.py              # Deprecated (backward compatibility)
```

## File Responsibilities

### 1. `__init__.py` - The Router
**Purpose**: Single entry point that dynamically loads the correct provider

```python
from app.core.config import settings

async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        return await gemini_tts(text, language)
    else:
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        return await yarngpt_tts(text, language)
```

**Benefits**:
- ✅ Lazy loading - only imports what's needed
- ✅ Single import point for all consumers
- ✅ No code changes needed when switching providers

### 2. `yarngpt_provider.py` - YarnGPT Implementation
**Purpose**: Pure YarnGPT TTS implementation

```python
VOICE_MAP = {
    "yoruba": "idera",
    "hausa": "zainab",
    "igbo": "amaka",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    # YarnGPT API implementation
    ...
```

**Features**:
- Native African language voices
- Optimized for Yoruba/Hausa/Igbo
- Requires YARNGPT_API_KEY

### 3. `gemini_provider.py` - Gemini TTS Implementation
**Purpose**: Pure Google Gemini TTS implementation

```python
VOICE_MAP = {
    "yoruba": "Kainene",
    "hausa": "Aoife",
    "igbo": "Kainene",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    # Gemini TTS implementation using Pydantic AI
    agent = Agent('google-gla:gemini-2.5-flash-preview-tts')
    ...
```

**Features**:
- Latest Google TTS technology
- Uses same GOOGLE_API_KEY as ASR/LLM
- High-quality multilingual voices

## Flow Diagram

```
┌─────────────────────────────────────────┐
│  chat.py endpoint                       │
│  from app.tts import synthesize_speech  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  __init__.py (Router)                   │
│  Check: settings.TTS_PROVIDER           │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  YarnGPT    │  │  Gemini TTS  │
│  Provider   │  │  Provider    │
│             │  │              │
│ • idera    │  │ • Kainene    │
│ • zainab   │  │ • Aoife      │
│ • amaka    │  │ • Kainene    │
└─────────────┘  └──────────────┘
```

## Usage Examples

### In Application Code

```python
# chat.py endpoint
from app.tts import synthesize_speech

# Works automatically based on TTS_PROVIDER flag
audio = await synthesize_speech("E ku aro", "yoruba")
```

### Switching Providers

```bash
# In .env file
TTS_PROVIDER=yarngpt   # Uses yarngpt_provider.py

# OR
TTS_PROVIDER=gemini    # Uses gemini_provider.py
```

### Testing Individual Providers

```python
# Test YarnGPT directly
from app.tts.yarngpt_provider import synthesize_speech
audio = await synthesize_speech("Hello", "yoruba")

# Test Gemini directly
from app.tts.gemini_provider import synthesize_speech
audio = await synthesize_speech("Hello", "yoruba")
```

## Adding a New Provider

To add a new TTS provider (e.g., Azure, AWS Polly):

1. **Create new file**: `backend/app/tts/azure_provider.py`

```python
VOICE_MAP = {
    "yoruba": "azure_voice_id",
    "hausa": "azure_voice_id",
    "igbo": "azure_voice_id",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    # Azure TTS implementation
    ...
```

2. **Update config**: `backend/app/core/config.py`

```python
TTS_PROVIDER: Literal["yarngpt", "gemini", "azure"] = "yarngpt"
```

3. **Update router**: `backend/app/tts/__init__.py`

```python
async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as tts
    elif settings.TTS_PROVIDER == "azure":
        from app.tts.azure_provider import synthesize_speech as tts
    else:
        from app.tts.yarngpt_provider import synthesize_speech as tts
    
    return await tts(text, language)
```

4. **Done!** No other code changes needed.

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each provider is self-contained
- Changes to one don't affect others
- Easy to understand and maintain

### 2. **Scalability**
- Add new providers without touching existing code
- Switch providers at runtime
- No redeployment needed to change provider

### 3. **Testability**
- Mock individual providers in tests
- Test providers in isolation
- Unit test the router separately

### 4. **Clean Imports**
- Single import point: `from app.tts import synthesize_speech`
- No need to know implementation details
- Consistent interface across providers

### 5. **Performance**
- Lazy loading - only imports active provider
- No unnecessary module loading
- Memory efficient

### 6. **Flexibility**
- A/B test different providers
- Fallback to different provider on failure
- Load balance across multiple providers

## Configuration

All configuration is centralized in `.env`:

```env
# Choose provider
TTS_PROVIDER=yarngpt

# API keys
GOOGLE_API_KEY=xxx      # For Gemini (ASR/LLM/TTS)
YARNGPT_API_KEY=xxx     # For YarnGPT
```

## Migration from Old Structure

If you have existing imports:

```python
# Old way (still works via backward compatibility)
from app.tts.yarngpt import synthesize_speech

# New way (recommended)
from app.tts import synthesize_speech
```

Both work! The old `yarngpt.py` now delegates to the router.

## Summary

✅ **3 files, 3 responsibilities**  
✅ **Clean separation** - YarnGPT and Gemini don't know about each other  
✅ **Easy switching** - change one env var  
✅ **Easy extension** - add new providers without touching existing code  
✅ **Backward compatible** - existing imports still work  

This is a **production-ready, scalable architecture** for TTS provider management! 🚀
