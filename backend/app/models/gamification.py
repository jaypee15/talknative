from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func, UniqueConstraint
from app.db.base import Base

class UserScenarioProgress(Base):
    __tablename__ = "user_scenario_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    scenario_id = Column(String, nullable=False)
    stars = Column(Integer, default=0)
    unlocked = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint('user_id', 'scenario_id', name='uq_user_scenario'),)

class UserProverb(Base):
    __tablename__ = "user_proverbs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    proverb_id = Column(String, nullable=False) # We link to JSON ID, not a DB FK for now
    acquired_at = Column(DateTime(timezone=True), server_default=func.now())