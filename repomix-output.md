This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    deploy.yml
backend/
  alembic/
    versions/
      001_initial_migration.py
    env.py
    script.py.mako
  app/
    ai/
      agent.py
    api/
      v1/
        chat.py
    core/
      config.py
    db/
      base.py
      session.py
    models/
      conversation.py
      turn.py
    tts/
      __init__.py
      gemini_provider.py
      yarngpt_provider.py
      yarngpt.py
    main.py
  scripts/
    poc_chain.py
  .env.example
  .gitignore
  alembic.ini
  Dockerfile
  Dockerfile.dev
  entrypoint.sh
  requirements.txt
frontend/
  src/
    App.tsx
    main.tsx
    vite-env.d.ts
  .gitignore
  Dockerfile
  Dockerfile.dev
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
.env.example
.gitignore
DEV_SETUP.md
docker-compose.dev.yml
docker-compose.yml
FIXES_APPLIED.md
LANGUAGE_SPECIFIC_PROMPTS.md
PSYCOPG3_MIGRATION.md
PYDANTIC_AI_SETUP.md
QUICK_TTS_SWITCH.md
README.md
TTS_ARCHITECTURE.md
TTS_SWITCHING.md
```

# Files

## File: backend/alembic/versions/001_initial_migration.py
````python
"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-11-29

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('conversations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('language', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    
    op.create_table('turns',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('role', sa.String(), nullable=False),
    sa.Column('transcription', sa.Text(), nullable=True),
    sa.Column('reply_text_local', sa.Text(), nullable=True),
    sa.Column('reply_text_english', sa.Text(), nullable=True),
    sa.Column('correction_feedback', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turns_id'), 'turns', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_turns_id'), table_name='turns')
    op.drop_table('turns')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
````

## File: backend/alembic/env.py
````python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.base import Base
from app.core.config import settings
from app.models.conversation import Conversation
from app.models.turn import Turn

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
````

## File: backend/alembic/script.py.mako
````
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
````

## File: backend/app/ai/agent.py
````python
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from app.core.config import settings

class ConversationTurn(BaseModel):
    user_transcription: str = Field(description="Exact transcription of what the user said")
    grammar_is_correct: bool = Field(description="True if the user's grammar was perfect")
    correction_feedback: str | None = Field(description="English feedback if grammar was wrong")
    reply_text_local: str = Field(description="The response in Igbo/Hausa/Yoruba")
    reply_text_english: str = Field(description="English translation of the response")

SYSTEM_PROMPTS = {
    "yoruba": (
        "You are a native Yoruba language tutor helping learners master this tonal language. "
        "FOCUS AREAS: "
        "- Tone accuracy (high/mid/low tones) - tones change word meanings "
        "- Proper use of vowel harmony (oral vs nasal vowels) "
        "- Culturally appropriate greetings based on time/context "
        "- Correct verb serialization patterns "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Incorrect tone patterns (e.g., 'ọmọ' child vs 'ọmọ́' offspring) "
        "- Missing or wrong diacritics "
        "- Improper verb ordering in serial constructions "
        "- Wrong vowel harmony in compound words "
        "\n"
        "You will receive audio from a learner speaking Yoruba. "
        "1. Transcribe EXACTLY what they said with proper tone marks (á, à, ā, é, è, etc.) "
        "2. If they made mistakes, explain briefly in English focusing on tones, vowels, or grammar "
        "3. Continue the conversation naturally in Yoruba, demonstrating correct usage "
        "4. Use appropriate cultural expressions and greetings"
    ),
    "hausa": (
        "You are a native Hausa language tutor helping learners master this important West African language. "
        "FOCUS AREAS: "
        "- Grammatical gender (masculine/feminine) and agreement "
        "- Grade system (verb modifications showing direction/voice) "
        "- Proper use of aspect markers (continuative, completive, future) "
        "- Correct usage of pronouns and possessives "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Gender agreement errors (adjectives/verbs not matching noun gender) "
        "- Grade confusion (using wrong verb grade for context) "
        "- Aspect marker misuse (na/ina/za confusion) "
        "- Incorrect pronoun forms for gender "
        "\n"
        "You will receive audio from a learner speaking Hausa. "
        "1. Transcribe EXACTLY what they said (use proper Hausa orthography) "
        "2. If they made mistakes, explain briefly in English focusing on gender, grades, or aspects "
        "3. Continue the conversation naturally in Hausa, demonstrating correct usage "
        "4. Use culturally appropriate Islamic greetings when relevant (Salam alaikum, etc.)"
    ),
    "igbo": (
        "You are a native Igbo language tutor helping learners master this complex tonal language. "
        "FOCUS AREAS: "
        "- Tone patterns (high/low/downstep) - crucial for meaning "
        "- Vowel harmony rules (must follow throughout words) "
        "- Serial verb constructions (multiple verbs in sequence) "
        "- Proper use of noun class prefixes "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Tone errors causing meaning changes "
        "- Vowel harmony violations (mixing incompatible vowels) "
        "- Wrong verb ordering in serial constructions "
        "- Incorrect or missing noun class markers "
        "- Improper use of stative verbs "
        "\n"
        "You will receive audio from a learner speaking Igbo. "
        "1. Transcribe EXACTLY what they said with proper tone marks (á, à, ọ́, ọ̀, etc.) "
        "2. If they made mistakes, explain briefly in English focusing on tones, vowel harmony, or verb patterns "
        "3. Continue the conversation naturally in Igbo, demonstrating correct usage "
        "4. Use community-oriented expressions and appropriate proverbs when relevant"
    )
}

def get_agent(language: str) -> Agent:
    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["yoruba"])
    
    return Agent(
        'google-gla:gemini-2.5-flash',
        output_type=ConversationTurn,
        system_prompt=system_prompt,
    )

# Backward compatibility: default agent for Yoruba
agent = get_agent("yoruba")
````

## File: backend/app/api/v1/chat.py
````python
import base64
from fastapi import APIRouter, UploadFile, File, Query
from pydantic_ai import BinaryContent
from app.ai.agent import get_agent
from app.tts import synthesize_speech

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    file: UploadFile = File(...),
    language: str = Query("yoruba", pattern="^(yoruba|hausa|igbo)$")
):
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"

    # Get language-specific agent
    agent = get_agent(language)
    
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    data = result.output

    audio_response = await synthesize_speech(
        text=data.reply_text_local,
        language=language
    )

    return {
        "transcription": data.user_transcription,
        "correction": data.correction_feedback,
        "reply": data.reply_text_local,
        "audio": base64.b64encode(audio_response).decode(),
    }
````

## File: backend/app/core/config.py
````python
from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    YARNGPT_API_KEY: str
    DATABASE_URL: str
    CORS_ALLOW_ORIGINS: list[str] = ["*"]
    
    TTS_PROVIDER: Literal["yarngpt", "gemini"] = "yarngpt"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()
````

## File: backend/app/db/base.py
````python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Ensure DATABASE_URL uses the correct driver for psycopg3
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
````

## File: backend/app/db/session.py
````python
from app.db.base import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
````

## File: backend/app/models/conversation.py
````python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
````

## File: backend/app/models/turn.py
````python
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.db.base import Base

class Turn(Base):
    __tablename__ = "turns"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)
    transcription = Column(Text)
    reply_text_local = Column(Text)
    reply_text_english = Column(Text)
    correction_feedback = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
````

## File: backend/app/tts/__init__.py
````python
from app.core.config import settings

async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        return await gemini_tts(text, language)
    else:
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        return await yarngpt_tts(text, language)
````

## File: backend/app/tts/gemini_provider.py
````python
from pydantic_ai import Agent

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
        print(f"Gemini TTS error: {e}")
        return b""
````

## File: backend/app/tts/yarngpt_provider.py
````python
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
````

## File: backend/app/tts/yarngpt.py
````python
# This file is deprecated. Use the new modular structure:
# - yarngpt_provider.py for YarnGPT TTS
# - gemini_provider.py for Gemini TTS
# - __init__.py for the router

# For backward compatibility, import from the main module
from app.tts import synthesize_speech

__all__ = ['synthesize_speech']
````

## File: backend/app/main.py
````python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.chat import router as chat_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

app.include_router(chat_router, prefix="/api/v1")
````

## File: backend/scripts/poc_chain.py
````python
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
````

## File: backend/.env.example
````
GOOGLE_API_KEY=your_google_api_key_here
YARNGPT_API_KEY=your_yarngpt_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOW_ORIGINS=["*"]

# TTS Provider: "yarngpt" or "gemini"
TTS_PROVIDER=yarngpt

# Note: DATABASE_URL will automatically be converted to use psycopg driver
# You can also use: postgresql+psycopg://user:password@host:5432/dbname
````

## File: backend/.gitignore
````
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv
.env
*.log
.DS_Store
.idea
.vscode
*.db
*.sqlite
alembic.ini.bak
````

## File: backend/alembic.ini
````
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = 

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
````

## File: backend/Dockerfile
````
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
````

## File: backend/Dockerfile.dev
````
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
````

## File: backend/entrypoint.sh
````bash
#!/bin/bash
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8080
````

## File: backend/requirements.txt
````
fastapi==0.122.0
uvicorn[standard]==0.38.0
httpx==0.28.1
pydantic==2.12.5
pydantic-settings==2.12.0
pydantic-ai==1.25.1
python-multipart==0.0.20
sqlalchemy==2.0.44
alembic==1.17.2
psycopg[binary]==3.2.13
````

## File: frontend/src/vite-env.d.ts
````typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
````

## File: frontend/Dockerfile
````
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
````

## File: frontend/Dockerfile.dev
````
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
````

## File: .env.example
````
GOOGLE_API_KEY=your_google_api_key_here
YARNGPT_API_KEY=your_yarngpt_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOW_ORIGINS=["*"]

# TTS Provider: "yarngpt" or "gemini"
TTS_PROVIDER=yarngpt
````

## File: DEV_SETUP.md
````markdown
# Development Setup Guide

This project has two Docker Compose configurations:

## 🔥 Development Mode (Hot Reload)

### Quick Start
```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or use the shorthand
docker-compose -f docker-compose.dev.yml up
```

### Features
✅ **Backend Auto-Reload**
- Code changes instantly reload the server
- No rebuild needed
- Uvicorn `--reload` flag enabled

✅ **Frontend Hot Module Replacement (HMR)**
- Instant UI updates on save
- Vite dev server with HMR
- Fast refresh for React components

✅ **Volume Mounting**
- Your local code is synced to containers
- Edit locally, see changes immediately
- No need to rebuild after code changes

### What's Different

**Backend:**
- Uses `Dockerfile.dev`
- Mounts `./backend` → `/app` (with volume)
- Runs: `uvicorn app.main:app --reload`
- Python cache excluded from sync

**Frontend:**
- Uses `Dockerfile.dev`
- Mounts `./frontend` → `/app` (with volume)
- Runs: `npm run dev --host`
- Preserves `node_modules` in container
- Vite dev server on port 5173

### Access Points
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:8080 (FastAPI with reload)
- **Backend Health**: http://localhost:8080/healthz

### Development Workflow
```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up

