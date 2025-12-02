"""
Script to clean up audio files older than 30 days from Supabase Storage.
Deletes files from storage and sets audio URLs to NULL in the database.
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.supabase_client import supabase
from app.models.conversation import Conversation
from app.models.turn import Turn


def cleanup_old_audio():
    """
    Clean up audio files older than 30 days.
    """
    # Create database session
    engine = create_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://"))
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Calculate cutoff date (30 days ago)
        cutoff_date = datetime.now() - timedelta(days=30)
        
        print(f"Cleaning up audio files older than {cutoff_date.isoformat()}")
        
        # Find old conversations
        old_conversations = db.query(Conversation).filter(
            Conversation.created_at < cutoff_date
        ).all()
        
        print(f"Found {len(old_conversations)} conversations older than 30 days")
        
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
                        print(f"Deleted: {file_path}")
                    except Exception as e:
                        print(f"Error deleting {file_path}: {str(e)}")
                
                # Update database to NULL audio URLs
                if turn.user_audio_url or turn.ai_response_audio_url:
                    turn.user_audio_url = None
                    turn.ai_response_audio_url = None
                    total_turns_updated += 1
        
        # Commit database changes
        db.commit()
        
        print(f"\nCleanup complete:")
        print(f"- Files deleted: {total_files_deleted}")
        print(f"- Turns updated: {total_turns_updated}")
        print(f"- Conversations processed: {len(old_conversations)}")
        
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    cleanup_old_audio()
