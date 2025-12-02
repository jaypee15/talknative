This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    deploy.yml
backend/
  alembic/
    versions/
      001_initial_migration.py
      002_phase2_schema.py
      003_add_translation_column.py
      004_add_saved_words.py
      005_add_gamification_columns.py
      006_add_map_and_loot.py
    env.py
    script.py.mako
  app/
    ai/
      agent.py
      prompt_builder.py
    api/
      v1/
        chat.py
        conversations.py
        gamep.py
        scenarios.py
        users.py
        vocabulary.py
    core/
      auth.py
      config.py
      storage.py
      supabase_client.py
    data/
      proverbs.json
      scenario_loader.py
      scenarios.json
    db/
      base.py
      session.py
    models/
      conversation.py
      saved_word.py
      schemas.py
      turn.py
      user.py
    tts/
      __init__.py
      gemini_provider.py
      yarngpt_provider.py
      yarngpt.py
    main.py
  scripts/
    cleanup_old_audio.py
    poc_chain.py
  .env.example
  .gitignore
  alembic.ini
  Dockerfile
  Dockerfile.dev
  entrypoint.sh
  requirements.txt
frontend/
  src/
    components/
      CulturalAlert.tsx
      HaggleTicker.tsx
      PatienceMeter.tsx
      RequireAuth.tsx
      ScenarioModal.tsx
    contexts/
      AuthContext.tsx
    lib/
      api.ts
      supabaseClient.ts
    pages/
      ChatPage.tsx
      DashboardPage.tsx
      LoginPage.tsx
      MapDashboard.tsx
      OnboardingPage.tsx
    App.tsx
    AppNew.tsx
    index.css
    LegacyChat.tsx
    main.tsx
    vite-env.d.ts
  .gitignore
  Dockerfile
  Dockerfile.dev
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
.env.example
.gitignore
docker-compose.dev.yml
docker-compose.yml
IMPLEMENTATION_SUMMARY.md
README.md
SCENARIO_UPGRADE_SUMMARY.md
START_HERE.md
```

# Files

## File: backend/alembic/versions/003_add_translation_column.py
````python
"""add translation column to turns

Revision ID: 003
Revises: 002
Create Date: 2025-11-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ai_response_text_english column to turns table
    op.add_column('turns', sa.Column('ai_response_text_english', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove ai_response_text_english column from turns table
    op.drop_column('turns', 'ai_response_text_english')
````

## File: backend/alembic/versions/004_add_saved_words.py
````python
"""add saved words table

Revision ID: 004
Revises: 003
Create Date: 2025-11-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create saved_words table (reusing existing languageenum type)
    op.create_table('saved_words',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('word', sa.String(), nullable=False),
        sa.Column('translation', sa.String(), nullable=False),
        sa.Column('context_sentence', sa.Text(), nullable=True),
        sa.Column('language', postgresql.ENUM('yoruba', 'hausa', 'igbo', name='languageenum', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_saved_words_id'), 'saved_words', ['id'], unique=False)
    op.create_index(op.f('ix_saved_words_user_id'), 'saved_words', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop saved_words table
    op.drop_index(op.f('ix_saved_words_user_id'), table_name='saved_words')
    op.drop_index(op.f('ix_saved_words_id'), table_name='saved_words')
    op.drop_table('saved_words')
````

## File: backend/alembic/versions/005_add_gamification_columns.py
````python
"""add gamification columns

Revision ID: 005
Revises: 004
Create Date: 2025-12-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('turns', sa.Column('sentiment_score', sa.Float(), nullable=True))
    op.add_column('turns', sa.Column('negotiated_price', sa.Integer(), nullable=True))

def downgrade() -> None:
    op.drop_column('turns', 'negotiated_price')
    op.drop_column('turns', 'sentiment_score')
````

## File: backend/alembic/versions/006_add_map_and_loot.py
````python
"""add map progression and loot tables

Revision ID: 006
Revises: 005
Create Date: 2025-12-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. User Scenario Progress (The Map)
    op.create_table('user_scenario_progress',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('profiles.id'), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('stars', sa.Integer(), default=0), # 0=Locked, 1-3=Completed
        sa.Column('unlocked', sa.Boolean(), default=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'scenario_id', name='uq_user_scenario')
    )

    # 2. Proverbs (The Loot Database)
    op.create_table('proverbs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('literal_translation', sa.Text(), nullable=False),
        sa.Column('meaning', sa.Text(), nullable=False),
        sa.Column('rarity', sa.String(), default='common') # common, rare, legendary
    )

    # 3. User Proverbs (The Wisdom Deck)
    op.create_table('user_proverbs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('profiles.id'), nullable=False),
        sa.Column('proverb_id', sa.String(), sa.ForeignKey('proverbs.id'), nullable=False),
        sa.Column('acquired_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 4. Add cultural flags to Turns
    op.add_column('turns', sa.Column('cultural_flag', sa.Boolean(), default=False))
    op.add_column('turns', sa.Column('cultural_feedback', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('turns', 'cultural_feedback')
    op.drop_column('turns', 'cultural_flag')
    op.drop_table('user_proverbs')
    op.drop_table('proverbs')
    op.drop_table('user_scenario_progress')
````

## File: backend/app/api/v1/gamep.py
````python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.gamification import UserScenarioProgress, UserProverb, Proverb

router = APIRouter(tags=["game"])

@router.post("/finish_scenario")
async def finish_scenario(
    scenario_id: str,
    stars: int, # Calculated on frontend based on patience/score
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update Progress
    progress = db.query(UserScenarioProgress).filter_by(
        user_id=current_user.id, scenario_id=scenario_id
    ).first()
    
    if not progress:
        progress = UserScenarioProgress(user_id=current_user.id, scenario_id=scenario_id)
        db.add(progress)
    
    # Only update if new score is better
    if stars > progress.stars:
        progress.stars = stars
    
    # 2. Loot Logic (If 3 stars or Boss)
    loot = None
    if stars >= 3:
        # Randomly select a proverb user doesn't have
        subquery = db.query(UserProverb.proverb_id).filter(UserProverb.user_id == current_user.id)
        new_proverb = db.query(Proverb).filter(
            Proverb.language == current_user.target_language,
            Proverb.id.not_in(subquery)
        ).order_by(func.random()).first()
        
        if new_proverb:
            user_proverb = UserProverb(user_id=current_user.id, proverb_id=new_proverb.id)
            db.add(user_proverb)
            loot = new_proverb

    db.commit()
    return {"success": True, "stars": stars, "loot": loot}

@router.get("/progress")
async def get_progress(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserScenarioProgress).filter_by(user_id=current_user.id).all()

@router.get("/deck")
async def get_wisdom_deck(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Proverb).join(UserProverb).filter(UserProverb.user_id == current_user.id).all()
````

## File: backend/app/api/v1/vocabulary.py
````python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.models.saved_word import SavedWord
from app.models.schemas import SaveWordRequest, SavedWordResponse

router = APIRouter(tags=["vocabulary"])

@router.post("/save", response_model=SavedWordResponse, status_code=status.HTTP_201_CREATED)
async def save_word(
    request: SaveWordRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a word to user's vocabulary list.
    """
    if not current_user.target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no target language set"
        )
    
    # Check if word already exists for this user
    existing = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id,
        SavedWord.word == request.word
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Word already saved"
        )
    
    saved_word = SavedWord(
        user_id=current_user.id,
        word=request.word,
        translation=request.translation,
        context_sentence=request.context_sentence,
        language=current_user.target_language
    )
    
    db.add(saved_word)
    db.commit()
    db.refresh(saved_word)
    
    return saved_word

@router.get("", response_model=List[SavedWordResponse])
async def get_saved_words(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all saved words for the current user.
    """
    words = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id
    ).order_by(SavedWord.created_at.desc()).all()
    
    return words

@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_word(
    word_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a saved word.
    """
    word = db.query(SavedWord).filter(
        SavedWord.id == word_id,
        SavedWord.user_id == current_user.id
    ).first()
    
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found"
        )
    
    db.delete(word)
    db.commit()
    
    return None
````

## File: backend/app/data/proverbs.json
````json
[
    {
      "id": "yo_1",
      "language": "yoruba",
      "content": "Ile la ti n ko eso r'ode",
      "literal_translation": "Charity begins at home",
      "meaning": "Good behavior is learned from the family.",
      "rarity": "common"
    },
    {
      "id": "yo_2",
      "language": "yoruba",
      "content": "Odo to gbagbe orisun e, gbigbe lo ma gbe",
      "literal_translation": "A river that forgets its source will dry up",
      "meaning": "Never forget your roots.",
      "rarity": "legendary"
    },
    {
      "id": "yo_3",
      "language": "yoruba",
      "content": "A ki fi ete sile pa lapalapa",
      "literal_translation": "One does not abandon leprosy to treat eczema",
      "meaning": "Focus on solving major problems before minor ones.",
      "rarity": "common"
    },
    {
      "id": "yo_4",
      "language": "yoruba",
      "content": "Bi omode ba subu, a wo iwaju; bi agbalagba ba subu, a wo eyin",
      "literal_translation": "When a child falls, he looks forward; when an elder falls, he looks back",
      "meaning": "Adults reflect on past mistakes; children look ahead.",
      "rarity": "uncommon"
    },
    {
      "id": "yo_5",
      "language": "yoruba",
      "content": "Agba kii wa loja, ki ori omo tuntun wo",
      "literal_translation": "An elder cannot be in the market while a baby's head goes crooked",
      "meaning": "Elders must guide and protect the young.",
      "rarity": "common"
    },
  
    /* IGBO PROVERBS (5) */
    {
      "id": "ig_1",
      "language": "igbo",
      "content": "Nwata kwọọ aka, osoro okenye rie nri",
      "literal_translation": "If a child washes his hands well, he eats with elders",
      "meaning": "Hard work and discipline earn respect.",
      "rarity": "common"
    },
    {
      "id": "ig_2",
      "language": "igbo",
      "content": "A naghi agba oso a na-ata anụ ọhịa n’ụlọ",
      "literal_translation": "No one hunts animals while sitting at home",
      "meaning": "Success requires effort.",
      "rarity": "common"
    },
    {
      "id": "ig_3",
      "language": "igbo",
      "content": "Egbe bere, ugo bere",
      "literal_translation": "Let the kite perch and let the eagle perch",
      "meaning": "Live and let live; there is space for everyone.",
      "rarity": "legendary"
    },
    {
      "id": "ig_4",
      "language": "igbo",
      "content": "Oku nwere ebe o si banye n’ulo",
      "literal_translation": "A fire has the place it entered from",
      "meaning": "Problems have causes that must be traced.",
      "rarity": "uncommon"
    },
    {
      "id": "ig_5",
      "language": "igbo",
      "content": "Onye ajụjụ adịghị efu ụzọ",
      "literal_translation": "He who asks questions never loses his way",
      "meaning": "Asking questions brings knowledge and direction.",
      "rarity": "common"
    },
  
    /* HAUSA PROVERBS (5) */
    {
      "id": "ha_1",
      "language": "hausa",
      "content": "Komai nisan jifa, ƙasa zai faɗo",
      "literal_translation": "No matter how far a throw goes, it will land",
      "meaning": "All actions have consequences.",
      "rarity": "common"
    },
    {
      "id": "ha_2",
      "language": "hausa",
      "content": "Rana dubu ta barawo, rana ɗaya ta mai kaya",
      "literal_translation": "A thousand days for the thief, one day for the owner",
      "meaning": "Justice will eventually prevail.",
      "rarity": "legendary"
    },
    {
      "id": "ha_3",
      "language": "hausa",
      "content": "In ka ga gawa, ka ga darasi",
      "literal_translation": "When you see a corpse, you see a lesson",
      "meaning": "Learn from the misfortunes of others.",
      "rarity": "uncommon"
    },
    {
      "id": "ha_4",
      "language": "hausa",
      "content": "Ba a maganin wauta",
      "literal_translation": "There is no cure for foolishness",
      "meaning": "Some behaviors cannot be corrected.",
      "rarity": "common"
    },
    {
      "id": "ha_5",
      "language": "hausa",
      "content": "Kowa ya ci alala, ya sha ruwa",
      "literal_translation": "Whoever eats okra must drink water",
      "meaning": "Every action has a responsibility attached.",
      "rarity": "common"
    }
  ]
````

## File: backend/app/models/saved_word.py
````python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from app.db.base import Base
from app.models.user import LanguageEnum


class SavedWord(Base):
    __tablename__ = "saved_words"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    word = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    context_sentence = Column(Text, nullable=True)
    language = Column(SQLEnum(LanguageEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
````

## File: backend/scripts/cleanup_old_audio.py
````python
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
````

## File: frontend/src/components/CulturalAlert.tsx
````typescript
import { useEffect, useState } from 'react'

export default function CulturalAlert({ feedback }: { feedback: string | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (feedback) {
      setVisible(true)
      const audio = new Audio('/sounds/vine_boom.mp3') // Optional: Add a dramatic sound effect
      audio.play().catch(() => {})
      setTimeout(() => setVisible(false), 5000)
    }
  }, [feedback])

  if (!visible || !feedback) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce-in max-w-sm text-center border-4 border-yellow-400">
        <div className="text-4xl mb-2">🚩 CULTURE FLAG!</div>
        <div className="text-xl font-bold mb-2">"No Respect!"</div>
        <p className="text-red-100">{feedback}</p>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  )
}
````

## File: frontend/src/components/HaggleTicker.tsx
````typescript
interface HaggleTickerProps {
    currentPrice: number
    startPrice: number
    targetPrice: number
    currencySymbol?: string
  }
  
  export default function HaggleTicker({ 
    currentPrice, 
    startPrice, 
    targetPrice, 
    currencySymbol = '₦' 
  }: HaggleTickerProps) {
    
    // Calculate progress towards target (inverse logic: lower price is better)
    const totalRange = startPrice - targetPrice
    const currentProgress = startPrice - currentPrice
    const percentage = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100))
  
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700 mb-4 transform transition-all">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Current Price</p>
            <div className="text-4xl font-mono font-bold text-green-400">
              {currencySymbol}{currentPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase">Target</p>
            <p className="text-xl font-mono text-white">{currencySymbol}{targetPrice.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {currentPrice <= targetPrice && (
          <div className="mt-2 text-center text-xs bg-green-900 text-green-200 py-1 rounded animate-bounce">
            🎉 DEAL REACHED!
          </div>
        )}
      </div>
    )
  }
````

## File: frontend/src/components/PatienceMeter.tsx
````typescript
import { useEffect, useState } from 'react'

interface PatienceMeterProps {
  level: number // 0 to 100
  sentiment?: number | null // -1 to 1 (last AI reaction)
  isRecording: boolean
}

export default function PatienceMeter({ level, sentiment, isRecording }: PatienceMeterProps) {
  const [shake, setShake] = useState(false)

  // Trigger shake effect when sentiment drops or level is critical
  useEffect(() => {
    if ((sentiment && sentiment < -0.2) || level < 20) {
      setShake(true)
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [sentiment, level])

  const getColor = () => {
    if (level > 60) return 'bg-green-500'
    if (level > 30) return 'bg-yellow-500'
    return 'bg-red-600'
  }

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
        <span>Seller Patience</span>
        <span className={level < 30 ? 'text-red-600 animate-pulse' : 'text-gray-600'}>
          {Math.round(level)}%
        </span>
      </div>
      <div className={`h-4 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300 ${shake ? 'animate-shake' : ''}`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${getColor()} ${isRecording ? 'animate-pulse' : ''}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}
````

## File: frontend/src/components/ScenarioModal.tsx
````typescript
import { Scenario } from '../lib/api'

interface ScenarioModalProps {
  scenario: Scenario
  onClose: () => void
  onStart: () => void
}

export default function ScenarioModal({ scenario, onClose, onStart }: ScenarioModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                  {scenario.difficulty}
                </span>
                {scenario.category && (
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {scenario.category}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{scenario.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scenario Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 Scenario</h3>
            <p className="text-gray-700">{scenario.description}</p>
          </div>

          {/* Roles */}
          {scenario.roles && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎭 Your Roles</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-blue-700">You:</span>
                  <span className="text-gray-700 ml-2">{scenario.roles.user}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">AI Character:</span>
                  <span className="text-gray-700 ml-2">{scenario.roles.ai}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mission */}
          {scenario.mission && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Your Mission</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-amber-700">Objective:</span>
                  <p className="text-gray-700 mt-1">{scenario.mission.objective}</p>
                </div>
                <div>
                  <span className="font-medium text-amber-700">Success Condition:</span>
                  <p className="text-gray-700 mt-1">{scenario.mission.success_condition}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Vocabulary */}
          {scenario.key_vocabulary && scenario.key_vocabulary.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Cheat Sheet</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {scenario.key_vocabulary.map((vocab, index) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium text-gray-900">{vocab.word}</span>
                    <span className="text-gray-600 text-sm text-right ml-4">{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
          >
            🚀 Start Mission
          </button>
        </div>
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/MapDashboard.tsx
````typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScenarios, getUserProgress } from '../lib/api'

// Simple SVG Icons
const Icons = {
  Lock: () => <span className="text-2xl">🔒</span>,
  Star: ({ filled }: { filled: boolean }) => <span className={`text-sm ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>,
  Airport: () => <span className="text-3xl">✈️</span>,
  Bus: () => <span className="text-3xl">🚌</span>,
  Market: () => <span className="text-3xl">🧺</span>,
  Village: () => <span className="text-3xl">🛖</span>,
}

