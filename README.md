# TalkNative Monorepo (Frontend + Backend)

Dockerized Vite React frontend and FastAPI backend.

## Quick start

1. Create `.env` based on the variables below
2. Build and run:

```bash
docker compose up -d --build
```

App: http://localhost/
API: http://localhost/api/v1

## Environment variables

Add a `.env` file in repo root with:

```
APP_NAME=Talk Native Backend
API_V1_STR=/api/v1
REDIS_URL=redis://redis:6379/0
SECRET_KEY=change_me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENAI_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Development

- Frontend dev server: `cd frontend && npm i && VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run dev`
- Backend: `uvicorn app.main:app --reload`

## Compose (single Dockerfile)

The root `Dockerfile` builds the frontend and runs FastAPI + nginx. Redis runs as a separate service:

```bash
docker compose up -d --build
```

### Development image

Use `Dockerfile.dev` by passing an env var to compose. This starts uvicorn with reload and Vite dev server.

```bash
DOCKERFILE=Dockerfile.dev docker compose up -d --build
# Frontend: http://localhost:5173  API: http://localhost:8000
```

