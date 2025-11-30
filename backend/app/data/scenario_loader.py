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
