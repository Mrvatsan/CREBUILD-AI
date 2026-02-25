"""
Base AI module for IntentBridge.

Provides the foundation for all AI-powered modules. Handles Google Gemini
API integration, structured JSON generation, prompt loading from templates,
and mock response fallbacks for offline development.
"""
import json
import logging
from backend.core.config import settings

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - fallback for environments without the SDK
    genai = None


class AIModule:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.model_name = model_name
        self.mock_mode = settings.USE_MOCK_AI or not settings.GOOGLE_API_KEY

        if not self.mock_mode:
            if not genai:
                raise ImportError("google-generativeai package is required for live mode")
            self.logger.info(f"Initializing AIModule with model: {model_name}")
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel(model_name)
        else:
            self.logger.warning(f"Running {self.__class__.__name__} in MOCK AI mode. Responses are deterministic stubs.")

    async def _generate_structured_json(self, prompt: str, retries: int = 2) -> dict:
        if self.mock_mode:
            return self._mock_response()

        for attempt in range(retries + 1):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        # response_mime_type="application/json", # Use if available
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                self.logger.error(f"Attempt {attempt + 1} failed: {e}")
                if attempt == retries:
                    return {"error": str(e), "status": "failed"}
                continue
        return {"error": "Unknown error", "status": "failed"}

    def load_prompt(self, filename: str) -> str:
        # Simplified for now, in production use shared folder
        from pathlib import Path
        prompt_path = Path(__file__).parent.parent.parent / "config" / "prompts" / filename
        if prompt_path.exists():
            return prompt_path.read_text()
        return ""

    def _mock_response(self) -> dict:
        """Return deterministic JSON to keep the pipeline operable offline."""
        name = self.__class__.__name__
        if name == "IntentClassifier":
            return {
                "intent_type": "Build",
                "core_goal": "Mock: transform idea into execution plan",
                "target_users": "Product teams",
                "platform": "SaaS",
                "constraints": ["Mock response", "No API key"],
                "missing_critical_information": ["Real requirements"],
                "confidence_score": 0.42
            }
        if name == "AmbiguityResolver":
            return {
                "has_ambiguity": False,
                "questions": [],
                "analysis": "Mock mode: proceeding without clarifications."
            }
        if name == "ExecutionPlanner":
            return {
                "product_definition": {
                    "problem": "Mock problem statement",
                    "target_audience": "Demo users",
                    "value_proposition": "Showcase offline mode",
                    "core_features": ["Intent parsing", "Planning", "Visualization"],
                    "optional_features": ["Code generation"]
                },
                "functional_requirements": ["Capture inputs", "Detect ambiguity", "Generate plan"],
                "non_functional_requirements": ["Scalable", "Observable"],
                "technical_architecture": {
                    "frontend": "React",
                    "backend": "FastAPI",
                    "database": "PostgreSQL",
                    "ai": "Gemini or mock"
                },
                "execution_roadmap": {
                    "milestones": ["MVP", "AI Enhancements"],
                    "risks": ["LLM availability"],
                    "fallback": "Use mock responders"
                }
            }
        if name == "BuildEngine":
            return {
                "architecture": {"project_name": "MockApp", "tech_stack": {"frontend": "React", "backend": "FastAPI"}},
                "backend": {"files": [{"path": "main.py", "content": "# Mock backend"}]},
                "frontend": {"files": [{"path": "App.js", "content": "// Mock frontend"}]},
                "database": {"sql_schema": "CREATE TABLE users (...);"}
            }
        return {"status": "mock", "detail": f"No mock defined for {name}"}
