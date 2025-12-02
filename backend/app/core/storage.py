"""Supabase Storage helper for audio uploads."""

import os
import logging
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
        file_type: str  # 'user' or 'ai'
    ) -> str:
        """
        Generate standardized object key for audio files.
        
        Pattern: {user_id}/{conversation_id}/{turn_number}/{type}.webm
        """
        extension = "webm"  # Default, can be made dynamic
        return f"{user_id}/{conversation_id}/{turn_number}/{file_type}.{extension}"
    
    async def upload_audio(
        self,
        audio_data: bytes,
        user_id: str,
        conversation_id: str,
        turn_number: int,
        file_type: str  # 'user' or 'ai'
        ) -> Optional[str]:
        """
        Upload audio to Supabase Storage and return public URL.
        
        Returns:
            Public URL of the uploaded file, or None if upload fails
        """
        try:
            object_key = self._get_object_key(user_id, conversation_id, turn_number, file_type)
            
            # Upload to Supabase Storage
            response = supabase.storage.from_(self.bucket_name).upload(
                path=object_key,
                file=audio_data,
                file_options={"content-type": "audio/webm"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(self.bucket_name).get_public_url(object_key)
            
            return public_url
            
        except Exception as e:
            logging.getLogger(__name__).exception("Error uploading audio to Supabase Storage: %s", e)
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
            logging.getLogger(__name__).exception("Error deleting audio: %s", e)
            return False

# Singleton instance
storage_manager = StorageManager()