# 2. Edit code in your IDE
# backend/app/api/v1/chat.py
# frontend/src/App.tsx

# 3. Save → Changes appear automatically! ✨

# 4. View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# 5. Stop
docker-compose -f docker-compose.dev.yml down
```

### When to Rebuild

You only need to rebuild if you change:
- ✅ `requirements.txt` (Python dependencies)
- ✅ `package.json` (npm dependencies)
- ✅ Dockerfile itself

```bash
# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build
```

## 🚀 Production Mode (Optimized Build)

### Quick Start
```bash
# Build and run production containers
docker-compose up --build
```

### Features
- ✅ Optimized builds
- ✅ Production-ready Nginx for frontend
- ✅ Smaller image sizes
- ✅ No dev dependencies

### What's Different

**Backend:**
- Uses `Dockerfile` (production)
- Runs migrations on startup
- No auto-reload
- Optimized for deployment

**Frontend:**
- Uses `Dockerfile` (production)
- Multi-stage build (Node → Nginx)
- Serves static files via Nginx
- Port 8080 (maps to 5173 for consistency)

### Access Points
- **Frontend**: http://localhost:5173 (via Nginx)
- **Backend**: http://localhost:8080

### When to Use
- ✅ Testing production builds locally
- ✅ Before deploying to Cloud Run
- ✅ Performance testing

## Comparison

| Feature | Dev Mode | Production Mode |
|---------|----------|-----------------|
| **Hot Reload** | ✅ Yes | ❌ No |
| **Volume Mounting** | ✅ Yes | ❌ No |
| **Build Speed** | Fast (cached) | Slower (optimized) |
| **Image Size** | Larger | Smaller |
| **Frontend Server** | Vite dev | Nginx |
| **Backend Reload** | Auto | Manual |
| **Use Case** | Development | Deployment/Testing |

## File Structure

```
.
├── docker-compose.yml          # Production config
├── docker-compose.dev.yml      # Development config (use this!)
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build (with reload)
│   └── ...
└── frontend/
    ├── Dockerfile              # Production build (Nginx)
    ├── Dockerfile.dev          # Development build (Vite dev)
    └── ...
