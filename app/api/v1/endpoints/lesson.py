from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.sql import get_db_session

router = APIRouter()


class LessonResponse(BaseModel):
    lesson_id: str
    title: str
    content: str


@router.get("/next", response_model=LessonResponse)
async def get_next_lesson(db: AsyncSession = Depends(get_db_session)):
    # Placeholder: pick next lesson from DB based on user progress
    return LessonResponse(lesson_id="demo-1", title="Greetings", content="Kedu? - How are you?")


