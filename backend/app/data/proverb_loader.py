import json
from pathlib import Path
from typing import List, Optional, Dict
from functools import lru_cache
from app.core.logging import get_logger

PROVERBS_FILE = Path(__file__).parent / "proverbs.json"

class ProverbLoader:
    def __init__(self):
        self._proverbs: Dict[str, dict] = {}
        self._load_proverbs()
    
    def _load_proverbs(self):
        if not PROVERBS_FILE.exists():
            logger.warning("%s not found", PROVERBS_FILE)
            return
        
        with open(PROVERBS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Index by ID
            self._proverbs = {p['id']: p for p in data}

    def get_proverb(self, proverb_id: str) -> Optional[dict]:
        return self._proverbs.get(proverb_id)

    def get_proverbs_by_language(self, language: str) -> List[dict]:
        return [p for p in self._proverbs.values() if p['language'] == language]

    def get_all_proverbs(self) -> List[dict]:
        return list(self._proverbs.values())

@lru_cache()
def get_proverb_loader() -> ProverbLoader:
    return ProverbLoader()

logger = get_logger(__name__)
