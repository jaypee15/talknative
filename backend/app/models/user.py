import enum
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, func
from app.db.base import Base

class LanguageEnum(str, enum.Enum):
    yoruba = "yoruba"
    hausa = "hausa"
    igbo = "igbo"

class ProficiencyEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # Supabase Auth UUID
    email = Column(String, unique=True, index=True, nullable=False)
    target_language = Column(SQLEnum(LanguageEnum), nullable=True)
    proficiency_level = Column(SQLEnum(ProficiencyEnum), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
