# Pydantic AI + Google Gemini Setup

This project uses **Pydantic AI** to interact with Google's Gemini models via the Generative Language API.

## Configuration

### Model Name Format

Pydantic AI uses the following format for Google models:

```python
agent = Agent('google-gla:gemini-2.0-flash-exp')
```

Where:
- `google-gla` = Google Generative Language API (aistudio.google.com)
- `gemini-2.0-flash-exp` = The model name

### Available Models

You can use any of Google's Gemini models:
- `google-gla:gemini-2.0-flash-exp` (recommended for this project - fastest, experimental)
- `google-gla:gemini-2.5-flash` (stable, fast)
- `google-gla:gemini-2.5-pro` (most capable)
- `google-gla:gemini-1.5-flash` (older, still good)

### API Key Setup

1. Go to [aistudio.google.com](https://aistudio.google.com) and create an API key
2. Set it as an environment variable:

```bash
export GOOGLE_API_KEY=your-api-key
```

Or in your `.env` file:

```env
GOOGLE_API_KEY=your-api-key
```

### How Pydantic AI Handles It

Pydantic AI automatically:
- Reads the `GOOGLE_API_KEY` from environment variables
- Configures the Google provider
- Handles audio input (webm/wav) via the API
- Returns structured responses based on your Pydantic model

### Agent Configuration

```python
from pydantic_ai import Agent
from pydantic import BaseModel, Field

class ConversationTurn(BaseModel):
    user_transcription: str
    grammar_is_correct: bool
    correction_feedback: str | None
    reply_text_local: str
    reply_text_english: str

agent = Agent(
    'google-gla:gemini-2.0-flash-exp',
    result_type=ConversationTurn,
    system_prompt="Your instructions here..."
)
```

### Alternative: Explicit Provider

If you need more control, you can explicitly create the provider:

```python
from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

provider = GoogleProvider(api_key='your-api-key')
model = GoogleModel('gemini-2.0-flash-exp', provider=provider)
agent = Agent(model)
```

## Dependencies

The project uses `pydantic-ai` (not `pydantic-ai-slim[google]`) which includes all providers by default:

```txt
pydantic-ai==1.25.1
```

If you want to use the slim version with only Google support:

```txt
pydantic-ai-slim[google]==1.25.1
```

## Vertex AI (Optional)

If you want to use Vertex AI instead of the Generative Language API:

1. Change the model name format:
```python
agent = Agent('google-vertex:gemini-2.0-flash-exp')
```

2. Set up Vertex AI credentials (requires more setup)

For this project, we use the simpler Generative Language API via `google-gla`.

## References

- [Pydantic AI Docs](https://ai.pydantic.dev/)
- [Google AI Studio](https://aistudio.google.com)
- [Gemini Models](https://ai.google.dev/models/gemini)
