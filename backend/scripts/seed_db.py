import json
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.base import SessionLocal
from app.models.gamification import Proverb
from sqlalchemy.exc import IntegrityError

DATA_DIR = Path(__file__).parent.parent / "app" / "data"

def seed_proverbs():
    db = SessionLocal()
    print("🌱 Seeding Proverbs...")
    
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
        print(f"✅ Added {count} new proverbs.")
        
    except FileNotFoundError:
        print("❌ proverbs.json not found!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_proverbs()