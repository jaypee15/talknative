"""
Script to clean up audio files older than 30 days from Supabase Storage.
Deletes files from storage and sets audio URLs to NULL in the database.
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.supabase_client import supabase
from app.models.conversation import Conversation
from app.models.turn import Turn
from app.core.logging import configure_logging, get_logger


def cleanup_old_audio():
    """
    Clean up audio files older than 30 days.
    """
    configure_logging()
    logger = get_logger(__name__)
    # Create database session
    engine = create_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://"))
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Calculate cutoff date (30 days ago)
        cutoff_date = datetime.now() - timedelta(days=30)
        logger.info("Cleaning up audio files older than %s", cutoff_date.isoformat())
        
        # Find old conversations
        old_conversations = db.query(Conversation).filter(
            Conversation.created_at < cutoff_date
        ).all()
        
        logger.info("Found %s conversations older than 30 days", len(old_conversations))
        
        total_files_deleted = 0
        total_turns_updated = 0
        
        for conv in old_conversations:
            # Get all turns for this conversation
            turns = db.query(Turn).filter(
                Turn.conversation_id == conv.id
            ).all()
            
            for turn in turns:
                files_to_delete = []
                
                # Extract file paths from URLs
                if turn.user_audio_url:
                    # URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
                    path = turn.user_audio_url.split(f"{settings.SUPABASE_BUCKET_NAME}/")[-1]
                    files_to_delete.append(path)
                
                if turn.ai_response_audio_url:
                    path = turn.ai_response_audio_url.split(f"{settings.SUPABASE_BUCKET_NAME}/")[-1]
                    files_to_delete.append(path)
                
                # Delete files from Supabase Storage
                for file_path in files_to_delete:
                    try:
                        supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).remove([file_path])
                        total_files_deleted += 1
                        logger.info("Deleted: %s", file_path)
                    except Exception as e:
                        logger.exception("Error deleting %s: %s", file_path, str(e))
                
                # Update database to NULL audio URLs
                if turn.user_audio_url or turn.ai_response_audio_url:
                    turn.user_audio_url = None
                    turn.ai_response_audio_url = None
                    total_turns_updated += 1
        
        # Commit database changes
        db.commit()
        
        logger.info("Cleanup complete:")
        logger.info("- Files deleted: %s", total_files_deleted)
        logger.info("- Turns updated: %s", total_turns_updated)
        logger.info("- Conversations processed: %s", len(old_conversations))
        
    except Exception as e:
        logger.exception("Error during cleanup: %s", str(e))
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    cleanup_old_audio()