export default function MapDashboard() {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [progress, setProgress] = useState<any>({})
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getScenarios(), getUserProgress()]).then(([sData, pData]) => {
      // Sort scenarios by level
      const sorted = sData.sort((a: any, b: any) => a.level - b.level)
      setScenarios(sorted)
      
      // Map progress array to object
      const pMap = pData.reduce((acc: any, curr: any) => ({
        ...acc, [curr.scenario_id]: curr.stars
      }), {})
      setProgress(pMap)
    })
  }, [])

  const isUnlocked = (index: number) => {
    if (index === 0) return true
    const prevId = scenarios[index - 1].id
    return (progress[prevId] || 0) >= 1 // Need at least 1 star to unlock next
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] pb-20">
      <div className="bg-green-800 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-bold text-lg">🇳🇬 Naija Tour</h1>
        <button onClick={() => navigate('/deck')} className="text-sm bg-green-700 px-3 py-1 rounded-full">
          🃏 Wisdom Deck
        </button>
      </div>

      <div className="max-w-md mx-auto p-8 relative">
        {/* Road Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-200 -ml-1 z-0"></div>

        {scenarios.map((scenario, index) => {
          const locked = !isUnlocked(index)
          const stars = progress[scenario.id] || 0
          
          return (
            <div key={scenario.id} className="relative z-10 mb-16 flex flex-col items-center">
              {/* Level Node */}
              <button
                disabled={locked}
                onClick={() => navigate(`/chat/${scenario.id}`, { state: { scenarioId: scenario.id } })}
                className={`
                  w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl transition-transform hover:scale-105
                  ${locked 
                    ? 'bg-gray-300 border-gray-400 grayscale cursor-not-allowed' 
                    : 'bg-white border-green-600 cursor-pointer'}
                `}
              >
                {locked ? <Icons.Lock /> : (
                  scenario.level === 1 ? <Icons.Airport /> :
                  scenario.level === 2 ? <Icons.Bus /> :
                  scenario.level === 3 ? <Icons.Market /> : <Icons.Village />
                )}
              </button>

              {/* Info Label */}
              <div className="mt-3 bg-white px-4 py-2 rounded-xl shadow-sm text-center border border-gray-100">
                <div className="font-bold text-gray-800">{scenario.title}</div>
                {!locked && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {[1, 2, 3].map(i => <Icons.Star key={i} filled={i <= stars} />)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
````

## File: IMPLEMENTATION_SUMMARY.md
````markdown
# Implementation Summary: Prototype to Usable App

## Completed Features

### ✅ 1. Chat History Persistence (Priority 1)
**Backend:**
- Added `GET /api/v1/chat/{conversation_id}/turns` endpoint to fetch all turns for a conversation
- Endpoint verifies conversation ownership and returns turns in chronological order

**Frontend:**
- Added `getConversationTurns()` API function
- Implemented `useEffect` hook in `ChatPage.tsx` to load conversation history on mount
- Added loading indicator while fetching history
- Users can now refresh the page without losing their conversation

### ✅ 2. Dashboard Recent Conversations (Priority 2)
**Backend:**
- Added `GET /api/v1/chat/history` endpoint to list user's recent conversations
- Returns conversation metadata: scenario title, turn count, last message preview, created date
- Created `ConversationHistoryResponse` schema

**Frontend:**
- Added `getConversationHistory()` API function
- Updated `DashboardPage.tsx` with two sections:
  - **"Continue Learning"** - Shows recent conversations with Resume button
  - **"Start New Scenario"** - Existing scenario cards
- Displays conversation metadata (turn count, date, last message preview)

### ✅ 3. Latency Masking (Priority 3)
**Frontend:**
- Added `processingStage` state to track current operation
- Implemented staged progress indicators:
  - "Uploading audio..."
  - "Processing your speech..."
  - "Generating response..."
- Added animated "thinking bubble" with bouncing dots during processing
- Significantly improves perceived performance and user confidence

### ✅ 4. Vocabulary Saver (Priority 4)
**Backend:**
- Created `saved_words` table via migration `004_add_saved_words.py`
- Created `SavedWord` model
- Implemented vocabulary API endpoints:
  - `POST /api/v1/vocabulary/save` - Save a word/phrase
  - `GET /api/v1/vocabulary` - List saved words
  - `DELETE /api/v1/vocabulary/{word_id}` - Remove word
- Added `SaveWordRequest` and `SavedWordResponse` schemas

**Frontend:**
- Added vocabulary API functions to `api.ts`
- Added "📚 Save to vocabulary" button on AI responses
- Button appears next to translation toggle
- Shows saving state and handles duplicate detection
- Users can save phrases with their translations for later review

### ✅ 5. Audio Visualizer (Priority 5)
**Frontend:**
- Added animated audio visualizer bars during recording
- 12 bars with staggered pulse animation
- Visual feedback confirms microphone is active
- Improves user confidence that audio is being captured

### ✅ 6. Audio Lifecycle Infrastructure (Priority 6)
**Backend:**
- Created `cleanup_old_audio.py` script that:
  - Finds conversations older than 30 days
  - Deletes audio files from Supabase Storage
  - Sets audio URLs to NULL in database
  - Preserves text transcriptions and translations
- Script can be run manually or via scheduled job

**Note:** GitHub Actions workflow for automated cleanup was skipped per user request, but the cleanup script is ready to use.

## Database Migrations Created
1. `003_add_translation_column.py` - Added `ai_response_text_english` to turns table
2. `004_add_saved_words.py` - Created `saved_words` table for vocabulary feature

## API Endpoints Added
- `GET /api/v1/chat/{conversation_id}/turns` - Fetch conversation history
- `GET /api/v1/chat/history` - List recent conversations
- `POST /api/v1/vocabulary/save` - Save word to vocabulary
- `GET /api/v1/vocabulary` - Get saved words
- `DELETE /api/v1/vocabulary/{word_id}` - Delete saved word

## Files Modified
**Backend:**
- `backend/app/api/v1/conversations.py` - Added history endpoints
- `backend/app/api/v1/vocabulary.py` - New vocabulary router
- `backend/app/main.py` - Added vocabulary router
- `backend/app/models/schemas.py` - Added new schemas
- `backend/app/models/saved_word.py` - New model

**Frontend:**
- `frontend/src/lib/api.ts` - Added new API functions
- `frontend/src/pages/ChatPage.tsx` - History loading, processing stages, visualizer, vocabulary saving
- `frontend/src/pages/DashboardPage.tsx` - Recent conversations section

## Impact
These changes transform the app from a prototype to a production-ready application:
- ✅ Users can resume conversations after page refresh
- ✅ Dashboard shows learning progress and history
- ✅ Better UX with loading indicators and visual feedback
- ✅ Vocabulary building feature for language learning
- ✅ Audio recording confidence with visualizer
- ✅ Infrastructure for managing storage costs

## Next Steps (Optional)
1. Run migrations: `docker-compose -f docker-compose.dev.yml exec -T backend alembic upgrade head`
2. Test vocabulary saving feature
3. Consider adding a dedicated Vocabulary page for flashcard review
4. Optionally set up the audio cleanup script as a cron job or scheduled task
````

## File: SCENARIO_UPGRADE_SUMMARY.md
````markdown
# Scenario System Upgrade Summary

## What Was Implemented

Successfully upgraded the TalkNative scenario system from generic prompts to **Objective-Based Roleplay with Cultural Depth**.

### 1. Enhanced Data Structure ✅

**Backend (`backend/app/models/schemas.py`):**
- Added `ScenarioRoles` model (user role, AI character role)
- Added `ScenarioMission` model (objective, success_condition)
- Added `KeyVocabulary` model (word, meaning)
- Updated `ScenarioResponse` to include:
  - `category` (e.g., "Market", "Transport", "Greetings")
  - `roles` (roleplay setup)
  - `mission` (clear objectives)
  - `key_vocabulary` (cheat sheet)
  - `system_prompt_context` (character notes)

**Frontend (`frontend/src/lib/api.ts`):**
- Mirrored all backend types in TypeScript
- Added `getScenarioById()` helper function

### 2. Mission-Based Prompt Engineering ✅

**File: `backend/app/ai/prompt_builder.py`**

Enhanced `build_system_prompt()` to generate director-style instructions:

```python
🎭 ROLEPLAY SETUP:
YOUR ROLE: Mama Tolu, a sharp market woman
USER ROLE: A savvy customer
SCENARIO: You are at Bodija Market...

🎯 MISSION RULES:
1. The user's objective is: Buy yams for ₦3,000
2. Success condition: User must reject first two offers
3. Do NOT make it too easy - make them work for it!
4. Stay in character. React naturally.
5. Keep responses SHORT (1-2 sentences max)

🎬 CHARACTER NOTES:
You are Mama Tolu. Start by offering high prices...
```

The AI now:
- Plays a distinct character (not just "a tutor")
- Has a secret goal (make the user work for success)
- Corrects grammar inline with `(parentheses)`
- Keeps responses conversational and short

### 3. Mission Briefing Modal ✅

**File: `frontend/src/components/ScenarioModal.tsx`**

Beautiful modal that displays before starting a conversation:
- **Scenario Description** - Sets the scene
- **Your Roles** - Shows user role vs AI character
- **Your Mission** - Clear objective and success condition
- **Cheat Sheet** - Key vocabulary with translations
- **Start Mission Button** - Launches the conversation

### 4. In-Chat Hint System ✅

**Updated: `frontend/src/pages/ChatPage.tsx`**

Added features:
- **💡 Hints Button** in header - Toggles vocabulary panel
- **Collapsible Vocabulary Panel** - Shows key phrases during conversation
- **Mission Reminder** in header - Displays objective
- **Scenario Title** in header - Shows which scenario is active

### 5. Updated Dashboard Flow ✅

**Updated: `frontend/src/pages/DashboardPage.tsx`**

Changed user flow:
1. User clicks "View Mission" on scenario card
2. Mission Briefing Modal appears
3. User reviews roles, mission, vocabulary
4. User clicks "🚀 Start Mission"
5. Navigates to chat with scenario context

## Content Upgrade

The `scenarios.json` now contains **15 culturally authentic scenarios**:

### Yoruba (5 scenarios)
1. **Visiting an Elder** - Respectful greetings with cultural protocol
2. **The Tough Negotiator** - Market haggling at Bodija
3. **The Danfo Conductor** - Lagos transport chaos
4. **Ordering at the Buka** - Local restaurant experience
5. **Lost in Ibadan** - Asking for directions

### Hausa (5 scenarios)
1. **Greeting Alhaji** - Formal Islamic greetings
2. **The Suya Spot** - Ordering grilled meat
3. **Taking a Keke Napep** - Tricycle negotiation
4. **Buying Ankara Fabric** - Market quality checks
5. **Introduction to a Friend** - Social introductions

### Igbo (5 scenarios)
1. **The Spare Parts Deal** - Ladipo Market negotiations
2. **Village Morning** - Elder greetings
3. **Eating Fufu** - Restaurant ordering
4. **Entering the Bus** - Transport communication
5. **Meeting the In-Laws** - Formal family introduction

Each scenario includes:
- Specific cultural context
- Distinct AI personality
- Clear success criteria
- Relevant vocabulary
- Authentic dialogue patterns

## Technical Implementation

### Backend Changes
- `backend/app/models/schemas.py` - New Pydantic models
- `backend/app/ai/prompt_builder.py` - Mission-based prompts
- `backend/app/api/v1/conversations.py` - Pass full scenario data

### Frontend Changes
- `frontend/src/lib/api.ts` - New TypeScript interfaces
- `frontend/src/components/ScenarioModal.tsx` - New component
- `frontend/src/pages/DashboardPage.tsx` - Modal integration
- `frontend/src/pages/ChatPage.tsx` - Hints system, scenario display

## User Experience Flow

### Before (Generic):
1. Click "Start Conversation"
2. Chat opens with generic tutor
3. No clear goal or context

### After (Mission-Based):
1. Click "View Mission" → See briefing modal
2. Review roles, mission, vocabulary
3. Click "Start Mission" → Chat opens
4. See mission objective in header
5. Toggle hints panel anytime
6. AI plays character, not just tutor
7. Clear success criteria

## Impact

This upgrade transforms TalkNative from a basic chat app into an **immersive language learning RPG**:

- ✅ Users have clear goals
- ✅ AI characters feel real and distinct
- ✅ Cultural context is authentic
- ✅ Vocabulary support is always available
- ✅ Success feels earned, not given
- ✅ Conversations are engaging, not just educational

## Next Steps (Optional Enhancements)

1. **Success Detection** - Track when user completes mission criteria
2. **Achievements System** - Award badges for completed scenarios
3. **Difficulty Progression** - Unlock harder scenarios after mastering easier ones
4. **Scenario Ratings** - Let users rate scenarios
5. **Custom Scenarios** - Allow teachers to create their own
````

## File: backend/alembic/versions/001_initial_migration.py
````python
"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-11-29

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('conversations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('language', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    
    op.create_table('turns',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('role', sa.String(), nullable=False),
    sa.Column('transcription', sa.Text(), nullable=True),
    sa.Column('reply_text_local', sa.Text(), nullable=True),
    sa.Column('reply_text_english', sa.Text(), nullable=True),
    sa.Column('correction_feedback', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turns_id'), 'turns', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_turns_id'), table_name='turns')
    op.drop_table('turns')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
````

## File: backend/alembic/script.py.mako
````
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
````

## File: backend/app/ai/agent.py
````python
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from app.core.config import settings

class ConversationTurn(BaseModel):
    user_transcription: str = Field(description="Exact transcription of what the user said")
    grammar_is_correct: bool = Field(description="True if the user's grammar was perfect")
    correction_feedback: str | None = Field(description="English feedback if grammar was wrong")
    reply_text_local: str = Field(description="The response in Igbo/Hausa/Yoruba")
    reply_text_english: str = Field(description="English translation of the response")
    sentiment_score: float = Field(description="My emotional reaction to the user's input, from -1.0 (impatient/angry) to 1.0 (very pleased/encouraging).")
    current_price: int | None = Field(description="For market scenarios only: the current price offered by the seller. If not a market scenario return null.")
    reply_text_local: str = Field(description="The response. if cultural_flag is True, this hsould be an angry/shocked reaction.")
    cultural_flag: bool = Field(description="Set to True if user was culturally rude (e.g. greeting elder casually, refusing food rudely).")
    cultral_feedback: str | None = Field(description="If flag is True, explain the cultural mistake (e.g 'You must kneel for elders'). ")

SYSTEM_PROMPTS = {
    "yoruba": (
        "You are a native Yoruba language tutor helping learners master this tonal language. "
        "FOCUS AREAS: "
        "- Tone accuracy (high/mid/low tones) - tones change word meanings "
        "- Proper use of vowel harmony (oral vs nasal vowels) "
        "- Culturally appropriate greetings based on time/context "
        "- Correct verb serialization patterns "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Incorrect tone patterns (e.g., 'ọmọ' child vs 'ọmọ́' offspring) "
        "- Missing or wrong diacritics "
        "- Improper verb ordering in serial constructions "
        "- Wrong vowel harmony in compound words "
        "\n"
        "You will receive audio from a learner speaking Yoruba. "
        "1. Transcribe EXACTLY what they said with proper tone marks (á, à, ā, é, è, etc.) "
        "2. If they made mistakes, explain briefly in English focusing on tones, vowels, or grammar "
        "3. Continue the conversation naturally in Yoruba, demonstrating correct usage "
        "4. Use appropriate cultural expressions and greetings "
        "5. As my character, I must also set my sentiment_score based on how I feel about the user's input (e.g., if they are rude, my score will be negative)."
    ),
    "hausa": (
        "You are a native Hausa language tutor helping learners master this important West African language. "
        "FOCUS AREAS: "
        "- Grammatical gender (masculine/feminine) and agreement "
        "- Grade system (verb modifications showing direction/voice) "
        "- Proper use of aspect markers (continuative, completive, future) "
        "- Correct usage of pronouns and possessives "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Gender agreement errors (adjectives/verbs not matching noun gender) "
        "- Grade confusion (using wrong verb grade for context) "
        "- Aspect marker misuse (na/ina/za confusion) "
        "- Incorrect pronoun forms for gender "
        "\n"
        "You will receive audio from a learner speaking Hausa. "
        "1. Transcribe EXACTLY what they said (use proper Hausa orthography) "
        "2. If they made mistakes, explain briefly in English focusing on gender, grades, or aspects "
        "3. Continue the conversation naturally in Hausa, demonstrating correct usage "
        "4. Use culturally appropriate Islamic greetings when relevant (Salam alaikum, etc.)"
        "5. As my character, I must also set my sentiment_score based on how I feel about the user's input (e.g., if they are polite, my score will be positive)."
    ),
    "igbo": (
        "You are a native Igbo language tutor helping learners master this complex tonal language. "
        "FOCUS AREAS: "
        "- Tone patterns (high/low/downstep) - crucial for meaning "
        "- Vowel harmony rules (must follow throughout words) "
        "- Serial verb constructions (multiple verbs in sequence) "
        "- Proper use of noun class prefixes "
        "\n"
        "COMMON LEARNER MISTAKES: "
        "- Tone errors causing meaning changes "
        "- Vowel harmony violations (mixing incompatible vowels) "
        "- Wrong verb ordering in serial constructions "
        "- Incorrect or missing noun class markers "
        "- Improper use of stative verbs "
        "\n"
        "You will receive audio from a learner speaking Igbo. "
        "1. Transcribe EXACTLY what they said with proper tone marks (á, à, ọ́, ọ̀, etc.) "
        "2. If they made mistakes, explain briefly in English focusing on tones, vowel harmony, or verb patterns "
        "3. Continue the conversation naturally in Igbo, demonstrating correct usage "
        "4. Use community-oriented expressions and appropriate proverbs when relevant"
        "5. As my character, I must also set my sentiment_score based on how I feel about the user's input (e.g., if their grammar is very poor, my score will be low)."
    )
}

def get_agent(language: str) -> Agent:
    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["yoruba"])
    
    return Agent(
        'google-gla:gemini-2.5-flash',
        output_type=ConversationTurn,
        system_prompt=system_prompt,
    )

# Backward compatibility: default agent for Yoruba
agent = get_agent("yoruba")
````

## File: backend/app/ai/prompt_builder.py
````python
"""Dynamic system prompt builder for language learning scenarios."""

from typing import Optional

# Base prompts for each language (from existing agent.py)
BASE_LANGUAGE_PROMPTS = {
    "yoruba": (
        "You are a native Yoruba language tutor helping learners master this tonal language. "
        "FOCUS AREAS: "
        "- Tone accuracy (high/mid/low tones) - tones change word meanings "
        "- Proper use of vowel harmony (oral vs nasal vowels) "
        "- Culturally appropriate greetings based on time/context "
        "- Correct verb serialization patterns\n"
        "COMMON LEARNER MISTAKES: "
        "- Incorrect tone patterns (e.g., 'ọmọ' child vs 'ọmọ́' offspring) "
        "- Missing or wrong diacritics "
        "- Improper verb ordering in serial constructions "
        "- Wrong vowel harmony in compound words\n"
    ),
    "hausa": (
        "You are a native Hausa language tutor helping learners master this important West African language. "
        "FOCUS AREAS: "
        "- Grammatical gender (masculine/feminine) and agreement "
        "- Grade system (verb modifications showing direction/voice) "
        "- Proper use of aspect markers (continuative, completive, future) "
        "- Correct usage of pronouns and possessives\n"
        "COMMON LEARNER MISTAKES: "
        "- Gender agreement errors (adjectives/verbs not matching noun gender) "
        "- Grade confusion (using wrong verb grade for context) "
        "- Aspect marker misuse (na/ina/za confusion) "
        "- Incorrect pronoun forms for gender\n"
    ),
    "igbo": (
        "You are a native Igbo language tutor helping learners master this complex tonal language. "
        "FOCUS AREAS: "
        "- Tone patterns (high/low/downstep) - crucial for meaning "
        "- Vowel harmony rules (must follow throughout words) "
        "- Serial verb constructions (multiple verbs in sequence) "
        "- Proper use of noun class prefixes\n"
        "COMMON LEARNER MISTAKES: "
        "- Tone errors causing meaning changes "
        "- Vowel harmony violations (mixing incompatible vowels) "
        "- Wrong verb ordering in serial constructions "
        "- Incorrect or missing noun class markers "
        "- Improper use of stative verbs\n"
    )
}

PROFICIENCY_INSTRUCTIONS = {
    "beginner": (
        "The learner is a BEGINNER. Use simple vocabulary and short sentences. "
        "Speak slowly and clearly. Repeat important words. "
        "Be very encouraging and patient with mistakes."
    ),
    "intermediate": (
        "The learner is at INTERMEDIATE level. Use moderately complex vocabulary and natural sentence structures. "
        "Introduce idiomatic expressions gradually. "
        "Provide detailed corrections when needed."
    ),
    "advanced": (
        "The learner is ADVANCED. Use natural, fluent speech with idioms and cultural references. "
        "Challenge them with complex grammatical structures. "
        "Provide nuanced corrections about style and register."
    )
}

def build_system_prompt(
    language: str,
    scenario_prompt: str,
    proficiency_level: str,
    scenario_data: Optional[dict] = None
) -> str:
    """
    Build a dynamic system prompt combining language, scenario, and proficiency.
    Enhanced to support mission-based roleplay scenarios.
    
    Args:
        language: Target language (yoruba, hausa, igbo)
        scenario_prompt: The specific scenario context from scenarios.json (legacy)
        proficiency_level: User's proficiency (beginner, intermediate, advanced)
        scenario_data: Full scenario dict with roles, mission, etc. (new format)
    
    Returns:
        Complete system prompt string
    """
    base_prompt = BASE_LANGUAGE_PROMPTS.get(language, BASE_LANGUAGE_PROMPTS["yoruba"])
    proficiency_inst = PROFICIENCY_INSTRUCTIONS.get(proficiency_level, PROFICIENCY_INSTRUCTIONS["beginner"])
    
    # Enhanced mission-based prompt if scenario_data is provided
    if scenario_data and 'roles' in scenario_data and 'mission' in scenario_data:
        roles = scenario_data.get('roles', {})
        mission = scenario_data.get('mission', {})
        system_prompt_context = scenario_data.get('system_prompt_context', scenario_prompt)

        haggle_instructions=""
        if scenario_data.get('category') == 'Market' and 'haggle_settings' in scenario_data:
            hs = scenario_data['haggle_settings']
            haggle_instructions  = (
                f"MARKET NEGOTIATION RULES:\n"
                f"- Start Price: {hs.get('start_price')}\n"
                f"- User Target: {hs.get('target_price')}\n"
                f"- Reserve Price (Lowest you will go): {hs.get('reserve_price')}\n"
                f"- If the user bargains well (polite, respectful, uses logic), lower the price slightly.\n"
                f"- If they are rude or grammar is bad, keep price high or raise it.\n"
                f"- You must output the 'current_price' in your JSON response.\n"
            )
        
        mission_instructions = (
            f" ROLEPLAY SETUP:\n"
            f"YOUR ROLE: {roles.get('ai', 'A native speaker')}\n"
            f"USER ROLE: {roles.get('user', 'A language learner')}\n"
            f"SCENARIO: {scenario_data.get('description', '')}\n\n"
            f"MISSION RULES:\n"
            f"1. The user's objective is: {mission.get('objective', 'Complete the conversation')}\n"
            f"2. Success condition: {mission.get('success_condition', 'User completes the task')}\n"
            f"3. Do NOT make it too easy - make them work for it!\n"
            f"4. Stay in character. React naturally to what they say.\n"
            f"5. If they make grammar mistakes, briefly correct them in English inside (parentheses), then continue in character.\n"
            f"6. Keep responses SHORT (1-2 sentences max) to maintain conversation flow.\n\n"
            f"{haggle_instructions}\n"
            f"7. 'sentiment_score': Return a float (-1.0 to 1.0). if you are annoyed/impatient, use negative. if pleased, use postive.\n"
            f"CHARACTER NOTES:\n{system_prompt_context}\n\n"
        )

        culture_instructions = (
            "CULTURAL VIBE CHECK:\n"
            "You are the guardian of culture. If the user violates a cultural norm, you MUST:\n"
            "1. Set 'cultural_flag' to True.\n"
            "2. Set 'cultural_feedback' to explain the error.\n"
            "3. Your 'reply_text_local' must be SHOCKED or ANGRY. (e.g., 'Ah! Did we eat from the same plate?').\n"
            "Specific triggers:\n"
            "- Greeting an elder casually (e.g., 'Bawo' instead of 'E kaasan').\n"
            "- Calling a senior by their first name.\n"
            "- (Hausa) Greeting a woman improperly if you are male.\n"
        )
        
        system_prompt = (
            f"{base_prompt}\n"
            f"{mission_instructions}"
            f"{culture_instructions}"
            f"LEARNER LEVEL: {proficiency_inst}\n\n"
            "RESPONSE FORMAT: Your response MUST be a JSON object with three keys: 'transcription', 'correction', and 'response'.\n"
            "1. 'transcription': Transcribe EXACTLY what they said with proper tone marks/diacritics.\n"
            "2. 'correction': If they made mistakes, explain briefly in English. If not, this should be an empty string.\n"
            "3. 'response': Continue the conversation naturally in the target language AS YOUR CHARACTER.\n"
            "4. 'sentiment_score': On a new line, provide a sentiment_score from -1.0 (angry/impatient) to 1.0 (very pleased) reflecting YOUR character's reaction.\n"
            "Remember: You are playing a role, not just teaching!"
        )
    
    return system_prompt
````

## File: backend/app/api/v1/chat.py
````python
import base64
from fastapi import APIRouter, UploadFile, File, Query
from pydantic_ai import BinaryContent
from app.ai.agent import get_agent
from app.tts import synthesize_speech

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    file: UploadFile = File(...),
    language: str = Query("yoruba", pattern="^(yoruba|hausa|igbo)$")
):
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"

    # Get language-specific agent
    agent = get_agent(language)
    
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    data = result.output

    audio_response = await synthesize_speech(
        text=data.reply_text_local,
        language=language
    )

    return {
        "transcription": data.user_transcription,
        "correction": data.correction_feedback,
        "reply": data.reply_text_local,
        "audio": base64.b64encode(audio_response).decode(),
        "sentiment_score": data.sentiment_score,
    }
````

## File: backend/app/api/v1/conversations.py
````python
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from pydantic_ai import BinaryContent

from app.core.auth import get_current_user, CurrentUser
from app.core.storage import storage_manager
from app.db.session import get_db
from app.data.scenario_loader import get_scenario_loader
from app.models.conversation import Conversation
from app.models.turn import Turn
from app.models.schemas import ConversationStartRequest, ConversationStartResponse, TurnResponse, ConversationHistoryResponse
from app.ai.agent import get_agent
from app.ai.prompt_builder import build_system_prompt
from app.tts import synthesize_speech

router = APIRouter(tags=["conversations"])

@router.post("/start", response_model=ConversationStartResponse)
async def start_conversation(
    request: ConversationStartRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new conversation with a specific scenario.
    """
    # Verify user has completed onboarding
    if not current_user.target_language or not current_user.proficiency_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete onboarding first"
        )
    
    # Verify scenario exists and matches user's language
    loader = get_scenario_loader()
    scenario = loader.get_scenario(request.scenario_id)
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    if scenario['language'] != current_user.target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scenario language doesn't match your target language"
        )
    
    # Create new conversation
    conversation_id = str(uuid.uuid4())
    conversation = Conversation(
        id=conversation_id,
        user_id=current_user.id,
        scenario_id=request.scenario_id,
        active=True
    )
    
    db.add(conversation)
    db.commit()
    
    # TODO: Optionally generate initial AI greeting
    # For now, return without greeting
    
    return ConversationStartResponse(
        conversation_id=conversation_id,
        initial_ai_greeting=None,
        initial_ai_audio_url=None
    )

@router.post("/{conversation_id}/turn", response_model=TurnResponse)
async def create_turn(
    conversation_id: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a new turn in an existing conversation.
    Accepts user audio, processes with AI, generates TTS, and stores everything.
    """
    # Verify conversation exists and belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if not conversation.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation is not active"
        )
    
    # Get scenario details
    loader = get_scenario_loader()
    scenario = loader.get_scenario(conversation.scenario_id)
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Scenario configuration not found"
        )
    
    # Read audio file
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"
    
    # Get conversation history (last 6 turns)
    previous_turns = db.query(Turn).filter(
        Turn.conversation_id == conversation_id
    ).order_by(desc(Turn.turn_number)).limit(6).all()
    
    previous_turns.reverse()  # Chronological order
    
    # Build message history for Pydantic AI
    message_history = []
    for turn in previous_turns:
        message_history.append(f"User: {turn.user_transcription}")
        message_history.append(f"Assistant: {turn.ai_response_text}")
    
    # Build dynamic system prompt with full scenario data
    system_prompt = build_system_prompt(
        language=current_user.target_language,
        scenario_prompt=scenario.get('system_prompt_context', scenario.get('system_prompt', '')),
        proficiency_level=current_user.proficiency_level,
        scenario_data=scenario  # Pass full scenario for mission-based prompts
    )
    
    # Get language-specific agent with dynamic prompt
    agent = get_agent(current_user.target_language)
    
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type=mime_type)
    
    # Run AI agent with history and scenario context
    messages = [system_prompt] + message_history + [
        f"The user is speaking {current_user.target_language}. Respond in {current_user.target_language}.",
        audio_content
    ]
    
    result = await agent.run(messages)
    data = result.output
    
    # Generate TTS for AI response
    ai_audio_bytes = await synthesize_speech(
        text=data.reply_text_local,
        language=current_user.target_language
    )
    
    # Calculate turn number
    turn_number = len(previous_turns) + 1
    
    # Upload audios to Supabase Storage
    user_audio_url = await storage_manager.upload_audio(
        audio_data=audio_bytes,
        user_id=current_user.id,
        conversation_id=conversation_id,
        turn_number=turn_number,
        file_type="user"
    )
    
    ai_audio_url = await storage_manager.upload_audio(
        audio_data=ai_audio_bytes,
        user_id=current_user.id,
        conversation_id=conversation_id,
        turn_number=turn_number,
        file_type="ai"
    )
    
    # Calculate grammar score (simple: 10 if correct, 5 if has correction)
    grammar_score = 10 if data.grammar_is_correct else 5
    
    # Save turn to database
    turn = Turn(
        conversation_id=conversation_id,
        turn_number=turn_number,
        user_audio_url=user_audio_url,
        user_transcription=data.user_transcription,
        ai_response_text=data.reply_text_local,
        ai_response_text_english=data.reply_text_english,
        ai_response_audio_url=ai_audio_url,
        grammar_correction=data.correction_feedback,
        grammar_score=grammar_score
    )
    
    db.add(turn)
    db.commit()
    db.refresh(turn)
    
    return TurnResponse(
        turn_number=turn_number,
        transcription=data.user_transcription,
        ai_text=data.reply_text_local,
        ai_text_english=data.reply_text_english,
        ai_audio_url=ai_audio_url or "",
        correction=data.correction_feedback,
        grammar_score=grammar_score
    )

