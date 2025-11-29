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
