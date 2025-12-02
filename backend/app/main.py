from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.chat import router as chat_router
from app.api.v1.users import router as users_router
from app.api.v1.scenarios import router as scenarios_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.vocabulary import router as vocabulary_router
from app.api.v1.game import router as game_router

app = FastAPI(title="TalkNative API", version="2.0")

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

# V1 API routes
app.include_router(chat_router, prefix="/api/v1", tags=["chat-legacy"])
app.include_router(users_router, prefix="/api/v1/user")
app.include_router(scenarios_router, prefix="/api/v1/scenarios")
app.include_router(conversations_router, prefix="/api/v1/chat")
app.include_router(vocabulary_router, prefix="/api/v1/vocabulary")
app.include_router(game_router, prefix="/api/v1/game")