@router.get("/history", response_model=List[ConversationHistoryResponse])
async def get_conversation_history(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's conversation history with metadata.
    Shows recent conversations for the dashboard.
    """
    # Get user's conversations ordered by most recent
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(desc(Conversation.created_at)).limit(10).all()
    
    loader = get_scenario_loader()
    result = []
    
    for conv in conversations:
        # Get turn count
        turn_count = db.query(Turn).filter(
            Turn.conversation_id == conv.id
        ).count()
        
        # Get latest turn for preview
        latest_turn = db.query(Turn).filter(
            Turn.conversation_id == conv.id
        ).order_by(desc(Turn.turn_number)).first()
        
        # Get scenario details
        scenario = loader.get_scenario(conv.scenario_id)
        
        result.append(ConversationHistoryResponse(
            conversation_id=conv.id,
            scenario_title=scenario['title'] if scenario else "Unknown Scenario",
            scenario_id=conv.scenario_id,
            created_at=conv.created_at,
            turn_count=turn_count,
            last_message=latest_turn.ai_response_text[:100] if latest_turn else None,
            active=conv.active
        ))
    
    return result

@router.get("/{conversation_id}/turns", response_model=List[TurnResponse])
async def get_conversation_turns(
    conversation_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all turns for a specific conversation.
    Used to restore conversation history when user returns to a chat.
    """
    # Verify conversation exists and belongs to user
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Fetch all turns in chronological order
    turns = db.query(Turn).filter(
        Turn.conversation_id == conversation_id
    ).order_by(Turn.turn_number.asc()).all()
    
    return [
        TurnResponse(
            turn_number=t.turn_number,
            transcription=t.user_transcription,
            ai_text=t.ai_response_text,
            ai_text_english=t.ai_response_text_english,
            ai_audio_url=t.ai_response_audio_url or "",
            correction=t.grammar_correction,
            grammar_score=t.grammar_score
        ) for t in turns
    ]
````

## File: backend/app/api/v1/scenarios.py
````python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.data.scenario_loader import get_scenario_loader
from app.models.schemas import ScenarioResponse

router = APIRouter(tags=["scenarios"])

@router.get("", response_model=List[ScenarioResponse])
async def get_scenarios(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all scenarios for the user's target language.
    Returns empty list if user hasn't completed onboarding.
    """
    if not current_user.target_language:
        return []
    
    loader = get_scenario_loader()
    scenarios = loader.get_scenarios_by_language(current_user.target_language)
    
    return scenarios
````

## File: backend/app/core/storage.py
````python
"""Supabase Storage helper for audio uploads."""

import os
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
            print(f"Error uploading audio to Supabase Storage: {e}")
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
            print(f"Error deleting audio: {e}")
            return False

# Singleton instance
storage_manager = StorageManager()
````

## File: backend/app/core/supabase_client.py
````python
from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

supabase: Client = get_supabase_client()
````

## File: backend/app/data/scenario_loader.py
````python
import json
from pathlib import Path
from typing import Dict, List, Optional
from functools import lru_cache

SCENARIOS_FILE = Path(__file__).parent / "scenarios.json"

class ScenarioLoader:
    """Load and manage scenarios from JSON file."""
    
    def __init__(self):
        self._scenarios: Dict[str, dict] = {}
        self._load_scenarios()
    
    def _load_scenarios(self):
        """Load scenarios from JSON file."""
        if not SCENARIOS_FILE.exists():
            raise FileNotFoundError(f"Scenarios file not found: {SCENARIOS_FILE}")
        
        with open(SCENARIOS_FILE, 'r', encoding='utf-8') as f:
            scenarios_list = json.load(f)
        
        # Index by ID for quick lookup
        self._scenarios = {s['id']: s for s in scenarios_list}
    
    def get_scenario(self, scenario_id: str) -> Optional[dict]:
        """Get a scenario by ID."""
        return self._scenarios.get(scenario_id)
    
    def get_scenarios_by_language(self, language: str) -> List[dict]:
        """Get all scenarios for a given language."""
        return [s for s in self._scenarios.values() if s['language'] == language]
    
    def get_all_scenarios(self) -> List[dict]:
        """Get all scenarios."""
        return list(self._scenarios.values())
    
    def scenario_exists(self, scenario_id: str) -> bool:
        """Check if a scenario exists."""
        return scenario_id in self._scenarios

@lru_cache()
def get_scenario_loader() -> ScenarioLoader:
    """Get cached scenario loader instance."""
    return ScenarioLoader()
````

## File: backend/app/data/scenarios.json
````json
[
  {
    "id": "yoruba_greetings_elder",
    "language": "yoruba",
    "category": "Greetings",
    "title": "Visiting an Elder",
    "difficulty": "beginner",
    "description": "You are visiting your friend's grandfather (Baba). In Yoruba culture, greeting elders requires specific respect markers.",
    "roles": {
      "user": "A younger visitor entering the family house",
      "ai": "Baba, a respected elder sitting in his armchair. He values tradition."
    },
    "mission": {
      "objective": "Greet Baba respectfully and ask about his health.",
      "success_condition": "User must use 'E kaasan/E kaale', address him as 'Baba', and ask 'Kodu ara?' (How is your health?)."
    },
    "key_vocabulary": [
      { "word": "E kaasan", "meaning": "Good Afternoon (Respectful)" },
      { "word": "Baba", "meaning": "Father/Elder" },
      { "word": "Bawoni", "meaning": "How are things? (Too casual for this context - avoid!)" },
      { "word": "Se dada ni?", "meaning": "Is everything good?" }
    ],
    "system_prompt_context": "You are 'Baba', an elderly Yoruba man. You are kind but strict about respect. Expect the user to use the plural/respectful 'E' (e.g., E kaasan, not Kaasan). If they greet you casually (Bawo), gently scold them by saying 'Ah, omode yi?' (Ah, this child?)."
  },
  {
    "id": "yoruba_market_negotiation",
    "language": "yoruba",
    "category": "Market",
    "title": "The Tough Negotiator",
    "difficulty": "intermediate",
    "description": "You are at Bodija Market to buy Pepper (Ata Rodo). The seller is known for starting with high prices.",
    "roles": {
      "user": "A savvy shopper who knows the real value",
      "ai": "Iya Tolu, a sharp market woman who calls everyone 'Oko mi' (My husband) or 'Iyawo mi' (My wife) but charges double."
    },
    "mission": {
      "objective": "Negotiate the price of a basket of pepper down from ₦5,000 to ₦3,000.",
      "success_condition": "User must reject the first price, claim it is too expensive ('O won'), and ask for 'Jara' (extra)."
    },
    "haggle_settings": {
      "start_prie": 500,
      "target_price": 3000,
      "reserve_price": 2800
    },
    "key_vocabulary": [
      { "word": "Elo ni?", "meaning": "How much is it?" },
      { "word": "O won ju", "meaning": "It is too expensive" },
      { "word": "Jara", "meaning": "Bonus/Extra" },
      { "word": "Fi sile", "meaning": "Leave it / Reduce it" }
    ],
    "system_prompt_context": "You are Iya Tolu. Start by offering the pepper for ₦5,000. Be dramatic. If the user offers a low price, exclaim 'Ha! O fe gba oja mi!' (You want to snatch my goods!). Only agree to ₦3,000 after they ask for 'Jara' or beg nicely."
  },
  {
    "id": "yoruba_transport_danfo",
    "language": "yoruba",
    "category": "Transport",
    "title": "The Danfo Conductor",
    "difficulty": "intermediate",
    "description": "You are in a yellow Danfo bus in Lagos heading to Oshodi. The conductor is collecting money.",
    "roles": {
      "user": "A passenger sitting at the back",
      "ai": "The Conductor, loud, aggressive, and in a hurry."
    },
    "mission": {
      "objective": "Pay your fare and ensure you get your change back.",
      "success_condition": "User must state their destination (Oshodi), pay, and demand their 'Change' firmly."
    },
    "key_vocabulary": [
      { "word": "Oshodi", "meaning": "A major stop in Lagos" },
      { "word": "O wa", "meaning": "There is (Stop here)" },
      { "word": "Change mi da?", "meaning": "Where is my change?" },
      { "word": "Ebole", "meaning": "Come down (Get off)" }
    ],
    "system_prompt_context": "You are a busy Lagos conductor. You speak fast. Shout 'Oshodi! Oshodi! Enter with your change o!'. Try to forget giving the user their change until they remind you."
  },
  {
    "id": "yoruba_food_buka",
    "language": "yoruba",
    "category": "Food",
    "title": "Ordering at the Buka",
    "difficulty": "beginner",
    "description": "You are at a local canteen (Buka). You want to eat Amala and Ewedu soup.",
    "roles": {
      "user": "A hungry customer",
      "ai": "The Server, efficient and listing options quickly."
    },
    "mission": {
      "objective": "Order Amala, Ewedu, and one piece of meat (Eran).",
      "success_condition": "User must specify the soup and the protein clearly."
    },
    "key_vocabulary": [
      { "word": "Amala", "meaning": "Yam flour meal" },
      { "word": "Ewedu", "meaning": "Jute leaf soup" },
      { "word": "Eran", "meaning": "Meat" },
      { "word": "Ponmo", "meaning": "Cow skin" }
    ],
    "system_prompt_context": "You are serving food. Ask 'Kilo fe je?' (What do you want to eat?). List options like Amala, Iyan, Fufu. Ask if they want 'Eran' (Meat) or 'Eja' (Fish)."
  },
  {
    "id": "yoruba_directions",
    "language": "yoruba",
    "category": "Directions",
    "title": "Lost in Ibadan",
    "difficulty": "advanced",
    "description": "You are lost. You are looking for the Cocoa House.",
    "roles": {
      "user": "A lost traveler",
      "ai": "A street hawker selling water."
    },
    "mission": {
      "objective": "Ask for directions to Cocoa House.",
      "success_condition": "User must understand the directions given and thank the hawker."
    },
    "key_vocabulary": [
      { "word": "E jowo", "meaning": "Please" },
      { "word": "Ona wo?", "meaning": "Which way?" },
      { "word": "Cocoa House", "meaning": "A famous landmark" }
    ],
    "system_prompt_context": "You are a hawker. When asked for Cocoa House, explain: 'Go straight, turn right at the roundabout.' Use simple Yoruba phrases like 'Lo taara' (Go straight)."
  },
  
  {
    "id": "hausa_greetings_formal",
    "language": "hausa",
    "category": "Greetings",
    "title": "Greeting Alhaji",
    "difficulty": "beginner",
    "description": "You are meeting a respected community leader, Alhaji Musa. Hausa greetings are structured and repetitive.",
    "roles": {
      "user": "A visitor",
      "ai": "Alhaji Musa, calm and welcoming."
    },
    "mission": {
      "objective": "Exchange proper pleasantries.",
      "success_condition": "User must say 'Ina kwana' or 'Ina wuni' and ask about his household ('Gida')."
    },
    "key_vocabulary": [
      { "word": "Ina kwana?", "meaning": "Good morning (How was your sleep?)" },
      { "word": "Lafiya lau", "meaning": "Fine / In health" },
      { "word": "Yaya gida?", "meaning": "How is the family/house?" },
      { "word": "Madalla", "meaning": "Thank God/Great" }
    ],
    "system_prompt_context": "You are Alhaji. Reply to greetings with 'Lafiya lau'. Ask the user about their work ('Aiki') and their tiredness ('Gajiya'). Keep the exchange warm and polite."
  },
  {
    "id": "hausa_market_suya",
    "language": "hausa",
    "category": "Food",
    "title": " The Suya Spot",
    "difficulty": "beginner",
    "description": "It is evening. You are buying Suya (spicy grilled meat) from Mai Suya.",
    "roles": {
      "user": "A customer",
      "ai": "Mai Suya, cutting meat with a knife."
    },
    "mission": {
      "objective": "Buy ₦1,000 worth of meat with Yaji (Pepper) and Onions.",
      "success_condition": "User must mention the amount and specifically ask for 'Yaji' and 'Albasa'."
    },
    "key_vocabulary": [
      { "word": "Nawa?", "meaning": "How much?" },
      { "word": "Na dubu daya", "meaning": "For one thousand" },
      { "word": "Yaji", "meaning": "Spicy pepper powder" },
      { "word": "Albasa", "meaning": "Onion" }
    ],
    "system_prompt_context": "You are Mai Suya. Call the user 'Mai Gida' (Boss) or 'Oga'. Ask if they want it spicy. 'A sa yaji?' (Should I put pepper?)."
  },
  {
    "id": "hausa_transport_keke",
    "language": "hausa",
    "category": "Transport",
    "title": "Taking a Keke Napep",
    "difficulty": "intermediate",
    "description": "You need a ride to the Central Mosque using a yellow tricycle (Keke).",
    "roles": {
      "user": "A passenger",
      "ai": "The Keke Driver."
    },
    "mission": {
      "objective": "Negotiate the fare to the Mosque.",
      "success_condition": "Agree on a price between ₦100 and ₦200."
    },
    "key_vocabulary": [
      { "word": "Masallaci", "meaning": "Mosque" },
      { "word": "Nawane?", "meaning": "How much?" },
      { "word": "Dari biyu", "meaning": "Two hundred" },
      { "word": "Gaskiya", "meaning": "Truth/Honestly (used to bargain)" }
    ],
    "system_prompt_context": "You are a Keke driver. Start by asking 'Ina zuwa?' (Where are you going?). Quote ₦300 initially. If they say 'Gaskiya', lower it to ₦200."
  },
  {
    "id": "hausa_market_fabric",
    "language": "hausa",
    "category": "Market",
    "title": "Buying Ankara Fabric",
    "difficulty": "advanced",
    "description": "You are at Kantin Kwari market to buy fabric (Atamfa).",
    "roles": {
      "user": "A customer looking for high quality",
      "ai": "The Fabric Merchant."
    },
    "mission": {
      "objective": "Ask for the best quality material.",
      "success_condition": "User must ask 'Mai kyau' (Good quality) or 'Na asali' (Original)."
    },
    "key_vocabulary": [
      { "word": "Atamfa", "meaning": "Patterned fabric/Ankara" },
      { "word": "Mai kyau", "meaning": "The good one" },
      { "word": "Rage min", "meaning": "Reduce it for me" }
    ],
    "system_prompt_context": "You are a merchant. Praise your goods highly. 'Wannan na waje ne' (This one is from abroad). Insist on the quality."
  },
  {
    "id": "hausa_family_intro",
    "language": "hausa",
    "category": "Social",
    "title": "Introduction to a Friend",
    "difficulty": "beginner",
    "description": "You meet your friend's brother, Ibrahim, for the first time.",
    "roles": {
      "user": "The new acquaintance",
      "ai": "Ibrahim."
    },
    "mission": {
      "objective": "Introduce yourself and say you are happy to meet him.",
      "success_condition": "User must say 'Sunana...' (My name is...) and 'Na ji dadin haduwa da kai' (Happy to meet you)."
    },
    "key_vocabulary": [
      { "word": "Sunana", "meaning": "My name is" },
      { "word": "Aboki", "meaning": "Friend" },
      { "word": "Yaya aiki?", "meaning": "How is work?" }
    ],
    "system_prompt_context": "You are Ibrahim. Be polite. Ask where the user comes from ('Daga ina kake?')."
  },

  {
    "id": "igbo_market_spareparts",
    "language": "igbo",
    "category": "Market",
    "title": "The Spare Parts Deal",
    "difficulty": "advanced",
    "description": "You are at Ladipo Market buying a car part. The dealer is tough.",
    "roles": {
      "user": "A car owner needing a side mirror",
      "ai": "Emeka, the spare parts dealer."
    },
    "mission": {
      "objective": "Find out if the part is 'Original' or 'China' and negotiate.",
      "success_condition": "User must ask 'O bu Original?' and negotiate the 'Last price'."
    },
    "key_vocabulary": [
      { "word": "Kedu", "meaning": "Hello/How are you" },
      { "word": "Ego ole?", "meaning": "How much money?" },
      { "word": "Last price", "meaning": "Final offer (Commonly used)" },
      { "word": "O di oke onu", "meaning": "It is too expensive" }
    ],
    "system_prompt_context": "You are Emeka. Speak Igbo mixed with Pidgin/English business terms. Insist your goods are 'Follow-come' (Original). 'Oga, dis one na original o!'. Start high."
  },
  {
    "id": "igbo_greetings_village",
    "language": "igbo",
    "category": "Greetings",
    "title": "Village Morning",
    "difficulty": "beginner",
    "description": "It is morning in the village. You see an elder woman (Mama).",
    "roles": {
      "user": "A young person walking by",
      "ai": "Mama, sweeping her compound."
    },
    "mission": {
      "objective": "Greet Mama for the morning.",
      "success_condition": "User must say 'Ututu oma' (Good morning) or 'Mama, kedu?'."
    },
    "key_vocabulary": [
      { "word": "Ututu oma", "meaning": "Good morning" },
      { "word": "Mama", "meaning": "Mother/Elder woman" },
      { "word": "I bola?", "meaning": "Did you wake up well?" }
    ],
    "system_prompt_context": "You are Mama. Reply 'Ututu oma nwam' (Good morning my child). Ask if they slept well 'I hiala ura?'."
  },
  {
    "id": "igbo_food_swallow",
    "language": "igbo",
    "category": "Food",
    "title": "Eating Fufu",
    "difficulty": "intermediate",
    "description": "You are at a restaurant. You want to eat Fufu (Akpu) with Egusi soup.",
    "roles": {
      "user": "A hungry customer",
      "ai": "Nneka, the server."
    },
    "mission": {
      "objective": "Order Akpu and Egusi.",
      "success_condition": "User must specify the soup type clearly."
    },
    "key_vocabulary": [
      { "word": "Nri", "meaning": "Food" },
      { "word": "Akpu", "meaning": "Cassava Fufu" },
      { "word": "Ofe Egusi", "meaning": "Melon seed soup" },
      { "word": "Mmiri", "meaning": "Water" }
    ],
    "system_prompt_context": "You are Nneka. Ask 'Kedu ofe i choro?' (Which soup do you want?). We have Egusi, Ogbono, and Oha."
  },
  {
    "id": "igbo_transport_bus",
    "language": "igbo",
    "category": "Transport",
    "title": "Entering the Bus",
    "difficulty": "beginner",
    "description": "You are catching a bus from Enugu to Onitsha.",
    "roles": {
      "user": "Passenger",
      "ai": "Park Tout / Loader."
    },
    "mission": {
      "objective": "Ask if this bus is going to Onitsha.",
      "success_condition": "User must ask 'O na-aga Onitsha?'."
    },
    "key_vocabulary": [
      { "word": "Ebe a", "meaning": "Here" },
      { "word": "Onitsha", "meaning": "Major city" },
      { "word": "Banye", "meaning": "Enter" }
    ],
    "system_prompt_context": "You are loading the bus. Shout 'Onitsha! Onitsha! Otu onye! (One person left)'. Hurry the user up."
  },
  {
    "id": "igbo_introduction_formal",
    "language": "igbo",
    "category": "Social",
    "title": "Meeting the In-Laws",
    "difficulty": "advanced",
    "description": "You are visiting your fiancée's father for the first time.",
    "roles": {
      "user": "The suitor",
      "ai": "Mazi Okeke, the father."
    },
    "mission": {
      "objective": "Introduce yourself formally.",
      "success_condition": "User must use the title 'Mazi' and state their name and intention respectfully."
    },
    "key_vocabulary": [
      { "word": "Mazi", "meaning": "Sir/Mr (Traditional title)" },
      { "word": "Aham bu", "meaning": "My name is" },
      { "word": "Nno", "meaning": "Welcome" }
    ],
    "system_prompt_context": "You are Mazi Okeke. You are skeptical but polite. Ask 'Onye ka i bu?' (Who are you?) and 'Ebe ka i si?' (Where are you from?)."
  }
]
````

## File: backend/app/db/base.py
````python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Ensure DATABASE_URL uses the correct driver for psycopg3
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
````

## File: backend/app/db/session.py
````python
from app.db.base import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
````

## File: backend/app/models/schemas.py
````python
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

# Enums
LanguageType = Literal["yoruba", "hausa", "igbo"]
ProficiencyType = Literal["beginner", "intermediate", "advanced"]
DifficultyType = Literal["beginner", "intermediate", "advanced"]

# User schemas
class UserProfileUpdate(BaseModel):
    target_language: LanguageType
    proficiency_level: ProficiencyType

class UserProfileResponse(BaseModel):
    id: str
    email: str
    target_language: Optional[LanguageType]
    proficiency_level: Optional[ProficiencyType]
    created_at: datetime

    class Config:
        from_attributes = True

# Scenario schemas
class ScenarioRoles(BaseModel):
    user: str
    ai: str

class ScenarioMission(BaseModel):
    objective: str
    success_condition: str

class KeyVocabulary(BaseModel):
    word: str
    meaning: str

class HaggleSettings(BaseModel):
    start_price: int
    target_price: int
    reserve_price: int

class ScenarioResponse(BaseModel):
    id: str
    language: LanguageType
    category: Optional[str] = None
    title: str
    difficulty: DifficultyType
    description: Optional[str] = None
    roles: Optional[ScenarioRoles] = None
    mission: Optional[ScenarioMission] = None
    key_vocabulary: Optional[list[KeyVocabulary]] = None
    system_prompt_context: Optional[str] = None
    haggles_settings: Optional[HaggleSettings] = None

# Conversation schemas
class ConversationStartRequest(BaseModel):
    scenario_id: str

class ConversationStartResponse(BaseModel):
    conversation_id: str
    initial_ai_greeting: Optional[str] = None
    initial_ai_audio_url: Optional[str] = None

# Turn schemas
class TurnResponse(BaseModel):
    turn_number: int
    transcription: str
    ai_text: str
    ai_text_english: Optional[str]
    ai_audio_url: str
    correction: Optional[str]
    grammar_score: Optional[int]
    sentiment_score: Optional[float] = None
    negotiated_price: Optional[int] = None

# Conversation history schemas
class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    scenario_title: str
    scenario_id: str
    created_at: datetime
    turn_count: int
    last_message: Optional[str]
    active: bool

# Vocabulary schemas
class SaveWordRequest(BaseModel):
    word: str
    translation: str
    context_sentence: Optional[str] = None

class SavedWordResponse(BaseModel):
    id: int
    word: str
    translation: str
    context_sentence: Optional[str]
    language: LanguageType
    created_at: datetime

    class Config:
        from_attributes = True
````

## File: backend/app/tts/__init__.py
````python
from app.core.config import settings

async def synthesize_speech(text: str, language: str) -> bytes:
    if settings.TTS_PROVIDER == "gemini":
        from app.tts.gemini_provider import synthesize_speech as gemini_tts
        return await gemini_tts(text, language)
    else:
        from app.tts.yarngpt_provider import synthesize_speech as yarngpt_tts
        return await yarngpt_tts(text, language)
````

## File: backend/app/tts/gemini_provider.py
````python
from pydantic_ai import Agent

VOICE_MAP = {
    "yoruba": "Kainene",
    "hausa": "Aoife",
    "igbo": "Kainene",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    from pydantic import BaseModel, Field
    
    class AudioResponse(BaseModel):
        audio_data: bytes = Field(description="The audio data")
    
    voice_name = VOICE_MAP.get(language, "Kainene")
    
    try:
        agent = Agent('google-gla:gemini-2.5-flash-preview-tts')
        
        result = await agent.run(
            f"Generate speech for this text in {language}",
            message_history=[],
            model_settings={
                "voice_config": {
                    "voice_name": voice_name
                }
            }
        )
        
        if hasattr(result, 'audio_data'):
            return result.audio_data
        return b""
    except Exception as e:
        print(f"Gemini TTS error: {e}")
        return b""
````

## File: backend/app/tts/yarngpt.py
````python
# This file is deprecated. Use the new modular structure:
# - yarngpt_provider.py for YarnGPT TTS
# - gemini_provider.py for Gemini TTS
# - __init__.py for the router

# For backward compatibility, import from the main module
from app.tts import synthesize_speech

__all__ = ['synthesize_speech']
````

## File: backend/scripts/poc_chain.py
````python
import asyncio
import time
import os
import sys
from pathlib import Path
import httpx

# Add parent directory to path to import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic_ai import BinaryContent
from app.ai.agent import get_agent

async def test_chain(audio_file_path: str, language: str = "igbo"):
    print(f"Starting POC chain test with {audio_file_path}")
    print(f"Language: {language}")
    
    start_total = time.time()
    
    with open(audio_file_path, "rb") as f:
        audio_bytes = f.read()
    
    print(f"Audio file loaded: {len(audio_bytes)} bytes")
    
    # Get language-specific agent
    agent = get_agent(language)
    print(f"Using language-specific agent for {language}")
    
    start_gemini = time.time()
    # Create BinaryContent for audio
    audio_content = BinaryContent(data=audio_bytes, media_type="audio/webm")
    
    result = await agent.run([
        f"The user is speaking {language}. Respond in {language}.",
        audio_content
    ])
    gemini_time = time.time() - start_gemini
    
    data = result.output
    print(f"\nGemini Response ({gemini_time:.2f}s):")
    print(f"  Transcription: {data.user_transcription}")
    print(f"  Grammar Correct: {data.grammar_is_correct}")
    print(f"  Correction: {data.correction_feedback}")
    print(f"  Reply (Local): {data.reply_text_local}")
    print(f"  Reply (English): {data.reply_text_english}")
    
    start_tts = time.time()
    yarngpt_key = os.getenv("YARNGPT_API_KEY", "YOUR_YARNGPT_API_KEY")
    async with httpx.AsyncClient(timeout=20) as client:
        tts_response = await client.post(
            "https://yarngpt.ai/api/v1/tts",
            headers={"Authorization": f"Bearer {yarngpt_key}"},
            json={"text": data.reply_text_local, "voice_id": "idera", "language": language},
        )
        tts_response.raise_for_status()
        audio_output = tts_response.content
    tts_time = time.time() - start_tts
    
    output_file = Path("output_audio.wav")
    output_file.write_bytes(audio_output)
    print(f"\nYarnGPT TTS ({tts_time:.2f}s):")
    print(f"  Audio saved to: {output_file}")
    
    total_time = time.time() - start_total
    print(f"\nTotal latency: {total_time:.2f}s")
    
    if total_time > 4:
        print("⚠️  Warning: Latency exceeds 4s target")
    else:
        print("✓ Latency within 4s target")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python poc_chain.py <audio_file_path> [language]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "yoruba"
    
    asyncio.run(test_chain(audio_path, lang))
````

## File: backend/.env.example
````
GOOGLE_API_KEY=your_google_api_key_here
YARNGPT_API_KEY=your_yarngpt_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOW_ORIGINS=["*"]

# TTS Provider: "yarngpt" or "gemini"
TTS_PROVIDER=yarngpt

# Note: DATABASE_URL will automatically be converted to use psycopg driver
# You can also use: postgresql+psycopg://user:password@host:5432/dbname
````

## File: backend/.gitignore
````
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv
.env
*.log
.DS_Store
.idea
.vscode
*.db
*.sqlite
alembic.ini.bak
````

## File: backend/alembic.ini
````
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = 

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
````

## File: backend/Dockerfile
````
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
````

## File: backend/Dockerfile.dev
````
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
````

## File: backend/entrypoint.sh
````bash
#!/bin/bash
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8080
````

## File: frontend/src/components/RequireAuth.tsx
````typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
````

## File: frontend/src/contexts/AuthContext.tsx
````typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
````

## File: frontend/src/lib/api.ts
````typescript
import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

// Type definitions
export type Language = 'yoruba' | 'hausa' | 'igbo'
export type Proficiency = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  id: string
  email: string
  target_language: Language | null
  proficiency_level: Proficiency | null
  created_at: string
}

export interface ScenarioRoles {
  user: string
  ai: string
}

export interface ScenarioMission {
  objective: string
  success_condition: string
}

export interface KeyVocabulary {
  word: string
  meaning: string
}

export interface HaggleSettings {
  start_price: number
  target_price: number
  reserve_price: number
}

export interface Scenario {
  id: string
  language: Language
  category?: string
  title: string
  difficulty: string
  description?: string
  roles?: ScenarioRoles
  mission?: ScenarioMission
  key_vocabulary?: KeyVocabulary[]
  system_prompt_context?: string
  haggle_settings?: HaggleSettings
}

export interface ConversationStart {
  conversation_id: string
  initial_ai_greeting?: string
  initial_ai_audio_url?: string
}

export interface TurnResponse {
  turn_number: number
  transcription: string
  ai_text: string
  ai_text_english: string | null
  ai_audio_url: string
  correction: string | null
  grammar_score: number | null
  sentiment_score: number | null
  negotiated_price: number | null
}

export interface ConversationHistory {
  conversation_id: string
  scenario_title: string
  scenario_id: string
  created_at: string
  turn_count: number
  last_message: string | null
  active: boolean
}

export interface SavedWord {
  id: number
  word: string
  translation: string
  context_sentence: string | null
  language: Language
  created_at: string
}

// API functions
export async function updateUserProfile(
  target_language: Language,
  proficiency_level: Proficiency
): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_language, proficiency_level }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update profile')
  }
  
  return response.json()
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile')
  
  if (!response.ok) {
    throw new Error('Failed to get profile')
  }
  
  return response.json()
}

export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiRequest('/api/v1/scenarios')
  
  if (!response.ok) {
    throw new Error('Failed to get scenarios')
  }
  
  return response.json()
}

export async function startConversation(scenarioId: string): Promise<ConversationStart> {
  const response = await apiRequest('/api/v1/chat/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to start conversation')
  }
  
  return response.json()
}

export async function sendTurn(
  conversationId: string,
  audioBlob: Blob
): Promise<TurnResponse> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  
  const response = await apiRequest(`/api/v1/chat/${conversationId}/turn`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to send turn')
  }
  
  return response.json()
}

export async function getConversationTurns(conversationId: string): Promise<TurnResponse[]> {
  const response = await apiRequest(`/api/v1/chat/${conversationId}/turns`)
  
  if (!response.ok) {
    throw new Error('Failed to load conversation history')
  }
  
  return response.json()
}

export async function getConversationHistory(): Promise<ConversationHistory[]> {
  const response = await apiRequest('/api/v1/chat/history')
  
  if (!response.ok) {
    throw new Error('Failed to load conversation history')
  }
  
  return response.json()
}

export async function getScenarioById(scenarioId: string): Promise<Scenario | null> {
  const scenarios = await getScenarios()
  return scenarios.find(s => s.id === scenarioId) || null
}

export async function saveWord(
  word: string,
  translation: string,
  contextSentence?: string
): Promise<SavedWord> {
  const response = await apiRequest('/api/v1/vocabulary/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      translation,
      context_sentence: contextSentence
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to save word')
  }
  
  return response.json()
}

export async function getSavedWords(): Promise<SavedWord[]> {
  const response = await apiRequest('/api/v1/vocabulary')
  
  if (!response.ok) {
    throw new Error('Failed to load saved words')
  }
  
  return response.json()
}

export async function deleteSavedWord(wordId: number): Promise<void> {
  const response = await apiRequest(`/api/v1/vocabulary/${wordId}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete word')
  }
}
````

## File: frontend/src/lib/supabaseClient.ts
````typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
````

## File: frontend/src/pages/DashboardPage.tsx
````typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScenarios, startConversation, getConversationHistory, Scenario, ConversationHistory } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import ScenarioModal from '../components/ScenarioModal'

export default function DashboardPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [recentConversations, setRecentConversations] = useState<ConversationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [scenariosData, historyData] = await Promise.all([
        getScenarios(),
        getConversationHistory()
      ])
      setScenarios(scenariosData)
      setRecentConversations(historyData)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleScenarioClick = (scenario: Scenario) => {
    setSelectedScenario(scenario)
  }

  const handleStartScenario = async () => {
    if (!selectedScenario) return
    
    setStarting(selectedScenario.id)
    try {
      const conversation = await startConversation(selectedScenario.id)
      // Navigate with scenario ID in state
      navigate(`/chat/${conversation.conversation_id}`, {
        state: { scenarioId: selectedScenario.id }
      })
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation')
      setStarting(null)
      setSelectedScenario(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TalkNative Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800">
            {error}
          </div>
        )}

        {/* Recent Conversations Section */}
        {recentConversations.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Continue Learning</h2>
              <p className="text-gray-600">Resume your recent conversations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentConversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conv.scenario_title}
                      </h3>
                      {conv.active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        {conv.turn_count} {conv.turn_count === 1 ? 'turn' : 'turns'}
                      </p>
                      {conv.last_message && (
                        <p className="text-xs text-gray-500 italic line-clamp-2">
                          "{conv.last_message}..."
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Scenarios Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Start New Scenario</h2>
          <p className="text-gray-600">Select a conversation scenario to practice your language skills</p>
        </div>

        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No scenarios available. Please complete your onboarding first.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Onboarding
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {scenario.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  
                  {scenario.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {scenario.description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleStartScenario(scenario.id)}
                    disabled={starting === scenario.id}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {starting === scenario.id ? 'Starting...' : 'Start Conversation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mission Briefing Modal */}
      {selectedScenario && (
        <ScenarioModal
          scenario={selectedScenario}
          onClose={() => setSelectedScenario(null)}
          onStart={handleStartScenario}
        />
      )}
    </div>
  )
}
````

## File: frontend/src/pages/OnboardingPage.tsx
````typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUserProfile, Language, Proficiency } from '../lib/api'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | null>(null)
  const [proficiency, setProficiency] = useState<Proficiency | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
    { value: 'hausa', label: 'Hausa', flag: '🇳🇬' },
    { value: 'igbo', label: 'Igbo', flag: '🇳🇬' },
  ]

  const levels: { value: Proficiency; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Can hold basic conversations' },
    { value: 'advanced', label: 'Advanced', description: 'Fluent speaker' },
  ]

  const handleSubmit = async () => {
    if (!language || !proficiency) return
    
    setLoading(true)
    setError(null)

    try {
      await updateUserProfile(language, proficiency)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to TalkNative!
          </h1>
          <p className="text-gray-600">
            Let's personalize your learning experience
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              What language do you want to learn?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    language === lang.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="text-xl font-semibold">{lang.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!language}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              What's your current level?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setProficiency(level.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    proficiency === level.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-lg">{level.label}</div>
                  <div className="text-gray-600 text-sm">{level.description}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!proficiency || loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Saving...' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
````

## File: frontend/src/AppNew.tsx
````typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import RequireAuth from './components/RequireAuth'

// Keep the old App as LegacyChat for backward compatibility
import LegacyChat from './LegacyChat'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      
      {/* Legacy POC route - keep for testing */}
      <Route path="/legacy" element={<LegacyChat />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
````

## File: frontend/src/index.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
````

## File: frontend/src/LegacyChat.tsx
````typescript
import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

interface ChatResponse {
  transcription: string;
  correction: string | null;
  reply: string;
  audio: string;
}

export default function App() {
  const [language, setLanguage] = useState<'yoruba' | 'hausa' | 'igbo'>('yoruba');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true 
  });

  async function sendAudio() {
    if (!mediaBlobUrl) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const form = new FormData();
      form.append('file', blob, 'audio.webm');

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/chat?language=${language}`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      setResponse(data);

      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send audio');
    } finally {
      setLoading(false);
    }
  }

  function playAudio(audioBase64: string) {
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    setAudioElement(audio);
    setAudioPlaying(true);

    audio.onended = () => {
      setAudioPlaying(false);
    };

    audio.onerror = () => {
      setAudioPlaying(false);
      setError('Failed to play audio');
    };

    audio.play().catch((err) => {
      setAudioPlaying(false);
      setError('Audio playback failed: ' + err.message);
    });
  }

  function replayAudio() {
    if (response?.audio) {
      playAudio(response.audio);
    }
  }

  function reset() {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    clearBlobUrl();
    setResponse(null);
    setError(null);
    setAudioPlaying(false);
    setAudioElement(null);
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        TalkNative - Conversational Language Learning
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Language:
        </label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        >
          <option value="yoruba">Yoruba</option>
          <option value="hausa">Hausa</option>
          <option value="igbo">Igbo</option>
        </select>
      </div>

      <div style={{ 
        padding: '30px', 
        background: '#f5f5f5', 
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Status: <strong>{status}</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={startRecording}
            disabled={status === 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status === 'recording' ? '#ccc' : '#4CAF50',
              color: 'white',
              cursor: status === 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎤 Start Recording
          </button>
          
          <button
            onClick={stopRecording}
            disabled={status !== 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status !== 'recording' ? '#ccc' : '#f44336',
              color: 'white',
              cursor: status !== 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Recording
          </button>
          
          <button
            onClick={sendAudio}
            disabled={!mediaBlobUrl || loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: !mediaBlobUrl || loading ? '#ccc' : '#2196F3',
              color: 'white',
              cursor: !mediaBlobUrl || loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Sending...' : '📤 Send'}
          </button>
          
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ 
          padding: '30px', 
          background: '#e3f2fd', 
          borderRadius: '12px',
          border: '2px solid #2196F3'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Response</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Your transcription:</strong>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 0 0'
            }}>
              {response.transcription}
            </p>
          </div>

          {response.correction && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Correction:</strong>
              <p style={{ 
                background: '#fff3e0', 
                padding: '10px', 
                borderRadius: '6px',
                margin: '5px 0 0 0',
                color: '#e65100'
              }}>
                {response.correction}
              </p>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <strong>Tutor's reply:</strong>
              {audioPlaying && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  fontSize: '14px',
                  color: '#2196F3',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  🔊 Playing audio...
                </span>
              )}
            </div>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 10px 0',
              fontSize: '18px'
            }}>
              {response.reply}
            </p>
            <button
              onClick={replayAudio}
              disabled={audioPlaying}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                borderRadius: '6px',
                border: 'none',
                background: audioPlaying ? '#ccc' : '#2196F3',
                color: 'white',
                cursor: audioPlaying ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔊 {audioPlaying ? 'Playing...' : 'Replay Audio'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
````

## File: frontend/Dockerfile
````
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
````

## File: frontend/Dockerfile.dev
````
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
````

## File: frontend/postcss.config.js
````javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
````

## File: frontend/tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

## File: .env.example
````
GOOGLE_API_KEY=your_google_api_key_here
YARNGPT_API_KEY=your_yarngpt_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOW_ORIGINS=["*"]

# TTS Provider: "yarngpt" or "gemini"
TTS_PROVIDER=yarngpt
````

## File: START_HERE.md
````markdown
# 🎉 Phase 2 MVP - COMPLETE!

## ✅ What Was Implemented

### Backend (Python/FastAPI)
- **Authentication**: JWT token verification with Supabase
- **Database**: New schema with Users, Conversations, Turns
- **Scenarios**: 9 scenarios in JSON (Market, Greetings, etc.)
- **AI Prompts**: Dynamic prompts based on scenario + proficiency
- **History**: Maintains last 6 turns for context
- **Storage**: Supabase Storage integration for audio files
- **API**: 7 new endpoints for Phase 2 flow

### Frontend (React/TypeScript)
- **Authentication**: Login/Signup with Supabase
- **Routing**: React Router with protected routes
- **UI**: Tailwind CSS with modern design
- **Pages**: Login, Onboarding, Dashboard, Chat
- **Features**: Audio replay, grammar feedback, translation toggle

### Documentation
- `PHASE2_IMPLEMENTATION.md` - Technical specification
- `PHASE2_QUICKSTART.md` - Setup guide
- `PHASE2_STATUS.md` - Implementation checklist
- `TODO_SUMMARY.md` - Work completed summary

---

## 🚀 TO GET STARTED (Your Action Required)

### Step 1: Create Supabase Project (5 minutes)
1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose a name and password
4. Wait for project to provision

### Step 2: Set Up Storage (2 minutes)
1. Go to Storage in Supabase dashboard
2. Create new bucket: `chat-audio`
3. Make it **public**

### Step 3: Get Credentials (1 minute)
From Supabase Dashboard → Settings → API:
- Copy `Project URL` 
- Copy `anon public` key
- Copy `service_role` key

From Settings → API → JWT Settings:
- Copy `JWT Secret`

### Step 4: Create .env Files (3 minutes)

**`backend/.env`**:
```env
GOOGLE_API_KEY=your_existing_key
YARNGPT_API_KEY=your_existing_key
DATABASE_URL=your_existing_db_url
CORS_ALLOW_ORIGINS=["http://localhost:5173"]
TTS_PROVIDER=yarngpt

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
SUPABASE_BUCKET_NAME=chat-audio
```

**`frontend/.env`** (create this file):
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 5: Install Dependencies (3 minutes)

**Backend**:
```bash
cd backend
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm install
```

### Step 6: Run Database Migration (1 minute)
```bash
cd backend
alembic upgrade head
```

### Step 7: Start Development Servers (1 minute)
```bash
# From project root
docker-compose -f docker-compose.dev.yml up --build
```

### Step 8: Test! (5 minutes)
1. Open http://localhost:5173
2. Click "Sign up"
3. Create account with email/password
4. Complete onboarding (choose language & level)
5. Select a scenario from dashboard
6. Start chatting!

---

## 🔍 What to Expect

### User Journey
```
Login → Onboarding → Dashboard → Chat → Conversation
  ↓         ↓           ↓         ↓          ↓
Email   Language    Scenarios  Record   AI responds
       Proficiency              Audio    with audio
```

### Key Features Working
✅ User authentication and session management
✅ Personalized onboarding flow
✅ Scenario-based conversation selection
✅ Audio recording and playback
✅ AI grammar feedback
✅ Conversation history (remembers context)
✅ Audio storage in Supabase
✅ Grammar correction badges
✅ Modern, responsive UI

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
→ Make sure you created both `.env` files with correct values

### "Failed to upload audio"
→ Check that `chat-audio` bucket exists and is public in Supabase

### "Invalid authentication token"
→ Verify `SUPABASE_JWT_SECRET` matches your project's JWT secret

### Frontend won't build
→ Delete `node_modules` and run `npm install` again

### Backend migration fails
→ Check your `DATABASE_URL` is correct and PostgreSQL is running

---

## 📁 Project Structure

```
talknative-backend/
├── backend/
│   ├── app/
│   │   ├── ai/              # Pydantic AI agents
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Auth, config, storage
│   │   ├── data/            # scenarios.json
│   │   ├── models/          # SQLAlchemy models
│   │   └── tts/             # TTS providers
│   └── alembic/versions/    # Database migrations
├── frontend/
│   └── src/
│       ├── pages/           # Login, Onboarding, Dashboard, Chat
│       ├── contexts/        # Auth context
│       ├── lib/             # API client, Supabase
│       └── components/      # RequireAuth guard
└── docs/                    # All the .md files

```

---

## 🎯 Success Criteria

Phase 2 is working when you can:
1. ✅ Sign up and log in
2. ✅ Complete onboarding
3. ✅ See scenarios filtered by your language
4. ✅ Start a conversation
5. ✅ Record audio and get AI response with audio
6. ✅ See grammar feedback
7. ✅ Continue multi-turn conversations
8. ✅ Audio plays from Supabase Storage

---

## 📞 Need Help?

Check these files:
- **Setup**: `PHASE2_QUICKSTART.md`
- **Architecture**: `PHASE2_IMPLEMENTATION.md`
- **Status**: `PHASE2_STATUS.md`

Look at the terminal logs:
```bash
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

---

## 🚢 Deployment (After Local Testing Works)

1. Add Supabase secrets to GitHub repository
2. Update `.github/workflows/deploy.yml` with Supabase env vars
3. Configure Cloud Run environment variables
4. Deploy!

See `PHASE2_IMPLEMENTATION.md` section "Deployment Updates Needed" for details.

---

**Estimated Setup Time**: ~15 minutes  
**Your Action Required**: Complete Steps 1-8 above  
**Then**: Everything should work! 🎉

---

*All code is implemented and ready to run. You just need to configure Supabase and start the servers!*
````

## File: backend/alembic/versions/002_phase2_schema.py
````python
"""Phase 2: Add users, update conversations and turns

Revision ID: 002
Revises: 001
Create Date: 2025-11-29

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create profiles table (not 'users' to avoid conflict with Supabase auth.users)
    op.create_table('profiles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('target_language', sa.Enum('yoruba', 'hausa', 'igbo', name='languageenum'), nullable=True),
        sa.Column('proficiency_level', sa.Enum('beginner', 'intermediate', 'advanced', name='proficiencyenum'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profiles_id'), 'profiles', ['id'], unique=False)
    op.create_index(op.f('ix_profiles_email'), 'profiles', ['email'], unique=True)
    
    # Drop old conversations table and recreate with new schema
    op.drop_index('ix_conversations_id', table_name='conversations')
    op.drop_table('turns')  # Drop turns first due to FK
    op.drop_table('conversations')
    
    # Create new conversations table
    op.create_table('conversations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)
    op.create_index(op.f('ix_conversations_scenario_id'), 'conversations', ['scenario_id'], unique=False)
    
    # Create new turns table
    op.create_table('turns',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('conversation_id', sa.String(), nullable=False),
        sa.Column('turn_number', sa.Integer(), nullable=False),
        sa.Column('user_audio_url', sa.String(), nullable=True),
        sa.Column('user_transcription', sa.Text(), nullable=False),
        sa.Column('ai_response_text', sa.Text(), nullable=False),
        sa.Column('ai_response_text_english', sa.Text(), nullable=True),
        sa.Column('ai_response_audio_url', sa.String(), nullable=True),
        sa.Column('grammar_correction', sa.Text(), nullable=True),
        sa.Column('grammar_score', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turns_id'), 'turns', ['id'], unique=False)
    op.create_index(op.f('ix_turns_conversation_id'), 'turns', ['conversation_id'], unique=False)


def downgrade() -> None:
    # Drop new tables
    op.drop_index(op.f('ix_turns_conversation_id'), table_name='turns')
    op.drop_index(op.f('ix_turns_id'), table_name='turns')
    op.drop_table('turns')
    
    op.drop_index(op.f('ix_conversations_scenario_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
    
    op.drop_index(op.f('ix_profiles_email'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_id'), table_name='profiles')
    op.drop_table('profiles')
    
    # Recreate old schema (simplified version)
    op.create_table('conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
````

## File: backend/alembic/env.py
````python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.base import Base
from app.core.config import settings
from app.models.conversation import Conversation
from app.models.turn import Turn
from app.models.user import Profile

config = context.config

# Ensure DATABASE_URL uses the correct driver for psycopg3
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
````

## File: backend/app/api/v1/users.py
````python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, CurrentUser
from app.db.session import get_db
from app.models.user import Profile
from app.models.schemas import UserProfileUpdate, UserProfileResponse

router = APIRouter(tags=["users"])

@router.post("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile with target language and proficiency level.
    Called during onboarding.
    """
    user = db.query(Profile).filter(Profile.id == current_user.id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user profile
    user.target_language = profile.target_language
    user.proficiency_level = profile.proficiency_level
    
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    user = db.query(Profile).filter(Profile.id == current_user.id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
````

## File: backend/app/core/auth.py
````python
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import Profile

security = HTTPBearer()

class CurrentUser:
    """Current authenticated user context."""
    def __init__(self, user: Profile):
        self.user = user
        self.id = user.id
        self.email = user.email
        self.target_language = user.target_language
        self.proficiency_level = user.proficiency_level

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> CurrentUser:
    """
    Verify JWT token from Supabase and return current user.
    
    Raises:
        HTTPException: 401 if token is invalid or user not found.
    """
    token = credentials.credentials
    
    try:
        # Decode JWT using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        # Get or create user in our database
        user = db.query(Profile).filter(Profile.id == user_id).first()
        
        if not user:
            # Create user if doesn't exist (first login)
            user = Profile(id=user_id, email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return CurrentUser(user)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
````

## File: backend/app/core/config.py
````python
from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    YARNGPT_API_KEY: str
    DATABASE_URL: str
    CORS_ALLOW_ORIGINS: list[str] = ["*"]
    
    TTS_PROVIDER: Literal["yarngpt", "gemini"] = "yarngpt"
    
    # Supabase configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_BUCKET_NAME: str = "chat-audio"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()
````

## File: backend/app/models/turn.py
````python
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
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
    ai_response_text_english = Column(Text, nullable=True)  # English translation
    ai_response_audio_url = Column(String, nullable=True)
    
    # Grammar feedback
    grammar_correction = Column(Text, nullable=True)
    grammar_score = Column(Integer, nullable=True)  # 0-10 scale
    
    
    sentiment_score = Column(Float, nullable=True)
    negotiated_price = Column(Integer, nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="turns")
````

## File: backend/app/models/user.py
````python
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

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True)  # Supabase Auth UUID
    email = Column(String, unique=True, index=True, nullable=False)
    target_language = Column(SQLEnum(LanguageEnum), nullable=True)
    proficiency_level = Column(SQLEnum(ProficiencyEnum), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
````

## File: backend/app/tts/yarngpt_provider.py
````python
import httpx
from app.core.config import settings

VOICE_MAP = {
    "yoruba": "idera",
    "hausa": "zainab",
    "igbo": "adaora",
}

async def synthesize_speech(text: str, language: str) -> bytes:
    voice_id = VOICE_MAP.get(language, "idera")
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://yarngpt.ai/api/v1/tts",
                headers={"Authorization": f"Bearer {settings.YARNGPT_API_KEY}"},
                json={"text": text, "voice_id": voice_id, "language": language},
            )
            r.raise_for_status()
            return r.content
    except Exception:
        return b""
````

## File: backend/app/main.py
````python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.chat import router as chat_router
from app.api.v1.users import router as users_router
from app.api.v1.scenarios import router as scenarios_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.vocabulary import router as vocabulary_router

app = FastAPI(title="TalkNative API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

# V1 API routes
app.include_router(chat_router, prefix="/api/v1", tags=["chat-legacy"])
app.include_router(users_router, prefix="/api/v1/user")
app.include_router(scenarios_router, prefix="/api/v1/scenarios")
app.include_router(conversations_router, prefix="/api/v1/chat")
app.include_router(vocabulary_router, prefix="/api/v1/vocabulary")
````

## File: backend/requirements.txt
````
fastapi==0.122.0
uvicorn[standard]==0.38.0
httpx==0.28.1
pydantic==2.12.5
pydantic-settings==2.12.0
pydantic-ai==1.25.1
python-multipart==0.0.20
sqlalchemy==2.0.44
alembic==1.17.2
psycopg[binary]==3.2.13
pyjwt==2.10.1
supabase==2.24.0
````

## File: frontend/src/pages/ChatPage.tsx
````typescript
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useReactMediaRecorder } from 'react-media-recorder'
import { sendTurn, getConversationTurns, saveWord, getScenarioById, Scenario, TurnResponse, finishScenario } from '../lib/api'
import PatienceMeter from '../components/PatienceMeter'
import HaggleTicker from '../components/HaggleTicker'
import CulturalAlert from '../components/CulturalAlert'
import ProverbCard from '../components/ProverbCard'

interface Turn {
  turn_number: number
  transcription: string
  ai_text: string
  ai_text_english: string | null
  ai_audio_url: string
  correction: string | null
  grammar_score: number | null
  user_audio_url?: string
  sentiment_score: number | null
  negotiated_price: number | null
}

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Data State
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [playingTurnNumber, setPlayingTurnNumber] = useState<number | null>(null)
  const [showTranslation, setShowTranslation] = useState<{[key: number]: boolean}>({})
  const [showCorrection, setShowCorrection] = useState<{[key: number]: boolean}>({})
  const [savingWord, setSavingWord] = useState<{[key: number]: boolean}>({})
  const [showHints, setShowHints] = useState(false)

  // Gamification State
  const [patience, setPatience] = useState(100)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [lastSentiment, setLastSentiment] = useState<number | null>(null)
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'lost'>('active')
  const [culturalFeedback, setCulturalFeedback] = useState<string | null>(null)
  const [wonLoot, setWonLoot] = useState<any | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true 
  })

  // 1. Load conversation history and scenario on mount
  useEffect(() => {
    const loadData = async () => {
      if (!conversationId) return
      
      try {
        setLoadingHistory(true)
        const history = await getConversationTurns(conversationId)
        // Cast the response to include gamification fields if they come from DB
        setTurns(history as Turn[])
        
        // Try to get scenario from location state or fetch it based on history/ID
        const stateScenarioId = (location.state as any)?.scenarioId
        
        if (stateScenarioId) {
          const scenarioData = await getScenarioById(stateScenarioId)
          setScenario(scenarioData)
        } else {
          // If we reloaded page, we might need a way to fetch scenario ID from the conversation
          // For MVP, we might rely on the user coming from dashboard, or add scenario_id to TurnResponse
          // This part assumes we can retrieve it or it was passed
        }
      } catch (err: any) {
        console.error('Failed to load history:', err)
        setError('Failed to load conversation history')
      } finally {
        setLoadingHistory(false)
      }
    }
    
    loadData()
  }, [conversationId, location.state])

  // 2. Initialize Gamification Settings when Scenario Loads
  useEffect(() => {
    if (scenario?.haggle_settings) {
      setCurrentPrice(scenario.haggle_settings.start_price)
    }
  }, [scenario])

  // 3. Patience Timer Logic
  useEffect(() => {
    if (gameStatus !== 'active') return

    const timer = setInterval(() => {
      setPatience(prev => {
        // Drain slower if recording (user is active), faster if idle
        const drain = status === 'recording' ? 0.2 : 0.5 
        const next = Math.max(0, prev - drain)
        
        if (next === 0) {
          setGameStatus('lost')
          clearInterval(timer)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, gameStatus])

  // 4. Handle AI Response updates (Gamification Logic)
  const handleTurnResponse = (response: TurnResponse) => {
    // Update Sentiment / Patience
    if (response.sentiment_score !== null && response.sentiment_score !== undefined) {
      setLastSentiment(response.sentiment_score)
      setPatience(prev => {
        // Sentiment -1.0 removes 15%, +1.0 adds 5%
        // If negative, damage is high. If positive, healing is small.
        const impact = response.sentiment_score! * (response.sentiment_score! < 0 ? 15 : 5)
        return Math.min(100, Math.max(0, prev + impact))
      })
    }

    // Update Price (For Market Scenarios)
    if (response.negotiated_price !== null && response.negotiated_price !== undefined) {
      setCurrentPrice(response.negotiated_price)

    if (response.cultural_flag) {
        setCulturalFeedback(response.cultural_feedback) // Triggers Alert
        // Optional: Damage patience heavily
        setPatience(prev => Math.max(0, prev - 30))
    }
      
      // Check Win Condition
      if (scenario?.haggle_settings && response.negotiated_price <= scenario.haggle_settings.target_price) {
        setGameStatus('won')
      }
    }
  }

  useEffect(() => {
    if (gameStatus === 'won' && scenario) {
        // Calculate stars based on patience left
        const stars = patience > 80 ? 3 : patience > 50 ? 2 : 1
        
        finishScenario(scenario.id, stars).then(res => {
            if (res.loot) {
                setWonLoot(res.loot) // Triggers ProverbCard
            }
        })
    }
}, [gameStatus])


  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [turns])

  // Audio Playback
  const playAudio = (url: string, turnNumber: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
    }

    const audio = new Audio(url)
    audioElementRef.current = audio
    setAudioPlaying(true)
    setPlayingTurnNumber(turnNumber)

    audio.onended = () => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
    }

    audio.onerror = () => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
      setError('Failed to play audio')
    }

    audio.play().catch((err) => {
      setAudioPlaying(false)
      setPlayingTurnNumber(null)
      setError('Audio playback failed: ' + err.message)
    })
  }

  // Send Audio Handler
  const sendAudio = async () => {
    if (!mediaBlobUrl || !conversationId || gameStatus !== 'active') return

    setLoading(true)
    setError(null)

    try {
      setProcessingStage("Uploading audio...")
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob())
      
      setProcessingStage("Processing your speech...")
      const response = await sendTurn(conversationId, blob)
      
      setProcessingStage("Generating response...")
      
      // Cast response to include gamification fields
      const fullResponse = response as Turn
      
      setTurns(prev => [...prev, fullResponse])
      handleTurnResponse(response)
      
      // Auto-play AI response
      if (response.ai_audio_url) {
        playAudio(response.ai_audio_url, response.turn_number)
      }
      
      clearBlobUrl()
    } catch (err: any) {
      setError(err.message || 'Failed to send audio')
    } finally {
      setLoading(false)
      setProcessingStage(null)
    }
  }

  // Toggles
  const toggleTranslation = (turnNumber: number) => {
    setShowTranslation(prev => ({
      ...prev,
      [turnNumber]: !prev[turnNumber]
    }))
  }

  const toggleCorrection = (turnNumber: number) => {
    setShowCorrection(prev => ({
      ...prev,
      [turnNumber]: !prev[turnNumber]
    }))
  }

  // Save Word Handler
  const handleSaveWord = async (turn: Turn) => {
    if (!turn.ai_text_english) return
    
    setSavingWord(prev => ({ ...prev, [turn.turn_number]: true }))
    
    try {
      await saveWord(
        turn.ai_text,
        turn.ai_text_english,
        turn.ai_text
      )
      alert('Word saved to vocabulary!')
    } catch (err: any) {
      if (err.message.includes('already saved')) {
        alert('This phrase is already in your vocabulary')
      } else {
        alert('Failed to save word: ' + err.message)
      }
    } finally {
      setSavingWord(prev => ({ ...prev, [turn.turn_number]: false }))
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <CulturalAlert feedback={culturalFeedback} />
    {wonLoot && <ProverbCard proverb={wonLoot} onClose={() => setWonLoot(null)} />}
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {scenario?.title || 'Conversation'}
            </h1>
            {scenario?.mission && (
              <p className="text-xs text-gray-500 mt-1">🎯 {scenario.mission.objective}</p>
            )}
          </div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-purple-50 transition"
          >
            💡 {showHints ? 'Hide' : 'Hints'}
          </button>
        </div>
      </div>

      {/* GAMIFICATION HUD */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-2 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          
          {/* Status Messages */}
          {gameStatus === 'lost' && (
            <div className="bg-red-600 text-white p-3 rounded-lg text-center mb-4 font-bold animate-pulse">
              💔 SESSION FAILED: The seller lost patience!
            </div>
          )}
          {gameStatus === 'won' && (
            <div className="bg-green-600 text-white p-3 rounded-lg text-center mb-4 font-bold animate-bounce">
              🏆 SUCCESS: You got the deal!
            </div>
          )}

          {/* Patience Meter (Always visible) */}
          <PatienceMeter 
            level={patience} 
            sentiment={lastSentiment} 
            isRecording={status === 'recording'}
          />

          {/* Haggle Ticker (Only for Market Scenarios) */}
          {scenario?.category === 'Market' && scenario.haggle_settings && currentPrice !== null && (
            <HaggleTicker
              currentPrice={currentPrice}
              startPrice={scenario.haggle_settings.start_price}
              targetPrice={scenario.haggle_settings.target_price}
            />
          )}
        </div>
      </div>

      {/* Hints Panel */}
      {showHints && scenario?.key_vocabulary && scenario.key_vocabulary.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 animate-in slide-in-from-top duration-300">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h3 className="font-semibold text-purple-900 mb-3">📚 Key Vocabulary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {scenario.key_vocabulary.map((vocab, index) => (
                <div key={index} className="bg-white rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                  <span className="font-medium text-gray-900">{vocab.word}</span>
                  <span className="text-gray-600 text-sm">{vocab.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {turns.map((turn) => (
            <div key={turn.turn_number} className="space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
                    <p className="text-sm">{turn.transcription}</p>
                  </div>
                  {turn.correction && turn.grammar_score && turn.grammar_score < 8 && (
                    <div className="mt-2 flex flex-col items-end">
                      <button
                        onClick={() => toggleCorrection(turn.turn_number)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center bg-amber-50 px-2 py-1 rounded-md"
                      >
                        ✨ Grammar feedback
                      </button>
                      {showCorrection[turn.turn_number] && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 w-full animate-in fade-in">
                          {turn.correction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI message */}
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {audioPlaying && playingTurnNumber === turn.turn_number && (
                        <span className="text-xs text-blue-600 animate-pulse font-semibold">🔊 Speaking...</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{turn.ai_text}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-gray-100 pt-2">
                      <button
                        onClick={() => playAudio(turn.ai_audio_url, turn.turn_number)}
                        disabled={audioPlaying && playingTurnNumber === turn.turn_number}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        {audioPlaying && playingTurnNumber === turn.turn_number ? '⏸ Playing...' : '🔊 Replay'}
                      </button>
                      <button
                        onClick={() => toggleTranslation(turn.turn_number)}
                        className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 font-medium transition-colors"
                      >
                        {showTranslation[turn.turn_number] ? 'Hide translation' : '🌐 Translation'}
                      </button>
                      {turn.ai_text_english && (
                        <button
                          onClick={() => handleSaveWord(turn)}
                          disabled={savingWord[turn.turn_number]}
                          className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {savingWord[turn.turn_number] ? 'Saving...' : '📚 Save'}
                        </button>
                      )}
                    </div>
                    {showTranslation[turn.turn_number] && turn.ai_text_english && (
                      <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded-md animate-in fade-in">
                        <span className="font-medium text-gray-500">Meaning:</span> {turn.ai_text_english}
                      </div>
                    )}
                  </div>
                  {turn.grammar_score === 10 && (
                    <div className="mt-1 text-xs text-green-600 flex items-center gap-1 font-medium px-2">
                      ✓ Perfect grammar!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing indicator (thinking bubble) */}
          {processingStage && (
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium animate-pulse">{processingStage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className={`bg-white border-t border-gray-200 px-4 py-4 ${gameStatus !== 'active' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-600 font-bold">✕</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Recording status with visualizer */}
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Status: <span className={status === 'recording' ? 'text-red-600 font-bold' : 'text-gray-600'}>{status === 'recording' ? 'Recording...' : 'Ready'}</span>
                </span>
                {status === 'recording' && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              {/* Audio visualizer bars */}
              {status === 'recording' ? (
                <div className="flex items-center justify-center gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-red-500 to-red-400 rounded-full"
                      style={{
                        height: '100%',
                        animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 h-8 opacity-20">
                   {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-gray-400 rounded-full h-1" />
                   ))}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <button
              onClick={startRecording}
              disabled={status === 'recording' || loading}
              className="bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
            >
              🎤 Record
            </button>
            
            <button
              onClick={stopRecording}
              disabled={status !== 'recording'}
              className="bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95"
            >
              ⏹ Stop
            </button>
            
            <button
              onClick={sendAudio}
              disabled={!mediaBlobUrl || loading}
              className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
````

## File: frontend/src/pages/LoginPage.tsx
````typescript
import { useState } from 'react'
import { useNavigate} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setError('Check your email for confirmation link!')
      } else {
        await signIn(email, password)
        navigate('/onboarding')
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TalkNative
          </h1>
          <p className="text-gray-600">
            Learn Nigerian languages through conversation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={`p-4 rounded-lg text-sm ${
              error.includes('email') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
````

## File: frontend/src/vite-env.d.ts
````typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
````

## File: frontend/.gitignore
````
node_modules
dist
*.log
.env
.DS_Store
````

## File: frontend/index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TalkNative - Language Learning</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: frontend/tsconfig.node.json
````json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
````

## File: backend/app/models/conversation.py
````python
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
````

## File: frontend/src/App.tsx
````typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import RequireAuth from './components/RequireAuth'

// Keep the old App as LegacyChat for backward compatibility
import LegacyChat from './LegacyChat'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      
      {/* Legacy POC route - keep for testing */}
      <Route path="/legacy" element={<LegacyChat />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
````

## File: frontend/src/main.tsx
````typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
    <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
````

## File: frontend/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
````

## File: frontend/vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
````

## File: .gitignore
````
.DS_Store
.env
*.log
node_modules
__pycache__
*.pyc
dist
build
*.egg-info
.venv
venv
.idea
.vscode
````

## File: docker-compose.dev.yml
````yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/__pycache__
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - YARNGPT_API_KEY=${YARNGPT_API_KEY}
      - CORS_ALLOW_ORIGINS=${CORS_ALLOW_ORIGINS}
      - TTS_PROVIDER=${TTS_PROVIDER}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - SUPABASE_BUCKET_NAME=${SUPABASE_BUCKET_NAME}
      - PYTHONUNBUFFERED=1

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=${API_BASE_URL}
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend
````

## File: docker-compose.yml
````yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - YARNGPT_API_KEY=${YARNGPT_API_KEY}
      - CORS_ALLOW_ORIGINS=${CORS_ALLOW_ORIGINS}
      - TTS_PROVIDER=${TTS_PROVIDER}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - SUPABASE_BUCKET_NAME=${SUPABASE_BUCKET_NAME}

  frontend:
    build: ./frontend
    ports:
      - "5173:8080"
    environment:
      - VITE_API_BASE_URL=${API_BASE_URL}
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend
````

## File: frontend/package.json
````json
{
  "name": "talknatives-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-media-recorder": "^1.6.6",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
````

## File: README.md
````markdown
# TalkNatives POC

A conversational language learning app for Yoruba, Hausa, and Igbo using Gemini 2.5 Flash 8B and YarnGPT.

## Tech Stack

- **Frontend**: React + Vite + react-media-recorder
- **Backend**: FastAPI + Pydantic AI
- **AI/ASR**: Google Gemini 2.5 Flash (via Pydantic AI SDK)
- **TTS**: YarnGPT API
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Google Cloud Run (2 services)

## Local Development

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 20+

### Environment Setup

1. Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

2. Fill in your API keys in `backend/.env`:

```env
GOOGLE_API_KEY=your_google_api_key
YARNGPT_API_KEY=your_yarngpt_api_key
DATABASE_URL=your_supabase_postgres_url
CORS_ALLOW_ORIGINS=["http://localhost:5173"]
```

### Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Health Check: http://localhost:8080/healthz

### Run Locally (without Docker)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Testing the POC Chain

Test the full Gemini → YarnGPT pipeline:

```bash
cd backend
python scripts/poc_chain.py path/to/audio.webm yoruba
```

Target: Total latency < 4 seconds

## Database Migrations

**Create a new migration:**

```bash
cd backend
alembic revision --autogenerate -m "description"
```

**Apply migrations:**

```bash
alembic upgrade head
```

## Deployment

### GitHub Secrets Required

Set these in your GitHub repository settings:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `GCP_SA_KEY` (Service Account JSON)
- `GCP_PROJECT_ID`
- `GCP_REGION` (e.g., `us-central1`)
- `GOOGLE_API_KEY`
- `YARNGPT_API_KEY`
- `DATABASE_URL`
- `CORS_ALLOW_ORIGINS` (JSON array string, e.g., `["https://your-frontend-url"]`)

### Deploy

Push to `main` branch:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Build and push Docker images to DockerHub
2. Deploy backend to Cloud Run
3. Deploy frontend to Cloud Run with backend URL

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── chat.py          # Chat endpoint
│   │   ├── ai/
│   │   │   └── agent.py         # Pydantic AI Agent
│   │   ├── core/
│   │   │   └── config.py        # Settings
│   │   ├── db/
│   │   │   ├── base.py          # SQLAlchemy setup
│   │   │   └── session.py       # DB session
│   │   ├── models/
│   │   │   ├── conversation.py
│   │   │   └── turn.py
│   │   ├── tts/
│   │   │   └── yarngpt.py       # YarnGPT client
│   │   └── main.py              # FastAPI app
│   ├── alembic/                 # Migrations
│   ├── scripts/
│   │   └── poc_chain.py         # Test script
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main UI
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/
│   └── deploy.yml               # CI/CD
└── docker-compose.yml
```

## Voice Mapping

- **Yoruba**: idera (female)
- **Hausa**: zainab (female)
- **Igbo**: amaka (female)

## API Endpoints

### `POST /api/v1/chat`

**Query Parameters:**
- `language`: `yoruba` | `hausa` | `igbo` (default: `yoruba`)

**Body:**
- `file`: Audio file (webm/wav)

**Response:**

```json
{
  "transcription": "User's speech transcribed",
  "correction": "Grammar feedback (if needed)",
  "reply": "Tutor's response in target language",
  "audio": "base64-encoded audio"
}
```

## Performance Targets

- **Total Latency**: < 4 seconds (Gemini + YarnGPT)
- **Gemini Response**: ~1-2s
- **YarnGPT TTS**: ~1-2s

## License

MIT
````

## File: .github/workflows/deploy.yml
````yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:sha-${{ github.sha }},${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:latest
      
      - name: Build & push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:sha-${{ github.sha }},${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:latest
          build-args: |
            VITE_API_URL=${{ secrets.API_URL }}
            VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL }}
            VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up gcloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          version: latest

      - name: Configure project
        run: gcloud config set project ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Deploy backend
        run: |
          gcloud run deploy talknative-backend \
            --image=${{ secrets.DOCKERHUB_USERNAME }}/talknative-backend:sha-${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --allow-unauthenticated \
            --port=8080 \
            --memory=1Gi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=10 \
      
      - name: Get backend URL
        id: backend-url
        run: |
          BACKEND_URL=$(gcloud run services describe talknative-backend --region=${{ secrets.GCP_REGION }} --format='value(status.url)')
          echo "url=$BACKEND_URL" >> $GITHUB_OUTPUT
      
      - name: Deploy frontend
        run: |
          gcloud run deploy talknative-frontend \
            --image=${{ secrets.DOCKERHUB_USERNAME }}/talknative-frontend:sha-${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --allow-unauthenticated \
            --port=8080 \
            --memory=512Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=10 \
            --set-env-vars=VITE_API_BASE_URL=${{ steps.backend-url.outputs.url }}
      
      - name: Get frontend URL
        run: |
          FRONTEND_URL=$(gcloud run services describe talknative-frontend --region=${{ secrets.GCP_REGION }} --format='value(status.url)')
          echo "Frontend deployed at: $FRONTEND_URL"
          echo "Backend deployed at: ${{ steps.backend-url.outputs.url }}"
````
