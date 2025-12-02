import json
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.base import SessionLocal
from app.models.gamification import Proverb
from sqlalchemy.exc import IntegrityError
from app.core.logging import configure_logging, get_logger

DATA_DIR = Path(__file__).parent.parent / "app" / "data"

def seed_proverbs():
    configure_logging()
    logger = get_logger(__name__)
    db = SessionLocal()
    logger.info("Seeding Proverbs...")
    
    try:
        with open(DATA_DIR / "proverbs.json", "r") as f:
            proverbs_data = json.load(f)
            
        count = 0
        for item in proverbs_data:
            # Check if exists
            exists = db.query(Proverb).filter_by(id=item['id']).first()
            if not exists:
                p = Proverb(**item)
                db.add(p)
                count += 1
        
        db.commit()
        logger.info("Added %s new proverbs.", count)
        
    except FileNotFoundError:
        logger.error("proverbs.json not found!")
    except Exception as e:
        logger.exception("Error: %s", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_proverbs()
