from backend.modules.base import AIModule
from jinja2 import Template

class IntentClassifier(AIModule):
    async def process(self, user_input: str) -> dict:
        prompt_template = self.load_prompt("intent_classifier.txt")
        prompt = Template(prompt_template).render(user_input=user_input)
        return await self._generate_structured_json(prompt)
