"""
Intent Classifier module for IntentBridge.

Parses raw user text input to detect core goals, constraints, target
platform, and confidence scores. Uses Jinja2 templates for prompt
construction and returns structured JSON via the Gemini API.
"""
from backend.modules.base import AIModule
from jinja2 import Template

class IntentClassifier(AIModule):
    async def process(self, user_input: str) -> dict:
        prompt_template = self.load_prompt("intent_classifier.txt")
        prompt = Template(prompt_template).render(user_input=user_input)
        return await self._generate_structured_json(prompt)
