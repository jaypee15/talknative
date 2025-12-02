"""Supabase Storage helper for audio uploads."""

import os
import logging
import asyncio
from app.core.logging import get_logger
from typing import Optional
from app.core.supabase_client import supabase
from app.core.config import settings

class StorageManager:
    """Manage audio file uploads to Supabase Storage."""
    
    def __init__(self):
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
    
    def _get_object_key(
        self,
        user_id: str,
        conversation_id: str,
        turn_number: int,
        file_type: str,  # 'user' or 'ai'
        extension: str = "webm"
    ) -> str:
        """
        Generate standardized object key for audio files.
        
        Pattern: {user_id}/{conversation_id}/{turn_number}/{type}.webm
        """
        return f"{user_id}/{conversation_id}/{turn_number}/{file_type}.{extension}"
    
    async def upload_audio(
        self,
        audio_data: bytes,
        user_id: str,
        conversation_id: str,
        turn_number: int,
        file_type: str,  # 'user' or 'ai'
        content_type: str = "audio/webm",
        extension: str | None = None,
        ) -> Optional[str]:
        """
        Upload audio to Supabase Storage and return public URL.
        
        Returns:
            Public URL of the uploaded file, or None if upload fails
        """
        ext = extension or (
            "wav" if content_type == "audio/wav" else
            "mp3" if content_type == "audio/mpeg" else
            "webm"
        )
        object_key = self._get_object_key(user_id, conversation_id, turn_number, file_type, ext)
        attempts = 3
        for i in range(attempts):
            try:
                response = supabase.storage.from_(self.bucket_name).upload(
                    path=object_key,
                    file=audio_data,
                    file_options={"content_type": content_type, "x-upsert": "true"}
                )
                public_url = supabase.storage.from_(self.bucket_name).get_public_url(object_key)
                return public_url
            except Exception as e:
                logger.warning("Upload attempt %s failed for %s: %s", i + 1, object_key, e)
                if i < attempts - 1:
                    await asyncio.sleep(0.8 * (i + 1))
                else:
                    logger.exception("Error uploading audio to Supabase Storage: %s", e)
                    return None
    
    async def delete_audio(
        self,
        user_id: str,
        conversation_id: str,
        turn_number: int,
        file_type: str
    ) -> bool:
        """Delete audio file from storage."""
        try:
            object_key = self._get_object_key(user_id, conversation_id, turn_number, file_type)
            supabase.storage.from_(self.bucket_name).remove([object_key])
            return True
        except Exception as e:
            logger.exception("Error deleting audio: %s", e)
            return False

# Singleton instance
storage_manager = StorageManager()
logger = get_logger(__name__)