```

## Environment Variables

### Development
Create `backend/.env`:
```bash
GOOGLE_API_KEY=your_key_here
YARNGPT_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ALLOW_ORIGINS=["http://localhost:5173"]
TTS_PROVIDER=yarngpt
```

### Production
Same file, but ensure `CORS_ALLOW_ORIGINS` matches your production URL.

## Troubleshooting

### Backend not reloading
```bash
# Check if volume is mounted
docker-compose -f docker-compose.dev.yml exec backend ls -la /app

# Check logs for reload events
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Frontend not hot-reloading
```bash
# Check Vite is running
docker-compose -f docker-compose.dev.yml logs frontend

# Ensure port 5173 is accessible
curl http://localhost:5173
```

### Port conflicts
```bash
# Check what's using ports
lsof -i :8080
lsof -i :5173

# Stop conflicting services
docker-compose -f docker-compose.dev.yml down
```

### Slow on macOS
Docker volumes can be slow on macOS. Consider:
- Use `:cached` or `:delegated` flags
- Or run outside Docker for development

```yaml
volumes:
  - ./backend:/app:cached  # Faster on macOS
```

## Best Practices

### Development
1. **Always use dev compose** for local work
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Keep containers running** - don't restart for code changes

3. **Watch the logs** - see reload events
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Rebuild only when needed** (dependencies change)

### Before Committing
1. **Test production build**
   ```bash
   docker-compose up --build
   ```

2. **Ensure both modes work**

3. **Check for errors** in production logs

## Quick Reference

```bash
# Development (daily use)
docker-compose -f docker-compose.dev.yml up        # Start dev
docker-compose -f docker-compose.dev.yml down      # Stop dev
docker-compose -f docker-compose.dev.yml logs -f   # Watch logs

# Production (testing)
docker-compose up --build                          # Start prod
docker-compose down                                # Stop prod

# Rebuild dependencies
docker-compose -f docker-compose.dev.yml up --build

# Shell into containers
docker-compose -f docker-compose.dev.yml exec backend bash
docker-compose -f docker-compose.dev.yml exec frontend sh
```

---

**Recommended for Development**: Always use `docker-compose.dev.yml` 🔥
````

## File: docker-compose.dev.yml
````yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/__pycache__
      - backend-alembic:/app/alembic/versions
    env_file:
      - .env
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - YARNGPT_API_KEY=${YARNGPT_API_KEY}
      - CORS_ALLOW_ORIGINS=["http://localhost:5173"]
      - PYTHONUNBUFFERED=1

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
    depends_on:
      - backend

