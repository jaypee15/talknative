from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
