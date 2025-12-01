from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    scenario_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    turns = relationship("Turn", back_populates="conversation", cascade="all, delete-orphan")