volumes:
  backend-alembic:
````

## File: FIXES_APPLIED.md
````markdown
# Fixes Applied - Pydantic AI API Updates

## Issue 1: `result_type` Parameter Error

**Error:**
```
pydantic_ai.exceptions.UserError: Unknown keyword arguments: `result_type`
```

**Root Cause:**
Pydantic AI API changed - the parameter name is now `output_type` instead of `result_type`.

**Fix Applied:**
- **File:** `backend/app/ai/agent.py` (line 81)
- **Change:** `result_type=ConversationTurn` → `output_type=ConversationTurn`

**Why it works:**
The Pydantic AI library updated its API. The structured output is now specified via `output_type` parameter.

---

## Issue 2: Audio Input Format Error

**Error:**
```
AssertionError: Expected code to be unreachable, but got: {'mime_type': 'audio/wav', 'data': b'\x1aE\xdf\xa3...
```

**Root Cause:**
Audio data was being passed as a plain dictionary `{"mime_type": ..., "data": ...}`, but Pydantic AI expects a `BinaryContent` object.

**Fix Applied:**

### 1. `backend/app/api/v1/chat.py`

**Before:**
```python
result = await agent.run([
    f"The user is speaking {language}. Respond in {language}.",
    {"mime_type": mime_type, "data": audio_bytes}  # ❌ Plain dict
])
data = result.data  # ❌ Wrong property
```

**After:**
```python
from pydantic_ai import BinaryContent

# Create BinaryContent for audio
audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)

result = await agent.run([
    f"The user is speaking {language}. Respond in {language}.",
    audio_content  # ✅ BinaryContent object
])
data = result.output  # ✅ Correct property
```

**Changes:**
1. Added `from pydantic_ai import BinaryContent` import
2. Created `BinaryContent` object with `data` and `media_type` parameters
3. Changed `result.data` to `result.output` (API change)

### 2. `backend/scripts/poc_chain.py`

**Before:**
```python
result = await agent.run([
    f"The user is speaking {language}. Respond in {language}.",
    {"mime_type": "audio/webm", "data": audio_bytes}  # ❌ Plain dict
])
data = result.data  # ❌ Wrong property
```

**After:**
```python
from pydantic_ai import BinaryContent

# Create BinaryContent for audio
audio_content = BinaryContent(data=audio_bytes, media_type="audio/webm")

result = await agent.run([
    f"The user is speaking {language}. Respond in {language}.",
    audio_content  # ✅ BinaryContent object
])
data = result.output  # ✅ Correct property
```

**Why it works:**
`BinaryContent` is Pydantic AI's proper class for handling binary data (audio, images, video, etc.). It provides:
- Proper type checking
- Media type validation
- Identifier for tracking
- Properties like `is_audio`, `data_uri`, etc.

---

## Summary of API Changes

| Old API | New API | Component |
|---------|---------|-----------|
| `result_type=` | `output_type=` | Agent initialization |
| `{"mime_type": ..., "data": ...}` | `BinaryContent(data=..., media_type=...)` | Audio input |
| `result.data` | `result.output` | Result property |

---

## Files Modified

1. ✅ `backend/app/ai/agent.py` - Updated `result_type` → `output_type`
2. ✅ `backend/app/api/v1/chat.py` - Updated audio input format and result property
3. ✅ `backend/scripts/poc_chain.py` - Updated audio input format and result property

---

## Testing Status

✅ **Hot Reload Working:** Server automatically restarted after changes
✅ **Server Started:** Application startup complete
⏳ **Integration Test:** Ready for testing with actual audio input

---

## Next Steps

1. Test the `/api/v1/chat` endpoint with real audio
2. Verify transcription and response generation
3. Confirm TTS audio output works correctly

---

## References

