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
