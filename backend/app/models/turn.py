from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Turn(Base):
    __tablename__ = "turns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    turn_number = Column(Integer, nullable=False)
    
    # User input
    user_audio_url = Column(String, nullable=True)
    user_transcription = Column(Text, nullable=False)
    
    # AI response
    ai_response_text = Column(Text, nullable=False)
    ai_response_audio_url = Column(String, nullable=True)
    
    # Grammar feedback
    grammar_correction = Column(Text, nullable=True)
    grammar_score = Column(Integer, nullable=True)  # 0-10 scale
    
    # Relationships
    conversation = relationship("Conversation", back_populates="turns")