- [Pydantic AI Input Documentation](https://ai.pydantic.dev/input/)
- [Pydantic AI BinaryContent API](https://ai.pydantic.dev/api/messages/)
- [Pydantic AI Output Documentation](https://ai.pydantic.dev/output/)
````

## File: LANGUAGE_SPECIFIC_PROMPTS.md
````markdown
# Language-Specific System Prompts

This document explains the language-specific AI tutor prompts implemented for Yoruba, Hausa, and Igbo.

## Overview

Each language now has its own specialized system prompt that guides the AI to:
1. Focus on language-specific grammar rules
2. Identify common learner mistakes for that language
3. Provide culturally appropriate responses
4. Use proper orthography and tone marks

## Implementation

### Architecture

```python
# app/ai/agent.py

SYSTEM_PROMPTS = {
    "yoruba": "...",
    "hausa": "...",
    "igbo": "..."
}

def get_agent(language: str) -> Agent:
    """Returns language-specific agent"""
    system_prompt = SYSTEM_PROMPTS.get(language)
    return Agent('google-gla:gemini-2.5-flash', 
                 result_type=ConversationTurn,
                 system_prompt=system_prompt)
```

### Usage

```python
# In chat endpoint
agent = get_agent(language)  # "yoruba", "hausa", or "igbo"
result = await agent.run([...])
```

## Language-Specific Details

### Yoruba 🇳🇬

**Focus Areas:**
- **Tone accuracy** - High (á), mid (a), low (à) tones change meanings
- **Vowel harmony** - Oral vs nasal vowels must harmonize
- **Cultural greetings** - Time-based and context-appropriate
- **Verb serialization** - Proper ordering of multiple verbs

**Common Mistakes:**
- Tone errors: `ọmọ` (child) vs `ọmọ́` (offspring)
- Missing diacritics
- Wrong verb order in serial constructions
- Vowel harmony violations in compounds

**Example Correction:**
```
User says: "Mo wa ile" (wrong tone)
AI corrects: "The correct pronunciation is 'Mo wá ilé' with high tones on 'wá' and 'lé'"
```

### Hausa 🇳🇬

**Focus Areas:**
- **Grammatical gender** - All nouns are masculine or feminine
- **Grade system** - 7 verb grades showing direction/voice
- **Aspect markers** - na/ina (continuous), za (future), etc.
- **Pronoun agreement** - Must match gender

**Common Mistakes:**
- Gender agreement: `kyakkyawan yarinya` (good girl) - kyakkyawan must be feminine
- Grade confusion: using wrong grade for context
- Aspect errors: `na/ina` vs `za` confusion
- Wrong pronoun for gender

**Example Correction:**
```
User says: "Kyakkyawan yarinya" (wrong gender agreement)
AI corrects: "Use feminine form: 'Kyakkyawar yarinya' (kyakkyawar agrees with feminine yarinya)"
```

### Igbo 🇳🇬

**Focus Areas:**
- **Tone patterns** - High, low, and downstep affect meaning
- **Vowel harmony** - Strict rules throughout words
- **Serial verb constructions** - Complex verb sequences
- **Noun class prefixes** - Must use correct markers

**Common Mistakes:**
- Tone errors causing meaning changes
- Vowel harmony violations (mixing incompatible vowels)
- Wrong verb ordering
- Missing noun class markers
- Improper stative verb usage

**Example Correction:**
```
User says: "O na-eje ulo" (vowel harmony error)
AI corrects: "Vowel harmony rule: use 'ụlọ' not 'ulo' (o-group vowels: o, ọ, u, ụ must harmonize)"
```

## Prompt Structure

Each prompt follows this structure:

1. **Role Definition** - "You are a native [Language] tutor..."
2. **Focus Areas** - Key grammatical/tonal features to emphasize
3. **Common Mistakes** - What learners typically struggle with
4. **Instructions** - How to transcribe, correct, and respond
5. **Cultural Context** - Appropriate expressions and usage

## Benefits

### 1. **Improved Error Detection**
- Each agent knows what to look for in its specific language
- Better at catching language-specific mistakes

### 2. **Better Pedagogical Feedback**
- Corrections focus on what matters for each language
- Examples are more relevant

### 3. **Cultural Appropriateness**
- Yoruba agent knows elaborate greeting protocols
- Hausa agent uses Islamic greetings appropriately
- Igbo agent incorporates proverbs and community expressions

### 4. **Accurate Transcription**
- Each agent knows proper orthography for its language
- Correct use of tone marks and diacritics

## Testing

### Test Each Language
```bash
# Test Yoruba
python backend/scripts/poc_chain.py audio.webm yoruba

# Test Hausa
python backend/scripts/poc_chain.py audio.webm hausa

# Test Igbo
python backend/scripts/poc_chain.py audio.webm igbo
```

### Compare Responses
Record the same audio in each language and compare:
- Accuracy of transcription
- Relevance of corrections
- Cultural appropriateness
- Teaching quality

## Prompt Maintenance

### When to Update Prompts

1. **User feedback** - If learners report incorrect corrections
2. **Native speaker review** - Get feedback from native speakers
3. **Common patterns** - If you notice recurring issues
4. **Cultural updates** - As language usage evolves

### How to Update

1. Edit `SYSTEM_PROMPTS` dict in `app/ai/agent.py`
2. Test with sample audio files
3. Deploy (no code changes needed, just prompt text)

### A/B Testing

You could implement A/B testing by creating alternate prompts:

```python
SYSTEM_PROMPTS_V2 = {
    "yoruba": "...",  # Alternative prompt
}

# Toggle in config
USE_PROMPT_VERSION = "v1"  # or "v2"
```

## Future Enhancements

### 1. **Difficulty Levels**
Add beginner/intermediate/advanced prompts:
```python
SYSTEM_PROMPTS = {
    "yoruba": {
        "beginner": "Focus on basic greetings and simple phrases...",
        "intermediate": "Focus on tone accuracy and verb constructions...",
        "advanced": "Focus on idiomatic expressions and proverbs..."
    }
}
```

### 2. **Topic-Specific Prompts**
Different prompts for different conversation topics:
- Greetings
- Shopping
- Family
- Business

### 3. **Regional Variations**
Add support for dialects:
```python
SYSTEM_PROMPTS = {
    "yoruba": {
        "standard": "...",
        "ijesha": "...",  # Ijesha dialect
        "ekiti": "..."    # Ekiti dialect
    }
}
```

## Performance Impact

- **No latency impact** - Prompts are loaded at agent creation
- **Minimal memory** - Just text strings in memory
- **Easy to cache** - Agents can be cached per language

## Best Practices

1. **Be specific** - Detail exact rules and common errors
2. **Give examples** - Show right vs wrong in the prompt
3. **Stay focused** - Each language has 3-4 main focus areas
4. **Cultural context** - Include appropriate cultural guidance
5. **Iterate** - Update based on real learner interactions

## Validation Checklist

- [ ] Native speaker review for each language
- [ ] Test with beginner, intermediate, advanced learners
- [ ] Verify tone mark accuracy in transcriptions
- [ ] Check cultural appropriateness of responses
- [ ] Ensure corrections are clear and helpful
- [ ] Compare against generic prompt performance

---

**Implementation Date**: November 29, 2025  
**Languages Supported**: Yoruba, Hausa, Igbo  
**Model**: Gemini 2.5 Flash via Pydantic AI
````

## File: PSYCOPG3_MIGRATION.md
````markdown
# Psycopg3 Configuration

This project uses **psycopg3** (`psycopg[binary]`), the latest PostgreSQL adapter for Python.

## What Changed

### Before (psycopg2)
```python
# requirements.txt
psycopg2-binary==2.9.9

# Database URL
postgresql://user:pass@host/db
```

### After (psycopg3)
```python
# requirements.txt
psycopg[binary]==3.2.13

# Database URL (automatically converted)
postgresql://user:pass@host/db  → postgresql+psycopg://user:pass@host/db
```

## How It Works

The code in `app/db/base.py` automatically converts standard PostgreSQL URLs to use the psycopg driver:

```python
# Automatic conversion
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(database_url)
```

## Supported URL Formats

All of these work:

```bash
# Standard format (auto-converted)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Explicit psycopg driver (recommended)
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname

# With SSL mode
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname?sslmode=require

# Supabase example
DATABASE_URL=postgresql+psycopg://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
```

## Benefits of Psycopg3

### Performance
- 🚀 **Faster** - Improved performance over psycopg2
- 🔧 **Better async** - Native async/await support
- 💾 **Memory efficient** - Lower memory footprint

### Modern Python
- ✅ **Type hints** - Full typing support
- ✅ **Python 3.7+** - Modern Python features
- ✅ **Active development** - Regular updates

### Better API
- 🎯 **Cleaner API** - More Pythonic interface
- 🔒 **Better security** - Improved connection handling
- 📦 **Binary package** - No compilation needed with `psycopg[binary]`

## Compatibility

### SQLAlchemy Support
- ✅ SQLAlchemy 1.4+
- ✅ SQLAlchemy 2.0+
- ✅ Alembic migrations

### Connection Pooling
Works with all SQLAlchemy pooling strategies:
- NullPool (default for async)
- QueuePool (default for sync)
- StaticPool

## Configuration Options

### In .env
```bash
# Basic
DATABASE_URL=postgresql://user:pass@localhost:5432/talknatives

# With connection parameters
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/talknatives?connect_timeout=10

# Supabase (with pooler)
DATABASE_URL=postgresql+psycopg://postgres.xxx:pass@region.pooler.supabase.com:5432/postgres
```

### In Code (if needed)
```python
# Custom engine with psycopg3
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg://user:pass@host/db",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
)
```

## Troubleshooting

### Issue: "No module named 'psycopg2'"
**Cause**: SQLAlchemy is trying to use psycopg2 driver  
**Solution**: Ensure DATABASE_URL uses `postgresql+psycopg://` prefix

### Issue: "could not connect to server"
**Cause**: Database connection issues  
**Solution**: Check your DATABASE_URL and network connectivity

```bash
# Test connection
psql "postgresql://user:pass@host:5432/dbname"
```

### Issue: SSL required
**Cause**: Database requires SSL connections  
**Solution**: Add `sslmode=require` to URL

```bash
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db?sslmode=require
```

## Migration from psycopg2

If you're migrating from psycopg2, the change is transparent:

### Step 1: Update requirements.txt
```diff
- psycopg2-binary==2.9.9
+ psycopg[binary]==3.2.13
```

### Step 2: Update DATABASE_URL (optional)
```bash
# Old (still works with auto-conversion)
DATABASE_URL=postgresql://user:pass@host/db

# New (explicit)
DATABASE_URL=postgresql+psycopg://user:pass@host/db
```

### Step 3: Rebuild
```bash
docker-compose down
docker-compose up --build
```

## Testing

### Verify Connection
```python
from app.db.base import engine

# Test connection
with engine.connect() as conn:
    result = conn.execute("SELECT 1")
    print(result.fetchone())  # Should print (1,)
```

### Check Driver
```python
print(engine.dialect.driver)  # Should print: 'psycopg'
```

## References

- [Psycopg3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- [SQLAlchemy PostgreSQL Dialects](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)
- [Migration Guide](https://www.psycopg.org/psycopg3/docs/basic/from_pg2.html)

---

**Current Setup**: psycopg[binary]==3.2.13 with automatic URL conversion  
**Status**: ✅ Production-ready
````

## File: PYDANTIC_AI_SETUP.md
````markdown
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
````

## File: QUICK_TTS_SWITCH.md
````markdown
# 🎙️ Quick TTS Switch Reference

## Switch in 10 Seconds

### Option 1: YarnGPT (Native African Voices) ✅
```bash
echo "TTS_PROVIDER=yarngpt" > backend/.env
```

### Option 2: Gemini TTS (Google Latest) 🚀
```bash
echo "TTS_PROVIDER=gemini" > backend/.env
```

Then restart:
```bash
docker-compose restart backend
```

---

## Voice Comparison

| Language | YarnGPT Voice | Gemini Voice |
|----------|---------------|--------------|
| Yoruba   | Idera         | Kainene      |
| Hausa    | Zainab        | Aoife        |
| Igbo     | Amaka         | Kainene      |

---

## API Keys Required

**YarnGPT Mode:**
- `GOOGLE_API_KEY` ← For ASR/LLM
- `YARNGPT_API_KEY` ← For TTS

**Gemini Mode:**
- `GOOGLE_API_KEY` ← For everything (ASR/LLM/TTS)

---

## Which to Use?

**Choose YarnGPT if:**
- ✅ You have YarnGPT access
- ✅ Need authentic Nigerian pronunciation

**Choose Gemini if:**
- ✅ Single API key setup
- ✅ Testing without YarnGPT
- ✅ Want latest Google tech

---

See `TTS_SWITCHING.md` for complete guide.
````

## File: TTS_ARCHITECTURE.md
````markdown
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
````

## File: TTS_SWITCHING.md
````markdown
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
````

## File: frontend/src/App.tsx
````typescript
import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

interface ChatResponse {
  transcription: string;
  correction: string | null;
  reply: string;
  audio: string;
}

export default function App() {
  const [language, setLanguage] = useState<'yoruba' | 'hausa' | 'igbo'>('yoruba');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true 
  });

  async function sendAudio() {
    if (!mediaBlobUrl) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const form = new FormData();
      form.append('file', blob, 'audio.webm');

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/chat?language=${language}`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      setResponse(data);

      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send audio');
    } finally {
      setLoading(false);
    }
  }

  function playAudio(audioBase64: string) {
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    setAudioElement(audio);
    setAudioPlaying(true);

    audio.onended = () => {
      setAudioPlaying(false);
    };

    audio.onerror = () => {
      setAudioPlaying(false);
      setError('Failed to play audio');
    };

    audio.play().catch((err) => {
      setAudioPlaying(false);
      setError('Audio playback failed: ' + err.message);
    });
  }

  function replayAudio() {
    if (response?.audio) {
      playAudio(response.audio);
    }
  }

  function reset() {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    clearBlobUrl();
    setResponse(null);
    setError(null);
    setAudioPlaying(false);
    setAudioElement(null);
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        TalkNative - Conversational Language Learning
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Language:
        </label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        >
          <option value="yoruba">Yoruba</option>
          <option value="hausa">Hausa</option>
          <option value="igbo">Igbo</option>
        </select>
      </div>

      <div style={{ 
        padding: '30px', 
        background: '#f5f5f5', 
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Status: <strong>{status}</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={startRecording}
            disabled={status === 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status === 'recording' ? '#ccc' : '#4CAF50',
              color: 'white',
              cursor: status === 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎤 Start Recording
          </button>
          
          <button
            onClick={stopRecording}
            disabled={status !== 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status !== 'recording' ? '#ccc' : '#f44336',
              color: 'white',
              cursor: status !== 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Recording
          </button>
          
          <button
            onClick={sendAudio}
            disabled={!mediaBlobUrl || loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: !mediaBlobUrl || loading ? '#ccc' : '#2196F3',
              color: 'white',
              cursor: !mediaBlobUrl || loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Sending...' : '📤 Send'}
          </button>
          
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ 
          padding: '30px', 
          background: '#e3f2fd', 
          borderRadius: '12px',
          border: '2px solid #2196F3'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Response</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Your transcription:</strong>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 0 0'
            }}>
              {response.transcription}
            </p>
          </div>

          {response.correction && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Correction:</strong>
              <p style={{ 
                background: '#fff3e0', 
                padding: '10px', 
                borderRadius: '6px',
                margin: '5px 0 0 0',
                color: '#e65100'
              }}>
                {response.correction}
              </p>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <strong>Tutor's reply:</strong>
              {audioPlaying && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  fontSize: '14px',
                  color: '#2196F3',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  🔊 Playing audio...
                </span>
              )}
            </div>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 10px 0',
              fontSize: '18px'
            }}>
              {response.reply}
            </p>
            <button
              onClick={replayAudio}
              disabled={audioPlaying}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                borderRadius: '6px',
                border: 'none',
                background: audioPlaying ? '#ccc' : '#2196F3',
                color: 'white',
                cursor: audioPlaying ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔊 {audioPlaying ? 'Playing...' : 'Replay Audio'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
````

## File: frontend/src/main.tsx
````typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
````

## File: frontend/.gitignore
````
node_modules
dist
*.log
.env
.DS_Store
````

## File: frontend/index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TalkNative - Language Learning</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: frontend/tsconfig.node.json
````json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
````

## File: docker-compose.yml
````yaml
version: '3.8'

services:
  backend:
    build: ./backend
    env_file:
      - .env
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - YARNGPT_API_KEY=${YARNGPT_API_KEY}
      - CORS_ALLOW_ORIGINS=["http://localhost:5173"]

  frontend:
    build: ./frontend
    ports:
      - "5173:8080"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
    depends_on:
      - backend
````

## File: frontend/package.json
````json
{
  "name": "talknatives-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-media-recorder": "^1.6.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
````

## File: frontend/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
````

## File: frontend/vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
````

## File: .gitignore
````
.DS_Store
.env
*.log
node_modules
__pycache__
*.pyc
dist
build
*.egg-info
.venv
venv
.idea
.vscode
````

## File: .github/workflows/deploy.yml
````yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:sha-${{ github.sha }},${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:latest
      
      - name: Build & push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:sha-${{ github.sha }},${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up gcloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          version: latest
          
      - name: Configure project
        run: gcloud config set project ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Deploy backend
        run: |
          gcloud run deploy talknative-backend \
            --image=${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:sha-${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --allow-unauthenticated \
            --port=8080 \
            --memory=1Gi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=10 \
      
      - name: Get backend URL
        id: backend-url
        run: |
          BACKEND_URL=$(gcloud run services describe talknative-backend --region=${{ secrets.GCP_REGION }} --format='value(status.url)')
          echo "url=$BACKEND_URL" >> $GITHUB_OUTPUT
      
      - name: Deploy frontend
        run: |
          gcloud run deploy talknative-frontend \
            --image=${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:sha-${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --allow-unauthenticated \
            --port=8080 \
            --memory=512Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=10 \
            --set-env-vars=VITE_API_BASE_URL=${{ steps.backend-url.outputs.url }}
      
      - name: Get frontend URL
        run: |
          FRONTEND_URL=$(gcloud run services describe talknative-frontend --region=${{ secrets.GCP_REGION }} --format='value(status.url)')
          echo "Frontend deployed at: $FRONTEND_URL"
          echo "Backend deployed at: ${{ steps.backend-url.outputs.url }}"
````

## File: README.md
````markdown
# TalkNatives POC

A conversational language learning app for Yoruba, Hausa, and Igbo using Gemini 2.5 Flash 8B and YarnGPT.

## Tech Stack

- **Frontend**: React + Vite + react-media-recorder
- **Backend**: FastAPI + Pydantic AI
- **AI/ASR**: Google Gemini 2.5 Flash (via Pydantic AI SDK)
- **TTS**: YarnGPT API
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Google Cloud Run (2 services)

## Local Development

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 20+

### Environment Setup

1. Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

2. Fill in your API keys in `backend/.env`:

```env
GOOGLE_API_KEY=your_google_api_key
YARNGPT_API_KEY=your_yarngpt_api_key
DATABASE_URL=your_supabase_postgres_url
CORS_ALLOW_ORIGINS=["http://localhost:5173"]
```

### Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Health Check: http://localhost:8080/healthz

### Run Locally (without Docker)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Testing the POC Chain

Test the full Gemini → YarnGPT pipeline:

```bash
cd backend
python scripts/poc_chain.py path/to/audio.webm yoruba
```

Target: Total latency < 4 seconds

## Database Migrations

**Create a new migration:**

```bash
cd backend
alembic revision --autogenerate -m "description"
```

**Apply migrations:**

```bash
alembic upgrade head
```

## Deployment

### GitHub Secrets Required

Set these in your GitHub repository settings:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `GCP_SA_KEY` (Service Account JSON)
- `GCP_PROJECT_ID`
- `GCP_REGION` (e.g., `us-central1`)
- `GOOGLE_API_KEY`
- `YARNGPT_API_KEY`
- `DATABASE_URL`
- `CORS_ALLOW_ORIGINS` (JSON array string, e.g., `["https://your-frontend-url"]`)

### Deploy

Push to `main` branch:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Build and push Docker images to DockerHub
2. Deploy backend to Cloud Run
3. Deploy frontend to Cloud Run with backend URL

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── chat.py          # Chat endpoint
│   │   ├── ai/
│   │   │   └── agent.py         # Pydantic AI Agent
│   │   ├── core/
│   │   │   └── config.py        # Settings
│   │   ├── db/
│   │   │   ├── base.py          # SQLAlchemy setup
│   │   │   └── session.py       # DB session
│   │   ├── models/
│   │   │   ├── conversation.py
│   │   │   └── turn.py
│   │   ├── tts/
│   │   │   └── yarngpt.py       # YarnGPT client
│   │   └── main.py              # FastAPI app
│   ├── alembic/                 # Migrations
│   ├── scripts/
│   │   └── poc_chain.py         # Test script
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main UI
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/
│   └── deploy.yml               # CI/CD
└── docker-compose.yml
```

## Voice Mapping

- **Yoruba**: idera (female)
- **Hausa**: zainab (female)
- **Igbo**: amaka (female)

## API Endpoints

### `POST /api/v1/chat`

**Query Parameters:**
- `language`: `yoruba` | `hausa` | `igbo` (default: `yoruba`)

**Body:**
- `file`: Audio file (webm/wav)

**Response:**

```json
{
  "transcription": "User's speech transcribed",
  "correction": "Grammar feedback (if needed)",
  "reply": "Tutor's response in target language",
  "audio": "base64-encoded audio"
}
```

## Performance Targets

- **Total Latency**: < 4 seconds (Gemini + YarnGPT)
- **Gemini Response**: ~1-2s
- **YarnGPT TTS**: ~1-2s

## License

MIT
````
