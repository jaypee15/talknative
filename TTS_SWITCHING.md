# TTS Provider Switching Guide

This project supports two TTS providers that you can easily switch between using a configuration flag.

## Available Providers

### 1. YarnGPT (Default)
- **Model**: YarnGPT API
- **Voices**: Native African language voices (Idera, Zainab, Amaka)
- **Quality**: Optimized for Yoruba, Hausa, and Igbo
- **Requires**: YarnGPT API key

### 2. Gemini TTS (Alternative)
- **Model**: `gemini-2.5-flash-preview-tts`
- **Voices**: Gemini's multilingual voices (Kainene, Aoife)
- **Quality**: High-quality, Google-powered TTS
- **Requires**: Google API key (same as for ASR/LLM)

## How to Switch

### Method 1: Environment Variable (Recommended)

Edit your `backend/.env` file:

```env
# Use YarnGPT (default)
TTS_PROVIDER=yarngpt

# OR use Gemini TTS
TTS_PROVIDER=gemini
```

### Method 2: Docker Compose

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - TTS_PROVIDER=gemini  # Change here
```

### Method 3: Cloud Run Deployment

Update `.github/workflows/deploy.yml` or set via gcloud CLI:

```bash
gcloud run services update talknatives-backend \
  --update-env-vars TTS_PROVIDER=gemini
```

## Voice Mappings

### YarnGPT Voices
```python
{
    "yoruba": "idera",   # Female
    "hausa": "zainab",   # Female
    "igbo": "amaka",     # Female
}
```

### Gemini Voices
```python
{
    "yoruba": "Kainene",  # Female
    "hausa": "Aoife",     # Female
    "igbo": "Kainene",    # Female
}
```

## Configuration File

The TTS provider is configured in `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    TTS_PROVIDER: Literal["yarngpt", "gemini"] = "yarngpt"
```

## Code Implementation

The switching logic is in `backend/app/tts/yarngpt.py`:

```python
async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        return await synthesize_speech_gemini(text, language)
    else:
        return await synthesize_speech_yarngpt(text, language)
```

## Testing Each Provider

### Test YarnGPT
```bash
# In backend/.env
TTS_PROVIDER=yarngpt

# Run
docker-compose up --build
# Test at http://localhost:5173
```

### Test Gemini TTS
```bash
# In backend/.env
TTS_PROVIDER=gemini

# Run
docker-compose up --build
# Test at http://localhost:5173
```

## Comparison

| Feature | YarnGPT | Gemini TTS |
|---------|---------|------------|
| **Native Voices** | ✅ African language optimized | ⚠️ Multilingual |
| **Quality** | High | Very High |
| **Latency** | ~1-2s | ~1-2s |
| **Cost** | Paid (YarnGPT pricing) | Included with Google API |
| **API Key** | Separate key needed | Uses same Google key |
| **Availability** | Requires YarnGPT access | Public preview |

## Recommendations

### Use YarnGPT when:
- ✅ You need the most authentic African language pronunciation
- ✅ You want voices specifically trained on Yoruba/Hausa/Igbo
- ✅ You have a YarnGPT API key

### Use Gemini TTS when:
- ✅ You want to minimize API keys (use same Google key)
- ✅ You want Google's latest TTS technology
- ✅ You're already using Gemini for ASR/LLM
- ✅ You want to test without YarnGPT access

## Fallback Behavior

If TTS fails (either provider), the system returns empty audio bytes without crashing:

```python
try:
    return await synthesize_speech_yarngpt(text, language)
except Exception:
    return b""  # Silent fallback
```

## Adding Custom Voices

### For YarnGPT
Edit `VOICE_MAP` in `backend/app/tts/yarngpt.py`:

```python
VOICE_MAP = {
    "yoruba": "femi",    # Change to male voice
    "hausa": "musa",     # Change to male voice
    "igbo": "emeka",     # Change to male voice
}
```

### For Gemini
Edit `GEMINI_VOICE_MAP`:

```python
GEMINI_VOICE_MAP = {
    "yoruba": "Puck",    # Different Gemini voice
    "hausa": "Charon",
    "igbo": "Kore",
}
```

See [Gemini voice list](https://ai.google.dev/api/generate-content#voice) for available voices.

## Troubleshooting

### YarnGPT Issues
```
Error: 401 Unauthorized
→ Check YARNGPT_API_KEY is correct
```

```
Error: 403 Forbidden
→ Verify YarnGPT account has API access
```

### Gemini TTS Issues
```
Error: Model not found
→ Ensure using 'gemini-2.5-flash-preview-tts'
→ Check Google API key has access to TTS models
```

### No Audio Output
```
→ Check TTS_PROVIDER value is "yarngpt" or "gemini"
→ Verify API keys are set
→ Check backend logs: docker-compose logs backend
```

## Environment Variables Summary

```env
# Required for both
GOOGLE_API_KEY=xxx

# Required for YarnGPT
YARNGPT_API_KEY=xxx

# TTS Provider selection
TTS_PROVIDER=yarngpt  # or "gemini"
```

---

**Quick Switch**: Just change `TTS_PROVIDER` in `.env` and restart! 🚀
