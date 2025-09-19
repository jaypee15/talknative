from fastapi import APIRouter
from app.api.v1.endpoints import chat, lessons, users

api_router_v1 = APIRouter()

api_router_v1.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router_v1.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
api_router_v1.include_router(users.router, prefix="/users", tags=["Users"])