from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from app.db.base import Base
from app.models.user import LanguageEnum


class SavedWord(Base):
    __tablename__ = "saved_words"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    word = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    context_sentence = Column(Text, nullable=True)
    language = Column(SQLEnum(LanguageEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
