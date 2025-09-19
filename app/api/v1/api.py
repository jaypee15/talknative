from fastapi import APIRouter
from app.api.v1.endpoints import health, chat, speech, lesson, auth

api_router_v1 = APIRouter()

api_router_v1.include_router(health.router, prefix="/health", tags=["Health"])

# from app.api.v1.endpoints import chat, lessons, users
api_router_v1.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router_v1.include_router(speech.router, prefix="/speech", tags=["Speech"])
api_router_v1.include_router(lesson.router, prefix="/lesson", tags=["Lesson"])
api_router_v1.include_router(auth.router, prefix="/auth", tags=["Auth"])
# api_router_v1.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
# api_router_v1.include_router(users.router, prefix="/users", tags=["Users"])